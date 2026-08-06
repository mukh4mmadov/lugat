import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { allWords, getWordKey, lessonInfo } from "../data";
import { resetProgress, selectDifficultWords, selectFavoriteWords } from "../store";
import { normalizeAnswer } from "../lib/study";
import { WordListActions } from "./PracticePages";

export function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const normalized = normalizeAnswer(query);
  const results = useMemo(() => {
    if (!normalized) return allWords;
    return allWords.filter((word) => [word.korean, word.uzbek, word.romanization].some((value) => normalizeAnswer(value).includes(normalized)));
  }, [normalized]);

  return (
    <GlassCard>
      <Header title={t("library.search")} badge={t("library.searchBadge")} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("library.searchPlaceholder")} className="premium-input mb-6" />
      <WordGrid words={results} empty={t("search.noResults")} />
    </GlassCard>
  );
}

export function FavoritesPage() {
  const { t } = useTranslation();
  const words = useSelector(selectFavoriteWords);
  return (
    <GlassCard>
      <Header title={t("library.favorites")} badge={t("flashcards.saved")} />
      <WordGrid words={words} empty={t("library.favoritesEmpty")} />
    </GlassCard>
  );
}

export function DifficultPage() {
  const { t } = useTranslation();
  const words = useSelector(selectDifficultWords);
  return (
    <GlassCard>
      <Header title={t("library.difficult")} badge={t("library.autoCollected")} />
      <WordGrid words={words} empty={t("library.difficultEmpty")} />
    </GlassCard>
  );
}

export function StatsPage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const difficult = selectDifficultWords({ progress });
  const studiedUnique = Object.values(progress.words).filter((word) => word.knownCount > 0 || word.wrongCount > 0).length;
  const accuracy = progress.stats.correct + progress.stats.wrong ? Math.round((progress.stats.correct / (progress.stats.correct + progress.stats.wrong)) * 100) : 0;
  const hardestLesson = lessonInfo
    .map((lesson) => ({ lesson: lesson.lesson, score: lesson.words.reduce((sum, word) => sum + (progress.words[getWordKey(word)]?.difficulty || 0), 0) }))
    .sort((left, right) => right.score - left.score)[0];

  const achievements = [
    [t("achievement.firstStep"), studiedUnique > 0],
    [t("achievement.hundredReviews"), progress.stats.studiedWords >= 100],
    [t("achievement.sevenDayStreak"), progress.stats.streak >= 7],
    [t("achievement.halfWay"), studiedUnique >= Math.round(allWords.length / 2)],
    [t("achievement.master"), studiedUnique === allWords.length],
  ];

  return (
    <div className="space-y-6">
      <GlassCard>
        <Header title={t("library.stats")} badge={t("library.analytics")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("stats.dailyStreak")} value={progress.stats.streak} />
          <Metric label={t("stats.accuracy")} value={`${accuracy}%`} />
          <Metric label={t("stats.wordsLearned")} value={studiedUnique} />
          <Metric label={t("stats.studyTime")} value={`${progress.stats.studyMinutes} ${t("time.minutes")}`} />
          <Metric label={t("stats.completedLessons")} value={lessonInfo.filter((lesson) => lesson.words.every((word) => progress.words[getWordKey(word)]?.knownCount > 0)).length} />
          <Metric label={t("stats.hardestLesson")} value={hardestLesson?.score ? hardestLesson.lesson : t("common.none")} />
          <Metric label={t("stats.hardWords")} value={difficult.length} />
          <Metric label={t("stats.reviews")} value={progress.stats.studiedWords} />
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <Header title={t("stats.achievements")} badge={t("stats.milestones")} />
          <div className="grid gap-3">
            {achievements.map(([name, unlocked]) => (
              <div key={name} className={`rounded-3xl p-4 font-black ${unlocked ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>{name}</div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <Header title={t("stats.recentActivity")} badge={t("stats.latestPractice")} />
          <div className="space-y-3">
            {progress.stats.activity.length ? progress.stats.activity.map((item) => (
              <div key={`${item.word}-${item.at}`} className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/10">
                <p className="font-black">{item.word}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{t("card.lesson", { lesson: item.lesson })} · {item.type}</p>
              </div>
            )) : <p className="text-slate-500 dark:text-slate-300">{t("stats.noActivity")}</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <GlassCard className="mx-auto max-w-3xl">
      <Header title={t("library.settings")} badge={t("library.personalization")} />
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-950/5 p-5 dark:bg-white/10">
          <h3 className="text-xl font-black">{t("settings.pronunciation")}</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t("settings.pronunciationText")}</p>
        </div>
        <div className="rounded-3xl bg-rose-50 p-5 dark:bg-rose-500/10">
          <h3 className="text-xl font-black text-rose-700 dark:text-rose-200">{t("settings.resetProgress")}</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t("settings.resetProgressText")}</p>
          <button type="button" onClick={() => window.confirm(t("settings.resetConfirm")) && dispatch(resetProgress())} className="mt-4 rounded-2xl bg-rose-500 px-5 py-3 font-black text-white">{t("settings.resetButton")}</button>
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
