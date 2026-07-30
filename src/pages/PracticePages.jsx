import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { getLessonWords, getWordKey } from "../data";
import { markDifficult, markKnown, toggleFavorite } from "../store";
import { isAnswerCorrect, shuffle } from "../lib/study";
import { speakKorean } from "../lib/speech";
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
  const dispatch = useDispatch();
  const { lesson, word, next } = useLessonPractice();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  function check() {
    const correct = isAnswerCorrect(answer, word.korean);
    dispatch(correct ? markKnown(getWordKey(word)) : markDifficult(getWordKey(word)));
    setResult(correct ? "Correct" : `Answer: ${word.korean} · ${word.romanization} · ${word.uzbek}`);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="listening" />
      <PracticeCard title="Listening Mode" badge="Audio first">
        <button type="button" onClick={() => speakKorean(word.korean)} className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-lg font-black text-white shadow-2xl shadow-sky-500/30">Play</button>
        <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type the Korean word you hear" className="premium-input mt-8" />
        <ResultActions result={result} onCheck={check} onNext={() => { setAnswer(""); setResult(null); next(); }} />
      </PracticeCard>
    </div>
  );
}

export function QuizPage() {
  const dispatch = useDispatch();
  const { lesson, words, word, next } = useLessonPractice();
  const [result, setResult] = useState(null);
  const options = useMemo(() => shuffle([word, ...shuffle(words.filter((item) => item.id !== word.id)).slice(0, 3)]), [word, words]);

  function choose(option) {
    const correct = option.id === word.id;
    dispatch(correct ? markKnown(getWordKey(word)) : markDifficult(getWordKey(word)));
    setResult(correct ? "Correct" : `Correct answer: ${word.uzbek}`);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="quiz" />
      <PracticeCard title="Quiz Mode" badge="4 choices">
        <p className="text-center text-5xl font-black md:text-7xl">{word.korean}</p>
        <p className="mt-3 text-center text-xl font-bold text-slate-500 dark:text-slate-300">{word.romanization}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <button key={getWordKey(option)} type="button" onClick={() => choose(option)} className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-left text-lg font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 dark:border-white/10 dark:bg-white/10 dark:text-white">
              {option.uzbek}
            </button>
          ))}
        </div>
        <ResultActions result={result} onCheck={() => speakKorean(word.korean)} checkLabel="Replay Audio" onNext={() => { setResult(null); next(); }} />
      </PracticeCard>
    </div>
  );
}

export function WritingPage() {
  const dispatch = useDispatch();
  const { lesson, word, next } = useLessonPractice();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  function check() {
    const correct = isAnswerCorrect(answer, word.uzbek);
    dispatch(correct ? markKnown(getWordKey(word)) : markDifficult(getWordKey(word)));
    setResult(correct ? "Correct" : `Answer: ${word.uzbek}`);
  }

  return (
    <div className="space-y-6">
      <ModeHeader lesson={lesson} active="writing" />
      <PracticeCard title="Writing Mode" badge="Type translation">
        <p className="text-center text-5xl font-black md:text-7xl">{word.korean}</p>
        <p className="mt-3 text-center text-xl font-bold text-sky-600 dark:text-sky-300">{word.romanization}</p>
        <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === "Enter" && check()} placeholder="Type the Uzbek translation" className="premium-input mt-8" />
        <ResultActions result={result} onCheck={check} onNext={() => { setAnswer(""); setResult(null); next(); }} />
      </PracticeCard>
    </div>
  );
}

function PracticeCard({ title, badge, children }) {
  return (
    <GlassCard className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <WordBadge>{badge}</WordBadge>
        <h2 className="mt-4 text-3xl font-black">{title}</h2>
      </div>
      {children}
    </GlassCard>
  );
}

function ResultActions({ result, onCheck, onNext, checkLabel = "Check" }) {
  return (
    <div className="mt-8 space-y-5 text-center">
      {result && <p className="rounded-3xl bg-slate-950/5 p-4 text-lg font-black text-slate-800 dark:bg-white/10 dark:text-white">{result}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onCheck} className="action-btn bg-sky-500 text-white">{checkLabel}</button>
        <button type="button" onClick={onNext} className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950">Next</button>
      </div>
    </div>
  );
}

export function WordListActions({ word }) {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.progress.favorites);
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => speakKorean(word.korean)} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-200">Audio</button>
      <button type="button" onClick={() => dispatch(toggleFavorite(getWordKey(word)))} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-400/15 dark:text-violet-200">{favorites[getWordKey(word)] ? "Saved" : "Favorite"}</button>
    </div>
  );
}
