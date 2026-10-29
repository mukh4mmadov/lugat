import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { lessons } from "../data";
import { GRAMMAR, GRAMMAR_COURSES, getGrammarPoint, grammarForLesson, rowText, tr } from "../data/grammar";
import { useAuth } from "../hooks/useAuth";
import { buildPractice } from "../lib/grammarDrills";
import { getDeviceId } from "../lib/deviceId";
import { speakKorean } from "../lib/speech";
import { supabase } from "../lib/supabase";
import { completeGrammar } from "../store";
import { ModeHeader } from "./FlashcardsPage";

const PASS_PERCENT = 70;

function usePointDone(id) {
  return useSelector((state) => Boolean(state.progress.grammar?.[id]?.done));
}

function PointCard({ point }) {
  const { i18n } = useTranslation();
  const done = usePointDone(point.id);
  return (
    <Link
      to={`/grammar/${point.id}`}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${done ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10" : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"}`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
        {done ? "✓" : "📐"}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-black" lang="ko">{point.pattern}</span>
        <span className="block truncate text-xs text-slate-500">{tr(point.title, i18n.language)}</span>
      </span>
    </Link>
  );
}

// /grammar — every point, grouped by book and lesson.
export function GrammarCatalogPage() {
  const { t } = useTranslation();
  const grammar = useSelector((state) => state.progress.grammar || {});
  const done = GRAMMAR.filter((point) => grammar[point.id]?.done).length;
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-black md:text-3xl">📐 {t("grammar.title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("grammar.subtitle", { done, total: GRAMMAR.length })}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((done / GRAMMAR.length) * 100)}%` }} />
        </div>
      </header>
      {GRAMMAR_COURSES.map((course) => (
        <GlassCard key={course.id} className="!p-5">
          <h2 className="text-xl font-black">K-TALIM {course.id}</h2>
          <div className="mt-4 space-y-4">
            {[...new Set(course.points.map((point) => point.lesson))].map((lesson) => (
              <section key={lesson}>
                <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">{t("card.lesson", { lesson })}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {course.points.filter((point) => point.lesson === lesson).map((point) => <PointCard key={point.id} point={point} />)}
                </div>
              </section>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// /lesson/:lessonId/grammar — the lesson's points under the lesson tabs.
export function LessonGrammarPage() {
  const { t } = useTranslation();
  const { lessonId } = useParams();
  const points = grammarForLesson(lessonId);
  return (
    <div className="space-y-6">
      <ModeHeader lesson={Number(lessonId)} />
      <GlassCard className="!p-5">
        <h2 className="text-xl font-black">📐 {t("grammar.lessonTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("grammar.lessonText")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {points.map((point) => <PointCard key={point.id} point={point} />)}
        </div>
        <Link to="/grammar" className="mt-4 inline-block text-sm font-bold text-sky-600 dark:text-sky-300">{t("grammar.allPoints")} →</Link>
      </GlassCard>
    </div>
  );
}

function Practice({ point, onFinish }) {
  const { t, i18n } = useTranslation();
  const words = useMemo(() => lessons.slice(0, point.lesson).flat(), [point.lesson]);
  const [questions] = useState(() => buildPractice(point, words));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [order, setOrder] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const question = questions[index];

  if (!question) return null;
  const answered = picked !== null;
  const isOrder = question.type === "order";
  const orderDone = isOrder && order.length === question.tokens.length;
  const orderRight = orderDone && order.map((i) => question.tokens[i]).join(" ") === question.answer;
  const right = isOrder ? orderRight : picked === question.answer;

  function check(value) {
    if (answered) return;
    setPicked(value);
    if (value === question.answer) setCorrectCount((count) => count + 1);
  }

  function next() {
    const gained = isOrder && orderRight ? 1 : 0;
    const total = correctCount + gained;
    if (index + 1 >= questions.length) {
      onFinish(Math.round((total / questions.length) * 100));
      return;
    }
    if (gained) setCorrectCount(total);
    setIndex(index + 1);
    setPicked(null);
    setOrder([]);
  }

  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between text-xs font-black text-slate-500">
        <span>{t("grammar.question", { current: index + 1, total: questions.length })}</span>
        <span>✓ {correctCount}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      {isOrder ? (
        <div className="mt-5">
          <p className="text-sm font-bold text-slate-500">{t("grammar.orderPrompt")}</p>
          <p className="mt-1 font-semibold">{rowText(question.example, i18n.language)}</p>
          <div className="mt-4 min-h-[3.5rem] rounded-2xl border-2 border-dashed border-slate-300 p-3 text-xl font-bold dark:border-white/15" lang="ko">
            {order.map((i) => question.tokens[i]).join(" ")}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {question.tokens.map((token, i) => (
              <button
                key={i}
                type="button"
                disabled={order.includes(i) || orderDone}
                onClick={() => setOrder([...order, i])}
                className="rounded-xl bg-white px-3 py-2 text-lg font-bold shadow-sm disabled:opacity-30 dark:bg-white/10"
                lang="ko"
              >
                {token}
              </button>
            ))}
            {order.length > 0 && !orderDone && (
              <button type="button" onClick={() => setOrder(order.slice(0, -1))} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500">⌫</button>
            )}
          </div>
          {orderDone && (
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${orderRight ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"}`}>
              {orderRight ? `✓ ${t("grammar.right")}` : `✗ ${t("grammar.correctIs")} `}
              {!orderRight && <span lang="ko">{question.answer}</span>}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-2xl font-black leading-10" lang="ko">{question.prompt}</p>
          {question.hint && <p className="mt-1 text-sm text-slate-500">💡 {tr(question.hint, i18n.language)}</p>}
          {question.form && <p className="mt-1 text-sm text-slate-500">{t(`grammar.form.${question.form}`)}</p>}
          <div className="mt-4 grid gap-2">
            {question.options.map((option) => {
              const state = !answered ? "" : option === question.answer ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : option === picked ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "opacity-60";
              return (
                <button key={option} type="button" onClick={() => check(option)} className={`rounded-2xl border-2 border-slate-200 px-4 py-3 text-left text-lg font-bold transition dark:border-white/10 ${state}`} lang="ko">
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(answered || orderDone) && (
        <button type="button" onClick={next} className={`mt-5 w-full rounded-2xl px-5 py-3 font-black text-white ${right ? "bg-emerald-600" : "bg-slate-950 dark:bg-white dark:text-slate-950"}`}>
          {index + 1 >= questions.length ? t("grammar.finish") : t("grammar.next")}
        </button>
      )}
    </GlassCard>
  );
}

function SentenceCheck({ point }) {
  const { t, i18n } = useTranslation();
  const { user, session } = useAuth();
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function check(event) {
    event.preventDefault();
    if (!sentence.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const token = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token || "";
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "grammarCheck", pointId: point.id, sentence, language: i18n.language, deviceId: getDeviceId() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 429) setError(t("grammar.checkLimit"));
      else if (!response.ok) setError(t("grammar.checkFailed"));
      else setResult(data);
    } catch {
      setError(t("grammar.checkFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="!p-5">
      <h3 className="text-lg font-black">✍️ {t("grammar.writeOwn")}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("grammar.writeOwnText", { pattern: point.pattern })}</p>
      {!user ? (
        <Link to="/login" className="mt-3 inline-block rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white">{t("nav.login")}</Link>
      ) : (
        <form onSubmit={check} className="mt-3 space-y-3">
          <input
            value={sentence}
            onChange={(event) => setSentence(event.target.value)}
            maxLength={200}
            lang="ko"
            placeholder={point.examples[0][0]}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-lg outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/10"
          />
          <button type="submit" disabled={busy || !sentence.trim()} className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
            {busy ? t("common.loading") : `🤖 ${t("grammar.check")}`}
          </button>
        </form>
      )}
      {error && (
        <p className="mt-3 text-sm font-bold text-rose-600">
          {error} {error === t("grammar.checkLimit") && <Link to="/premium" className="underline">⭐ Premium</Link>}
        </p>
      )}
      {result && (
        <div className={`mt-4 space-y-1.5 rounded-2xl p-4 text-sm ${result.correct && result.usesPattern ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
          <p className="font-black">{result.correct && result.usesPattern ? `✓ ${t("grammar.checkGood")}` : `✏️ ${t("grammar.checkFix")}`}</p>
          {!(result.correct && result.usesPattern) && <p className="text-lg font-bold" lang="ko">{result.corrected}</p>}
          <p className="text-slate-600 dark:text-slate-300">{result.translation}</p>
          <p>{result.explanation}</p>
        </div>
      )}
    </GlassCard>
  );
}

// /grammar/:pointId — a fresh page per point, so practice state never carries over.
export function GrammarPointPage() {
  const { pointId } = useParams();
  return <GrammarPoint key={pointId} pointId={pointId} />;
}

// Explanation, rules, examples, practice and the AI sentence check.
function GrammarPoint({ pointId }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const point = getGrammarPoint(pointId);
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const best = useSelector((state) => state.progress.grammar?.[pointId]?.best);
  const [mode, setMode] = useState("learn");
  const [score, setScore] = useState(null);
  const [round, setRound] = useState(0);
  if (!point) return <Navigate to="/grammar" replace />;
  const language = i18n.language;
  const position = GRAMMAR.indexOf(point);
  const prev = GRAMMAR[position - 1];
  const next = GRAMMAR[position + 1];

  function finish(percent) {
    setScore(percent);
    setMode("result");
    if (percent >= PASS_PERCENT) dispatch(completeGrammar({ id: point.id, score: percent }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2 px-1 text-sm font-bold">
        <Link to="/grammar" className="text-sky-600 dark:text-sky-300">📐 {t("grammar.title")}</Link>
        <span className="text-slate-400">/</span>
        <Link to={`/lesson/${point.lesson}/grammar`} className="text-sky-600 dark:text-sky-300">{t("card.lesson", { lesson: point.lesson })}</Link>
      </div>

      <GlassCard>
        <p className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-300">{t("card.lesson", { lesson: point.lesson })} · {t("grammar.title")}</p>
        <h1 className="mt-2 text-3xl font-black" lang="ko">{point.pattern}</h1>
        <p className="mt-1 text-lg font-bold text-slate-600 dark:text-slate-300">{tr(point.title, language)}</p>
        {best != null && <p className="mt-2 text-sm font-black text-emerald-600">✓ {t("grammar.best", { score: best })}</p>}
        <p className="mt-4 leading-7">{tr(point.explain, language)}</p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
          {point.rules.map((rule) => (
            <div key={rule[0]} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-2.5 last:border-0 dark:border-white/5">
              <span className="font-black text-sky-700 dark:text-sky-300" lang="ko">{rule[0]}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{rowText(rule, language)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="!p-5">
        <h2 className="text-lg font-black">💬 {t("grammar.examples")}</h2>
        <ul className="mt-3 space-y-3">
          {point.examples.map((example) => (
            <li key={example[0]} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
              <button type="button" onClick={() => speakKorean(example[0], rate)} className="text-left text-lg font-bold" lang="ko">{example[0]} 🔊</button>
              <p className="text-sm text-slate-600 dark:text-slate-300">{rowText(example, language)}</p>
            </li>
          ))}
        </ul>
        {point.mistakes?.length > 0 && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-400/20 dark:bg-rose-500/10">
            <p className="font-black text-rose-700 dark:text-rose-200">⚠️ {t("grammar.mistakes")}</p>
            {point.mistakes.map(([wrong, right, note]) => (
              <p key={wrong} className="mt-2">
                <span className="text-rose-600 line-through dark:text-rose-300" lang="ko">{wrong}</span> → <span className="font-bold text-emerald-700 dark:text-emerald-300" lang="ko">{right}</span>
                <span className="block text-slate-600 dark:text-slate-300">{tr(note, language)}</span>
              </p>
            ))}
          </div>
        )}
      </GlassCard>

      {mode === "learn" && (
        <button type="button" onClick={() => setMode("practice")} className="w-full rounded-2xl bg-sky-600 px-5 py-4 text-lg font-black text-white shadow-lg hover:bg-sky-700">
          🎯 {t("grammar.practice")}
        </button>
      )}
      {mode === "practice" && <Practice key={round} point={point} onFinish={finish} />}
      {mode === "result" && (
        <GlassCard className="text-center">
          <p className="text-5xl">{score >= PASS_PERCENT ? "🎉" : "💪"}</p>
          <p className="mt-2 text-3xl font-black">{score}%</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{score >= PASS_PERCENT ? t("grammar.passed") : t("grammar.notPassed", { percent: PASS_PERCENT })}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setRound(round + 1); setMode("practice"); }} className="rounded-2xl border border-slate-300 px-5 py-3 font-black dark:border-white/15">↻ {t("grammar.again")}</button>
            {next && <Link to={`/grammar/${next.id}`} className="rounded-2xl bg-sky-600 px-5 py-3 font-black text-white">{t("grammar.nextPoint")} →</Link>}
          </div>
        </GlassCard>
      )}

      <SentenceCheck key={point.id} point={point} />

      <div className="flex justify-between gap-2 text-sm font-bold">
        {prev ? <Link to={`/grammar/${prev.id}`} className="text-sky-600 dark:text-sky-300">← <span lang="ko">{prev.pattern}</span></Link> : <span />}
        {next ? <Link to={`/grammar/${next.id}`} className="text-right text-sky-600 dark:text-sky-300"><span lang="ko">{next.pattern}</span> →</Link> : <span />}
      </div>
    </div>
  );
}
