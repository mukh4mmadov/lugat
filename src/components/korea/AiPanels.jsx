import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../GlassCard";
import UpgradeCard from "../UpgradeCard";
import { UNIVERSITIES } from "../../data/korea/universities";
import { useAuth } from "../../hooks/useAuth";
import { speakKorean } from "../../lib/speech";
import { studyRequest, uniName, useWonRate } from "../../lib/studyKorea";
import { microphoneSupported, startRecording } from "../../lib/wavRecorder";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-slate-900";
const MAX_ANSWER_SECONDS = 90;

function useStudyStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const load = useCallback(() => {
    if (user) studyRequest("GET").then(setStatus).catch(() => {});
  }, [user]);
  useEffect(() => {
    load();
  }, [load]);
  return [status, load];
}

function SignInCard() {
  const { t } = useTranslation();
  return (
    <GlassCard className="text-center">
      <p className="text-4xl">🔐</p>
      <p className="mt-2 font-bold">{t("korea.ai.signIn")}</p>
      <Link to="/login" state={{ from: { pathname: "/korea" } }} className="mt-4 inline-block rounded-2xl bg-violet-600 px-5 py-2.5 font-black text-white">{t("common.login")}</Link>
    </GlassCard>
  );
}

function LimitNote({ tool, status }) {
  const { t } = useTranslation();
  const info = status?.tools?.[tool];
  if (!info) return null;
  if (!info.left && !status.premium) return <UpgradeCard feature="korea" />;
  return (
    <p className="text-xs font-bold text-slate-500">
      {t(`korea.ai.left.${info.period}`, { left: info.left, limit: info.limit })}
      {!status.premium && <Link to="/premium" className="ml-2 text-violet-600 underline dark:text-violet-300">⭐ {t("korea.ai.more")}</Link>}
    </p>
  );
}

function errorText(error, t) {
  if (error.status === 429) return t(`korea.ai.limit.${error.data?.period || "day"}`);
  return error.message || t("korea.ai.failed");
}

function UniversityPicker({ value, onChange }) {
  const { t, i18n } = useTranslation();
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={input}>
      <option value="">{t("korea.ai.anyUniversity")}</option>
      {UNIVERSITIES.filter((uni) => uni.featured).map((uni) => <option key={uni.id} value={uni.id}>{uniName(uni, i18n.language)}</option>)}
    </select>
  );
}

// Questions answered only from the official catalog.
export function ConsultantPanel() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [status, reload] = useStudyStatus();
  const rate = useWonRate();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);
  if (!user) return <SignInCard />;

  async function ask(text) {
    const value = (text || question).trim();
    if (value.length < 3 || busy) return;
    setQuestion("");
    setError("");
    setBusy(true);
    const history = messages.map((message) => ({ role: message.role, text: message.text }));
    setMessages((current) => [...current, { role: "user", text: value }]);
    try {
      const result = await studyRequest("POST", { action: "consult", question: value, history, language: i18n.language, rate: rate?.rate });
      setMessages((current) => [...current, { role: "advisor", text: result.answer, universityIds: result.universityIds, sources: result.sources, unknown: result.unknown }]);
      reload();
    } catch (requestError) {
      setError(errorText(requestError, t));
    } finally {
      setBusy(false);
    }
  }

  const examples = [t("korea.ai.example1"), t("korea.ai.example2"), t("korea.ai.example3")];
  return (
    <div className="space-y-3">
      <GlassCard className="!p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("korea.ai.consultIntro")}</p>
        {!messages.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => <button key={example} type="button" onClick={() => ask(example)} className="rounded-full bg-violet-50 px-3 py-1.5 text-left text-xs font-bold text-violet-800 dark:bg-violet-500/10 dark:text-violet-100">{example}</button>)}
          </div>
        )}
      </GlassCard>
      {messages.map((message, index) => (
        <div key={index} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-8 bg-violet-600 text-white" : "mr-4 bg-white/90 dark:bg-white/5"}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          {message.universityIds?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.universityIds.map((id) => {
                const uni = UNIVERSITIES.find((item) => item.id === id);
                return uni ? <Link key={id} to={`/korea/u/${id}`} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">🏛 {uniName(uni, i18n.language)}</Link> : null;
              })}
            </div>
          )}
          {message.sources?.length > 0 && <p className="mt-2 text-[11px] text-slate-500">{t("korea.source")}: {message.sources.map((key) => t(`korea.sourceName.${key}`)).join(", ")}</p>}
        </div>
      ))}
      {busy && <p className="text-sm font-bold text-slate-500">{t("korea.ai.thinking")}</p>}
      {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
      <div ref={end} />
      <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={800} placeholder={t("korea.ai.askPlaceholder")} className={input} />
        <button type="submit" disabled={busy || question.trim().length < 3} className="rounded-xl bg-violet-600 px-4 text-sm font-black text-white disabled:opacity-50">{t("korea.ai.ask")}</button>
      </form>
      <LimitNote tool="consult" status={status} />
      <p className="text-[11px] text-slate-500">{t("korea.ai.consultDisclaimer")}</p>
    </div>
  );
}

const QUESTIONS = ["about", "whyKorea", "whyMajor", "experience", "plans", "extra"];

// Writes or reviews 자기소개서, 학업계획서 and GKS documents.
export function DocsPanel() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [status, reload] = useStudyStatus();
  const [mode, setMode] = useState("write");
  const [kind, setKind] = useState("sop");
  const [docLanguage, setDocLanguage] = useState("ko");
  const [universityId, setUniversityId] = useState("");
  const [major, setMajor] = useState("");
  const [limit, setLimit] = useState(1500);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!user) return <SignInCard />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = mode === "write"
        ? { action: "writeDoc", kind, docLanguage, universityId, major, limit, answers, language: i18n.language }
        : { action: "reviewDoc", kind, docLanguage, text, limit, language: i18n.language };
      setResult({ mode, ...(await studyRequest("POST", body)) });
      reload();
    } catch (requestError) {
      setError(errorText(requestError, t));
    } finally {
      setBusy(false);
    }
  }

  const output = result?.mode === "write" ? result.text : result?.improved;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/70 p-1 dark:bg-white/5">
        {["write", "review"].map((value) => (
          <button key={value} type="button" onClick={() => { setMode(value); setResult(null); }} aria-pressed={mode === value} className={`rounded-xl px-3 py-2 text-sm font-black ${mode === value ? "bg-violet-600 text-white" : ""}`}>{t(`korea.docs.${value}`)}</button>
        ))}
      </div>
      <GlassCard className="!p-5">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={kind} onChange={(event) => setKind(event.target.value)} className={input}>
              {["sop", "studyplan", "gks_statement", "gks_plan"].map((value) => <option key={value} value={value}>{t(`korea.docs.kind.${value}`)}</option>)}
            </select>
            <select value={docLanguage} onChange={(event) => { setDocLanguage(event.target.value); setLimit(event.target.value === "ko" ? 1500 : 3000); }} className={input}>
              <option value="ko">{t("korea.docs.inKorean")}</option>
              <option value="en">{t("korea.docs.inEnglish")}</option>
            </select>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              {t("korea.docs.limit")}
              <input type="number" min={300} max={8000} step={100} value={limit} onChange={(event) => setLimit(Number(event.target.value))} className={input} />
            </label>
          </div>
          {mode === "write" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <UniversityPicker value={universityId} onChange={setUniversityId} />
                <input value={major} onChange={(event) => setMajor(event.target.value)} maxLength={120} placeholder={t("korea.docs.major")} className={input} />
              </div>
              {QUESTIONS.map((key) => (
                <label key={key} className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  {t(`korea.docs.q.${key}`)}
                  <textarea value={answers[key] || ""} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })} rows={key === "extra" ? 2 : 3} maxLength={1500} className={`${input} mt-1 font-normal`} />
                </label>
              ))}
              <p className="text-xs text-slate-500">{t("korea.docs.honest")}</p>
            </>
          ) : (
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("korea.docs.paste")}
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} maxLength={9000} className={`${input} mt-1 font-normal`} />
              <span className="mt-1 block text-right font-normal tabular-nums">{text.length}/{limit}</span>
            </label>
          )}
          <button type="submit" disabled={busy} className="w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white disabled:opacity-60">
            {busy ? t("korea.ai.working") : mode === "write" ? `✍️ ${t("korea.docs.writeButton")}` : `🔍 ${t("korea.docs.reviewButton")}`}
          </button>
          <LimitNote tool="doc" status={status} />
          {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
        </form>
      </GlassCard>

      {result && (
        <GlassCard className="!p-5 space-y-3">
          {result.mode === "review" && (
            <>
              <div className="flex items-center gap-3">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-xl font-black text-white ${result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}>{result.score}</span>
                <p className="flex-1 text-sm">{result.summary}</p>
              </div>
              {result.strengths.length > 0 && <ul className="text-sm text-emerald-700 dark:text-emerald-300">{result.strengths.map((item, index) => <li key={index}>✓ {item}</li>)}</ul>}
              {result.issues.map((issue, index) => (
                <div key={index} className="rounded-xl bg-rose-50 p-3 text-sm dark:bg-rose-500/10">
                  <p className="font-bold">“{issue.quote}”</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{issue.problem}</p>
                  <p className="mt-1 text-emerald-700 dark:text-emerald-300">→ {issue.fix}</p>
                </div>
              ))}
              <p className="text-xs font-black uppercase text-slate-500">{t("korea.docs.improved")}</p>
            </>
          )}
          {result.mode === "write" && <h3 className="font-black">{result.title}</h3>}
          <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 dark:bg-white/5" lang={docLanguage}>{output}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`font-bold tabular-nums ${output?.length > result.limit ? "text-rose-600" : "text-slate-500"}`}>{output?.length || 0}/{result.limit} {t("korea.docs.chars")}</span>
            <button type="button" onClick={async () => { await navigator.clipboard?.writeText(output || ""); setCopied(true); }} className="rounded-lg border border-slate-300 px-3 py-1.5 font-black dark:border-white/15">{copied ? `✓ ${t("invite.copied")}` : `📋 ${t("korea.docs.copy")}`}</button>
          </div>
          {result.mode === "write" && (
            <>
              <details className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                <summary className="cursor-pointer font-bold">{t("korea.docs.translation")}</summary>
                <p className="mt-2 whitespace-pre-wrap leading-6">{result.translation}</p>
              </details>
              {result.tips.length > 0 && <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">{result.tips.map((tip, index) => <li key={index}>💡 {tip}</li>)}</ul>}
            </>
          )}
          <p className="text-[11px] text-slate-500">{t("korea.docs.disclaimer")}</p>
        </GlassCard>
      )}
    </div>
  );
}

// A spoken mock interview: Friday asks, the learner answers aloud.
export function InterviewPanel() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const [status, reload] = useStudyStatus();
  const [kind, setKind] = useState("university");
  const [docLanguage, setDocLanguage] = useState("ko");
  const [universityId, setUniversityId] = useState("");
  const [major, setMajor] = useState("");
  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef(null);
  const timer = useRef(null);
  const sendRef = useRef(null);

  useEffect(() => () => {
    recorder.current?.cancel();
    clearInterval(timer.current);
  }, []);

  // Answers stop automatically at the time limit.
  useEffect(() => {
    if (recording && seconds >= MAX_ANSWER_SECONDS) sendRef.current?.();
  }, [recording, seconds]);

  const speak = useCallback((text) => {
    if (docLanguage === "ko") speakKorean(text, rate);
    else if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }, [docLanguage, rate]);

  if (!user) return <SignInCard />;

  async function start() {
    setBusy(true);
    setError("");
    try {
      const result = await studyRequest("POST", { action: "interviewStart", kind, docLanguage, universityId, major, language: i18n.language });
      setSession(result);
      setCurrent({ question: result.question, translation: result.translation });
      setAnswered([]);
      setSummary(null);
      speak(result.question);
      reload();
    } catch (requestError) {
      setError(errorText(requestError, t));
    } finally {
      setBusy(false);
    }
  }

  async function record() {
    setError("");
    try {
      recorder.current = await startRecording();
      setRecording(true);
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError(t("korea.interview.mic"));
    }
  }

  async function send() {
    clearInterval(timer.current);
    const active = recorder.current;
    recorder.current = null;
    setRecording(false);
    if (!active) return;
    const audio = await active.stop();
    if (!audio || audio.seconds < 1) {
      setError(t("korea.interview.tooShort"));
      return;
    }
    setBusy(true);
    try {
      const result = await studyRequest("POST", { action: "interviewTurn", sessionId: session.sessionId, audio: audio.base64, language: i18n.language });
      setAnswered((list) => [...list, result.answered]);
      if (result.summary) {
        setSummary(result.summary);
        setCurrent(null);
      } else {
        setCurrent(result.next);
        speak(result.next.question);
      }
    } catch (requestError) {
      setError(errorText(requestError, t));
    } finally {
      setBusy(false);
    }
  }

  sendRef.current = send;

  if (!session) {
    return (
      <GlassCard className="!p-5 space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("korea.interview.intro")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={kind} onChange={(event) => setKind(event.target.value)} className={input}>
            <option value="university">{t("korea.interview.university")}</option>
            <option value="gks">{t("korea.interview.gks")}</option>
          </select>
          <select value={docLanguage} onChange={(event) => setDocLanguage(event.target.value)} className={input}>
            <option value="ko">{t("korea.docs.inKorean")}</option>
            <option value="en">{t("korea.docs.inEnglish")}</option>
          </select>
          {kind === "university" && <UniversityPicker value={universityId} onChange={setUniversityId} />}
          <input value={major} onChange={(event) => setMajor(event.target.value)} maxLength={120} placeholder={t("korea.docs.major")} className={input} />
        </div>
        {!microphoneSupported() && <p className="text-sm font-bold text-rose-600">{t("korea.interview.mic")}</p>}
        <button type="button" disabled={busy || !microphoneSupported()} onClick={start} className="w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white disabled:opacity-60">{busy ? t("korea.ai.working") : `🎤 ${t("korea.interview.start")}`}</button>
        <LimitNote tool="interview" status={status} />
        {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {answered.map((turn, index) => (
        <GlassCard key={index} className="!p-4 space-y-2 text-sm">
          <p className="font-black" lang={docLanguage}>Q{index + 1}. {turn.question}</p>
          <p className="rounded-xl bg-slate-50 p-2 italic dark:bg-white/5" lang={docLanguage}>🗣 {turn.transcript}</p>
          <p><span className="font-black">{"⭐".repeat(turn.score)}</span> {turn.feedback}</p>
          <details>
            <summary className="cursor-pointer text-xs font-bold text-violet-700 dark:text-violet-300">{t("korea.interview.better")}</summary>
            <p className="mt-1 whitespace-pre-wrap" lang={docLanguage}>{turn.betterAnswer}</p>
          </details>
        </GlassCard>
      ))}
      {current && (
        <GlassCard className="!p-5 text-center">
          <p className="text-xs font-black uppercase text-violet-600">{t("korea.interview.question", { number: answered.length + 1, total: session.total })}</p>
          <button type="button" onClick={() => speak(current.question)} className="mt-2 text-lg font-black" lang={docLanguage}>{current.question} 🔊</button>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{current.translation}</p>
          {busy ? (
            <p className="mt-5 font-bold text-slate-500">{t("korea.ai.working")}</p>
          ) : recording ? (
            <button type="button" onClick={send} className="mt-5 rounded-full bg-rose-600 px-8 py-4 font-black text-white">⏹ {t("korea.interview.stop")} · {seconds}s</button>
          ) : (
            <button type="button" onClick={record} className="mt-5 rounded-full bg-violet-600 px-8 py-4 font-black text-white">🎙 {t("korea.interview.answer")}</button>
          )}
          {error && <p role="alert" className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
        </GlassCard>
      )}
      {summary && (
        <GlassCard className="!p-5 text-center">
          <p className="text-5xl font-black text-violet-600">{summary.overall}</p>
          <p className="mt-1 font-bold">{summary.verdict}</p>
          <div className="mt-4 grid gap-3 text-left text-sm sm:grid-cols-2">
            <ul className="space-y-1 text-emerald-700 dark:text-emerald-300">{summary.strengths.map((item, index) => <li key={index}>✓ {item}</li>)}</ul>
            <ul className="space-y-1 text-amber-700 dark:text-amber-300">{summary.improve.map((item, index) => <li key={index}>→ {item}</li>)}</ul>
          </div>
          <button type="button" onClick={() => setSession(null)} className="mt-5 rounded-2xl bg-violet-600 px-5 py-2.5 font-black text-white">{t("korea.interview.again")}</button>
        </GlassCard>
      )}
    </div>
  );
}
