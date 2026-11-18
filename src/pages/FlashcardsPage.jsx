import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, m as motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import ReportWordLink from "../components/ReportWordLink";
import AnkiSettingsPanel from "../components/anki/AnkiSettingsPanel";
import { exampleTranslation, getLessonWords, getWordKey, lessonInfo, meaning } from "../data";
import {
  answerCard,
  extendNewToday,
  restoreCard,
  selectAnkiOptions,
  selectDifficultWords,
  selectFavoriteWords,
  selectWeakWords,
  toggleFavorite,
  toggleManualDifficult,
} from "../store";
import { RATING, STATE, ankiDay, formatInterval, packCard, previewIntervals, schedule } from "../lib/fsrs";
import { buildPool, isRecallCard, pickNext, readCard, remainingCounts, todayCounts, wordKeyOf } from "../lib/anki";
import { enabledDeckWords, getDeck, loadEnabledDecks } from "../lib/decks";
import { MIN_FLASHCARD_MS } from "../lib/gamification";
import { speakKorean } from "../lib/speech";

const BUTTONS = [
  { name: "again", key: "1", tone: "bg-rose-500 hover:bg-rose-600 text-white" },
  { name: "hard", key: "2", tone: "bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-500" },
  { name: "good", key: "3", tone: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  { name: "easy", key: "4", tone: "bg-sky-500 hover:bg-sky-600 text-white" },
];

// Which words a session draws from, and how.
function useScope({ review, weak, list }) {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const options = useSelector(selectAnkiOptions);
  const weakWords = useSelector(selectWeakWords);
  const favoriteWords = useSelector(selectFavoriteWords);
  const difficultWords = useSelector(selectDifficultWords);
  const deckId = params.get("deck");
  const deck = deckId ? getDeck(deckId) : null;
  const [ready, setReady] = useState(!review);
  const vocab = useSelector((state) => state.content.vocab);

  useEffect(() => {
    if (!review) return undefined;
    let cancelled = false;
    (deck ? deck.ready() : loadEnabledDecks(options)).then(() => !cancelled && setReady(true), () => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [review, deck, options]);

  return useMemo(() => {
    if (list) return { kind: list, cram: true, words: list === "difficult" ? difficultWords : favoriteWords, ready: true, title: list === "difficult" ? "nav.difficult" : "nav.favorites" };
    if (weak) return { kind: "weak", cram: true, words: weakWords, ready: true, title: "anki.weakTitle" };
    if (review) {
      const words = deck ? deck.words() : enabledDeckWords(options);
      return { kind: "review", deckId, words, ready, title: deck ? deck.titleKey : "anki.studyNow" };
    }
    const lesson = Number(lessonId);
    return { kind: "lesson", lesson, unlimitedNew: true, words: getLessonWords(lesson), ready: true, title: "card.lesson" };
    // vocab: deck words change when a TOPIK deck finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, weak, review, deck, deckId, options, ready, lessonId, weakWords, favoriteWords, difficultWords, vocab]);
}

export default function FlashcardsPage({ review = false, weak = false, list = null }) {
  const { t } = useTranslation();
  const scope = useScope({ review, weak, list });
  const [showSettings, setShowSettings] = useState(false);
  const sessionKey = `${scope.kind}-${scope.deckId || ""}-${scope.lesson || ""}`;
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {scope.ready ? (
        <Reviewer key={sessionKey} scope={scope} onSettings={() => setShowSettings(true)} />
      ) : (
        <GlassCard><p role="status">{t("common.loading")}</p></GlassCard>
      )}
      {showSettings && <AnkiSettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function Reviewer({ scope, onSettings }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const settings = progress.settings;
  const [current, setCurrent] = useState(null);
  const [lastId, setLastId] = useState(null);
  const [answered, setAnswered] = useState(0);
  const [tally, setTally] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [undo, setUndo] = useState(null);
  // Cram sessions (favorites, difficult) show each card once unless it's failed.
  const [finished, setFinished] = useState(() => new Set());
  const [now, setNow] = useState(() => Date.now());

  const byKey = useMemo(() => new Map(scope.words.map((word) => [getWordKey(word), word])), [scope.words]);
  const pool = useMemo(() => {
    const built = buildPool(progress, scope.words, options, { now, cram: scope.cram });
    if (!scope.cram) return built;
    return { learning: built.learning, review: [...built.review, ...built.fresh].filter((id) => !finished.has(id)), fresh: [] };
  }, [progress, scope.words, scope.cram, options, now, finished]);
  const counts = useMemo(() => remainingCounts(pool, progress, options, { now, unlimitedNew: scope.unlimitedNew, cram: scope.cram }), [pool, progress, options, now, scope.unlimitedNew, scope.cram]);

  // Pick the next card whenever none is showing.
  const next = useMemo(() => (current ? null : pickNext(pool, counts, options, { now, lastId, answeredInSession: answered })), [current, pool, counts, options, now, lastId, answered]);
  useEffect(() => {
    if (next?.id) setCurrent({ id: next.id, shownAt: Date.now(), revealed: false });
  }, [next]);

  // While a learning card waits, check again every few seconds.
  useEffect(() => {
    if (!next?.waitUntil) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [next]);

  const word = current ? byKey.get(wordKeyOf(current.id)) : null;
  const recall = current ? isRecallCard(current.id) : false;
  const card = current ? readCard(progress, current.id) : null;
  const intervals = useMemo(() => (current ? previewIntervals(card, options) : null), [current, card, options]);

  // Audio: the Korean side when it's on screen.
  useEffect(() => {
    if (!word || settings.autoSpeak === false) return;
    if (!recall && !current.revealed) speakKorean(word.korean, settings.speechRate);
    if (recall && current.revealed) speakKorean(word.korean, settings.speechRate);
    // Only when the card or its side changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.revealed]);

  const reveal = useCallback(() => setCurrent((value) => (value && !value.revealed ? { ...value, revealed: true } : value)), []);

  const answer = useCallback(
    (name) => {
      if (!current?.revealed) return;
      const at = Date.now();
      const id = current.id;
      const before = readCard(progress, id);
      const scheduled = schedule(before, RATING[name], options, at);
      const day = ankiDay(at, options.dayStartsAt);
      const ms = at - current.shownAt;
      setUndo({ id, packed: progress.cards?.[id] || null, day, counts: progress.ankiDays?.[day] || null, name });
      dispatch(answerCard({ id, wordKey: wordKeyOf(id), rating: RATING[name], prevState: before ? before.state : STATE.new, packed: packCard(scheduled), day, quick: ms < MIN_FLASHCARD_MS, ms, leechThreshold: options.leechThreshold }));
      if (scope.cram && scheduled.state === STATE.review) setFinished((done) => new Set(done).add(id));
      setTally((value) => ({ ...value, [name]: value[name] + 1 }));
      setLastId(id);
      setAnswered((value) => value + 1);
      setNow(at);
      setCurrent(null);
    },
    [current, progress, options, dispatch, scope.cram],
  );

  const undoLast = useCallback(() => {
    if (!undo) return;
    dispatch(restoreCard(undo));
    setFinished((done) => {
      const copy = new Set(done);
      copy.delete(undo.id);
      return copy;
    });
    setTally((value) => ({ ...value, [undo.name]: Math.max(0, value[undo.name] - 1) }));
    setAnswered((value) => Math.max(0, value - 1));
    setCurrent({ id: undo.id, shownAt: Date.now(), revealed: false });
    setUndo(null);
  }, [undo, dispatch]);

  // Keys like Anki: Space/Enter shows the answer (then means Good), 1-4 rate, Z undoes, R replays.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea, select, [role=dialog]")) return;
      if (event.key === "z" || event.key === "Z" || ((event.ctrlKey || event.metaKey) && event.key === "z")) {
        event.preventDefault();
        undoLast();
        return;
      }
      if (!current) return;
      if (event.key === "r" || event.key === "R") {
        if (word) speakKorean(word.korean, settings.speechRate);
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (current.revealed) answer("good");
        else reveal();
        return;
      }
      const button = BUTTONS.find((item) => item.key === event.key);
      if (button && current.revealed) answer(button.name);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, word, settings.speechRate, answer, reveal, undoLast]);

  const title = scope.kind === "lesson" ? t("card.lesson", { lesson: scope.lesson }) : t(scope.title);
  const header = (
    <GlassCard className="p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/study" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("anki.decks")}</Link>
          <h1 className="truncate text-xl font-black md:text-2xl">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Counts counts={counts} current={current && card} />
          <button type="button" onClick={undoLast} disabled={!undo} title={`${t("anki.undo")} (Z)`} aria-label={t("anki.undo")} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg disabled:opacity-30 dark:border-white/10">↶</button>
          <button type="button" onClick={onSettings} title={t("anki.settings.title")} aria-label={t("anki.settings.title")} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg dark:border-white/10">⚙</button>
        </div>
      </div>
    </GlassCard>
  );

  if (!scope.words.length) {
    return (
      <>
        {header}
        <GlassCard className="text-center">
          <p className="text-4xl">📭</p>
          <h2 className="mt-2 text-xl font-black">{t(scope.kind === "review" ? "anki.noDeck" : "anki.emptyList")}</h2>
          <Link to="/study" className="mt-4 inline-flex rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("anki.decks")}</Link>
        </GlassCard>
      </>
    );
  }

  if (!current || !word) {
    return (
      <>
        {header}
        <Congrats scope={scope} tally={tally} answered={answered} waitUntil={next?.waitUntil} options={options} progress={progress} pool={pool} onMoreNew={(amount) => dispatch(extendNewToday({ day: ankiDay(Date.now(), options.dayStartsAt), amount }))} />
      </>
    );
  }

  const favorite = Boolean(progress.favorites[wordKeyOf(current.id)]);
  const difficult = Boolean(progress.words[wordKeyOf(current.id)]?.manualDifficult);
  const front = recall ? meaning(word) : word.korean;
  const example = word.example;

  return (
    <>
      {header}
      <AnimatePresence mode="wait">
        <motion.div key={current.id + answered} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <GlassCard className="p-5 md:p-8">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className={`rounded-full px-2.5 py-1 ${!card || card.state === STATE.new ? "bg-sky-500/10 text-sky-600 dark:text-sky-300" : card.state === STATE.review ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/10 text-rose-600 dark:text-rose-300"}`}>
                {t(!card || card.state === STATE.new ? "anki.state.new" : card.state === STATE.review ? "anki.state.review" : "anki.state.learning")}
              </span>
              <span>{t(recall ? "anki.cardRecall" : "anki.cardRecognition")}</span>
            </div>

            <div className="flex min-h-[11rem] flex-col items-center justify-center py-6 text-center">
              <p className={`font-black ${recall ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"}`} lang={recall ? undefined : "ko"}>{front}</p>
              {!recall && (
                <button type="button" onClick={() => speakKorean(word.korean, settings.speechRate)} aria-label={t("study.listen")} className="mt-4 grid h-11 w-11 place-items-center rounded-full bg-sky-500/10 text-lg text-sky-600 dark:text-sky-300">🔊</button>
              )}
            </div>

            {current.revealed ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-slate-200 pt-5 text-center dark:border-white/10">
                {recall ? (
                  <>
                    <p className="text-5xl font-black" lang="ko">{word.korean}</p>
                    <button type="button" onClick={() => speakKorean(word.korean, settings.speechRate)} aria-label={t("study.listen")} className="mx-auto mt-3 grid h-11 w-11 place-items-center rounded-full bg-sky-500/10 text-lg text-sky-600 dark:text-sky-300">🔊</button>
                  </>
                ) : (
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 md:text-3xl">{meaning(word)}</p>
                )}
                {options.showRomanization && word.romanization && <p className="mt-2 text-base font-semibold text-slate-500 dark:text-slate-400">[{word.romanization}]</p>}
                {(word.pos || word.hanja) && (
                  <p className="mt-1 text-xs font-bold text-slate-400">{[word.pos && t(`pos.${word.pos}`, { defaultValue: word.pos }), word.hanja].filter(Boolean).join(" · ")}</p>
                )}
                {options.showExample && example?.ko && (
                  <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-slate-100 p-4 text-left dark:bg-white/5">
                    <button type="button" onClick={() => speakKorean(example.ko, settings.speechRate)} className="text-left text-lg font-bold" lang="ko">{example.ko} 🔊</button>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{exampleTranslation(example)}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
                  <button type="button" onClick={() => dispatch(toggleFavorite(wordKeyOf(current.id)))} className={favorite ? "text-amber-500" : "text-slate-400"}>{favorite ? "★" : "☆"} {t("anki.favorite")}</button>
                  <button type="button" onClick={() => dispatch(toggleManualDifficult(wordKeyOf(current.id)))} className={difficult ? "text-rose-500" : "text-slate-400"}>⚑ {t("anki.markDifficult")}</button>
                  <ReportWordLink word={word} />
                </div>
              </motion.div>
            ) : null}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="sticky bottom-20 z-10 md:bottom-4">
        {current.revealed ? (
          <div className="grid grid-cols-4 gap-2">
            {BUTTONS.map((button) => (
              <button key={button.name} type="button" onClick={() => answer(button.name)} className={`rounded-2xl px-1 py-2.5 text-center shadow-lg transition active:scale-95 ${button.tone}`}>
                <span className="block text-[11px] font-semibold opacity-90">{intervals && formatInterval(intervals[button.name], t)}</span>
                <span className="block text-sm font-black">{t(`anki.rate.${button.name}`)}</span>
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={reveal} className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white shadow-lg dark:bg-white dark:text-slate-950">
            {t("anki.showAnswer")}
          </button>
        )}
        <p className="mt-2 hidden text-center text-[11px] text-slate-400 md:block">{t("anki.keysHint")}</p>
      </div>
    </>
  );
}

function Counts({ counts, current }) {
  const { t } = useTranslation();
  const state = current ? current.state : null;
  const cls = (active) => `tabular-nums ${active ? "underline decoration-2 underline-offset-4" : ""}`;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-950/5 px-3 py-2 text-sm font-black dark:bg-white/10" title={t("anki.countsHint")}>
      <span className={`text-sky-600 dark:text-sky-300 ${cls(current && (state === null || state === STATE.new))}`}>{counts.new}</span>
      <span className={`text-rose-600 dark:text-rose-300 ${cls(state === STATE.learning || state === STATE.relearning)}`}>{counts.learning}</span>
      <span className={`text-emerald-600 dark:text-emerald-300 ${cls(state === STATE.review)}`}>{counts.review}</span>
    </div>
  );
}

function Congrats({ scope, tally, answered, waitUntil, options, progress, pool, onMoreNew }) {
  const { t } = useTranslation();
  const today = todayCounts(progress, options);
  const studied = (today.new || 0) + (today.learn || 0) + (today.review || 0);
  const minutes = Math.round((today.ms || 0) / 60000);
  const correct = answered ? Math.round(((answered - tally.again) / answered) * 100) : null;
  const moreNew = scope.kind === "review" && pool.fresh.length > 0;
  const nextLesson = scope.kind === "lesson" && scope.lesson < lessonInfo.length ? scope.lesson + 1 : null;
  return (
    <GlassCard className="p-6 text-center md:p-10">
      <p className="text-5xl">{waitUntil ? "⏳" : "🎉"}</p>
      <h2 className="mt-3 text-2xl font-black md:text-3xl">{waitUntil ? t("anki.waitTitle") : t("anki.doneTitle")}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {waitUntil ? t("anki.waitText", { time: new Date(waitUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) : t("anki.doneText")}
      </p>
      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
        <Stat label={t("anki.todayCards")} value={studied} />
        <Stat label={t("anki.todayMinutes")} value={minutes} />
        <Stat label={t("anki.sessionCorrect")} value={correct === null ? "—" : `${correct}%`} />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {moreNew && (
          <button type="button" onClick={() => onMoreNew(10)} className="rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">+10 {t("anki.moreNew")}</button>
        )}
        {nextLesson && <Link to={`/study/${nextLesson}`} className="rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("study.nextLesson")}</Link>}
        <Link to="/study" className="rounded-2xl border border-slate-300 px-5 py-2.5 font-black dark:border-white/15">{t("anki.decks")}</Link>
        <Link to="/topik" className="rounded-2xl border border-slate-300 px-5 py-2.5 font-black dark:border-white/15">TOPIK</Link>
      </div>
    </GlassCard>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/5">
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
export { default as ModeHeader } from "../components/ModeHeader";
