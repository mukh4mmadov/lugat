import { createClient } from "@supabase/supabase-js";
import { SOURCES, UNIVERSITIES } from "../src/data/korea/universities.js";

// AI help for studying in Korea:
//   GET  /api/study-ai                                    limits used today / this week, my documents
//   POST { action: "consult", question, history, language }        answers only from the official catalog
//   POST { action: "writeDoc", kind, docLanguage, universityId, major, limit, answers, language }
//   POST { action: "reviewDoc", kind, docLanguage, text, limit, language }
//   POST { action: "interviewStart", kind, docLanguage, universityId, major, language }
//   POST { action: "interviewTurn", sessionId, audio, language }    audio: 16 kHz WAV, base64
//   Authorization: Bearer <session>
// Limits come from app_settings (study_* keys); free accounts get a few a week.

const GEMINI_MODEL = process.env.STUDY_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
const ALLOWED_ORIGINS = ["https://lugat-six.vercel.app", "http://localhost:5173", "http://localhost:3000"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE_NAMES = { uz: "Uzbek (Latin script)", en: "English", ru: "Russian" };
const DOC_KINDS = {
  sop: "자기소개서 (personal statement / self-introduction for university admission)",
  studyplan: "학업계획서 (study plan for university admission)",
  gks_statement: "GKS Personal Statement (Global Korea Scholarship)",
  gks_plan: "GKS Study Plan (Global Korea Scholarship)",
};
const INTERVIEW_QUESTIONS = 6;
const DEFAULT_LIMITS = { consultFree: 5, consultPremium: 50, docFree: 1, docPremium: 10, interviewFree: 1, interviewPremium: 10 };

const originAllowed = (origin) => Boolean(origin) && (ALLOWED_ORIGINS.includes(origin) || /^https:\/\/lugat-[a-z0-9-]+\.vercel\.app$/.test(origin));
const isPremium = (user) => Boolean(user.app_metadata?.premium_until) && new Date(user.app_metadata.premium_until).getTime() > Date.now();
const tashkentDay = (offset = 0) => new Date(Date.now() + 5 * 3600000 - offset * 86400000).toISOString().slice(0, 10);
const languageOf = (value) => (LANGUAGE_NAMES[value] ? value : "uz");
const clip = (value, max) => String(value || "").trim().slice(0, max);
const universityById = (id) => UNIVERSITIES.find((uni) => uni.id === id) || null;

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function gemini({ system, parts, schema, temperature = 0.4, maxTokens = 2048 }) {
  const response = await fetch(GEMINI_URL, {
    signal: AbortSignal.timeout(40000),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: "application/json", responseSchema: schema },
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text().catch(() => "")).slice(0, 300)}`);
  const data = await response.json();
  return JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
}

// ---- limits ---------------------------------------------------------------

async function limitsFor(db, premium) {
  const keys = ["study_consult_free_daily", "study_consult_premium_daily", "study_doc_free_weekly", "study_doc_premium_daily", "study_interview_free_weekly", "study_interview_premium_daily"];
  const { data } = await db.from("app_settings").select("key, value").in("key", keys);
  const value = (key, fallback) => {
    const found = Number((data || []).find((row) => row.key === key)?.value);
    return Number.isInteger(found) && found >= 0 ? found : fallback;
  };
  return premium
    ? { consult: { limit: value("study_consult_premium_daily", DEFAULT_LIMITS.consultPremium), period: "day" }, doc: { limit: value("study_doc_premium_daily", DEFAULT_LIMITS.docPremium), period: "day" }, interview: { limit: value("study_interview_premium_daily", DEFAULT_LIMITS.interviewPremium), period: "day" } }
    : { consult: { limit: value("study_consult_free_daily", DEFAULT_LIMITS.consultFree), period: "day" }, doc: { limit: value("study_doc_free_weekly", DEFAULT_LIMITS.docFree), period: "week" }, interview: { limit: value("study_interview_free_weekly", DEFAULT_LIMITS.interviewFree), period: "week" } };
}

async function usage(db, userId) {
  const { data } = await db.from("study_usage").select("day, kind, count").eq("user_id", userId).gte("day", tashkentDay(6));
  const today = tashkentDay();
  const result = { consult: { day: 0, week: 0 }, doc: { day: 0, week: 0 }, interview: { day: 0, week: 0 } };
  for (const row of data || []) {
    result[row.kind].week += row.count;
    if (row.day === today) result[row.kind].day += row.count;
  }
  return result;
}

async function status(db, user) {
  const premium = isPremium(user);
  const [limits, used] = await Promise.all([limitsFor(db, premium), usage(db, user.id)]);
  const tools = Object.fromEntries(
    Object.entries(limits).map(([kind, { limit, period }]) => {
      const count = used[kind][period];
      return [kind, { limit, period, used: count, left: Math.max(0, limit - count) }];
    }),
  );
  return { premium, tools };
}

async function spend(db, userId, kind) {
  const day = tashkentDay();
  const { data } = await db.from("study_usage").select("count").eq("user_id", userId).eq("day", day).eq("kind", kind).maybeSingle();
  await db.from("study_usage").upsert({ user_id: userId, day, kind, count: (data?.count || 0) + 1 });
}

// ---- consultant -----------------------------------------------------------

const CATALOG = UNIVERSITIES.map((uni) =>
  [uni.id, uni.ko, uni.en || "", uni.region || "", uni.kind, uni.founding || "", uni.tuition ? `${uni.tuition} KRW/yr` : "no data", `degree:${uni.ieqas.degree}`, `language:${uni.ieqas.language}`, uni.ieqas.excellent ? "excellent" : ""].join("|"),
).join("\n");

const FACTS = `Official facts you may use:
- Tuition = KOSAF average annual tuition per university (${SOURCES.kosaf.date}), in won. Branch campuses show the main campus average.
- IEQAS (MOJ/MOE, announced ${SOURCES.ieqas.date}): "certified" universities get simplified student-visa screening; "excellent" are top certified; "scrutiny" universities have new international student visas largely stopped for one year from the 2026 fall semester; "none" = not certified.
- The IEQAS criteria count new degree students with TOPIK 3+ and enrolled students with TOPIK 4+. Each university sets its own TOPIK requirement in its admission guide (모집요강); language programs (D-4) usually need no TOPIK.
- GKS (Korean Government Scholarship, NIIED, studyinkorea.go.kr): undergraduate call every autumn (usually under 25), graduate call every early spring (usually under 40); embassy or university track; covers tuition, monthly allowance, airfare, a one-year Korean course and insurance. Exact dates and amounts are in each year's notice.
- Visas: D-4 language program, D-2 degree. Documents and procedure: the Korean embassy in Uzbekistan and visa.go.kr.
- Intakes: spring (March, applications usually Sep–Nov of the year before) and fall (September, applications usually Mar–May). Exact dates are on each university's site.`;

const CONSULT_SCHEMA = {
  type: "OBJECT",
  properties: {
    answer: { type: "STRING" },
    universityIds: { type: "ARRAY", items: { type: "STRING" } },
    sources: { type: "ARRAY", items: { type: "STRING", enum: ["kosaf", "ieqas", "gks", "visa", "topik", "university_site"] } },
    unknown: { type: "BOOLEAN" },
  },
  required: ["answer", "universityIds", "sources", "unknown"],
};

async function consult(db, user, body, res, rate) {
  const question = clip(body.question, 800);
  if (question.length < 3) return res.status(400).json({ error: "Ask a question" });
  const language = languageOf(body.language);
  const history = (Array.isArray(body.history) ? body.history : []).slice(-6).map((turn) => `${turn.role === "user" ? "Learner" : "Advisor"}: ${clip(turn.text, 600)}`);
  const system = `You are the K-TALIM study-in-Korea advisor for learners from Uzbekistan. Answer in ${LANGUAGE_NAMES[language]}.
Use ONLY the catalog and the facts below. Never invent tuition, deadlines, TOPIK requirements, rankings or admission chances. If the answer is not in this data, say plainly that you don't know and point to the official source (university site, studyinkorea.go.kr, the embassy), and set unknown=true.
When you recommend universities, return their ids in universityIds (at most 8), prefer "certified" ones, warn about "scrutiny" ones, and convert tuition to so'm when helpful (1 KRW = ${rate || "unknown"} UZS, Central Bank of Uzbekistan).
Keep answers short and practical: a few sentences or a short list. Mention which sources you used.

${FACTS}

Catalog (id|korean name|english name|region|kind|founding|tuition|ieqas degree|ieqas language|excellent):
${CATALOG}`;
  const result = await gemini({ system, parts: [{ text: `${history.length ? `Conversation so far:\n${history.join("\n")}\n\n` : ""}Learner's question: ${question}` }], schema: CONSULT_SCHEMA, temperature: 0.2, maxTokens: 1200 });
  await spend(db, user.id, "consult");
  const ids = (result.universityIds || []).filter((id) => universityById(id)).slice(0, 8);
  return res.status(200).json({ answer: clip(result.answer, 4000), universityIds: ids, sources: result.sources || [], unknown: Boolean(result.unknown) });
}

// ---- documents ------------------------------------------------------------

const DOC_SCHEMA = {
  type: "OBJECT",
  properties: { title: { type: "STRING" }, text: { type: "STRING" }, translation: { type: "STRING" }, tips: { type: "ARRAY", items: { type: "STRING" } } },
  required: ["title", "text", "translation", "tips"],
};

const REVIEW_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "INTEGER" },
    summary: { type: "STRING" },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    issues: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { quote: { type: "STRING" }, problem: { type: "STRING" }, fix: { type: "STRING" } }, required: ["quote", "problem", "fix"] },
    },
    improved: { type: "STRING" },
  },
  required: ["score", "summary", "strengths", "issues", "improved"],
};

const docLanguageOf = (value) => (value === "en" ? "en" : "ko");
const limitOf = (value, docLanguage) => Math.min(Math.max(Number(value) || (docLanguage === "ko" ? 1500 : 3000), 300), 8000);

async function writeDoc(db, user, body, res) {
  const kind = DOC_KINDS[body.kind] ? body.kind : null;
  if (!kind) return res.status(400).json({ error: "Unknown document" });
  const docLanguage = docLanguageOf(body.docLanguage);
  const language = languageOf(body.language);
  const limit = limitOf(body.limit, docLanguage);
  const uni = universityById(body.universityId);
  const answers = Object.fromEntries(Object.entries(body.answers || {}).slice(0, 12).map(([key, value]) => [clip(key, 40), clip(value, 1500)]));
  if (Object.values(answers).join("").length < 80) return res.status(400).json({ error: "Tell a bit more about yourself" });

  const system = `You write admission documents for students from Uzbekistan applying to Korea. Write a ${DOC_KINDS[kind]} in ${docLanguage === "ko" ? "natural, formal Korean (합니다체 for 자기소개서/학업계획서)" : "clear, formal English"}.
Rules: use ONLY facts the student gave — never invent awards, grades, jobs or experiences. ${docLanguage === "ko" ? "Write all names in Korean script: people (알리), places (타슈켄트, 우즈베키스탄) and schools (타슈켄트 제110학교) — never leave Latin or Uzbek words in the Korean text." : ""} Keep it specific and personal, avoid clichés. Stay within ${limit} characters (count spaces), aiming for 85–100% of it. Structure it the way Korean admission officers expect for this document.
Also give: a short title, a faithful ${LANGUAGE_NAMES[language]} translation in "translation", and 3–5 tips in ${LANGUAGE_NAMES[language]} on what the student could add or check.`;
  const prompt = `Target: ${uni ? `${uni.ko}${uni.en ? ` (${uni.en})` : ""}` : "a Korean university"}; major/program: ${clip(body.major, 120) || "not given"}.
Student's answers (may be in Uzbek, Russian, English or Korean):
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join("\n")}`;
  const result = await gemini({ system, parts: [{ text: prompt }], schema: DOC_SCHEMA, temperature: 0.6, maxTokens: 6000 });
  const output = { title: clip(result.title, 200), text: clip(result.text, limit + 400), translation: clip(result.translation, 12000), tips: (result.tips || []).slice(0, 6).map((tip) => clip(tip, 300)) };
  output.characters = output.text.length;
  const { data: doc } = await db.from("admission_docs").insert({ user_id: user.id, kind: body.kind, language: docLanguage, university_id: uni?.id || null, input: { major: clip(body.major, 120), limit, answers }, output }).select("id, created_at").single();
  await spend(db, user.id, "doc");
  return res.status(200).json({ id: doc?.id, ...output, limit });
}

async function reviewDoc(db, user, body, res) {
  const kind = DOC_KINDS[body.kind] ? body.kind : "sop";
  const docLanguage = docLanguageOf(body.docLanguage);
  const language = languageOf(body.language);
  const limit = limitOf(body.limit, docLanguage);
  const text = clip(body.text, 9000);
  if (text.length < 150) return res.status(400).json({ error: "The text is too short to review" });
  const system = `You are a strict but kind admission-document reviewer for Korean universities and GKS. The document is a ${DOC_KINDS[kind]} written in ${docLanguage === "ko" ? "Korean" : "English"}; the limit is ${limit} characters (it has ${text.length}).
Give: a score 0–100 (content, structure, specificity, language accuracy, fit to the document type); a short summary; strengths; up to 8 issues, each quoting the exact phrase, explaining the problem and giving a fix; and an improved version in the document's language that keeps the student's facts and stays within the limit. Write the summary, strengths, problems and fixes in ${LANGUAGE_NAMES[language]}. Never invent facts.`;
  const result = await gemini({ system, parts: [{ text }], schema: REVIEW_SCHEMA, temperature: 0.3, maxTokens: 6000 });
  const output = {
    score: Math.max(0, Math.min(100, Math.round(Number(result.score) || 0))),
    summary: clip(result.summary, 1500),
    strengths: (result.strengths || []).slice(0, 6).map((item) => clip(item, 300)),
    issues: (result.issues || []).slice(0, 8).map((issue) => ({ quote: clip(issue.quote, 300), problem: clip(issue.problem, 400), fix: clip(issue.fix, 400) })),
    improved: clip(result.improved, limit + 400),
  };
  const { data: doc } = await db.from("admission_docs").insert({ user_id: user.id, kind: "review", language: docLanguage, input: { kind, limit, text }, output }).select("id").single();
  await spend(db, user.id, "doc");
  return res.status(200).json({ id: doc?.id, ...output, characters: text.length, limit });
}

// ---- interview ------------------------------------------------------------

const QUESTION_SCHEMA = { type: "OBJECT", properties: { question: { type: "STRING" }, translation: { type: "STRING" } }, required: ["question", "translation"] };
const TURN_SCHEMA = {
  type: "OBJECT",
  properties: {
    transcript: { type: "STRING" },
    score: { type: "INTEGER" },
    feedback: { type: "STRING" },
    betterAnswer: { type: "STRING" },
    nextQuestion: { type: "STRING" },
    nextTranslation: { type: "STRING" },
  },
  required: ["transcript", "score", "feedback", "betterAnswer", "nextQuestion", "nextTranslation"],
};
const SUMMARY_SCHEMA = {
  type: "OBJECT",
  properties: { overall: { type: "INTEGER" }, verdict: { type: "STRING" }, strengths: { type: "ARRAY", items: { type: "STRING" } }, improve: { type: "ARRAY", items: { type: "STRING" } } },
  required: ["overall", "verdict", "strengths", "improve"],
};

function interviewer(session, language) {
  const uni = universityById(session.university_id);
  const panel = session.kind === "gks" ? "a GKS (Global Korea Scholarship) selection panel member" : `an admission interviewer (professor) at ${uni ? uni.ko : "a Korean university"}`;
  return `You are ${panel}, interviewing an applicant from Uzbekistan${session.major ? ` for ${session.major}` : ""}. Ask in ${session.language === "ko" ? "Korean (polite 존댓말, clear and not too fast)" : "English"} — one short question at a time, like a real interview: motivation, why Korea and this school, study plan, background, future plans, a follow-up on their previous answer. Give translations and feedback in ${LANGUAGE_NAMES[language]}.`;
}

async function interviewStart(db, user, body, res, language) {
  const kind = body.kind === "gks" ? "gks" : "university";
  const docLanguage = docLanguageOf(body.docLanguage);
  const uni = universityById(body.universityId);
  const session = { kind, language: docLanguage, university_id: uni?.id || null, major: clip(body.major, 120) };
  const first = await gemini({ system: interviewer(session, language), parts: [{ text: "Start the interview with a short greeting and the first question. Return the question and its translation." }], schema: QUESTION_SCHEMA, temperature: 0.7, maxTokens: 400 });
  const turns = [{ question: clip(first.question, 500), translation: clip(first.translation, 600) }];
  const { data, error } = await db.from("interview_sessions").insert({ user_id: user.id, kind, language: docLanguage, university_id: session.university_id, turns: [{ ...turns[0], major: session.major }] }).select("id").single();
  if (error) throw error;
  await spend(db, user.id, "interview");
  return res.status(200).json({ sessionId: data.id, question: turns[0].question, translation: turns[0].translation, total: INTERVIEW_QUESTIONS });
}

async function interviewTurn(db, user, body, res, language) {
  if (!UUID.test(String(body.sessionId || ""))) return res.status(400).json({ error: "Invalid session" });
  const audio = typeof body.audio === "string" ? body.audio : "";
  if (audio.length < 4000) return res.status(400).json({ error: "The recording is empty." });
  if (audio.length > 4_000_000) return res.status(413).json({ error: "The recording is too long." });
  const { data: row } = await db.from("interview_sessions").select("*").eq("id", body.sessionId).maybeSingle();
  if (!row || row.user_id !== user.id || row.ended_at) return res.status(404).json({ error: "Session not found" });
  const turns = row.turns || [];
  const current = turns[turns.length - 1];
  const session = { ...row, major: turns[0]?.major || "" };
  const last = turns.length >= INTERVIEW_QUESTIONS;
  const transcriptSoFar = turns.slice(0, -1).map((turn, index) => `Q${index + 1}: ${turn.question}\nA${index + 1}: ${turn.transcript || ""}`).join("\n");

  const result = await gemini({
    system: `${interviewer(session, language)}
Now evaluate the applicant's spoken answer to the current question: transcribe it, score it 1–5 (content, relevance, clarity, ${session.language === "ko" ? "Korean" : "English"} accuracy), give short feedback in ${LANGUAGE_NAMES[language]}, and a better model answer in the interview language that keeps their facts. ${last ? "This was the last question: set nextQuestion and nextTranslation to empty strings." : "Then ask the next question (it may follow up on this answer)."}`,
    parts: [
      { text: `${transcriptSoFar ? `Interview so far:\n${transcriptSoFar}\n\n` : ""}Current question: ${current.question}` },
      { inlineData: { mimeType: "audio/wav", data: audio } },
      { text: "The audio above is the applicant's answer." },
    ],
    schema: TURN_SCHEMA,
    temperature: 0.5,
    maxTokens: 1500,
  });
  const answered = { ...current, transcript: clip(result.transcript, 2000), score: Math.max(1, Math.min(5, Math.round(Number(result.score) || 1))), feedback: clip(result.feedback, 1200), betterAnswer: clip(result.betterAnswer, 1500) };
  const nextTurns = [...turns.slice(0, -1), answered];
  let summary = null;
  if (last || !result.nextQuestion) {
    summary = await gemini({
      system: `${interviewer(session, language)} Summarise the whole interview for the applicant in ${LANGUAGE_NAMES[language]}: an overall score 0–100, a one-sentence verdict, strengths and what to improve.`,
      parts: [{ text: nextTurns.map((turn, index) => `Q${index + 1}: ${turn.question}\nA${index + 1}: ${turn.transcript}\nScore: ${turn.score}/5`).join("\n") }],
      schema: SUMMARY_SCHEMA,
      temperature: 0.3,
      maxTokens: 800,
    });
    summary = { overall: Math.max(0, Math.min(100, Math.round(Number(summary.overall) || 0))), verdict: clip(summary.verdict, 400), strengths: (summary.strengths || []).slice(0, 5), improve: (summary.improve || []).slice(0, 5) };
  } else {
    nextTurns.push({ question: clip(result.nextQuestion, 500), translation: clip(result.nextTranslation, 600) });
  }
  await db.from("interview_sessions").update({ turns: nextTurns, ...(summary ? { summary, ended_at: new Date().toISOString() } : {}) }).eq("id", row.id);
  return res.status(200).json({ answered, next: summary ? null : nextTurns[nextTurns.length - 1], summary, number: answered ? nextTurns.filter((turn) => turn.transcript).length : 0, total: INTERVIEW_QUESTIONS });
}

async function wonRate() {
  try {
    const response = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/KRW/", { signal: AbortSignal.timeout(5000) });
    const [row] = await response.json();
    return Number(row.Rate) / (Number(row.Nominal) || 1);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (req.method === "POST" && !originAllowed(req.headers.origin)) return res.status(403).json({ error: "Forbidden: origin not allowed." });
  const db = serviceClient();
  if (!db || !process.env.GEMINI_API_KEY) return res.status(503).json({ error: "Not configured" });
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const { data: auth } = token ? await db.auth.getUser(token) : { data: null };
  const user = auth?.user;
  if (!user) return res.status(401).json({ error: "Sign in first." });

  try {
    if (req.method === "GET") {
      const [state, { data: docs }, { data: interviews }] = await Promise.all([
        status(db, user),
        db.from("admission_docs").select("id, kind, language, university_id, output, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        db.from("interview_sessions").select("id, kind, language, university_id, summary, started_at").eq("user_id", user.id).order("started_at", { ascending: false }).limit(10),
      ]);
      return res.status(200).json({ ...state, docs: docs || [], interviews: interviews || [] });
    }
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const language = languageOf(body.language);
    const tool = { consult: "consult", writeDoc: "doc", reviewDoc: "doc", interviewStart: "interview" }[body.action];
    if (tool) {
      const state = await status(db, user);
      if (state.tools[tool].left <= 0) return res.status(429).json({ error: "Limit reached", tool, premium: state.premium, period: state.tools[tool].period });
    }
    if (body.action === "consult") {
      // The browser sends the Central Bank rate it read; the server checks it is sane.
      const sent = Number(body.rate);
      return await consult(db, user, body, res, sent > 1 && sent < 100 ? sent : await wonRate());
    }
    if (body.action === "writeDoc") return await writeDoc(db, user, body, res);
    if (body.action === "reviewDoc") return await reviewDoc(db, user, body, res);
    if (body.action === "interviewStart") return await interviewStart(db, user, body, res, language);
    if (body.action === "interviewTurn") return await interviewTurn(db, user, body, res, language);
    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("Study AI error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
