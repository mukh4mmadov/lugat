import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import PdfPageViewer from "../components/PdfPageViewer";
import { useTopikExamContext } from "../hooks/useTopikExamContext";
import {
  TOPIK_EXAMS,
  TOPIK_VARIANTS,
  getTopikExam,
  getTopikVariant,
  getVariantQuestions,
} from "../data/topik/exams";
import {
  createTopikAttempt,
  deleteTopikAttempt,
  findActiveAttempt,
  getTopikAttempt,
  listTopikAttempts,
  submitTopikAttempt,
  updateTopikAttempt,
} from "../lib/topikAttempts";

const OPTION_MARKS = { 1: "①", 2: "②", 3: "③", 4: "④" };
const OPTIONS = ["1", "2", "3", "4"];

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(remainder)}` : `${pad(minutes)}:${pad(remainder)}`;
}

function formatDate(timestamp, language) {
  try {
    return new Date(timestamp).toLocaleString(language, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

function Overlay({ children }) {
  const [target, setTarget] = useState(null);
  useEffect(() => setTarget(document.getElementById("overlay-root") || document.body), []);
  return target ? createPortal(children, target) : null;
}

function useTopikAttempts() {
  const [attempts, setAttempts] = useState(() => listTopikAttempts());
  useEffect(() => {
    const refresh = () => setAttempts(listTopikAttempts());
    window.addEventListener("topik-attempts-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("topik-attempts-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return attempts;
}

function variantTitle(t, variant) {
  const exam = getTopikExam(variant.examId);
  return t(`topik.variant.${variant.mode}`, { number: exam.number });
}

function variantSummary(t, variant) {
  const count = getVariantQuestions(variant).length;
  if (variant.mode === "mock") return t("topik.mockMeta", { count, minutes: variant.durationSeconds / 60 });
  return t("topik.sectionMeta", { count });
}

function levelLabel(t, result) {
  if (!result) return "";
  return result.level ? t("topik.levelBadge", { level: result.level }) : t("topik.noLevel");
}

export function TopikHomePage() {
  const { t, i18n } = useTranslation();
  const attempts = useTopikAttempts();
  const submitted = attempts.filter((attempt) => attempt.status === "submitted");
  const mockResults = submitted.filter((attempt) => getTopikVariant(attempt.variantId)?.mode === "mock");
  const bestMock = mockResults.reduce((best, attempt) => Math.max(best, attempt.result?.total || 0), 0);
  const latestMock = mockResults[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <GlassCard className="relative overflow-hidden p-6 md:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">TOPIK I · 한국어능력시험</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">{t("topik.title")}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">{t("topik.subtitle")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatTile label={t("topik.statAttempts")} value={submitted.length} />
            <StatTile label={t("topik.statBestMock")} value={mockResults.length ? `${bestMock} / 200` : "—"} />
            <StatTile label={t("topik.statLatestLevel")} value={latestMock ? levelLabel(t, latestMock.result) : "—"} />
          </div>
        </div>
      </GlassCard>

      {TOPIK_EXAMS.map((exam) => (
        <section key={exam.id} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">{exam.level} · {t("topik.form", { form: exam.form })}</p>
              <h2 className="text-2xl font-black">{t("topik.examTitle", { number: exam.number })}</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("topik.examMeta", { count: exam.questions.length })}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TOPIK_VARIANTS.filter((variant) => variant.examId === exam.id).map((variant) => (
              <VariantCard key={variant.id} variant={variant} attempts={attempts} />
            ))}
          </div>
        </section>
      ))}

      <section className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="p-6 lg:col-span-3">
          <h2 className="text-xl font-black">{t("topik.recentAttempts")}</h2>
          {submitted.length ? (
            <ul className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
              {submitted.slice(0, 12).map((attempt) => {
                const variant = getTopikVariant(attempt.variantId);
                return (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-bold">{variantTitle(t, variant)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(attempt.submittedAt, i18n.language)} · {formatClock(attempt.elapsedSeconds)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black tabular-nums dark:bg-white/10">{attempt.result?.total ?? 0} / {attempt.result?.maxTotal ?? 0}</span>
                      {variant.mode === "mock" && <LevelPill result={attempt.result} />}
                      <Link to={`/topik/result/${attempt.id}`} className="rounded-xl bg-slate-950 px-3 py-1.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{t("topik.viewResult")}</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t("topik.noAttempts")}</p>
          )}
        </GlassCard>
        <GlassCard className="p-6 lg:col-span-2">
          <h2 className="text-xl font-black">{t("topik.aboutTitle")}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>📝 {t("topik.aboutFormat")}</li>
            <li>⏱️ {t("topik.aboutTime")}</li>
            <li>🏅 {t("topik.aboutLevels")}</li>
            <li>💾 {t("topik.aboutStorage")}</li>
            <li>⌨️ {t("topik.aboutKeys")}</li>
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}

function VariantCard({ variant, attempts }) {
  const { t } = useTranslation();
  const active = attempts.find((attempt) => attempt.variantId === variant.id && attempt.status === "in_progress");
  const best = attempts
    .filter((attempt) => attempt.variantId === variant.id && attempt.status === "submitted")
    .reduce((max, attempt) => Math.max(max, attempt.result?.total || 0), -1);
  const accent = variant.mode === "mock" ? "from-sky-500 to-violet-600" : variant.mode === "listening" ? "from-emerald-500 to-sky-500" : "from-amber-500 to-rose-500";
  const icon = variant.mode === "mock" ? "🎯" : variant.mode === "listening" ? "🎧" : "📖";

  return (
    <GlassCard className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-xl text-white shadow-lg`}>{icon}</span>
        {best >= 0 && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">{t("topik.best", { score: best })}</span>}
      </div>
      <h3 className="mt-4 text-xl font-black">{variantTitle(t, variant)}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(`topik.variantDescription.${variant.mode}`)}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{variantSummary(t, variant)}</p>
      <Link
        to={`/topik/${variant.id}`}
        className={`mt-4 rounded-2xl px-4 py-3 text-center font-black transition hover:-translate-y-0.5 ${active ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"}`}
      >
        {active ? t("topik.resume") : t("topik.start")}
      </Link>
    </GlassCard>
  );
}

export function TopikAttemptPage() {
  const { variantId } = useParams();
  return <TopikAttemptRoute key={variantId} variantId={variantId} />;
}

function TopikAttemptRoute({ variantId }) {
  const navigate = useNavigate();
  const variant = getTopikVariant(variantId);
  const [attempt, setAttempt] = useState(() => (variant ? findActiveAttempt(variant.id) : null));

  if (!variant) return <Navigate to="/topik" replace />;
  if (!attempt) {
    return (
      <TopikIntro
        variant={variant}
        onStart={() => setAttempt(createTopikAttempt(variant.id))}
      />
    );
  }
  return (
    <TopikExam
      key={attempt.id}
      variant={variant}
      initialAttempt={attempt}
      onSubmitted={(submitted) => navigate(`/topik/result/${submitted.id}`, { replace: true })}
    />
  );
}

function TopikIntro({ variant, onStart }) {
  const { t } = useTranslation();
  const exam = getTopikExam(variant.examId);
  const rules = variant.mode === "mock"
    ? ["topik.rules.mockTimer", "topik.rules.autoSubmit", "topik.rules.audio", "topik.rules.saved", "topik.rules.noAi"]
    : ["topik.rules.untimed", variant.mode === "listening" ? "topik.rules.audio" : "topik.rules.paper", "topik.rules.saved", "topik.rules.ai"];

  return (
    <GlassCard className="mx-auto max-w-2xl p-6 md:p-8">
      <Link to="/topik" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("topik.back")}</Link>
      <p className="mt-6 text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">{exam.level} · {t("topik.form", { form: exam.form })}</p>
      <h1 className="mt-2 text-3xl font-black">{variantTitle(t, variant)}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{t(`topik.variantDescription.${variant.mode}`)}</p>
      <p className="mt-4 text-sm font-bold">{variantSummary(t, variant)}</p>
      <ul className="mt-6 space-y-2 rounded-2xl bg-slate-100/80 p-5 text-sm leading-6 dark:bg-white/5">
        {rules.map((rule) => (
          <li key={rule} className="flex gap-2"><span className="text-sky-500">•</span><span>{t(rule)}</span></li>
        ))}
      </ul>
      {variant.section !== "reading" && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">🎧 {t("topik.headphones")}</p>
      )}
      <button type="button" onClick={onStart} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-lg font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
        {t("topik.start")}
      </button>
    </GlassCard>
  );
}

function TopikExam({ variant, initialAttempt, onSubmitted }) {
  const { t } = useTranslation();
  const { setContext } = useTopikExamContext();
  const exam = getTopikExam(variant.examId);
  const questions = useMemo(() => getVariantQuestions(variant), [variant]);
  const [attempt, setAttempt] = useState(initialAttempt);
  const [cursor, setCursor] = useState(Math.min(initialAttempt.cursor || 0, questions.length - 1));
  const [now, setNow] = useState(Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const submittedRef = useRef(false);
  const audioRef = useRef(null);
  const lastAudioSaveRef = useRef(0);
  const questionHeadingRef = useRef(null);

  const question = questions[cursor];
  const answers = useMemo(() => attempt.answers || {}, [attempt.answers]);
  const flagged = useMemo(() => attempt.flagged || {}, [attempt.flagged]);
  const answeredCount = questions.filter((item) => answers[item.number]).length;
  const flaggedCount = questions.filter((item) => flagged[item.number]).length;
  const elapsed = Math.floor((now - attempt.startedAt) / 1000);
  const remaining = variant.durationSeconds ? variant.durationSeconds - elapsed : null;
  const hasListening = questions.some((item) => item.section === "listening");

  const persist = useCallback((patch) => {
    const next = updateTopikAttempt(attempt.id, patch);
    if (next) {
      setAttempt(next);
      setSaveError(false);
    } else {
      setAttempt((previous) => ({ ...previous, ...patch }));
      setSaveError(true);
    }
  }, [attempt.id]);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const audio = audioRef.current;
    if (audio) audio.pause();
    const submitted = submitTopikAttempt(attempt.id);
    if (submitted) onSubmitted(submitted);
    else submittedRef.current = false;
  }, [attempt.id, onSubmitted]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining !== null && remaining <= 0) finish();
  }, [remaining, finish]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    updateTopikAttempt(attempt.id, { cursor });
    const heading = questionHeadingRef.current;
    // Bring the new question's heading out from under the sticky exam bar.
    if (heading && heading.getBoundingClientRect().top < 200) {
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [attempt.id, cursor]);

  // Practice sections can ask the AI tutor about the current question; full mocks stay exam-like.
  useEffect(() => {
    if (variant.mode === "mock" || !question) {
      setContext(null);
    } else {
      setContext({
        examId: exam.id,
        variantId: variant.id,
        questionNumber: question.number,
        selectedOption: answers[question.number] || null,
        answers,
      });
    }
  }, [answers, exam.id, question, setContext, variant.id, variant.mode]);

  useEffect(() => () => setContext(null), [setContext]);

  const selectAnswer = useCallback((option) => {
    if (!question) return;
    const nextAnswers = { ...answers };
    if (nextAnswers[question.number] === option) delete nextAnswers[question.number];
    else nextAnswers[question.number] = option;
    persist({ answers: nextAnswers });
  }, [answers, persist, question]);

  const toggleFlag = useCallback(() => {
    if (!question) return;
    const nextFlagged = { ...flagged };
    if (nextFlagged[question.number]) delete nextFlagged[question.number];
    else nextFlagged[question.number] = true;
    persist({ flagged: nextFlagged });
  }, [flagged, persist, question]);

  const go = useCallback((index) => {
    setCursor(Math.max(0, Math.min(questions.length - 1, index)));
  }, [questions.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (confirmOpen || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest?.("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      if (OPTIONS.includes(event.key)) {
        event.preventDefault();
        selectAnswer(event.key);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(cursor + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(cursor - 1);
      } else if (event.key.toLowerCase() === "f") {
        toggleFlag();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, cursor, go, selectAnswer, toggleFlag]);

  const handleAudioTime = () => {
    const audio = audioRef.current;
    if (!audio || Date.now() - lastAudioSaveRef.current < 4000) return;
    lastAudioSaveRef.current = Date.now();
    updateTopikAttempt(attempt.id, { audioTime: audio.currentTime });
  };

  if (!question) return <GlassCard role="alert">{t("topik.noQuestions")}</GlassCard>;

  const timerTone = remaining === null
    ? "bg-white/80 text-slate-800 dark:bg-white/10 dark:text-white"
    : remaining < 300
      ? "animate-pulse bg-rose-600 text-white"
      : remaining < 600
        ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
        : "bg-white/80 text-slate-800 dark:bg-white/10 dark:text-white";
  const sectionChanged = cursor > 0 && questions[cursor - 1].section !== question.section;

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-44 lg:pb-0">
      <div className="sticky top-[3.75rem] z-30 -mx-4 border-b border-slate-200/70 bg-slate-50/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/90 md:rounded-2xl md:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link to="/topik" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("topik.back")}</Link>
            <h1 className="truncate text-lg font-black md:text-xl">{variantTitle(t, variant)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-xl bg-white/80 px-3 py-2 text-sm font-bold tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-300 sm:inline">
              {t("topik.answeredCount", { answered: answeredCount, total: questions.length })}
            </span>
            <div role="timer" aria-live="off" className={`rounded-xl px-3 py-2 text-base font-black tabular-nums md:text-lg ${timerTone}`}>
              {remaining === null ? `⏱ ${formatClock(elapsed)}` : `⏳ ${formatClock(remaining)}`}
            </div>
            <button type="button" onClick={() => setConfirmOpen(true)} className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white transition hover:bg-rose-700 md:px-4">
              {t("topik.finish")}
            </button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      {saveError && <p role="alert" className="rounded-2xl bg-rose-100 p-3 text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">{t("topik.saveError")}</p>}

      {hasListening && (
        <div className={`rounded-2xl border border-sky-200 bg-sky-50/90 p-3 dark:border-sky-400/20 dark:bg-sky-500/10 ${question.section === "listening" ? "" : "opacity-70"}`}>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-200">🎧 {t("topik.audioTitle", { number: exam.number })}</p>
          <audio
            ref={audioRef}
            className="w-full"
            controls
            preload="metadata"
            src={exam.audio}
            onLoadedMetadata={(event) => {
              if (attempt.audioTime) event.currentTarget.currentTime = attempt.audioTime;
            }}
            onTimeUpdate={handleAudioTime}
            onPause={() => updateTopikAttempt(attempt.id, { audioTime: audioRef.current?.currentTime || 0 })}
          >
            {t("topik.audioUnsupported")}
          </audio>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {sectionChanged && (
            <p className="rounded-2xl bg-violet-100 p-3 text-sm font-bold text-violet-900 dark:bg-violet-500/15 dark:text-violet-100">📖 {t("topik.readingStarts")}</p>
          )}
          <div ref={questionHeadingRef} className="flex scroll-mt-52 flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-black">{t("topik.questionNumber", { number: question.number })}</h2>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {question.section === "listening" ? t("topik.listening") : t("topik.reading")} · {t("topik.pointsCount", { count: question.points })} · {t("topik.paperPage", { number: question.page })}
            </span>
          </div>
          <PdfPageViewer url={exam.pdf} page={question.page} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-40 space-y-4">
            <GlassCard className="p-5">
              <AnswerControls
                question={question}
                selected={answers[question.number]}
                flagged={!!flagged[question.number]}
                onSelect={selectAnswer}
                onFlag={toggleFlag}
                onPrev={() => go(cursor - 1)}
                onNext={() => go(cursor + 1)}
                isFirst={cursor === 0}
                isLast={cursor === questions.length - 1}
                onFinish={() => setConfirmOpen(true)}
                showAi={variant.mode !== "mock"}
              />
            </GlassCard>
            <GlassCard className="p-5">
              <AnswerSheet questions={questions} answers={answers} flagged={flagged} cursor={cursor} onJump={go} />
            </GlassCard>
          </div>
        </aside>
      </div>

      <GlassCard className="p-5 lg:hidden">
        <AnswerSheet questions={questions} answers={answers} flagged={flagged} cursor={cursor} onJump={go} />
      </GlassCard>

      <Overlay>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
        <AnswerControls
          compact
          question={question}
          selected={answers[question.number]}
          flagged={!!flagged[question.number]}
          onSelect={selectAnswer}
          onFlag={toggleFlag}
          onPrev={() => go(cursor - 1)}
          onNext={() => go(cursor + 1)}
          isFirst={cursor === 0}
          isLast={cursor === questions.length - 1}
          onFinish={() => setConfirmOpen(true)}
          showAi={variant.mode !== "mock"}
        />
      </div>
      </Overlay>

      {confirmOpen && (
        <ConfirmSubmit
          unanswered={questions.length - answeredCount}
          flagged={flaggedCount}
          remaining={remaining}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={finish}
        />
      )}
    </div>
  );
}

function AnswerControls({ question, selected, flagged, onSelect, onFlag, onPrev, onNext, isFirst, isLast, onFinish, showAi, compact = false }) {
  const { t } = useTranslation();
  const openAi = () => window.dispatchEvent(new CustomEvent("k-talim:open-ai-chat"));
  return (
    <div className={compact ? "space-y-2.5" : "space-y-4"}>
      {!compact && <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("topik.chooseAnswer", { number: question.number })}</p>}
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={t("topik.chooseAnswer", { number: question.number })}>
        {OPTIONS.map((option) => {
          const active = selected === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(option)}
              className={`rounded-2xl border-2 font-black transition ${compact ? "py-2.5 text-2xl" : "py-4 text-3xl"} ${active ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-600/30" : "border-slate-200 bg-white text-slate-700 hover:border-sky-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"}`}
            >
              {OPTION_MARKS[option]}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={isFirst} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-30 dark:border-white/10">← {compact ? "" : t("topik.previous")}</button>
        <button type="button" onClick={onFlag} aria-pressed={flagged} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${flagged ? "bg-amber-400 text-slate-950" : "border border-slate-200 dark:border-white/10"}`}>
          ⚑ {flagged ? t("topik.flagged") : t("topik.flag")}
        </button>
        {showAi && (
          <button type="button" onClick={openAi} className="rounded-xl border border-violet-300 px-3 py-2 text-sm font-bold text-violet-700 dark:border-violet-400/30 dark:text-violet-200" title={t("topik.askAi")}>
            🤖{compact ? "" : ` ${t("topik.askAi")}`}
          </button>
        )}
        {isLast ? (
          <button type="button" onClick={onFinish} className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white">{t("topik.finish")}</button>
        ) : (
          <button type="button" onClick={onNext} className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">{compact ? "" : t("topik.next")} →</button>
        )}
      </div>
    </div>
  );
}

function AnswerSheet({ questions, answers, flagged, cursor, onJump, results }) {
  const { t } = useTranslation();
  const sections = ["listening", "reading"].filter((section) => questions.some((question) => question.section === section));
  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("topik.answerSheet")}</p>
      {sections.map((section) => (
        <div key={section}>
          <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{section === "listening" ? `🎧 ${t("topik.listening")}` : `📖 ${t("topik.reading")}`}</p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
            {questions.map((question, index) => {
              if (question.section !== section) return null;
              let tone;
              if (results) {
                tone = !answers[question.number]
                  ? "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                  : answers[question.number] === question.answer
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white";
              } else if (index === cursor) {
                tone = "bg-sky-600 text-white ring-2 ring-sky-300";
              } else if (answers[question.number]) {
                tone = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200";
              } else {
                tone = "bg-white text-slate-700 dark:bg-white/5 dark:text-slate-300";
              }
              return (
                <button
                  key={question.number}
                  type="button"
                  onClick={() => onJump(index)}
                  aria-label={t("topik.questionNumber", { number: question.number })}
                  aria-current={!results && index === cursor ? "step" : undefined}
                  className={`relative grid h-9 place-items-center rounded-lg border border-slate-200/70 text-xs font-black tabular-nums transition hover:scale-105 dark:border-white/10 ${tone}`}
                >
                  {question.number}
                  {flagged[question.number] && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!results && (
        <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-300" />{t("topik.legendAnswered")}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{t("topik.legendFlagged")}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-sky-600" />{t("topik.legendCurrent")}</span>
        </div>
      )}
    </div>
  );
}

function ConfirmSubmit({ unanswered, flagged, remaining, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const confirmRef = useRef(null);
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <Overlay>
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-labelledby="topik-submit-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <h2 id="topik-submit-title" className="text-2xl font-black">{t("topik.confirmTitle")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("topik.confirmText")}</p>
        <ul className="mt-4 space-y-2 text-sm font-semibold">
          <li className={unanswered ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"}>
            {unanswered ? t("topik.confirmUnanswered", { count: unanswered }) : t("topik.confirmAllAnswered")}
          </li>
          {flagged > 0 && <li className="text-amber-600 dark:text-amber-300">⚑ {t("topik.confirmFlagged", { count: flagged })}</li>}
          {remaining !== null && <li className="text-slate-500 dark:text-slate-400">⏳ {t("topik.confirmTimeLeft", { time: formatClock(remaining) })}</li>}
        </ul>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-bold dark:border-white/20">{t("topik.keepWorking")}</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 font-black text-white">{t("topik.finish")}</button>
        </div>
      </div>
    </div>
    </Overlay>
  );
}

export function TopikResultPage() {
  const { t, i18n } = useTranslation();
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const attempt = useMemo(() => getTopikAttempt(attemptId), [attemptId]);
  const [filter, setFilter] = useState("all");
  const [openQuestion, setOpenQuestion] = useState(null);

  if (!attempt || attempt.status !== "submitted") {
    return (
      <GlassCard role="alert" className="mx-auto max-w-xl text-center">
        <p className="font-bold">{t("topik.resultUnavailable")}</p>
        <Link to="/topik" className="mt-4 inline-block font-bold text-sky-600 underline dark:text-sky-300">{t("topik.backToTests")}</Link>
      </GlassCard>
    );
  }

  const variant = getTopikVariant(attempt.variantId);
  const exam = getTopikExam(variant.examId);
  const questions = getVariantQuestions(variant);
  const { result, answers = {}, flagged = {} } = attempt;
  const percent = result.maxTotal ? Math.round((result.total / result.maxTotal) * 100) : 0;
  const statusOf = (question) => (!answers[question.number] ? "unanswered" : answers[question.number] === question.answer ? "correct" : "incorrect");
  const visible = questions.filter((question) => {
    if (filter === "all") return true;
    if (filter === "flagged") return flagged[question.number];
    return statusOf(question) === filter;
  });
  const counts = {
    all: questions.length,
    correct: questions.filter((question) => statusOf(question) === "correct").length,
    incorrect: questions.filter((question) => statusOf(question) === "incorrect").length,
    unanswered: questions.filter((question) => statusOf(question) === "unanswered").length,
    flagged: questions.filter((question) => flagged[question.number]).length,
  };

  const retake = () => {
    createTopikAttempt(variant.id);
    navigate(`/topik/${variant.id}`);
  };
  const remove = () => {
    if (!window.confirm(t("topik.deleteConfirm"))) return;
    deleteTopikAttempt(attempt.id);
    navigate("/topik", { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <ScoreRing percent={percent} label={`${result.total}`} sub={`/ ${result.maxTotal}`} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">{exam.level} · {t("topik.form", { form: exam.form })}</p>
            <h1 className="mt-1 text-3xl font-black">{variantTitle(t, variant)}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(attempt.submittedAt, i18n.language)} · {t("topik.elapsed")}: {formatClock(attempt.elapsedSeconds)}</p>
            {variant.mode === "mock" && (
              <p className={`mt-4 inline-block rounded-2xl px-4 py-2 font-black ${result.level ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                {result.level ? `🏅 ${t("topik.estimatedLevel", { level: result.level })}` : t("topik.belowLevel")}
              </p>
            )}
            {variant.mode === "mock" && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("topik.levelHint", { level1: exam.level1Min, level2: exam.level2Min })}</p>
            )}
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {result.listening && <ScoreTile label={`🎧 ${t("topik.listeningScore")}`} value={`${result.listening.score} / 100`} sub={t("topik.correctOf", { correct: result.listening.correct, total: result.listening.total })} />}
          {result.reading && <ScoreTile label={`📖 ${t("topik.readingScore")}`} value={`${result.reading.score} / 100`} sub={t("topik.correctOf", { correct: result.reading.correct, total: result.reading.total })} />}
          <ScoreTile label={t("topik.accuracy")} value={`${counts.all ? Math.round((counts.correct / counts.all) * 100) : 0}%`} sub={t("topik.correctOf", { correct: counts.correct, total: counts.all })} />
          <ScoreTile label={t("topik.unanswered")} value={counts.unanswered} sub={t("topik.questionsWord")} />
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={retake} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white dark:bg-white dark:text-slate-950">{t("topik.retake")}</button>
          <Link to="/topik" className="rounded-2xl border border-slate-300 px-5 py-3 font-bold dark:border-white/20">{t("topik.backToTests")}</Link>
          <button type="button" onClick={remove} className="rounded-2xl px-5 py-3 font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">{t("topik.deleteAttempt")}</button>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <GlassCard className="h-fit p-5 lg:sticky lg:top-24">
          <AnswerSheet
            questions={questions}
            answers={answers}
            flagged={flagged}
            cursor={-1}
            results
            onJump={(index) => {
              setFilter("all");
              setOpenQuestion(questions[index].number);
              window.setTimeout(() => document.getElementById(`review-${questions[index].number}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
          />
        </GlassCard>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">{t("topik.reviewAnswers")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {["all", "incorrect", "unanswered", "correct", "flagged"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                >
                  {t(`topik.filter.${key}`)} ({counts[key]})
                </button>
              ))}
            </div>
          </div>
          {visible.length === 0 && <GlassCard className="text-sm text-slate-500 dark:text-slate-400">{t("topik.filterEmpty")}</GlassCard>}
          {visible.map((question) => {
            const status = statusOf(question);
            const open = openQuestion === question.number;
            return (
              <GlassCard key={question.number} id={`review-${question.number}`} className="scroll-mt-24 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-black text-white ${status === "correct" ? "bg-emerald-500" : status === "incorrect" ? "bg-rose-500" : "bg-slate-400"}`}>{question.number}</span>
                    <div>
                      <p className="font-black">
                        {status === "correct" ? `✓ ${t("topik.correct")}` : status === "incorrect" ? `✗ ${t("topik.incorrect")}` : t("topik.unanswered")}
                        {flagged[question.number] && <span className="ml-2 text-amber-500">⚑</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {question.section === "listening" ? t("topik.listening") : t("topik.reading")} · {status === "correct" ? question.points : 0}/{question.points} {t("topik.pointsShort")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{t("topik.yourAnswer")}: <b className={status === "incorrect" ? "text-rose-600 dark:text-rose-300" : ""}>{answers[question.number] ? OPTION_MARKS[answers[question.number]] : "—"}</b></span>
                    <span>{t("topik.correctAnswer")}: <b className="text-emerald-600 dark:text-emerald-300">{OPTION_MARKS[question.answer]}</b></span>
                    <button type="button" onClick={() => setOpenQuestion(open ? null : question.number)} aria-expanded={open} className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold dark:border-white/10">
                      {open ? t("topik.hidePaper") : t("topik.showPaper")}
                    </button>
                  </div>
                </div>
                {open && <PdfPageViewer url={exam.pdf} page={question.page} className="mt-4" maxHeightClass="max-h-[70vh]" />}
              </GlassCard>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function ScoreRing({ percent, label, sub }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-white/10" />
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-sky-500 transition-all duration-700" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><p className="text-4xl font-black tabular-nums">{label}</p><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{sub}</p></div>
      </div>
    </div>
  );
}

function ScoreTile({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-slate-100/90 p-4 dark:bg-white/5">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function LevelPill({ result }) {
  const { t } = useTranslation();
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${result?.level ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}>
      {levelLabel(t, result)}
    </span>
  );
}
