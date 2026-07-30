import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { getLessonWords, getWordKey, lessonInfo } from "../data";
import { markWordStudied, selectStudyProgress, toggleFavorite, toggleManualDifficult } from "../store";
import { shuffle } from "../lib/study";
import { speakKorean } from "../lib/speech";

/* ------------------------------------------------------------------ */
/* Study Home — lists all 14 lessons, same card look as the Home page  */
/* ------------------------------------------------------------------ */

export function StudyHomePage() {
  const progress = useSelector((state) => state.progress);

  return (
    <div className="space-y-8">
      <GlassCard className="relative overflow-hidden p-8 md:p-10">
        <div className="absolute right-6 top-6 hidden h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl md:block" />
        <WordBadge tone="green">Learn before you test</WordBadge>
        <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Study Mode</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Memorize vocabulary at your own pace — no scoring, no quiz. Pick a lesson to review every word, then head to Practice to test yourself.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-300">
          <span className="rounded-full bg-slate-950/5 px-4 py-2 dark:bg-white/10">Study</span>
          <span>→</span>
          <span className="rounded-full bg-slate-950/5 px-4 py-2 dark:bg-white/10">Practice</span>
        </div>
      </GlassCard>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessonInfo.map((lesson, index) => {
          const percent = selectStudyProgress({ progress }, lesson.lesson);
          return (
            <motion.article
              key={lesson.lesson}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-xl font-black text-white shadow-lg">
                  {lesson.lesson}
                </div>
                <WordBadge tone={percent === 100 ? "green" : "violet"}>{lesson.count} words</WordBadge>
              </div>
              <h3 className="mt-5 text-xl font-black">Lesson {lesson.lesson}</h3>
              <p className="mt-2 min-h-12 text-sm capitalize text-slate-600 dark:text-slate-300">{lesson.category}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-300">
                <span>{percent}% studied</span>
                <Link className="text-sky-600 transition group-hover:translate-x-1 dark:text-sky-300" to={`/study/${lesson.lesson}`}>
                  Continue
                </Link>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Study Mode — pure memorization, no scoring, no I Know / Don't Know   */
/* ------------------------------------------------------------------ */

const memoryModes = [
  { value: "full", label: "Show everything" },
  { value: "hideUzbek", label: "Hide Uzbek" },
  { value: "onlyKorean", label: "Only Korean" },
];

export function StudyModePage() {
  const { lessonId = "1" } = useParams();
  const lesson = Number(lessonId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const progress = useSelector((state) => state.progress);

  const sourceWords = useMemo(() => getLessonWords(lesson), [lesson]);
  const [order, setOrder] = useState(() => sourceWords.map((_, index) => index));
  const [current, setCurrent] = useState(0);
  const [memoryMode, setMemoryMode] = useState("full");
  const [revealed, setRevealed] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Reset the session whenever the lesson changes.
  useEffect(() => {
    setOrder(sourceWords.map((_, index) => index));
    setCurrent(0);
    setRevealed(false);
    setAutoPlay(false);
    setCompleted(false);
  }, [sourceWords]);

  const word = sourceWords[order[current]];
  const isFavorite = word ? progress.favorites[getWordKey(word)] : false;
  const isDifficult = word ? progress.words[getWordKey(word)]?.manualDifficult : false;
  const percent = order.length ? Math.round(((current + 1) / order.length) * 100) : 0;

  // Mark the current word as studied (for the Study home page progress bar).
  useEffect(() => {
    if (word) dispatch(markWordStudied(getWordKey(word)));
  }, [dispatch, word]);

  useEffect(() => {
    setRevealed(false);
  }, [current, memoryMode]);

  // Auto Play: speak the word, wait 2s, move to next word.
  useEffect(() => {
    if (!autoPlay || completed || !word) return undefined;
    speakKorean(word.korean);
    const timer = setTimeout(() => {
      goNext();
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, current, order, completed]);

  if (!sourceWords.length) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <WordBadge tone="amber">Study</WordBadge>
        <h2 className="mt-4 text-3xl font-black">Lesson not found</h2>
        <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/study">
          Choose a lesson
        </Link>
      </GlassCard>
    );
  }

  function goNext() {
    setCurrent((value) => {
      if (value + 1 >= order.length) {
        setAutoPlay(false);
        setCompleted(true);
        return value;
      }
      return value + 1;
    });
  }

  function goPrev() {
    setAutoPlay(false);
    setCurrent((value) => Math.max(0, value - 1));
  }

  function doShuffle() {
    setAutoPlay(false);
    setCompleted(false);
    setOrder((value) => shuffle(value));
    setCurrent(0);
  }

  function studyAgain(reshuffle = false) {
    setCompleted(false);
    setAutoPlay(false);
    setOrder(reshuffle ? shuffle(sourceWords.map((_, index) => index)) : sourceWords.map((_, index) => index));
    setCurrent(0);
  }

  function jumpTo(originalIndex) {
    const position = order.indexOf(originalIndex);
    if (position === -1) return;
    setAutoPlay(false);
    setCompleted(false);
    setCurrent(position);
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <StudyHeader lesson={lesson} />
        <GlassCard className="mx-auto max-w-2xl text-center">
          <WordBadge tone="green">Lesson completed</WordBadge>
          <h2 className="mt-4 text-4xl font-black">Lesson completed 🎉</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            You've gone through all {order.length} words in Lesson {lesson}. Ready to test yourself?
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => studyAgain(false)} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              Study Again
            </button>
            <button type="button" onClick={() => navigate(`/lesson/${lesson}/flashcards`)} className="action-btn bg-emerald-500 text-white">
              Go to Practice
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const showUzbek = memoryMode === "full" || (memoryMode === "hideUzbek" && revealed) || (memoryMode === "onlyKorean" && revealed);
  const showExtras = memoryMode === "full" || (memoryMode === "onlyKorean" && revealed) || memoryMode === "hideUzbek";
  const showRomanization = memoryMode !== "onlyKorean" || revealed;

  return (
    <div className="space-y-6">
      <StudyHeader lesson={lesson} />

      <GlassCard>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <WordBadge tone="sky">Lesson {lesson}</WordBadge>
            <h2 className="mt-3 text-3xl font-black">Study Mode</h2>
            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">Word {current + 1} / {order.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {memoryModes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMemoryMode(item.value)}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${memoryMode === item.value ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" style={{ width: `${percent}%` }} />
        </div>

        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${getWordKey(word)}-${memoryMode}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="relative min-h-[380px] w-full rounded-[2rem] border border-white/60 bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-8 shadow-2xl shadow-emerald-900/10 dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,.18),transparent_35%)]" />
              <div className="relative flex min-h-[320px] flex-col justify-between">
                <div className="flex items-center justify-between">
                  <WordBadge>Lesson {word.lesson}</WordBadge>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch(toggleFavorite(getWordKey(word)))}
                      title="Favorite"
                      className={`grid h-10 w-10 place-items-center rounded-full text-lg transition ${isFavorite ? "bg-violet-500 text-white" : "bg-white/70 text-slate-600 dark:bg-white/10 dark:text-slate-200"}`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(toggleManualDifficult(getWordKey(word)))}
                      title="Mark difficult"
                      className={`grid h-10 w-10 place-items-center rounded-full text-lg transition ${isDifficult ? "bg-amber-500 text-white" : "bg-white/70 text-slate-600 dark:bg-white/10 dark:text-slate-200"}`}
                    >
                      {isDifficult ? "🔖" : "📑"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-center">
                  <p className="text-6xl font-black leading-tight tracking-tight md:text-7xl">{word.korean}</p>
                  {showRomanization && <p className="text-2xl font-semibold text-sky-600 dark:text-sky-300">{word.romanization}</p>}
                  {showUzbek && <p className="text-3xl font-black">{word.uzbek}</p>}
                  {showExtras && word.english && <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">{word.english}</p>}
                  {showExtras && (word.pos || word.partOfSpeech) && (
                    <p>
                      <WordBadge tone="amber">{word.pos || word.partOfSpeech}</WordBadge>
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => speakKorean(word.korean)}
                    title="Play audio"
                    className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-3xl text-white shadow-2xl shadow-sky-500/30 transition hover:-translate-y-1"
                  >
                    🔊
                  </button>

                  {memoryMode === "hideUzbek" && !revealed && (
                    <button type="button" onClick={() => setRevealed(true)} className="action-btn bg-emerald-500 text-white">
                      Show Meaning
                    </button>
                  )}
                  {memoryMode === "onlyKorean" && !revealed && (
                    <button type="button" onClick={() => setRevealed(true)} className="action-btn bg-emerald-500 text-white">
                      Reveal
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={goPrev} disabled={current === 0} className="action-btn bg-slate-100 text-slate-700 disabled:opacity-40 dark:bg-white/10 dark:text-slate-200">
            Previous
          </button>
          <button type="button" onClick={() => speakKorean(word.korean)} className="action-btn bg-sky-500 text-white">
            Repeat Audio
          </button>
          <button type="button" onClick={doShuffle} className="action-btn bg-violet-500 text-white">
            Shuffle
          </button>
          <button
            type="button"
            onClick={() => setAutoPlay((value) => !value)}
            className={`action-btn text-white ${autoPlay ? "bg-rose-500" : "bg-emerald-500"}`}
          >
            {autoPlay ? "Stop Auto Play" : "Auto Play"}
          </button>
          <button type="button" onClick={goNext} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            Next
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-slate-200/70 pt-6 dark:border-white/10">
          <label className="text-sm font-bold text-slate-500 dark:text-slate-300" htmlFor="quick-jump">
            Quick jump to a word
          </label>
          <select
            id="quick-jump"
            value={order[current]}
            onChange={(event) => jumpTo(Number(event.target.value))}
            className="premium-input max-w-xs text-center"
          >
            {sourceWords.map((item, index) => (
              <option key={getWordKey(item)} value={index}>
                {index + 1}. {item.korean} — {item.uzbek}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>
    </div>
  );
}

function StudyHeader({ lesson }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <Link to="/study" className="text-sm font-black text-sky-600 dark:text-sky-300">
          Back to Study lessons
        </Link>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Study — Lesson {lesson}</h1>
      </div>
      <Link
        to={`/lesson/${lesson}/flashcards`}
        className="rounded-2xl border border-slate-200 bg-white/75 px-5 py-3 text-center font-black text-slate-800 shadow-sm transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white"
      >
        Go to Practice
      </Link>
    </div>
  );
}
