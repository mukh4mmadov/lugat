import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { getMasteryOverview } from "../lib/mastery";
import WordBadge from "../components/WordBadge";
import EmptyStateIllustrations from "../components/EmptyStateIllustrations";
import { lessonInfo } from "../data";
import { selectLessonProgress, selectReviewCount } from "../store";

export default function HomePage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const reviewCount = useSelector(selectReviewCount);
  const totalWords = lessonInfo.reduce((sum, lesson) => sum + lesson.count, 0);
  const completedLessons = lessonInfo.filter((lesson) => selectLessonProgress({ progress }, lesson.lesson) === 100).length;
  const isNewUser = progress.stats.studiedWords === 0 && progress.stats.streak === 0 && completedLessons === 0;
  const dailyLesson = (new Date().getDate() % lessonInfo.length) + 1;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <GlassCard className="relative overflow-hidden p-6 md:p-10">
        {isNewUser ? (
          <div className="relative z-10">
            <div className="mx-auto mb-4 h-24 w-24">
              <EmptyStateIllustrations.WelcomeNewUser />
            </div>
            <h2 className="text-center text-2xl font-black md:text-3xl">{t("home.welcomeTitle")}</h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300 md:text-base">{t("home.welcomeMessage")}</p>
            <div className="mt-4 text-center">
              <Link to="/lesson/1/flashcards" className="inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-black text-white shadow-xl shadow-sky-500/25 transition hover:-translate-y-1">{t("home.startLesson")}</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-sky-300/25 blur-3xl md:block" />
            <WordBadge>{t("home.officialSource")}</WordBadge>
            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-6xl">
              {t("home.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg md:leading-8">
              {t("home.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/lesson/1/flashcards" className="rounded-2xl bg-slate-950 px-5 py-2.5 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 dark:bg-white dark:text-slate-950">
                {t("home.continueLesson")}
              </Link>
              <Link to="/review" className="rounded-2xl border border-slate-200 bg-white/75 px-5 py-2.5 font-black text-slate-800 shadow-sm transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white">
                {t("home.reviewMode")}
              </Link>
            </div>
          </>
        )}
      </GlassCard>

        <GlassCard className="grid content-between gap-5">
          <div>
            <WordBadge tone="green">{t("home.progress")}</WordBadge>
            <h3 className="mt-4 text-3xl font-black">{t("home.dashboard")}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("home.words")} value={totalWords} />
            <Metric label={t("home.lessons")} value={lessonInfo.length} />
            <Metric label={t("home.completed")} value={completedLessons} />
            <Metric label={t("home.streak")} value={progress.stats.streak} />
          </div>
        </GlassCard>
      </section>

      {(() => {
        const overview = getMasteryOverview(progress.words);
        return (
          <GlassCard className="relative overflow-hidden p-5 md:p-8">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
            <div className="relative">
              <WordBadge tone="green">{t("home.masteryOverview")}</WordBadge>
              <h2 className="mt-3 text-xl font-black md:text-2xl">{t("home.yourWordMastery")}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-emerald-50 p-3 text-center dark:bg-emerald-400/10">
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{overview.mastered}</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">{t("home.mastered")}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-center dark:bg-sky-400/10">
                  <p className="text-2xl font-black text-sky-700 dark:text-sky-200">{overview.practiced}</p>
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-300">{t("home.practiced")}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center dark:bg-amber-400/10">
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-200">{overview.learning}</p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-300">{t("home.learning")}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-center dark:bg-white/10">
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{overview.new}</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{t("home.new")}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                  <span>{t("home.overallProgress")}</span>
                  <span>{overview.overallPercent}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${overview.overallPercent}%` }} />
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })()}

      {reviewCount > 0 && (
        <GlassCard className="relative overflow-hidden p-5 md:p-8 transition hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-amber-300/25 blur-3xl md:block" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <WordBadge tone="amber">{t("home.reviewMode")}</WordBadge>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">
                {t("srs.reviewsDue", { count: reviewCount })}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 md:text-base">
                {t("srs.reviewsDueSubtitle")}
              </p>
            </div>
            <Link to="/review" className="shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-2.5 text-center font-black text-white shadow-xl shadow-amber-500/25 transition hover:-translate-y-1">
              {t("srs.reviewNow")}
            </Link>
          </div>
        </GlassCard>
      )}

      <GlassCard className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <WordBadge tone="amber">{t("home.dailyChallenge")}</WordBadge>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">{t("home.dailyChallengeText", { lesson: dailyLesson })}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 md:text-base">{t("home.dailyChallengeSubtitle")}</p>
        </div>
        <Link to={`/lesson/${dailyLesson}/flashcards`} className="rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-2.5 text-center font-black text-white shadow-xl shadow-amber-500/25 transition hover:-translate-y-1">
          {t("home.startChallenge")}
        </Link>
      </GlassCard>

      <Link to="/courses" className="group block">
        <GlassCard className="relative overflow-hidden p-6 md:p-10 transition hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-violet-300/25 blur-3xl md:block" />
          <div className="relative">
            <WordBadge tone="violet">{t("courses.browseByCourse", { defaultValue: "Browse by Course" })}</WordBadge>
            <h2 className="mt-4 max-w-3xl text-2xl font-black tracking-tight md:text-4xl">
              {t("courses.browseTitle", { defaultValue: "Explore Lessons by Book" })}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-lg md:leading-8">
              {t("courses.browseSubtitle", { defaultValue: "Choose K-TALIM 1A or 1B to view its lessons" })}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-2.5 font-black text-white transition group-hover:scale-105">
              {t("courses.openCourses", { defaultValue: "Open Course Library" })}
              <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </div>
        </GlassCard>
      </Link>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessonInfo.map((lesson, index) => {
          const percent = selectLessonProgress({ progress }, lesson.lesson);
          return (
            <motion.article key={lesson.lesson} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="group rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-lg font-black text-white shadow-lg">
                  {lesson.lesson}
                </div>
                <WordBadge tone={percent === 100 ? "green" : "violet"}>{lesson.count} {t("home.words")}</WordBadge>
              </div>
              <h3 className="mt-4 text-lg font-black">{t("card.lesson", { lesson: lesson.lesson })}</h3>
               <p className="mt-1.5 min-h-10 text-xs capitalize text-slate-600 dark:text-slate-300">{t(lesson.category)}</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                <span>{t("home.wordsLearned", { percent })}</span>
                <Link className="text-sky-600 transition group-hover:translate-x-1 dark:text-sky-300" to={`/lesson/${lesson.lesson}/flashcards`}>
                  {t("home.continue")}
                </Link>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/10">
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}
