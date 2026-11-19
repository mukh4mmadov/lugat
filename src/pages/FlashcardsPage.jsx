import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, m as motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import ReportWordLink from "../components/ReportWordLink";
import AnkiSettingsPanel from "../components/anki/AnkiSettingsPanel";
import { exampleTranslation, getWordKey, meaning } from "../data";
import { loadTopikVocab } from "../data/topikVocab";
import {
  answerCard,
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
import { lessonSet, setTitle, unitSet } from "../lib/wordSets";
import { MIN_FLASHCARD_MS } from "../lib/gamification";
import { speakKorean } from "../lib/speech";

const BUTTONS = [
  { name: "again", key: "1", tone: "bg-rose-500 hover:bg-rose-600 text-white" },
  { name: "hard", key: "2", tone: "bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-500" },
  { name: "good", key: "3", tone: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  { name: "easy", key: "4", tone: "bg-sky-500 hover:bg-sky-600 text-white" },
];

// Which words a session draws from, and how. Lessons and TOPIK units are
// the learner's own choice, so all their new words are open.
function useScope({ unit, weak, list }) {
  const { lessonId, unitId } = useParams();
  const weakWords = useSelector(selectWeakWords);
  const favoriteWords = useSelector(selectFavoriteWords);
  const difficultWords = useSelector(selectDifficultWords);
  const vocab = useSelector((state) => state.content.vocab);

  useEffect(() => {
    if (unit) loadTopikVocab("topik1");
  }, [unit]);

  return useMemo(() => {
    if (list) return { kind: list, cram: true, words: list === "difficult" ? difficultWords : favoriteWords, ready: true, title: list === "difficult" ? "nav.difficult" : "nav.favorites", backTo: list === "difficult" ? "/difficult" : "/favorites" };
    if (weak) return { kind: "weak", cram: true, words: weakWords, ready: true, title: "anki.weakTitle", backTo: "/review" };
    const set = unit ? unitSet(unitId) : lessonSet(lessonId);
    if (!set) return { kind: "none", words: [], ready: true, title: "anki.noDeck", backTo: "/study" };
    const words = set.words();
    const next = unit ? unitSet(set.n + 1) : lessonSet(set.n + 1);
    return { kind: set.kind, set, setKey: set.key, unlimitedNew: true, words, ready: words.length > 0, backTo: set.home, next: next?.home || null };
    // vocab: a unit's words arrive with the TOPIK list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, weak, unit, unitId, lessonId, weakWords, favoriteWords, difficultWords, vocab]);
}

export default function FlashcardsPage({ unit = false, weak = false, list = null }) {
  const { t } = useTranslation();
  const scope = useScope({ unit, weak, list });
  const [showSettings, setShowSettings] = useState(false);
  const sessionKey = `${scope.kind}-${scope.setKey || ""}`;
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
  const { t, i18n } = useTranslation();
  const cardRef = useRef(null);
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

  // Once the answer shows, bring the whole card into view above the buttons.
  useEffect(() => {
    if (!current?.revealed) return undefined;
    const frame = requestAnimationFrame(() => cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
    return () => cancelAnimationFrame(frame);
  }, [current?.revealed, current?.id]);

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

  const title = scope.set ? setTitle(scope.set, t, i18n.language) : t(scope.title);
  // One compact row, so the card and its answer buttons fit on a phone.
  const header = (
    <GlassCard className="p-2.5 md:p-4">
      <div className="flex items-center gap-2">
        <Link to={scope.backTo} aria-label={t("common.back")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg font-black text-sky-600 dark:border-white/10 dark:text-sky-300">←</Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-black md:text-xl">{title}</h1>
        <Counts counts={counts} current={current && card} />
        <button type="button" onClick={undoLast} disabled={!undo} title={`${t("anki.undo")} (Z)`} aria-label={t("anki.undo")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg disabled:opacity-30 dark:border-white/10">↶</button>
        <button type="button" onClick={onSettings} title={t("anki.settings.title")} aria-label={t("anki.settings.title")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg dark:border-white/10">⚙</button>
      </div>
    </GlassCard>
  );

  if (!scope.words.length) {
    return (
      <>
        {header}
        <GlassCard className="text-center">
          <p className="text-4xl">📭</p>
          <h2 className="mt-2 text-xl font-black">{t(scope.kind === "none" ? "anki.noDeck" : "anki.emptyList")}</h2>
          <Link to="/study" className="mt-4 inline-flex rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("sets.chooseSet")}</Link>
        </GlassCard>
      </>
    );
  }

  if (!current || !word) {
    return (
      <>
        {header}
        <Congrats scope={scope} tally={tally} answered={answered} waitUntil={next?.waitUntil} options={options} progress={progress} />
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
          <div ref={cardRef} className="scroll-mb-44 scroll-mt-20 md:scroll-mb-28">
          <GlassCard className="p-4 md:p-7">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className={`rounded-full px-2.5 py-1 ${!card || card.state === STATE.new ? "bg-sky-500/10 text-sky-600 dark:text-sky-300" : card.state === STATE.review ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/10 text-rose-600 dark:text-rose-300"}`}>
                {t(!card || card.state === STATE.new ? "anki.state.new" : card.state === STATE.review ? "anki.state.review" : "anki.state.learning")}
              </span>
              <span>{t(recall ? "anki.cardRecall" : "anki.cardRecognition")}</span>
            </div>

            <div className={`flex flex-col items-center justify-center text-center ${current.revealed ? "py-3" : "min-h-[10rem] py-6 md:min-h-[12rem]"}`}>
              <p className={`font-black ${recall ? "text-3xl md:text-4xl" : current.revealed ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`} lang={recall ? undefined : "ko"}>{front}</p>
              {!recall && (
                <button type="button" onClick={() => speakKorean(word.korean, settings.speechRate)} aria-label={t("study.listen")} className={`grid h-11 w-11 place-items-center rounded-full bg-sky-500/10 text-lg text-sky-600 dark:text-sky-300 ${current.revealed ? "mt-2" : "mt-4"}`}>🔊</button>
              )}
            </div>

            {current.revealed ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-slate-200 pt-3 text-center dark:border-white/10">
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
                  <div className="mx-auto mt-3 max-w-xl rounded-2xl bg-slate-100 p-3 text-left dark:bg-white/5">
                    <button type="button" onClick={() => speakKorean(example.ko, settings.speechRate)} className="text-left text-lg font-bold" lang="ko">{example.ko} 🔊</button>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{exampleTranslation(example)}</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
                  <button type="button" onClick={() => dispatch(toggleFavorite(wordKeyOf(current.id)))} className={favorite ? "text-amber-500" : "text-slate-400"}>{favorite ? "★" : "☆"} {t("anki.favorite")}</button>
                  <button type="button" onClick={() => dispatch(toggleManualDifficult(wordKeyOf(current.id)))} className={difficult ? "text-rose-500" : "text-slate-400"}>⚑ {t("anki.markDifficult")}</button>
                  <ReportWordLink word={word} />
                </div>
              </motion.div>
            ) : null}
          </GlassCard>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stays above the bottom menu; its own background keeps the card text from showing through. */}
      <div className="sticky bottom-[4.75rem] z-10 rounded-[1.4rem] bg-white/85 p-1.5 shadow-xl backdrop-blur-xl dark:bg-slate-950/80 md:bottom-4">
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

function Congrats({ scope, tally, answered, waitUntil, options, progress }) {
  const { t } = useTranslation();
  const today = todayCounts(progress, options);
  const studied = (today.new || 0) + (today.learn || 0) + (today.review || 0);
  const minutes = Math.round((today.ms || 0) / 60000);
  const correct = answered ? Math.round(((answered - tally.again) / answered) * 100) : null;
  const nextSet = scope.next;
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
        {nextSet && <Link to={nextSet} className="rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t(scope.kind === "unit" ? "sets.nextUnit" : "study.nextLesson")}</Link>}
        <Link to={scope.backTo} className="rounded-2xl border border-slate-300 px-5 py-2.5 font-black dark:border-white/15">← {t("sets.back")}</Link>
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
