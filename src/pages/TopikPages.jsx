import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import { useTopikExamContext } from "../hooks/useTopikExamContext";
import { supabase } from "../lib/supabase";

const variantLabels = {
  "35thmock": "topik.mock",
  "35thlistening": "topik.listeningFull",
  "35threading": "topik.readingFull",
};

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  return hours
    ? String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0")
    : String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
}

function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("/")) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from("topik-assets").getPublicUrl(path).data.publicUrl;
}

function withTimeout(request, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("TOPIK request timed out")), timeoutMs);
    Promise.resolve(request).then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); }
    );
  });
}

function LoginPrompt() {
  const { t } = useTranslation();
  return (
    <GlassCard className="mx-auto max-w-xl text-center">
      <h1 className="text-2xl font-black">{t("topik.loginTitle")}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{t("topik.loginText")}</p>
      <Link to="/login" state={{ from: { pathname: "/topik" } }} className="mt-5 inline-flex rounded-2xl bg-sky-600 px-5 py-3 font-black text-white">
        {t("nav.login")}
      </Link>
    </GlassCard>
  );
}

export function TopikHomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [variants, setVariants] = useState([]);
  const [counts, setCounts] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      const [variantResult, questionResult, attemptResult] = await Promise.all([
        supabase.from("topik_variants").select("*").eq("is_published", true).order("id"),
        supabase.from("topik_questions").select("id, exam_id, section"),
        supabase.from("topik_attempts").select("id, variant_id, status, submitted_at, total_score, estimated_level, elapsed_seconds").order("created_at", { ascending: false }).limit(10),
      ]);
      if (cancelled) return;
      if (variantResult.error || questionResult.error || attemptResult.error) {
        setError(t("topik.loadError"));
      } else {
        const nextCounts = {};
        (questionResult.data || []).forEach((question) => {
          nextCounts[question.exam_id] = (nextCounts[question.exam_id] || 0) + 1;
        });
        setVariants(variantResult.data || []);
        setCounts(nextCounts);
        setAttempts(attemptResult.data || []);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user, t]);

  if (!user) return <LoginPrompt />;
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">TOPIK I</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">{t("topik.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("topik.subtitle")}</p>
      </header>
      {error && <p role="alert" className="rounded-2xl bg-rose-100 p-4 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">{error}</p>}
      <section className="grid gap-4 md:grid-cols-3">
        {variants.map((variant) => {
          const expected = variant.mode === "mock" ? 70 : variant.mode === "reading" ? 40 : 30;
          const ready = variant.content_ready && (counts[variant.exam_id] || 0) >= expected;
          return (
            <GlassCard key={variant.id} className="flex h-full flex-col p-6">
              <span className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">35th · TOPIK I B</span>
              <h2 className="mt-3 text-xl font-black">{t(variantLabels[variant.id] || "topik.mock")}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{variant.mode === "mock" ? t("topik.mockDescription") : t("topik.sectionDescription")}</p>
              <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">{variant.mode === "mock" ? t("topik.mockTime") : t("topik.noTimeLimit")}</p>
              {ready
                ? <Link to={"/topik/" + variant.id} aria-label={`${t("topik.start")} ${t(variantLabels[variant.id] || "topik.mock")}`} className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-center font-black text-white dark:bg-white dark:text-slate-950">{t("topik.start")}</Link>
                : <button type="button" disabled className="mt-4 cursor-not-allowed rounded-2xl bg-slate-200 px-4 py-3 font-black text-slate-500 dark:bg-white/10 dark:text-slate-400">{t("topik.contentPending")}</button>}
            </GlassCard>
          );
        })}
        {!loading && variants.length === 0 && <GlassCard className="md:col-span-3">{t("topik.noExams")}</GlassCard>}
        {loading && <GlassCard className="md:col-span-3">{t("common.loading")}</GlassCard>}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-black">{t("topik.recentAttempts")}</h2>
        {attempts.length
          ? <div className="space-y-2">{attempts.map((attempt) => (
            <Link key={attempt.id} to={attempt.status === "submitted" ? "/topik/result/" + attempt.id : "/topik/" + attempt.variant_id + "?attemptId=" + attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:border-sky-300 dark:border-white/10 dark:bg-white/5">
              <span className="font-bold">{t(variantLabels[attempt.variant_id] || "topik.mock")}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{attempt.status === "submitted" ? attempt.total_score + " " + t("topik.points") : t("topik.inProgress")}</span>
            </Link>
          ))}</div>
          : <p className="text-sm text-slate-500 dark:text-slate-400">{t("topik.noAttempts")}</p>}
      </section>
    </div>
  );
}

export function TopikAttemptPage() {
  const { t } = useTranslation();
  const translateRef = useRef(t);
  translateRef.current = t;
  const { user } = useAuth();
  const { setContext } = useTopikExamContext();
  const { variantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get("attemptId");
  const [variant, setVariant] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitRef = useRef(false);

  const visibleQuestions = useMemo(() => {
    if (!variant) return [];
    return questions.filter((question) => !variant.section || question.section === variant.section);
  }, [questions, variant]);
  const currentQuestion = visibleQuestions[cursor];
  const remaining = variant && variant.mode === "mock" && attempt
    ? Math.max(0, variant.duration_seconds - Math.floor((now - new Date(attempt.started_at).getTime()) / 1000))
    : null;

  const submitAttempt = useCallback(async () => {
    if (!attemptId || submitting || autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    setSubmitting(true);
    setError("");
    const { error: submitError } = await supabase.rpc("submit_topik_attempt", { p_attempt_id: attemptId });
    if (submitError) {
      autoSubmitRef.current = false;
      setError(t("topik.submitError"));
      setSubmitting(false);
      return;
    }
    navigate("/topik/result/" + attemptId, { replace: true });
  }, [attemptId, navigate, submitting, t]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      setError("");
      autoSubmitRef.current = false;
      setVariant(null);
      setExam(null);
      setAttempt(null);
      setAnswers({});
      setQuestions([]);
      setCursor(0);
      const { data: nextVariant, error: variantError } = await withTimeout(supabase.from("topik_variants").select("*").eq("id", variantId).eq("is_published", true).maybeSingle());
      if (variantError || !nextVariant) {
        if (!cancelled) { setError(translateRef.current("topik.loadError")); setLoading(false); }
        return;
      }
      const [{ data: nextExam, error: examError }, { data: nextQuestions, error: questionsError }] = await withTimeout(Promise.all([
        supabase.from("topik_exams").select("*").eq("id", nextVariant.exam_id).maybeSingle(),
        supabase.from("topik_questions").select("id, exam_id, section, question_number, points, content").eq("exam_id", nextVariant.exam_id).order("question_number"),
      ]));
      if (examError || questionsError || !nextExam) {
        if (!cancelled) { setError(translateRef.current("topik.loadError")); setLoading(false); }
        return;
      }
      if (cancelled) return;
      setVariant(nextVariant);
      setExam(nextExam);
      setQuestions(nextQuestions || []);
      if (attemptId) {
        const [{ data: nextAttempt, error: attemptError }, { data: saved, error: savedError }] = await withTimeout(Promise.all([
          supabase.from("topik_attempts").select("*").eq("id", attemptId).eq("user_id", user.id).maybeSingle(),
          supabase.from("topik_attempt_answers").select("question_id, selected_option").eq("attempt_id", attemptId),
        ]));
        if (attemptError || savedError || !nextAttempt || nextAttempt.variant_id !== nextVariant.id) {
          setError(translateRef.current("topik.loadError"));
        } else if (nextAttempt.status === "submitted") {
          navigate("/topik/result/" + attemptId, { replace: true });
        } else {
          setAttempt(nextAttempt);
          setAnswers(Object.fromEntries((saved || []).filter((row) => row.selected_option).map((row) => [row.question_id, row.selected_option])));
        }
      }
      setLoading(false);
    }
    load().catch(() => {
      if (!cancelled) {
        setError(translateRef.current("topik.loadError"));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [attemptId, navigate, user, variantId]);

  useEffect(() => {
    if (!attempt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (remaining === 0 && variant && variant.mode === "mock" && attempt && !saving && !autoSubmitRef.current) submitAttempt();
  }, [attempt, remaining, saving, submitAttempt, variant]);

  useEffect(() => {
    if (attempt && currentQuestion) setContext({ attemptId: attempt.id, questionId: currentQuestion.id });
    else setContext(null);
    return () => setContext(null);
  }, [attempt, currentQuestion, setContext]);

  async function startAttempt() {
    setError("");
    const { data, error: startError } = await supabase.rpc("start_topik_attempt", { p_variant_id: variantId });
    if (startError || !data) {
      setError(startError && startError.message.includes("not available") ? t("topik.contentPending") : t("topik.startError"));
      return;
    }
    navigate("/topik/" + variantId + "?attemptId=" + data.id, { replace: true });
  }

  async function selectAnswer(optionId) {
    if (!attempt || !currentQuestion || saving || submitting) return;
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.rpc("save_topik_answer", {
      p_attempt_id: attempt.id,
      p_question_id: currentQuestion.id,
      p_selected_option: optionId,
    });
    if (saveError) setError(t("topik.saveError"));
    else setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionId }));
    setSaving(false);
  }

  if (!user) return <LoginPrompt />;
  if (loading) return <GlassCard>{t("common.loading")}</GlassCard>;
  if (attemptId && error) return <GlassCard role="alert" className="mx-auto max-w-2xl text-center"><p>{error}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white dark:bg-white dark:text-slate-950">{t("topik.retry")}</button><Link to="/topik" className="rounded-xl border border-slate-300 px-5 py-3 font-bold dark:border-white/20">{t("topik.back")}</Link></div></GlassCard>;
  if (error && !variant) return <GlassCard role="alert">{error}</GlassCard>;
  if (!variant || !exam) return null;
  const expected = variant.mode === "mock" ? 70 : variant.mode === "reading" ? 40 : 30;
  if (!attempt && (!variant.content_ready || visibleQuestions.length < expected)) {
    return <GlassCard className="mx-auto max-w-2xl text-center"><h1 className="text-2xl font-black">{t(variantLabels[variant.id])}</h1><p className="mt-3 text-slate-600 dark:text-slate-300">{t("topik.contentPending")}</p><Link className="mt-5 inline-block font-bold text-sky-600 underline" to="/topik">{t("topik.back")}</Link></GlassCard>;
  }
  if (!attempt) {
    return <GlassCard className="mx-auto max-w-2xl p-7">
      <Link to="/topik" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("topik.back")}</Link>
      <p className="mt-6 text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">35th · TOPIK I B</p>
      <h1 className="mt-2 text-3xl font-black">{t(variantLabels[variant.id])}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{variant.mode === "mock" ? t("topik.mockDescription") : t("topik.sectionDescription")}</p>
      <p className="mt-4 text-sm font-bold">{variant.mode === "mock" ? t("topik.mockTime") : t("topik.noTimeLimit")}</p>
      <button type="button" onClick={startAttempt} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white dark:bg-white dark:text-slate-950">{t("topik.start")}</button>
      {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
    </GlassCard>;
  }
  if (!currentQuestion) return <GlassCard role="alert">{t("topik.noQuestions")}</GlassCard>;

  const content = currentQuestion.content || {};
  const options = Array.isArray(content.options) ? content.options : [];
  const imageSrc = assetUrl(content.image_path);
  const elapsed = Math.floor((now - new Date(attempt.started_at).getTime()) / 1000);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link to="/topik" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("topik.back")}</Link><h1 className="mt-2 text-2xl font-black">{t(variantLabels[variant.id])}</h1></div>
        <div role="timer" aria-live="off" className={"rounded-2xl px-4 py-3 text-lg font-black tabular-nums " + (remaining !== null && remaining < 300 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200" : "bg-white/80 text-slate-800 dark:bg-white/10 dark:text-white")}>
          {remaining === null ? t("topik.elapsed") + ": " + formatClock(elapsed) : t("topik.remaining") + ": " + formatClock(remaining)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleQuestions.map((question, index) => (
          <button key={question.id} type="button" onClick={() => setCursor(index)} aria-label={t("topik.questionNumber", { number: question.question_number })} className={"grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-black " + (index === cursor ? "bg-sky-600 text-white" : answers[question.id] ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-200")}>{question.question_number}</button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">{error}</p>}
      <GlassCard className="p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          <span>{currentQuestion.section === "listening" ? t("topik.listening") : t("topik.reading")}</span>
          <span>{currentQuestion.question_number} / {variant.mode === "mock" ? 70 : visibleQuestions.length} · {currentQuestion.points} {t("topik.points")}</span>
        </div>
        {currentQuestion.section === "listening" && <div className="mt-5 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/10">
          <p className="mb-2 text-sm font-black">35th {t("topik.listening")}</p>
          <audio className="w-full" controls preload="metadata" src="/topik/35th/listening.mp3">{t("topik.audioUnsupported")}</audio>
        </div>}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <iframe
            key={content.document_page}
            title={`${t("topik.questionNumber", { number: currentQuestion.question_number })} · 35th TOPIK I B`}
            src={`/topik/35th/paper.pdf#page=${content.document_page || 3}&toolbar=0&navpanes=0&scrollbar=0`}
            className="h-[65vh] min-h-[28rem] w-full"
          />
        </div>
        <a href={`/topik/35th/paper.pdf#page=${content.document_page || 3}`} target="_blank" rel="noreferrer" className="inline-block text-sm font-bold text-sky-600 underline dark:text-sky-300">
          {t("topik.openPaperPage", { number: content.document_page || 3 })}
        </a>
        {content.passage && <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-100/80 p-5 text-lg leading-relaxed dark:bg-white/5">{content.passage}</div>}
        {content.text && <p className="mt-5 whitespace-pre-wrap text-lg leading-relaxed">{content.text}</p>}
        {imageSrc && <img src={imageSrc} alt={content.image_alt || ""} className="mx-auto mt-5 max-h-[28rem] max-w-full rounded-2xl object-contain" />}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const optionId = String(option.id);
            const selected = answers[currentQuestion.id] === optionId;
            const optionImage = assetUrl(option.image_path);
            return <button key={optionId} type="button" disabled={saving || submitting} onClick={() => selectAnswer(optionId)} aria-pressed={selected} className={"rounded-2xl border p-4 text-left transition " + (selected ? "border-sky-500 bg-sky-50 ring-2 ring-sky-300 dark:bg-sky-500/15" : "border-slate-200 bg-white/70 hover:border-sky-300 dark:border-white/10 dark:bg-white/5")}>
              <span className="mr-2 font-black">{optionId}.</span>{option.text}
              {optionImage && <img src={optionImage} alt={option.image_alt || ""} className="mt-3 max-h-48 rounded-xl object-contain" />}
            </button>;
          })}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button type="button" disabled={cursor === 0} onClick={() => setCursor((value) => value - 1)} className="rounded-xl border border-slate-200 px-4 py-2 font-bold disabled:opacity-40 dark:border-white/10">{t("topik.previous")}</button>
          {cursor < visibleQuestions.length - 1 && <button type="button" onClick={() => setCursor((value) => value + 1)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white dark:bg-white dark:text-slate-950">{t("topik.next")}</button>}
          <button type="button" disabled={submitting || saving} onClick={submitAttempt} className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white disabled:opacity-50">{submitting ? t("topik.submitting") : t("topik.finish")}</button>
        </div>
      </GlassCard>
    </div>
  );
}

export function TopikResultPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setLoading(false); return; }
      const { data: attempt, error: attemptError } = await supabase.from("topik_attempts").select("*").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
      if (attemptError || !attempt || attempt.status !== "submitted") {
        if (!cancelled) { setError(t("topik.resultUnavailable")); setLoading(false); }
        return;
      }
      const [{ data: nextVariant, error: variantError }, { data: savedAnswers, error: answersError }] = await Promise.all([
        supabase.from("topik_variants").select("*").eq("id", attempt.variant_id).maybeSingle(),
        supabase.from("topik_attempt_answers").select("question_id, selected_option, correct_option, is_correct, awarded_points").eq("attempt_id", attempt.id),
      ]);
      if (variantError || answersError || !nextVariant) {
        if (!cancelled) { setError(t("topik.resultUnavailable")); setLoading(false); }
        return;
      }
      const { data: questionsResult, error: questionsError } = await supabase.from("topik_questions").select("id, section, question_number, points, content").eq("exam_id", nextVariant.exam_id).order("question_number");
      if (questionsError) {
        if (!cancelled) { setError(t("topik.resultUnavailable")); setLoading(false); }
        return;
      }
      if (!cancelled) {
        setResult({ ...attempt, answers: savedAnswers || [] });
        setVariant(nextVariant);
        setQuestions((questionsResult || []).filter((question) => !nextVariant.section || question.section === nextVariant.section));
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [attemptId, t, user]);

  if (!user) return <LoginPrompt />;
  if (loading) return <GlassCard>{t("common.loading")}</GlassCard>;
  if (error || !result || !variant) return <GlassCard role="alert">{error || t("topik.resultUnavailable")}</GlassCard>;
  const answers = new Map(result.answers.map((answer) => [answer.question_id, answer]));
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <GlassCard className="p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">35th · TOPIK I B</p>
        <h1 className="mt-2 text-3xl font-black">{t("topik.resultTitle")}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{t(variantLabels[variant.id])}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {variant.mode === "mock" && <ScoreTile label={t("topik.listeningScore")} score={result.listening_score} />}
          {variant.mode === "mock" && <ScoreTile label={t("topik.readingScore")} score={result.reading_score} />}
          <ScoreTile label={t("topik.totalScore")} score={result.total_score} />
          <ScoreTile label={t("topik.elapsed")} score={formatClock(result.elapsed_seconds)} />
        </div>
        {variant.mode === "mock" && <p className="mt-4 rounded-2xl bg-sky-50 p-4 font-black text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">{result.estimated_level ? t("topik.estimatedLevel", { level: result.estimated_level }) : t("topik.belowLevel")}</p>}
        <Link to="/topik" className="mt-5 inline-block font-bold text-sky-600 underline dark:text-sky-300">{t("topik.backToTests")}</Link>
      </GlassCard>
      <section className="space-y-3">
        <h2 className="text-2xl font-black">{t("topik.reviewAnswers")}</h2>
        {questions.map((question) => {
          const answer = answers.get(question.id);
          const options = Array.isArray(question.content && question.content.options) ? question.content.options : [];
          const chosenText = options.find((option) => String(option.id) === (answer && answer.selected_option))?.text;
          const correctText = options.find((option) => String(option.id) === (answer && answer.correct_option))?.text;
          return <GlassCard key={question.id} className="p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-black">{t("topik.questionNumber", { number: question.question_number })}</h3>
              <span className={answer && answer.is_correct ? "font-bold text-emerald-600 dark:text-emerald-300" : answer?.selected_option ? "font-bold text-rose-600 dark:text-rose-300" : "font-bold text-slate-500 dark:text-slate-400"}>{answer?.selected_option ? answer.is_correct ? t("topik.correct") : t("topik.incorrect") : t("topik.unanswered")}</span>
            </div>
            {question.content?.text && <p className="mt-3 whitespace-pre-wrap">{question.content.text}</p>}
            {question.content?.passage && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{question.content.passage}</p>}
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <p><b>{t("topik.yourAnswer")}:</b> {answer?.selected_option ? answer.selected_option + ". " + (chosenText || "") : t("topik.unanswered")}</p>
              <p><b>{t("topik.correctAnswer")}:</b> {answer?.correct_option ? answer.correct_option + ". " + (correctText || "") : t("topik.answerUnavailable")}</p>
            </div>
            {question.content?.document_page && <a href={`/topik/35th/paper.pdf#page=${question.content.document_page}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-sky-600 underline dark:text-sky-300">{t("topik.openPaperPage", { number: question.content.document_page })}</a>}
            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{(answer?.awarded_points || 0) + " / " + question.points + " " + t("topik.points")}</p>
          </GlassCard>;
        })}
      </section>
    </div>
  );
}

function ScoreTile({ label, score }) {
  return <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5"><p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{score}</p></div>;
}
