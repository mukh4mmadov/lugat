import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { MASTERY_LEVELS, getWordMastery, getMasteryOverview } from "../lib/mastery";
import WordBadge from "../components/WordBadge";
import MasteryBadge from "../components/MasteryBadge";
import { allWords, getWordKey, lessonInfo } from "../data";
import { resetProgress, selectDifficultWords, selectFavoriteWords, markShareMilestoneShown, setSpeechRate, setAutoSpeak } from "../store";
import { normalizeAnswer } from "../lib/study";
import { WordListActions } from "./PracticePages";
import ShareModal from "../components/ShareModal";
import EmptyStateIllustrations from "../components/EmptyStateIllustrations";

export function SearchPage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const [query, setQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setVisibleCount(60);
  }, [debouncedQuery, masteryFilter]);

  const normalized = normalizeAnswer(debouncedQuery);
  const results = useMemo(() => {
    let filtered = allWords;
    if (normalized) {
      filtered = allWords.filter((word) => [word.korean, word.uzbek, word.romanization].filter(Boolean).some((value) => normalizeAnswer(value).includes(normalized)));
    }
    if (masteryFilter !== "all") {
      filtered = filtered.filter((word) => getWordMastery(getWordKey(word), progress.words).level === masteryFilter);
    }
    return filtered;
  }, [normalized, masteryFilter, progress.words]);

  const masteryCounts = useMemo(() => {
    const counts = { all: results.length };
    Object.values(MASTERY_LEVELS).forEach((level) => {
      counts[level] = results.filter((word) => getWordMastery(getWordKey(word), progress.words).level === level).length;
    });
    return counts;
  }, [results, progress.words]);

  const displayedResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  return (
    <GlassCard>
      <Header title={t("library.search")} badge={t("library.searchBadge")} />
      <label htmlFor="library-search-input" className="sr-only">{t("library.search")}</label>
      <input id="library-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("library.searchPlaceholder", { count: allWords.length })} className="premium-input mb-4" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: t("mastery.filterAll", { count: masteryCounts.all }) },
          { key: MASTERY_LEVELS.NEW, label: t("mastery.filterNew", { count: masteryCounts.new }) },
          { key: MASTERY_LEVELS.LEARNING, label: t("mastery.filterLearning", { count: masteryCounts.learning }) },
          { key: MASTERY_LEVELS.PRACTICED, label: t("mastery.filterPracticed", { count: masteryCounts.practiced }) },
          { key: MASTERY_LEVELS.MASTERED, label: t("mastery.filterMastered", { count: masteryCounts.mastered }) },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMasteryFilter(item.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
              masteryFilter === item.key
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "bg-white/65 text-slate-700 dark:bg-white/10 dark:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <WordGrid words={displayedResults} empty={t("search.noResults")} showMastery Illustration={EmptyStateIllustrations.SearchNoResults} />
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + 60)}
          className="mt-4 rounded-2xl border border-slate-200 bg-white/75 px-5 py-2.5 font-black text-slate-800 shadow-sm transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {t("library.showMore")}
        </button>
      )}
    </GlassCard>
  );
}

export function FavoritesPage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const words = useSelector(selectFavoriteWords);
  return (
    <GlassCard>
      <Header title={t("library.favorites")} badge={t("flashcards.saved")} />
      <WordGrid words={words} empty={t("library.favoritesEmpty")} showMastery masteryWordsState={progress.words} Illustration={EmptyStateIllustrations.FavoritesEmpty} />
    </GlassCard>
  );
}

export function DifficultPage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const words = useSelector(selectDifficultWords);
  return (
    <GlassCard>
      <Header title={t("library.difficult")} badge={t("library.autoCollected")} />
      <WordGrid words={words} empty={t("library.difficultEmpty")} showMastery masteryWordsState={progress.words} Illustration={EmptyStateIllustrations.DifficultEmpty} />
    </GlassCard>
  );
}

export function StatsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const difficult = selectDifficultWords({ progress });
  const studiedUnique = Object.values(progress.words).filter((word) => word.knownCount > 0 || word.wrongCount > 0).length;
  const accuracy = progress.stats.correct + progress.stats.wrong ? Math.round((progress.stats.correct / (progress.stats.correct + progress.stats.wrong)) * 100) : 0;
  const hardestLesson = lessonInfo
    .map((lesson) => ({ lesson: lesson.lesson, score: lesson.words.reduce((sum, word) => sum + (progress.words[getWordKey(word)]?.difficulty || 0), 0) }))
    .sort((left, right) => right.score - left.score)[0];
  const masteryOverview = getMasteryOverview(progress.words);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const currentMilestone = studiedUnique >= 50 ? Math.floor(studiedUnique / 50) * 50 : 0;

  useEffect(() => {
    if (currentMilestone > 0 && !progress.shareMilestones[currentMilestone]) {
      dispatch(markShareMilestoneShown(currentMilestone));
      setIsShareModalOpen(true);
    }
  }, [currentMilestone, progress.shareMilestones, dispatch]);

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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <WordBadge>{t("library.analytics")}</WordBadge>
            <h2 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">{t("library.stats")}</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="action-btn bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          >
            <span className="mr-2">{t("common.share")}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.5 9 12c0-.5-.114-.938-.316-1.342m0 2.684a3 3 0 11-6 0 3 3 0 016 0zM17 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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

      <GlassCard>
        <Header title={t("mastery.wordLevels")} badge={t("mastery.overview")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("home.mastered")} value={masteryOverview.mastered} tone="green" />
          <Metric label={t("home.practiced")} value={masteryOverview.practiced} tone="sky" />
          <Metric label={t("home.learning")} value={masteryOverview.learning} tone="amber" />
          <Metric label={t("home.new")} value={masteryOverview.new} tone="slate" />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
            <span>{t("mastery.overallMastery")}</span>
            <span>{masteryOverview.overallPercent}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${masteryOverview.overallPercent}%` }} />
          </div>
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
            )) : (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-24 w-24">
                  <EmptyStateIllustrations.NoActivity />
                </div>
                <p className="text-slate-500 dark:text-slate-300">{t("stats.noActivity")}</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        progress={progress}
      />
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  return (
    <GlassCard className="mx-auto max-w-3xl">
      <Header title={t("library.settings")} badge={t("library.personalization")} />
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-950/5 p-5 dark:bg-white/10">
          <h3 className="text-xl font-black">{t("settings.pronunciation")}</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t("settings.pronunciationText")}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/5 p-5 dark:bg-white/10">
          <h3 className="text-xl font-black">{t("settings.audioSection")}</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("settings.speechRate")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={progress.settings.speechRate}
                  onChange={(e) => dispatch(setSpeechRate(Number(e.target.value)))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {progress.settings.speechRate.toFixed(2)}x
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{t("settings.autoSpeak")}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("settings.autoSpeakDescription")}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(setAutoSpeak(!progress.settings.autoSpeak))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  progress.settings.autoSpeak ? "bg-sky-500" : "bg-slate-200 dark:bg-white/10"
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${
                  progress.settings.autoSpeak ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
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
    <div className="mb-4">
      <WordBadge>{badge}</WordBadge>
      <h2 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">{title}</h2>
    </div>
  );
}

function WordGrid({ words, empty, showMastery = false, masteryWordsState, Illustration }) {
  const { t } = useTranslation();
  if (!words.length) {
    return (
      <div className="text-center py-8">
        {Illustration && (
          <div className="mx-auto mb-4 h-24 w-24">
            <Illustration />
          </div>
        )}
        <p className="text-slate-500 dark:text-slate-300">{empty}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {words.map((word) => {
        const mastery = showMastery ? getWordMastery(getWordKey(word), masteryWordsState) : null;
        return (
          <article key={getWordKey(word)} className="rounded-3xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black">{word.korean}</p>
                  {mastery && <MasteryBadge level={mastery.level} size="xs" />}
                </div>
                {word.romanization && <p className="font-semibold text-sky-600 dark:text-sky-300">{word.romanization}</p>}
                <p className="mt-1 text-slate-600 dark:text-slate-300">{word.uzbek}</p>
              </div>
              <WordBadge tone={word.needsReview ? "amber" : "green"}>{t("library.lessonPrefix")}{word.lesson}</WordBadge>
            </div>
            <div className="mt-3"><WordListActions word={word} /></div>
          </article>
        );
      })}
    </div>
  );
}

function Metric({ label, value, tone }) {
  const toneColors = {
    green: "text-emerald-600 dark:text-emerald-300",
    sky: "text-sky-600 dark:text-sky-300",
    amber: "text-amber-600 dark:text-amber-300",
    slate: "text-slate-600 dark:text-slate-300",
  };
  return (
    <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/10">
      <p className={`text-2xl font-black ${toneColors[tone] || "text-slate-900 dark:text-white"}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}
