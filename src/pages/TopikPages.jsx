import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import PdfPageViewer from "../components/PdfPageViewer";
import TopikQuestion, { preloadPaperPages } from "../components/TopikQuestion";
import { useTopikExamContext } from "../hooks/useTopikExamContext";
import {
  TOPIK_EXAMS,
  TOPIK_VARIANTS,
  getTopikExam,
  getQuestionType,
  getTopikVariant,
  getVariantQuestions,
  questionTypeBreakdown,
} from "../data/topik/exams";
import { formatDate } from "../lib/dates";
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(attempt.submittedAt, i18n.language, { time: true })} · {formatClock(attempt.elapsedSeconds)}</p>
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
    return <TopikIntro variant={variant} onStart={() => setAttempt(createTopikAttempt(variant.id))} />;
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

function useCandidate() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  return name || t("topik.guestCandidate");
}

function candidateNumber(exam, attemptId = "") {
  const digits = attemptId.replace(/[^0-9]/g, "").padEnd(6, "0").slice(0, 6);
  return `${String(exam.number).padStart(3, "0")}-${digits}`;
}

// Mirrors the steps before a computer-based TOPIK: confirm the candidate,
// check the sound, read the rules, then start.
function TopikIntro({ variant, onStart }) {
  const { t } = useTranslation();
  const exam = getTopikExam(variant.examId);
  const candidate = useCandidate();
  const hasAudio = variant.section !== "reading";
  const steps = hasAudio ? ["candidate", "sound", "rules"] : ["candidate", "rules"];
  const [step, setStep] = useState(0);
  const [soundOk, setSoundOk] = useState(false);
  const soundRef = useRef(null);
  const current = steps[step];
  const rules = variant.mode === "mock"
    ? ["topik.rules.mockTimer", "topik.rules.autoSubmit", "topik.rules.examAudio", "topik.rules.saved", "topik.rules.noAi"]
    : ["topik.rules.untimed", hasAudio ? "topik.rules.audio" : "topik.rules.paper", "topik.rules.saved", "topik.rules.ai"];

  useEffect(() => () => soundRef.current?.pause(), []);

  const playSample = () => {
    const audio = soundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    window.setTimeout(() => audio.pause(), 8000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/topik" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("topik.back")}</Link>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[#17305a] px-6 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">{exam.level} · 제{exam.number}회 한국어능력시험</p>
            <p className="mt-0.5 text-lg font-black">{variantTitle(t, variant)}</p>
          </div>
          <p className="text-sm font-bold text-sky-100">{step + 1} / {steps.length}</p>
        </div>
        <ol className="flex border-b border-slate-200 text-xs font-bold dark:border-white/10">
          {steps.map((name, index) => (
            <li key={name} className={`flex-1 px-3 py-2.5 text-center ${index === step ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200" : index < step ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400"}`}>
              {index < step ? "✓ " : ""}{t(`topik.introStep.${name}`)}
            </li>
          ))}
        </ol>
        <div className="p-6 md:p-8">
          {current === "candidate" && (
            <div>
              <h1 className="text-2xl font-black">수험자 정보 확인 <span className="text-base font-bold text-slate-500">· {t("topik.introStep.candidate")}</span></h1>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoRow label={t("topik.candidateName")} value={candidate} />
                <InfoRow label={t("topik.examLabel")} value={`${exam.level} · ${t("topik.form", { form: exam.form })}`} />
                <InfoRow label={t("topik.questionsLabel")} value={variantSummary(t, variant)} />
                <InfoRow label={t("topik.sectionsLabel")} value={variant.section ? t(`topik.${variant.section}`) : `${t("topik.listening")} + ${t("topik.reading")}`} />
              </dl>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t(`topik.variantDescription.${variant.mode}`)}</p>
            </div>
          )}
          {current === "sound" && (
            <div className="text-center">
              <h1 className="text-2xl font-black">소리 확인 <span className="text-base font-bold text-slate-500">· {t("topik.introStep.sound")}</span></h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{t("topik.soundCheckText")}</p>
              <audio ref={soundRef} src={exam.audio} preload="none" />
              <button type="button" onClick={playSample} className="mx-auto mt-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-4xl text-white shadow-xl transition hover:scale-105">🔊</button>
              <label className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-3 rounded-2xl bg-slate-100 p-4 text-left text-sm font-bold dark:bg-white/5">
                <input type="checkbox" checked={soundOk} onChange={(event) => setSoundOk(event.target.checked)} className="h-5 w-5 accent-sky-600" />
                {t("topik.soundCheckConfirm")}
              </label>
            </div>
          )}
          {current === "rules" && (
            <div>
              <h1 className="text-2xl font-black">유의 사항 <span className="text-base font-bold text-slate-500">· {t("topik.introStep.rules")}</span></h1>
              <ul className="mt-5 space-y-3">
                {rules.map((rule, index) => (
                  <li key={rule} className="flex gap-3 rounded-2xl bg-slate-100 p-4 text-sm leading-6 dark:bg-white/5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#17305a] text-xs font-black text-white">{index + 1}</span>
                    <span>{t(rule)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((value) => value - 1)} disabled={step === 0} className="rounded-2xl border border-slate-300 px-5 py-3 font-bold disabled:opacity-0 dark:border-white/20">← {t("topik.previous")}</button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => { soundRef.current?.pause(); setStep((value) => value + 1); }} disabled={current === "sound" && !soundOk} className="rounded-2xl bg-[#17305a] px-6 py-3 font-black text-white disabled:opacity-40">
                {t("topik.next")} →
              </button>
            ) : (
              <button type="button" onClick={onStart} className="rounded-2xl bg-rose-600 px-6 py-3 text-lg font-black text-white shadow-lg shadow-rose-600/25 transition hover:-translate-y-0.5">
                시험 시작 · {t("topik.start")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-black">{value}</dd>
    </div>
  );
}

// Full mocks play the recording the way the exam does: once, from the start,
// without pausing or seeking. Its position follows the clock, so reopening the
// page resumes where the recording would be in the room.
function ExamAudio({ exam, examMode, startedAt, savedTime, onSaveTime }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume, setVolume] = useState(1);
  const lastSaveRef = useRef(0);

  const expected = () => (Date.now() - startedAt) / 1000;

  const syncAndPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration && expected() >= audio.duration) return;
    audio.currentTime = Math.max(0, expected());
    audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    // startedAt never changes during an attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  const finished = examMode && duration > 0 && position >= duration - 0.5;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-3 dark:border-sky-400/20 dark:bg-slate-900">
      <audio
        ref={audioRef}
        src={exam.audio}
        preload="metadata"
        controls={!examMode}
        className={examMode ? "hidden" : "w-full"}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          if (examMode && expected() >= event.currentTarget.duration) setPosition(event.currentTarget.duration);
          else if (examMode) syncAndPlay();
          else if (savedTime) event.currentTarget.currentTime = savedTime;
        }}
        onTimeUpdate={(event) => {
          setPosition(event.currentTarget.currentTime);
          if (!examMode && Date.now() - lastSaveRef.current > 4000) {
            lastSaveRef.current = Date.now();
            onSaveTime(event.currentTarget.currentTime);
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={(event) => {
          setPlaying(false);
          if (examMode && !event.currentTarget.ended && expected() < (event.currentTarget.duration || Infinity)) {
            // Exam audio cannot be paused; a pause here means the browser stopped it.
            setBlocked(true);
          }
          if (!examMode) onSaveTime(event.currentTarget.currentTime);
        }}
      >
        {t("topik.audioUnsupported")}
      </audio>
      {examMode && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${playing ? "animate-pulse bg-rose-600" : "bg-slate-400"}`}>{finished ? "✓" : "🎧"}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#17305a] dark:text-sky-200">
              {finished ? t("topik.audioFinished") : playing ? `듣기 · ${t("topik.audioPlaying")}` : t("topik.audioWaiting")}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${duration ? Math.min(100, (position / duration) * 100) : 0}%` }} />
            </div>
            <p className="mt-0.5 text-[11px] font-bold tabular-nums text-slate-500">{formatClock(position)} / {formatClock(duration)}</p>
          </div>
          {blocked && !finished && (
            <button type="button" onClick={syncAndPlay} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white">▶ {t("topik.audioResume")}</button>
          )}
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            🔈
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              aria-label={t("topik.volume")}
              onChange={(event) => {
                const value = Number(event.target.value);
                setVolume(value);
                if (audioRef.current) audioRef.current.volume = value;
              }}
              className="w-20 accent-sky-600"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function TopikExam({ variant, initialAttempt, onSubmitted }) {
  const { t } = useTranslation();
  const { setContext } = useTopikExamContext();
  const candidate = useCandidate();
  const exam = getTopikExam(variant.examId);
  const questions = useMemo(() => getVariantQuestions(variant), [variant]);
  const isMock = variant.mode === "mock";
  const [attempt, setAttempt] = useState(initialAttempt);
  const [cursor, setCursor] = useState(Math.min(initialAttempt.cursor || 0, questions.length - 1));
  const [now, setNow] = useState(Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [warning, setWarning] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const submittedRef = useRef(false);
  const timeSpentRef = useRef({ ...(initialAttempt.timeSpent || {}) });
  const warnedRef = useRef(new Set());
  const scrollRef = useRef(null);

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
    updateTopikAttempt(attempt.id, { timeSpent: timeSpentRef.current });
    const submitted = submitTopikAttempt(attempt.id);
    if (submitted) onSubmitted(submitted);
    else submittedRef.current = false;
  }, [attempt.id, onSubmitted]);

  const questionRef = useRef(question);
  questionRef.current = question;

  // One clock drives the timer, time-per-question and the exam warnings.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === "visible" && questionRef.current) {
        const number = questionRef.current.number;
        timeSpentRef.current[number] = (timeSpentRef.current[number] || 0) + 1;
      }
    }, 1000);
    const spent = timeSpentRef.current;
    const save = window.setInterval(() => updateTopikAttempt(attempt.id, { timeSpent: spent }), 10000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(save);
      updateTopikAttempt(attempt.id, { timeSpent: spent });
    };
  }, [attempt.id]);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      setTimeUp(true);
      return;
    }
    for (const minutes of [10, 5, 1]) {
      if (remaining <= minutes * 60 && remaining > minutes * 60 - 5 && !warnedRef.current.has(minutes)) {
        warnedRef.current.add(minutes);
        setWarning(minutes);
      }
    }
  }, [remaining]);

  useEffect(() => {
    if (!warning) return undefined;
    const timer = window.setTimeout(() => setWarning(null), 6000);
    return () => window.clearTimeout(timer);
  }, [warning]);

  // Time is up: show the closing notice briefly, then hand in the answer sheet.
  useEffect(() => {
    if (!timeUp) return undefined;
    const timer = window.setTimeout(finish, 2500);
    return () => window.clearTimeout(timer);
  }, [timeUp, finish]);

  // Lock the page behind the exam screen and guard against closing it by accident.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const guard = (event) => {
      if (!isMock || submittedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("beforeunload", guard);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [isMock]);

  useEffect(() => {
    const pages = questions.slice(cursor, cursor + 3).flatMap((item) => {
      const content = exam.content?.[item.number];
      return [content?.shared?.page, content?.stem?.page, content?.options?.[0]?.box?.page];
    });
    preloadPaperPages(exam.pdf, [...new Set(pages.filter(Boolean))]);
  }, [cursor, exam, questions]);

  useEffect(() => {
    updateTopikAttempt(attempt.id, { cursor });
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [attempt.id, cursor]);

  // Practice sections can ask the AI tutor about the current question; full mocks stay exam-like.
  useEffect(() => {
    if (isMock || !question) {
      setContext(null);
    } else {
      setContext({ examId: exam.id, variantId: variant.id, questionNumber: question.number, selectedOption: answers[question.number] || null, answers });
    }
  }, [answers, exam.id, isMock, question, setContext, variant.id]);

  useEffect(() => () => setContext(null), [setContext]);

  const selectAnswer = useCallback((option) => {
    if (!question || timeUp) return;
    const nextAnswers = { ...answers };
    if (nextAnswers[question.number] === option) delete nextAnswers[question.number];
    else nextAnswers[question.number] = option;
    persist({ answers: nextAnswers });
  }, [answers, persist, question, timeUp]);

  const toggleFlag = useCallback(() => {
    if (!question) return;
    const nextFlagged = { ...flagged };
    if (nextFlagged[question.number]) delete nextFlagged[question.number];
    else nextFlagged[question.number] = true;
    persist({ flagged: nextFlagged });
  }, [flagged, persist, question]);

  const go = useCallback((index) => {
    setCursor(Math.max(0, Math.min(questions.length - 1, index)));
    setSheetOpen(false);
  }, [questions.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (confirmOpen || paperOpen || timeUp || event.metaKey || event.ctrlKey || event.altKey) return;
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
  }, [confirmOpen, cursor, go, paperOpen, selectAnswer, timeUp, toggleFlag]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  if (!question) return <GlassCard role="alert">{t("topik.noQuestions")}</GlassCard>;

  const timerTone = remaining === null
    ? "bg-white/10 text-white"
    : remaining < 300
      ? "animate-pulse bg-rose-600 text-white"
      : remaining < 600
        ? "bg-amber-400 text-slate-950"
        : "bg-white text-[#17305a]";
  const sectionLabel = question.section === "listening" ? `듣기 · ${t("topik.listening")}` : `읽기 · ${t("topik.reading")}`;
  const sectionStart = (section) => questions.findIndex((item) => item.section === section);

  const controls = (compact) => (
    <AnswerControls
      compact={compact}
      question={question}
      flagged={!!flagged[question.number]}
      onFlag={toggleFlag}
      onPrev={() => go(cursor - 1)}
      onNext={() => go(cursor + 1)}
      isFirst={cursor === 0}
      isLast={cursor === questions.length - 1}
      onFinish={() => setConfirmOpen(true)}
      showAi={!isMock}
    />
  );

  return (
    <Overlay>
      <div className="fixed inset-0 z-[55] flex flex-col bg-slate-100 text-slate-900 dark:bg-[#0b1220] dark:text-white" role="application" aria-label={variantTitle(t, variant)}>
        <header className="shrink-0 bg-[#17305a] text-white shadow-lg">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 md:px-5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">{exam.level} · 제{exam.number}회 한국어능력시험</p>
              <p className="truncate text-base font-black md:text-lg">{sectionLabel}</p>
            </div>
            <div className="hidden text-right text-xs leading-5 md:block">
              <p><span className="text-sky-200">수험번호</span> <b className="tabular-nums">{candidateNumber(exam, attempt.id)}</b></p>
              <p><span className="text-sky-200">{t("topik.candidateName")}</span> <b>{candidate}</b></p>
            </div>
            <div role="timer" aria-live="off" className={`rounded-xl px-3 py-1.5 text-center font-black tabular-nums ${timerTone}`}>
              <p className="text-[10px] font-bold opacity-80">{remaining === null ? "경과 시간" : "남은 시간"}</p>
              <p className="text-lg leading-tight md:text-xl">{formatClock(remaining === null ? elapsed : remaining)}</p>
            </div>
            <button type="button" onClick={toggleFullscreen} title={t("topik.fullscreen")} aria-label={t("topik.fullscreen")} className="hidden h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg transition hover:bg-white/20 sm:grid">⛶</button>
            <button type="button" onClick={() => setConfirmOpen(true)} className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-black transition hover:bg-rose-500 md:px-4">
              답안 제출<span className="hidden sm:inline"> · {t("topik.finish")}</span>
            </button>
          </div>
          <div className="bg-[#0f2343]">
            <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-1.5 text-xs font-bold md:px-5">
              {isMock && ["listening", "reading"].map((section) => (
                <button key={section} type="button" onClick={() => go(sectionStart(section))} className={`rounded-lg px-2.5 py-1 transition ${question.section === section ? "bg-white text-[#17305a]" : "text-sky-100 hover:bg-white/10"}`}>
                  {section === "listening" ? "듣기 1–30" : "읽기 31–70"}
                </button>
              ))}
              <span className="ml-auto tabular-nums text-sky-100">{t("topik.answeredCount", { answered: answeredCount, total: questions.length })}</span>
              <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-white/15 sm:block">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </header>

        {warning && (
          <div role="alert" className="absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-2xl bg-amber-400 px-5 py-3 text-center font-black text-slate-950 shadow-2xl">
            ⏰ 시험 종료 {warning}분 전입니다 · {t("topik.timeWarning", { minutes: warning })}
          </div>
        )}

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto grid max-w-[1500px] gap-4 p-3 pb-48 md:p-5 lg:grid-cols-[minmax(0,1fr)_23rem] lg:pb-5">
            <main className="min-w-0 space-y-3">
              {saveError && <p role="alert" className="rounded-2xl bg-rose-100 p-3 text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">{t("topik.saveError")}</p>}
              {hasListening && (
                <div className={question.section === "listening" || !isMock ? "" : "opacity-70"}>
                  <ExamAudio
                    exam={exam}
                    examMode={isMock}
                    startedAt={attempt.startedAt}
                    savedTime={attempt.audioTime}
                    onSaveTime={(time) => updateTopikAttempt(attempt.id, { audioTime: time })}
                  />
                </div>
              )}
              <TopikQuestion
                exam={exam}
                question={question}
                selected={answers[question.number]}
                onSelect={selectAnswer}
                showShared={showSharedFor(exam, question)}
              />
              <div className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900 lg:block">{controls(false)}</div>
              <button type="button" onClick={() => setPaperOpen(true)} className="text-sm font-bold text-slate-500 underline decoration-dotted underline-offset-4 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                📄 {t("topik.viewOriginalPage", { number: question.page })}
              </button>
            </main>

            <aside className="hidden lg:block">
              <div className="sticky top-5 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <AnswerSheet questions={questions} answers={answers} flagged={flagged} cursor={cursor} onJump={go} />
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-950 lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-black">{question.number}번 {answers[question.number] ? `· ${OPTION_MARKS[answers[question.number]]}` : ""}</span>
            <button type="button" onClick={() => setSheetOpen(true)} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/10">
              ☰ {t("topik.answerSheet")} · {answeredCount}/{questions.length}
            </button>
          </div>
          {controls(true)}
        </div>

        {paperOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3" onClick={() => setPaperOpen(false)}>
            <div role="dialog" aria-modal="true" className="flex max-h-full w-full max-w-4xl flex-col gap-2" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => setPaperOpen(false)} className="self-end rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-900">✕ {t("topik.closeSheet")}</button>
              <PdfPageViewer url={exam.pdf} page={question.page} maxHeightClass="max-h-[80vh]" />
            </div>
          </div>
        )}

        {sheetOpen && (
          <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/50 lg:hidden" onClick={() => setSheetOpen(false)}>
            <div role="dialog" aria-modal="true" className="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
              <AnswerSheet questions={questions} answers={answers} flagged={flagged} cursor={cursor} onJump={go} />
              <button type="button" onClick={() => setSheetOpen(false)} className="mt-4 w-full rounded-2xl border border-slate-300 py-3 font-bold dark:border-white/20">{t("topik.closeSheet")}</button>
            </div>
          </div>
        )}

        {confirmOpen && (
          <ConfirmSubmit
            unanswered={questions.length - answeredCount}
            flagged={flaggedCount}
            remaining={remaining}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={finish}
          />
        )}

        {timeUp && (
          <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4">
            <div role="alertdialog" className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
              <p className="text-5xl">⏰</p>
              <h2 className="mt-3 text-2xl font-black">시험이 종료되었습니다</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{t("topik.timeUpText")}</p>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// Shared passages repeat on every question of a "read/listen and answer" set;
// a <보기> example is shown once, on the first question of its block.
function showSharedFor(exam, question) {
  const content = exam.content?.[question.number];
  if (!content) return false;
  return content.instruction.includes("물음에 답하십시오") || content.group[0] === question.number;
}

function AnswerControls({ question, flagged, onFlag, onPrev, onNext, isFirst, isLast, onFinish, showAi, compact = false }) {
  const { t } = useTranslation();
  const openAi = () => window.dispatchEvent(new CustomEvent("k-talim:open-ai-chat"));
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={isFirst} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-30 dark:border-white/10">
          ← {compact ? "" : `이전 · ${t("topik.prevQuestion")}`}
        </button>
        <button type="button" onClick={onFlag} aria-pressed={flagged} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${flagged ? "bg-amber-400 text-slate-950" : "border border-slate-200 dark:border-white/10"}`}>
          ⚑ {flagged ? t("topik.flagged") : t("topik.flag")}
        </button>
        {showAi && (
          <button type="button" onClick={openAi} className="rounded-xl border border-violet-300 px-3 py-2 text-sm font-bold text-violet-700 dark:border-violet-400/30 dark:text-violet-200" title={t("topik.askAi")}>
            🤖{compact ? "" : ` ${t("topik.askAi")}`}
          </button>
        )}
        {isLast ? (
          <button type="button" onClick={onFinish} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white">답안 제출</button>
        ) : (
          <button type="button" onClick={onNext} className="rounded-xl bg-[#17305a] px-4 py-2.5 text-sm font-black text-white dark:bg-sky-500">
            {compact ? "" : `다음 · ${t("topik.nextQuestion")} `}→
          </button>
        )}
      </div>
      {!compact && <p className="text-center text-[11px] text-slate-400">{t("topik.keysHint")} · {question.number}번</p>}
    </div>
  );
}

function AnswerSheet({ questions, answers, flagged, cursor, onJump, results }) {
  const { t } = useTranslation();
  const sections = ["listening", "reading"].filter((section) => questions.some((question) => question.section === section));
  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">답안지 · {t("topik.answerSheet")}</p>
      {sections.map((section) => (
        <div key={section}>
          <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{section === "listening" ? `🎧 듣기 · ${t("topik.listening")}` : `📖 읽기 · ${t("topik.reading")}`}</p>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
            {questions.map((question, index) => {
              if (question.section !== section) return null;
              const chosen = answers[question.number];
              let tone;
              if (results) {
                tone = !chosen
                  ? "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                  : chosen === question.answer
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white";
              } else if (index === cursor) {
                tone = "bg-sky-600 text-white ring-2 ring-sky-300";
              } else if (chosen) {
                tone = "bg-[#17305a] text-white dark:bg-sky-500/70";
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
                  className={`relative flex h-10 flex-col items-center justify-center rounded-lg border border-slate-200/70 text-[11px] font-black leading-none tabular-nums transition hover:scale-105 dark:border-white/10 ${tone}`}
                >
                  <span>{question.number}</span>
                  {chosen && <span className="mt-0.5 text-[10px] opacity-90">{OPTION_MARKS[chosen]}</span>}
                  {flagged[question.number] && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!results && (
        <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#17305a] dark:bg-sky-500/70" />{t("topik.legendAnswered")}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{t("topik.legendFlagged")}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-sky-600 ring-1 ring-sky-300" />{t("topik.legendCurrent")}</span>
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-labelledby="topik-submit-title" className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <div className="bg-[#17305a] px-6 py-4 text-white">
          <h2 id="topik-submit-title" className="text-xl font-black">답안을 제출하시겠습니까?</h2>
          <p className="text-sm text-sky-100">{t("topik.confirmTitle")}</p>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300">{t("topik.confirmText")}</p>
          <ul className="mt-4 space-y-2 text-sm font-semibold">
            <li className={unanswered ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"}>
              {unanswered ? `✗ ${t("topik.confirmUnanswered", { count: unanswered })}` : `✓ ${t("topik.confirmAllAnswered")}`}
            </li>
            {flagged > 0 && <li className="text-amber-600 dark:text-amber-300">⚑ {t("topik.confirmFlagged", { count: flagged })}</li>}
            {remaining !== null && <li className="text-slate-500 dark:text-slate-400">⏳ {t("topik.confirmTimeLeft", { time: formatClock(remaining) })}</li>}
          </ul>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-bold dark:border-white/20">{t("topik.keepWorking")}</button>
            <button ref={confirmRef} type="button" onClick={onConfirm} className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 font-black text-white">제출 · {t("topik.finish")}</button>
          </div>
        </div>
      </div>
    </div>
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
  const { result, answers = {}, flagged = {}, timeSpent = {} } = attempt;
  const breakdown = questionTypeBreakdown(questions, answers);
  const slowest = questions
    .filter((question) => timeSpent[question.number])
    .sort((a, b) => timeSpent[b.number] - timeSpent[a.number])
    .slice(0, 5);
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
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(attempt.submittedAt, i18n.language, { time: true })} · {t("topik.elapsed")}: {formatClock(attempt.elapsedSeconds)}</p>
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

      <GlassCard className="p-6 md:p-8">
        <h2 className="text-2xl font-black">{t("topik.typeAnalysis")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("topik.typeAnalysisHint")}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {breakdown.map((group) => {
            const percentCorrect = Math.round((group.correct / group.total) * 100);
            const tone = percentCorrect >= 80 ? "bg-emerald-500" : percentCorrect >= 50 ? "bg-amber-400" : "bg-rose-500";
            return (
              <div key={group.key} className="rounded-2xl bg-slate-100/90 p-4 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black">{group.ko}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.section === "listening" ? "🎧" : "📖"} {t(`topik.type.${group.id}`)} · {group.ranges.join(", ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black tabular-nums">{group.correct}/{group.total}</p>
                    {group.lost > 0 && <p className="text-xs font-bold text-rose-600 dark:text-rose-300">−{group.lost} {t("topik.pointsShort")}</p>}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className={`h-full rounded-full ${tone}`} style={{ width: `${percentCorrect}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {slowest.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">⏱ {t("topik.slowestQuestions")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slowest.map((question) => (
                <span key={question.number} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold dark:bg-white/10">
                  {question.number}번 · {formatClock(timeSpent[question.number])}
                </span>
              ))}
            </div>
          </div>
        )}
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
                        {getQuestionType(question.number) && ` · ${getQuestionType(question.number).ko}`}
                        {timeSpent[question.number] ? ` · ⏱ ${formatClock(timeSpent[question.number])}` : ""}
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
                {open && (
                  <div className="mt-4 rounded-2xl bg-slate-100/80 p-3 dark:bg-white/5 md:p-4">
                    <TopikQuestion exam={exam} question={question} selected={answers[question.number]} review showShared />
                  </div>
                )}
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
