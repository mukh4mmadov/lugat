import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { allWords, getLessonWords, getWordKey } from "../data";
import { addActivity, advanceDeck, markDifficult, markKnown, setLessonDeck, toggleFavorite } from "../store";
import { buildStudyDeck, cardModes, getAnswer, getPrompt, makeHint, pickRandomCardMode } from "../lib/study";
import { speakKorean } from "../lib/speech";

export default function FlashcardsPage({ review = false }) {
  const { lessonId = "1" } = useParams();
  const dispatch = useDispatch();
  const [mode, setMode] = useState("random");
  const [flipped, setFlipped] = useState(false);
  const [hint, setHint] = useState("");
  const [randomPromptMode, setRandomPromptMode] = useState(() => pickRandomCardMode());
  const progress = useSelector((state) => state.progress);
  const lesson = Number(lessonId);
  const sourceWords = review
    ? allWords.filter((word) => (progress.words[getWordKey(word)]?.difficulty || 0) > 0)
    : getLessonWords(lesson);

  const deckKey = `${review ? "review" : lesson}-${mode}`;
  const savedDeck = progress.lessonDecks[deckKey];
  const wordsByKey = useMemo(() => Object.fromEntries(sourceWords.map((word) => [getWordKey(word), word])), [sourceWords]);

  useEffect(() => {
    if (!sourceWords.length) return;
    if (savedDeck?.queue?.length) return;
    const deck = buildStudyDeck(sourceWords, progress.words).map(getWordKey);
    dispatch(setLessonDeck({ lesson: review ? "review" : lesson, mode, queue: deck, cursor: 0 }));
  }, [dispatch, lesson, mode, progress.words, review, savedDeck?.queue?.length, sourceWords]);

  const queue = savedDeck?.queue || [];
  const cursor = Math.min(savedDeck?.cursor || 0, Math.max(0, queue.length - 1));
  const word = wordsByKey[queue[cursor]] || sourceWords[0];
  const activeMode = mode === "random" ? randomPromptMode : mode;
  const prompt = word ? getPrompt(word, activeMode) : "";
  const answer = word ? getAnswer(word, prompt, activeMode) : "";
  const isFavorite = word ? progress.favorites[getWordKey(word)] : false;
  const percent = queue.length ? Math.round(((cursor + 1) / queue.length) * 100) : 0;

  useEffect(() => {
    setFlipped(false);
    setHint("");
    if (mode === "random") {
      setRandomPromptMode(pickRandomCardMode());
    }
  }, [cursor, mode, deckKey]);

  if (!sourceWords.length) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <WordBadge tone="amber">Review</WordBadge>
        <h2 className="mt-4 text-3xl font-black">No difficult words yet</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Press Don't Know in flashcards to collect words here automatically.</p>
        <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/">
          Choose a lesson
        </Link>
      </GlassCard>
    );
  }

  function rebuildDeck(nextCursor = 0) {
    const deck = buildStudyDeck(sourceWords, progress.words).map(getWordKey);
    dispatch(setLessonDeck({ lesson: review ? "review" : lesson, mode, queue: deck, cursor: nextCursor }));
  }

  function nextCard() {
    if (cursor + 1 >= queue.length) {
      rebuildDeck(0);
      return;
    }
    dispatch(advanceDeck({ lesson: review ? "review" : lesson, mode, cursor: cursor + 1 }));
  }

  function mark(result) {
    if (!word) return;
    const key = getWordKey(word);
    dispatch(result === "known" ? markKnown(key) : markDifficult(key));
    dispatch(addActivity({ type: result, word: word.korean, lesson: word.lesson, at: Date.now() }));
    setFlipped(true);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} review={review} active="flashcards" />
      <GlassCard>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <WordBadge tone={review ? "amber" : "sky"}>{review ? "Smart Review" : `Lesson ${lesson}`}</WordBadge>
            <h2 className="mt-3 text-3xl font-black">Flashcards</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cardModes.map((item) => (
              <button key={item.value} type="button" onClick={() => { setMode(item.value); rebuildDeck(0); }} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${mode === item.value ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400" style={{ width: `${percent}%` }} />
        </div>

        <div className="mx-auto max-w-3xl [perspective:1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${getWordKey(word)}-${flipped}-${prompt}`}
              role="button"
              tabIndex={0}
              onClick={() => setFlipped((value) => !value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setFlipped((value) => !value);
                }
              }}
              initial={{ opacity: 0, rotateY: -24 }}
              animate={{ opacity: 1, rotateY: flipped ? 180 : 0 }}
              exit={{ opacity: 0, rotateY: 24 }}
              transition={{ duration: 0.45 }}
              className="relative min-h-[360px] w-full rounded-[2rem] border border-white/60 bg-gradient-to-br from-white via-sky-50 to-violet-50 p-8 text-left shadow-2xl shadow-sky-900/10 [transform-style:preserve-3d] dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,.18),transparent_35%)]" />
              <div className="relative flex min-h-[300px] flex-col justify-between [backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <WordBadge>{activeMode === "uzbek" ? "Uzbek" : "Korean"}</WordBadge>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{cursor + 1}/{queue.length}</span>
                </div>
                <div>
                  <p className="text-center text-5xl font-black leading-tight tracking-tight md:text-7xl">{prompt}</p>
                  {hint && <p className="mt-8 rounded-2xl bg-amber-100 p-4 text-center text-lg font-black text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">Hint: {hint}</p>}
                </div>
                <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-300">Tap card to flip</p>
              </div>
              <div className="absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-[2rem] p-8 [backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <WordBadge tone="green">Answer</WordBadge>
                  <button type="button" onClick={(event) => { event.stopPropagation(); speakKorean(word.korean); }} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">Replay Audio</button>
                </div>
                <div className="space-y-5 text-center">
                  <p className="text-5xl font-black md:text-7xl">{answer}</p>
                  <p className="text-3xl font-black text-sky-600 dark:text-sky-300">{word.korean}</p>
                  <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">{word.romanization}</p>
                </div>
                <div className="grid gap-2 text-sm font-bold text-slate-500 dark:text-slate-300 sm:grid-cols-3">
                  <span>Lesson {word.lesson}</span>
                  <span className="capitalize">{word.category}</span>
                  <span>{word.needsReview ? "Needs review" : "Verified from image"}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setHint(makeHint(answer))} className="action-btn bg-amber-500 text-white">Hint</button>
          <button type="button" onClick={() => mark("known")} className="action-btn bg-emerald-500 text-white">I Know</button>
          <button type="button" onClick={() => mark("difficult")} className="action-btn bg-rose-500 text-white">Don't Know</button>
          <button type="button" onClick={() => dispatch(toggleFavorite(getWordKey(word)))} className="action-btn bg-violet-500 text-white">{isFavorite ? "Saved" : "Favorite"}</button>
          <button type="button" onClick={() => speakKorean(word.korean)} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">Replay Audio</button>
          <button type="button" onClick={nextCard} className="action-btn bg-sky-500 text-white">Next</button>
        </div>
      </GlassCard>
    </div>
  );
}

export function ModeHeader({ lesson, active, review = false }) {
  const modes = review
    ? [["/review", "Review"]]
    : [
        [`/lesson/${lesson}/flashcards`, "Flashcards"],
        [`/lesson/${lesson}/listening`, "Listening"],
        [`/lesson/${lesson}/quiz`, "Quiz"],
        [`/lesson/${lesson}/writing`, "Writing"],
      ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <Link to="/" className="text-sm font-black text-sky-600 dark:text-sky-300">Back to lessons</Link>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{review ? "Review Mode" : `Lesson ${lesson}`}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-2xl px-4 py-2 text-sm font-black transition ${(isActive || active === label.toLowerCase()) ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
