import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { lessonInfo } from "../data";
import { selectLessonProgress } from "../store";

export default function HomePage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const totalWords = lessonInfo.reduce((sum, lesson) => sum + lesson.count, 0);
  const completedLessons = lessonInfo.filter((lesson) => selectLessonProgress({ progress }, lesson.lesson) === 100).length;
  const dailyLesson = (new Date().getDate() % lessonInfo.length) + 1;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <GlassCard className="relative overflow-hidden p-8 md:p-10">
          <div className="absolute right-6 top-6 hidden h-36 w-36 rounded-full bg-sky-300/25 blur-3xl md:block" />
          <WordBadge>{t("home.officialSource")}</WordBadge>
          <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            {t("home.title")}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {t("home.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/lesson/1/flashcards" className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 dark:bg-white dark:text-slate-950">
              {t("home.continueLesson")}
            </Link>
            <Link to="/review" className="rounded-2xl border border-slate-200 bg-white/75 px-6 py-3 font-black text-slate-800 shadow-sm transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white">
              {t("home.reviewMode")}
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="grid content-between gap-5">
          <div>
            <WordBadge tone="green">{t("home.progress")}</WordBadge>
            <h3 className="mt-4 text-3xl font-black">{t("home.dashboard")}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("home.words")} value={totalWords} />
            <Metric label={t("home.lessons")} value="14" />
            <Metric label={t("home.completed")} value={completedLessons} />
            <Metric label={t("home.streak")} value={progress.stats.streak} />
          </div>
        </GlassCard>
      </section>

      <GlassCard className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <WordBadge tone="amber">{t("home.dailyChallenge")}</WordBadge>
          <h2 className="mt-3 text-3xl font-black">{t("home.dailyChallengeText", { lesson: dailyLesson })}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t("home.dailyChallengeSubtitle")}</p>
        </div>
        <Link to={`/lesson/${dailyLesson}/flashcards`} className="rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-3 text-center font-black text-white shadow-xl shadow-amber-500/25 transition hover:-translate-y-1">
          {t("home.startChallenge")}
        </Link>
      </GlassCard>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessonInfo.map((lesson, index) => {
          const percent = selectLessonProgress({ progress }, lesson.lesson);
          return (
            <motion.article key={lesson.lesson} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="group rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-xl font-black text-white shadow-lg">
                  {lesson.lesson}
                </div>
                <WordBadge tone={percent === 100 ? "green" : "violet"}>{lesson.count} {t("home.words")}</WordBadge>
              </div>
              <h3 className="mt-5 text-xl font-black">{t("card.lesson", { lesson: lesson.lesson })}</h3>
              <p className="mt-2 min-h-12 text-sm capitalize text-slate-600 dark:text-slate-300">{lesson.category}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-300">
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
