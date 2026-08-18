import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { getWordMastery } from "../lib/mastery";
import WordBadge from "../components/WordBadge";
import MasteryBadge from "../components/MasteryBadge";
import { allWords, getLessonWords, getWordKey } from "../data";
import EmptyStateIllustrations from "../components/EmptyStateIllustrations";
import { addActivity, advanceDeck, setLessonDeck, toggleFavorite, rateFlashcard } from "../store";
import { buildStudyDeck, cardModes, getAnswer, getPrompt, makeHint, pickRandomCardMode } from "../lib/study";
import { SRS_RATINGS, getDueWords } from "../lib/srs";
import { speakKorean } from "../lib/speech";
import { selectWeakWords } from "../store";

export default function FlashcardsPage({ review = false, weak = false }) {
  const { t } = useTranslation();
  const { lessonId = "1" } = useParams();
  const dispatch = useDispatch();
  const [mode, setMode] = useState("random");
  const [flipped, setFlipped] = useState(false);
  const [hint, setHint] = useState("");
  const [randomPromptMode, setRandomPromptMode] = useState(() => pickRandomCardMode());
  const progress = useSelector((state) => state.progress);
  const weakWords = useSelector(selectWeakWords);
  const advanceRef = useRef(null);
  const lesson = Number(lessonId);
  const sourceWords = useMemo(() => {
    if (weak) return weakWords;
    if (review) return getDueWords(allWords, progress.words);
    return getLessonWords(lesson);
  }, [weak, review, lesson, weakWords, progress.words]);

  const deckKey = `${weak ? "weak" : review ? "review" : lesson}-${mode}`;
  const savedDeck = progress.lessonDecks[deckKey];
  const wordsByKey = useMemo(() => Object.fromEntries(sourceWords.map((word) => [getWordKey(word), word])), [sourceWords]);

  useEffect(() => {
    if (!sourceWords.length) return;
    if (savedDeck?.queue?.length) return;
    const deck = buildStudyDeck(sourceWords, progress.words).map(getWordKey);
    dispatch(setLessonDeck({ lesson: weak ? "weak" : review ? "review" : lesson, mode, queue: deck, cursor: 0 }));
  }, [dispatch, lesson, mode, progress.words, review, weak, savedDeck?.queue?.length, sourceWords]);

  const queue = savedDeck?.queue || [];
  const cursor = Math.min(savedDeck?.cursor || 0, Math.max(0, queue.length - 1));
  const word = wordsByKey[queue[cursor]] || sourceWords[0];
  const activeMode = mode === "random" ? randomPromptMode : mode;
  const prompt = word ? getPrompt(word, activeMode) : "";
  const answer = word ? getAnswer(word, prompt, activeMode) : "";
  const isFavorite = word ? progress.favorites[getWordKey(word)] : false;
  const percent = queue.length ? Math.round(((cursor + 1) / queue.length) * 100) : 0;
  const wordMastery = word ? getWordMastery(getWordKey(word), progress.words) : null;

  useEffect(() => {
    setFlipped(false);
    setHint("");
    if (mode === "random") {
      setRandomPromptMode(pickRandomCardMode());
    }
  }, [cursor, mode, deckKey]);

  const wordKey = word ? getWordKey(word) : "";

  useEffect(() => {
    if (!flipped && progress.settings.autoSpeak && word) {
      speakKorean(word.korean, progress.settings.speechRate);
    }
  }, [word, wordKey, flipped, progress.settings.autoSpeak, progress.settings.speechRate, word?.korean]);

  useEffect(() => {
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  if (!sourceWords.length) {
    if (weak) {
      return (
        <GlassCard className="mx-auto max-w-2xl text-center">
          <WordBadge tone="rose">{t("library.weakWords")}</WordBadge>
          <div className="mx-auto mb-4 h-24 w-24">
            <EmptyStateIllustrations.WeakWords />
          </div>
          <h2 className="text-3xl font-black">{t("library.noWeakWords")}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{t("library.noWeakWordsText")}</p>
          <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/">
            {t("common.back")}
          </Link>
        </GlassCard>
      );
    }
    if (review) {
      return (
        <GlassCard className="mx-auto max-w-2xl text-center">
          <WordBadge tone="amber">{t("home.reviewMode")}</WordBadge>
          <div className="mx-auto mb-4 h-24 w-24">
            <EmptyStateIllustrations.ReviewCaughtUp />
          </div>
          <h2 className="text-3xl font-black">{t("srs.caughtUp")}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{t("srs.caughtUpSubtitle")}</p>
          <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/">
            {t("common.back")}
          </Link>
        </GlassCard>
      );
    }
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <WordBadge tone="sky">{t("card.lesson", { lesson })}</WordBadge>
        <div className="mx-auto mb-4 h-24 w-24">
          <EmptyStateIllustrations.NoDifficultWords />
        </div>
        <h2 className="text-3xl font-black">{t("flashcards.noDifficultWords")}</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{t("flashcards.noDifficultText")}</p>
        <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/">
          {t("common.back")}
        </Link>
      </GlassCard>
    );
  }

  function rebuildDeck(nextCursor = 0) {
    const deck = buildStudyDeck(sourceWords, progress.words).map(getWordKey);
    dispatch(setLessonDeck({ lesson: weak ? "weak" : review ? "review" : lesson, mode, queue: deck, cursor: nextCursor }));
  }

  function nextCard() {
    if (cursor + 1 >= queue.length) {
      rebuildDeck(0);
      return;
    }
    dispatch(advanceDeck({ lesson: weak ? "weak" : review ? "review" : lesson, mode, cursor: cursor + 1 }));
  }

  function rate(rating) {
    if (!word || advanceRef.current) return;
    const key = getWordKey(word);
    dispatch(rateFlashcard({ key, rating }));
    dispatch(addActivity({ type: rating, word: word.korean, lesson: word.lesson, at: Date.now() }));
    setFlipped(true);
    advanceRef.current = setTimeout(() => {
      nextCard();
      advanceRef.current = null;
    }, 450);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} review={review} />
      <GlassCard>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <WordBadge tone={weak ? "rose" : review ? "amber" : "sky"}>{weak ? t("library.weakWords") : review ? t("practice.smartReview") : t("card.lesson", { lesson })}</WordBadge>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">{weak ? t("library.weakWords") : t("practice.flashcards")}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cardModes.map((item) => (
              <button key={item.value} type="button" onClick={() => { setMode(item.value); rebuildDeck(0); }} className={`rounded-2xl px-3 py-2 text-xs font-black transition sm:text-sm ${mode === item.value ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                {t(item.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
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
              className="relative min-h-[320px] w-full rounded-[2rem] border border-white/60 bg-gradient-to-br from-white via-sky-50 to-violet-50 p-6 text-left shadow-2xl shadow-sky-900/10 [transform-style:preserve-3d] dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,.18),transparent_35%)]" />
              <div className="relative flex min-h-[280px] flex-col justify-between [backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WordBadge>{activeMode === "uzbek" ? t("flashcards.uzbek") : t("flashcards.korean")}</WordBadge>
                    {wordMastery && <MasteryBadge level={wordMastery.level} size="xs" />}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{cursor + 1}/{queue.length}</span>
                </div>
                <div>
                  <p className="text-center text-4xl font-black leading-tight tracking-tight md:text-7xl">{prompt}</p>
                  {hint && <p className="mt-6 rounded-2xl bg-amber-100 p-3 text-center text-base font-black text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">{t("flashcards.hint")}: {hint}</p>}
                </div>
                <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-300 md:text-sm">{t("flashcards.tapToFlip")}</p>
              </div>
              <div className="absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-[2rem] p-6 [backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <WordBadge tone="green">{t("flashcards.answer")}</WordBadge>
                  <button type="button" onClick={(event) => { event.stopPropagation(); speakKorean(word.korean, progress.settings.speechRate); }} className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-950">{t("flashcards.replayAudio")}</button>
                </div>
                <div className="space-y-4 text-center">
                  <p className="text-4xl font-black md:text-7xl">{answer}</p>
                  <p className="text-2xl font-black text-sky-600 dark:text-sky-300 md:text-3xl">{word.korean}</p>
                  {word.romanization && <p className="text-base font-semibold text-slate-600 dark:text-slate-300 md:text-xl">{word.romanization}</p>}
                </div>
                <div className="grid gap-2 text-xs font-bold text-slate-500 dark:text-slate-300 sm:grid-cols-3">
                  <span>{t("card.lesson", { lesson: word.lesson })}</span>
                  <span className="capitalize">{word.category}</span>
                  <span>{word.needsReview ? t("card.needsReview") : t("card.verified")}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {flipped && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => rate(SRS_RATINGS.AGAIN)} className="action-btn bg-rose-500 text-white">{t("srs.again")}</button>
            <button type="button" onClick={() => rate(SRS_RATINGS.HARD)} className="action-btn bg-amber-500 text-white">{t("srs.hard")}</button>
            <button type="button" onClick={() => rate(SRS_RATINGS.GOOD)} className="action-btn bg-sky-500 text-white">{t("srs.good")}</button>
            <button type="button" onClick={() => rate(SRS_RATINGS.EASY)} className="action-btn bg-emerald-500 text-white">{t("srs.easy")}</button>
          </div>
        )}
        {!flipped && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setHint(makeHint(answer))} className="action-btn bg-amber-500 text-white">{t("flashcards.hint")}</button>
            <button type="button" onClick={() => dispatch(toggleFavorite(getWordKey(word)))} className="action-btn bg-violet-500 text-white">{isFavorite ? t("flashcards.saved") : t("flashcards.favorite")}</button>
            <button type="button" onClick={() => speakKorean(word.korean, progress.settings.speechRate)} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">{t("flashcards.replayAudio")}</button>
            <button type="button" onClick={nextCard} className="action-btn bg-sky-500 text-white">{t("flashcards.next")}</button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export function ModeHeader({ lesson, review = false, weak = false }) {
  const { t } = useTranslation();
  const modes = weak
    ? [["/weak-words", t("library.weakWords")]]
    : review
    ? [["/review", t("home.reviewMode")]]
    : [
        [`/lesson/${lesson}/flashcards`, t("practice.flashcards")],
        [`/lesson/${lesson}/listening`, t("practice.listening")],
        [`/lesson/${lesson}/quiz`, t("practice.quiz")],
        [`/lesson/${lesson}/writing`, t("practice.writing")],
      ];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <Link to="/" className="text-sm font-black text-sky-600 dark:text-sky-300">{t("common.back")}</Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">{weak ? t("library.weakWords") : review ? t("home.reviewMode") : t("card.lesson", { lesson })}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-2xl px-3 py-1.5 text-xs font-black transition sm:text-sm sm:px-4 sm:py-2 ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
