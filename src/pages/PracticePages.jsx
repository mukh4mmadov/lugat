import { useMemo, useEffect, useState } from "react";
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

function useLessonPractice() {
  const { lessonId = "1" } = useParams();
  const [cursor, setCursor] = useState(0);
  const lesson = Number(lessonId);
  const words = useMemo(() => shuffle(getLessonWords(lesson)), [lesson]);
  const word = words[cursor % words.length];
  return { lesson, words, word, next: () => setCursor((value) => value + 1), cursor };
}

export function ListeningPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const { lesson, word, next } = useLessonPractice();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const wordMastery = word ? getWordMastery(getWordKey(word), progress.words) : null;

  function check() {
    const correct = isAnswerCorrect(answer, word.korean);
    dispatch(correct ? markKnown({ key: getWordKey(word), exerciseType: "listening" }) : markDifficult({ key: getWordKey(word), exerciseType: "listening" }));
    const answerText = [word.korean, word.romanization, word.uzbek].filter(Boolean).join(' · ');
    setResult(correct ? t("practice.correct") : t("practice.incorrect", { answer: answerText }));
    setIsCorrect(correct);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="listening" />
      <PracticeCard title={t("practice.listening")} badge={t("practice.audioFirst")}>
        <button type="button" onClick={() => speakKorean(word.korean, progress.settings.speechRate)} className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-lg font-black text-white shadow-2xl shadow-sky-500/30">{t("practice.play")}</button>
        <label htmlFor="listening-answer-input" className="sr-only">{t("practice.typeKorean")}</label>
        <input
          id="listening-answer-input"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={t("practice.typeKorean")}
          disabled={isCorrect !== null}
          className={(() => {
            if (isCorrect === true) return "premium-input mt-8 rounded-3xl border border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
            if (isCorrect === false) return "premium-input mt-8 rounded-3xl border border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200";
            return "premium-input mt-8";
          })()}
        />
        <ResultActions result={result} onCheck={check} onNext={() => { setAnswer(""); setResult(null); setIsCorrect(null); next(); }} mastery={wordMastery} />
      </PracticeCard>
    </div>
  );
}

export function QuizPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const { lesson, words, word, next } = useLessonPractice();
  const [result, setResult] = useState(null);
  const options = useMemo(() => shuffle([word, ...shuffle(words.filter((item) => item.id !== word.id)).slice(0, 3)]), [word, words]);
  const wordMastery = word ? getWordMastery(getWordKey(word), progress.words) : null;
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setSelectedOption(null);
  }, [word]);

  function choose(option) {
    const correct = option.id === word.id;
    dispatch(correct ? markKnown({ key: getWordKey(word), exerciseType: "quiz" }) : markDifficult({ key: getWordKey(word), exerciseType: "quiz" }));
    setResult(correct ? t("practice.correct") : t("practice.incorrect", { answer: word.uzbek }));
    setSelectedOption(option);
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="quiz" />
      <PracticeCard title={t("practice.quiz")} badge={t("practice.fourChoices")}>
        <p className="text-center text-4xl font-black md:text-7xl">{word.korean}</p>
        {word.romanization && (
          <p className="mt-2 text-center text-lg font-bold text-slate-500 dark:text-slate-300 md:text-xl">{word.romanization}</p>
        )}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={getWordKey(option)}
              type="button"
              onClick={() => choose(option)}
              disabled={!!selectedOption}
              className={(() => {
                const isSelected = selectedOption?.id === option.id;
                const isCorrect = option.id === word.id;
                if (!selectedOption) {
                  return "rounded-3xl border border-slate-200 bg-white/80 p-5 text-left text-lg font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 dark:border-white/10 dark:bg-white/10 dark:text-white";
                }
                if (isCorrect) {
                  return "rounded-3xl border border-emerald-400 bg-emerald-50 p-5 text-left text-lg font-black text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
                }
                if (isSelected) {
                  return "rounded-3xl border border-rose-400 bg-rose-50 p-5 text-left text-lg font-black text-rose-800 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200";
                }
                return "rounded-3xl border border-slate-200 bg-white/80 p-5 text-left text-lg font-black text-slate-800 shadow-sm opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white";
              })()}
            >
              {option.uzbek}
            </button>
          ))}
        </div>
        <ResultActions result={result} onCheck={() => speakKorean(word.korean, progress.settings.speechRate)} checkLabel={t("practice.replayAudio")} onNext={() => { setResult(null); next(); }} mastery={wordMastery} />
      </PracticeCard>
    </div>
  );
}

export function WritingPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const { lesson, word, next } = useLessonPractice();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const wordMastery = word ? getWordMastery(getWordKey(word), progress.words) : null;

  function check() {
    const correct = isAnswerCorrect(answer, word.uzbek);
    dispatch(correct ? markKnown({ key: getWordKey(word), exerciseType: "writing" }) : markDifficult({ key: getWordKey(word), exerciseType: "writing" }));
    setResult(correct ? t("practice.correct") : t("practice.incorrect", { answer: word.uzbek }));
    setIsCorrect(correct);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="writing" />
      <PracticeCard title={t("practice.writing")} badge={t("practice.typeTranslation")}>
        <p className="text-center text-4xl font-black md:text-7xl">{word.korean}</p>
        {word.romanization && (
          <p className="mt-2 text-center text-lg font-bold text-sky-600 dark:text-sky-300 md:text-xl">{word.romanization}</p>
        )}
        <label htmlFor="writing-answer-input" className="sr-only">{t("practice.typeTranslation")}</label>
        <input
          id="writing-answer-input"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && check()}
          placeholder={t("practice.typeTranslation")}
          disabled={isCorrect !== null}
          className={(() => {
            if (isCorrect === true) return "premium-input mt-6 rounded-3xl border border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
            if (isCorrect === false) return "premium-input mt-6 rounded-3xl border border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200";
            return "premium-input mt-6";
          })()}
        />
        <ResultActions result={result} onCheck={check} onNext={() => { setAnswer(""); setResult(null); setIsCorrect(null); next(); }} mastery={wordMastery} />
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

function ResultActions({ result, onCheck, onNext, checkLabel, mastery }) {
  const { t } = useTranslation();
  return (
    <div className="mt-8 space-y-5 text-center">
      {result && <p className="rounded-3xl bg-slate-950/5 p-4 text-lg font-black text-slate-800 dark:bg-white/10 dark:text-white">{result}</p>}
      {mastery && (
        <div className="flex items-center justify-center gap-2">
          <MasteryBadge level={mastery.level} />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
            {t("practice.masteryScore", { score: mastery.score })}
          </span>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onCheck} className="action-btn bg-sky-500 text-white">{checkLabel || t("common.confirm")}</button>
        <button type="button" onClick={onNext} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">{t("button.next")}</button>
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
      <button type="button" onClick={() => speakKorean(word.korean, progress.settings.speechRate)} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-200">{t("practice.play")}</button>
      <button type="button" onClick={() => dispatch(toggleFavorite(getWordKey(word)))} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-400/15 dark:text-violet-200">{favorites[getWordKey(word)] ? t("flashcards.saved") : t("flashcards.favorite")}</button>
    </div>
  );
}
