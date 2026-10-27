import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { getWordMastery } from "../lib/mastery";
import WordBadge from "../components/WordBadge";
import MasteryBadge from "../components/MasteryBadge";
import { getLessonWords, getWordKey } from "../data";
import { markDifficult, markKnown, toggleFavorite } from "../store";
import { isAnswerCorrect, shuffle } from "../lib/study";
import { speakKorean } from "../lib/speech";
import { playCorrectSound, playWrongSound } from "../lib/sounds";
import { ModeHeader } from "./FlashcardsPage";

// A practice round walks through the lesson once, records each answer a single
// time, and ends with a summary from which the missed words can be retried.
function usePracticeRound(exerciseType) {
  const { lessonId = "1" } = useParams();
  const lesson = Number(lessonId);
  const dispatch = useDispatch();
  const lessonWords = useMemo(() => getLessonWords(lesson), [lesson]);
  const [round, setRound] = useState(() => shuffle(lessonWords));
  const [cursor, setCursor] = useState(0);
  const [results, setResults] = useState({});

  useEffect(() => {
    setRound(shuffle(lessonWords));
    setCursor(0);
    setResults({});
  }, [lessonWords]);

  const word = round[cursor] || null;
  const answered = word ? results[getWordKey(word)] : undefined;

  const record = useCallback(
    (correct) => {
      if (!word || answered !== undefined) return;
      const key = getWordKey(word);
      dispatch(correct ? markKnown({ key, exerciseType }) : markDifficult({ key, exerciseType }));
      if (correct) playCorrectSound();
      else playWrongSound();
      setResults((previous) => ({ ...previous, [key]: correct }));
    },
    [answered, dispatch, exerciseType, word],
  );

  const restart = useCallback((words) => {
    setRound(shuffle(words));
    setCursor(0);
    setResults({});
  }, []);

  const missed = round.filter((item) => results[getWordKey(item)] === false);
  const correctCount = Object.values(results).filter(Boolean).length;

  return {
    lesson,
    lessonWords,
    round,
    word,
    cursor,
    answered,
    record,
    next: () => setCursor((value) => value + 1),
    finished: round.length > 0 && cursor >= round.length,
    correctCount,
    missed,
    restartAll: () => restart(lessonWords),
    restartMissed: () => restart(missed),
  };
}

function RoundSummary({ session }) {
  const { t } = useTranslation();
  const total = session.round.length;
  const percent = total ? Math.round((session.correctCount / total) * 100) : 0;
  return (
    <GlassCard className="mx-auto max-w-2xl p-6 text-center md:p-8">
      <p className="text-5xl">{percent >= 80 ? "🎉" : percent >= 50 ? "👍" : "💪"}</p>
      <h2 className="mt-3 text-3xl font-black">{t("practice.roundDone")}</h2>
      <p className="mt-2 text-lg font-bold text-slate-600 dark:text-slate-300">
        {t("practice.roundScore", { correct: session.correctCount, total, percent })}
      </p>
      {session.missed.length > 0 && (
        <div className="mt-6 text-left">
          <p className="text-xs font-black uppercase tracking-widest text-rose-500">{t("practice.missedWords")}</p>
          <ul className="mt-2 divide-y divide-slate-200 rounded-2xl bg-slate-100/80 dark:divide-white/10 dark:bg-white/5">
            {session.missed.map((item) => (
              <li key={getWordKey(item)} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-lg font-black">{item.korean}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{item.uzbek}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {session.missed.length > 0 && (
          <button type="button" onClick={session.restartMissed} className="action-btn bg-rose-500 text-white">
            {t("practice.practiceMissed", { count: session.missed.length })}
          </button>
        )}
        <button type="button" onClick={session.restartAll} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          {t("practice.again")}
        </button>
      </div>
    </GlassCard>
  );
}

function RoundProgress({ session }) {
  const { t } = useTranslation();
  const total = session.round.length;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>{t("practice.progress", { current: Math.min(session.cursor + 1, total), total })}</span>
        <span>✓ {session.correctCount}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all" style={{ width: `${total ? (session.cursor / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function TypedAnswerPractice({ exerciseType, title, badge, placeholder, expected, prompt }) {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const session = usePracticeRound(exerciseType);
  const { word, answered } = session;
  const [answer, setAnswer] = useState("");
  const [blankError, setBlankError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setAnswer("");
    setBlankError(false);
    inputRef.current?.focus();
    if (word && exerciseType === "listening") speakKorean(word.korean, progress.settings.speechRate);
    // Speak once per new word, not on every rate change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, exerciseType]);

  if (session.finished) {
    return (
      <div className="space-y-6">
        <ModeHeader lesson={session.lesson} active={exerciseType} />
        <RoundSummary session={session} />
      </div>
    );
  }
  if (!word) return null;

  const check = () => {
    if (!answer.trim()) {
      setBlankError(true);
      return;
    }
    session.record(isAnswerCorrect(answer, expected(word)));
  };

  const submit = () => (answered === undefined ? check() : session.next());
  const mastery = getWordMastery(getWordKey(word), progress.words);
  const reveal = [word.korean, word.romanization, word.uzbek].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <ModeHeader lesson={session.lesson} active={exerciseType} />
      <PracticeCard title={title} badge={badge}>
        <RoundProgress session={session} />
        {prompt(word, progress.settings.speechRate)}
        <label htmlFor={`${exerciseType}-answer`} className="sr-only">{placeholder}</label>
        <input
          ref={inputRef}
          id={`${exerciseType}-answer`}
          value={answer}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => {
            setAnswer(event.target.value);
            setBlankError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          readOnly={answered !== undefined}
          className={`premium-input mt-6 ${answered === true ? "rounded-3xl border border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200" : answered === false ? "rounded-3xl border border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200" : ""}`}
        />
        {blankError && <p className="mt-2 text-center text-sm font-bold text-rose-600 dark:text-rose-400">{t("practice.enterAnswer")}</p>}
        <AnswerFooter
          answered={answered}
          reveal={reveal}
          mastery={mastery}
          onCheck={check}
          onDontKnow={() => session.record(false)}
          onNext={session.next}
        />
      </PracticeCard>
    </div>
  );
}

export function ListeningPage() {
  const { t } = useTranslation();
  return (
    <TypedAnswerPractice
      exerciseType="listening"
      title={t("practice.listening")}
      badge={t("practice.audioFirst")}
      placeholder={t("practice.typeKorean")}
      expected={(word) => word.korean}
      prompt={(word, rate) => (
        <button
          type="button"
          onClick={() => speakKorean(word.korean, rate)}
          aria-label={t("practice.replayAudio")}
          className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-4xl text-white shadow-2xl shadow-sky-500/30 transition hover:scale-105"
        >
          🔊
        </button>
      )}
    />
  );
}

export function WritingPage() {
  const { t } = useTranslation();
  return (
    <TypedAnswerPractice
      exerciseType="writing"
      title={t("practice.writing")}
      badge={t("practice.typeTranslation")}
      placeholder={t("practice.typeTranslation")}
      expected={(word) => word.uzbek}
      prompt={(word, rate) => (
        <button type="button" onClick={() => speakKorean(word.korean, rate)} className="mx-auto block text-center">
          <span className="block text-4xl font-black md:text-7xl">{word.korean}</span>
          {word.romanization && <span className="mt-2 block text-lg font-bold text-sky-600 dark:text-sky-300 md:text-xl">{word.romanization} 🔊</span>}
        </button>
      )}
    />
  );
}

export function QuizPage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const session = usePracticeRound("quiz");
  const { word, answered, lessonWords } = session;
  const [selectedKey, setSelectedKey] = useState(null);

  const options = useMemo(() => {
    if (!word) return [];
    // Distractors never repeat the correct meaning, so only one option can be right.
    const seen = new Set([word.uzbek]);
    const distractors = shuffle(lessonWords).filter((item) => {
      if (seen.has(item.uzbek)) return false;
      seen.add(item.uzbek);
      return true;
    });
    return shuffle([word, ...distractors.slice(0, 3)]);
  }, [word, lessonWords]);

  useEffect(() => {
    setSelectedKey(null);
    if (word && progress.settings.autoSpeak) speakKorean(word.korean, progress.settings.speechRate);
    // Speak once per new word.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea")) return;
      const index = Number(event.key) - 1;
      if (answered === undefined && index >= 0 && index < options.length) {
        setSelectedKey(getWordKey(options[index]));
        session.record(getWordKey(options[index]) === getWordKey(word));
      } else if (answered !== undefined && event.key === "Enter") {
        session.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, options, session, word]);

  if (session.finished) {
    return (
      <div className="space-y-6">
        <ModeHeader lesson={session.lesson} active="quiz" />
        <RoundSummary session={session} />
      </div>
    );
  }
  if (!word) return null;

  const mastery = getWordMastery(getWordKey(word), progress.words);

  return (
    <div className="space-y-6">
      <ModeHeader lesson={session.lesson} active="quiz" />
      <PracticeCard title={t("practice.quiz")} badge={t("practice.fourChoices")}>
        <RoundProgress session={session} />
        <button type="button" onClick={() => speakKorean(word.korean, progress.settings.speechRate)} className="mx-auto block text-center">
          <span className="block text-4xl font-black md:text-7xl">{word.korean}</span>
          {word.romanization && <span className="mt-2 block text-lg font-bold text-slate-500 dark:text-slate-300 md:text-xl">{word.romanization} 🔊</span>}
        </button>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {options.map((option, index) => {
            const key = getWordKey(option);
            const isRight = key === getWordKey(word);
            let tone = "border-slate-200 bg-white/80 text-slate-800 hover:-translate-y-1 hover:border-sky-300 dark:border-white/10 dark:bg-white/10 dark:text-white";
            if (answered !== undefined) {
              if (isRight) tone = "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
              else if (key === selectedKey) tone = "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200";
              else tone = "border-slate-200 bg-white/80 text-slate-800 opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white";
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedKey(key);
                  session.record(isRight);
                }}
                disabled={answered !== undefined}
                className={`flex items-center gap-3 rounded-3xl border p-5 text-left text-lg font-black shadow-sm transition ${tone}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950/5 text-xs dark:bg-white/10">{index + 1}</span>
                {option.uzbek}
              </button>
            );
          })}
        </div>
        <AnswerFooter
          answered={answered}
          mastery={mastery}
          onDontKnow={() => session.record(false)}
          onNext={session.next}
        />
      </PracticeCard>
    </div>
  );
}

function PracticeCard({ title, badge, children }) {
  return (
    <GlassCard className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-4 text-center md:mb-6">
        <WordBadge>{badge}</WordBadge>
        <h2 className="mt-2 text-2xl font-black md:text-3xl">{title}</h2>
      </div>
      {children}
    </GlassCard>
  );
}

function AnswerFooter({ answered, reveal, mastery, onCheck, onDontKnow, onNext }) {
  const { t } = useTranslation();
  return (
    <div className="mt-8 space-y-5 text-center">
      {answered !== undefined && (
        <p
          role="status"
          className={`rounded-3xl p-4 text-lg font-black ${answered ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}
        >
          {answered ? `✓ ${t("practice.correct")}` : reveal ? t("practice.incorrect", { answer: reveal }) : `✗ ${t("topik.incorrect")}`}
        </p>
      )}
      {mastery && (
        <div className="flex items-center justify-center gap-2">
          <MasteryBadge level={mastery.level} />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{t("practice.masteryScore", { score: mastery.score })}</span>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {answered === undefined ? (
          <>
            <button type="button" onClick={onDontKnow} className="action-btn border border-slate-300 text-slate-700 dark:border-white/15 dark:text-slate-200">
              {t("practice.dontKnow")}
            </button>
            {onCheck && (
              <button type="button" onClick={onCheck} className="action-btn bg-sky-500 text-white">
                {t("common.confirm")}
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={onNext} autoFocus className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            {t("button.next")} →
          </button>
        )}
      </div>
    </div>
  );
}

export function WordListActions({ word }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const favorites = progress.favorites;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => speakKorean(word.korean, progress.settings.speechRate)}
        className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-200"
      >
        {t("practice.play")}
      </button>
      <button
        type="button"
        onClick={() => dispatch(toggleFavorite(getWordKey(word)))}
        className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-400/15 dark:text-violet-200"
      >
        {favorites[getWordKey(word)]
          ? t("flashcards.saved")
          : t("flashcards.favorite")}
      </button>
    </div>
  );
}
