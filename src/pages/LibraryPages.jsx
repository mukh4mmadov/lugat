import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { allWords, getWordKey, lessonInfo } from "../data";
import { resetProgress, selectDifficultWords, selectFavoriteWords } from "../store";
import { normalizeAnswer } from "../lib/study";
import { WordListActions } from "./PracticePages";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const normalized = normalizeAnswer(query);
  const results = useMemo(() => {
    if (!normalized) return allWords;
    return allWords.filter((word) => [word.korean, word.uzbek, word.romanization].some((value) => normalizeAnswer(value).includes(normalized)));
  }, [normalized]);

  return (
    <GlassCard>
      <Header title="Search" badge="Korean · Uzbek · Romanization" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all 452 vocabulary entries" className="premium-input mb-6" />
      <WordGrid words={results} empty="No matching words found." />
    </GlassCard>
  );
}

export function FavoritesPage() {
  const words = useSelector(selectFavoriteWords);
  return (
    <GlassCard>
      <Header title="Favorites" badge="Saved words" />
      <WordGrid words={words} empty="No favorites yet. Save words from flashcards or search." />
    </GlassCard>
  );
}

export function DifficultPage() {
  const words = useSelector(selectDifficultWords);
  return (
    <GlassCard>
      <Header title="Difficult Words" badge="Auto collected" />
      <WordGrid words={words} empty="No difficult words yet. Press Don't Know during practice." />
    </GlassCard>
  );
}

export function StatsPage() {
  const progress = useSelector((state) => state.progress);
  const difficult = selectDifficultWords({ progress });
  const studiedUnique = Object.values(progress.words).filter((word) => word.knownCount > 0 || word.wrongCount > 0).length;
  const accuracy = progress.stats.correct + progress.stats.wrong ? Math.round((progress.stats.correct / (progress.stats.correct + progress.stats.wrong)) * 100) : 0;
  const hardestLesson = lessonInfo
    .map((lesson) => ({ lesson: lesson.lesson, score: lesson.words.reduce((sum, word) => sum + (progress.words[getWordKey(word)]?.difficulty || 0), 0) }))
    .sort((left, right) => right.score - left.score)[0];

  const achievements = [
    ["First Step", studiedUnique > 0],
    ["100 Reviews", progress.stats.studiedWords >= 100],
    ["7 Day Streak", progress.stats.streak >= 7],
    ["Half Way", studiedUnique >= Math.round(allWords.length / 2)],
    ["K-TALIM Master", studiedUnique === allWords.length],
  ];

  return (
    <div className="space-y-6">
      <GlassCard>
        <Header title="Statistics" badge="Learning analytics" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Daily streak" value={progress.stats.streak} />
          <Metric label="Accuracy" value={`${accuracy}%`} />
          <Metric label="Words learned" value={studiedUnique} />
          <Metric label="Study time" value={`${progress.stats.studyMinutes}m`} />
          <Metric label="Completed lessons" value={lessonInfo.filter((lesson) => lesson.words.every((word) => progress.words[getWordKey(word)]?.knownCount > 0)).length} />
          <Metric label="Hardest lesson" value={hardestLesson?.score ? hardestLesson.lesson : "—"} />
          <Metric label="Hard words" value={difficult.length} />
          <Metric label="Reviews" value={progress.stats.studiedWords} />
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <Header title="Achievements" badge="Milestones" />
          <div className="grid gap-3">
            {achievements.map(([name, unlocked]) => (
              <div key={name} className={`rounded-3xl p-4 font-black ${unlocked ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>{name}</div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <Header title="Recent Activity" badge="Latest practice" />
          <div className="space-y-3">
            {progress.stats.activity.length ? progress.stats.activity.map((item) => (
              <div key={`${item.word}-${item.at}`} className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/10">
                <p className="font-black">{item.word}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">Lesson {item.lesson} · {item.type}</p>
              </div>
            )) : <p className="text-slate-500 dark:text-slate-300">No activity yet.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const dispatch = useDispatch();
  return (
    <GlassCard className="mx-auto max-w-3xl">
      <Header title="Settings" badge="Personalization" />
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-950/5 p-5 dark:bg-white/10">
          <h3 className="text-xl font-black">Pronunciation</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Audio uses your browser's Korean speech synthesis voice (`ko-KR`) for every word.</p>
        </div>
        <div className="rounded-3xl bg-rose-50 p-5 dark:bg-rose-500/10">
          <h3 className="text-xl font-black text-rose-700 dark:text-rose-200">Reset Progress</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">This clears learned words, favorites, difficult words, stats, streak, and saved decks.</p>
          <button type="button" onClick={() => window.confirm("Reset all local progress?") && dispatch(resetProgress())} className="mt-4 rounded-2xl bg-rose-500 px-5 py-3 font-black text-white">Reset Progress</button>
        </div>
      </div>
    </GlassCard>
  );
}

function Header({ title, badge }) {
  return (
    <div className="mb-6">
      <WordBadge>{badge}</WordBadge>
      <h2 className="mt-4 text-4xl font-black tracking-tight">{title}</h2>
    </div>
  );
}

function WordGrid({ words, empty }) {
  if (!words.length) return <p className="text-slate-500 dark:text-slate-300">{empty}</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {words.map((word) => (
        <article key={getWordKey(word)} className="rounded-3xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-black">{word.korean}</p>
              <p className="font-semibold text-sky-600 dark:text-sky-300">{word.romanization}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{word.uzbek}</p>
            </div>
            <WordBadge tone={word.needsReview ? "amber" : "green"}>L{word.lesson}</WordBadge>
          </div>
          <div className="mt-4"><WordListActions word={word} /></div>
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-950/5 p-5 dark:bg-white/10">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}
