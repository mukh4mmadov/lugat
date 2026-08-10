import { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { MASTERY_LEVELS, getCourseMastery, getLessonMastery } from "../lib/mastery";
import WordBadge from "../components/WordBadge";
import MasteryBadge from "../components/MasteryBadge";
import { getCourses, getCourseLessons } from "../data";
import { selectLessonProgress } from "../store";
import { useSelector } from "react-redux";

export default function CoursesPage() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const progress = useSelector((state) => state.progress);

  const courses = useMemo(() => getCourses(), []);

  if (courseId) {
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      return (
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">{t("courses.notFound")}</p>
          <button onClick={() => navigate("/courses")} className="mt-4 rounded-2xl bg-sky-500 px-6 py-3 font-black text-white">
            {t("courses.backToCourses")}
          </button>
        </div>
      );
    }

      const lessons = getCourseLessons(courseId);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/courses")}
            className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            ← {t("courses.backToCourses", { defaultValue: "Back to Courses" })}
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              {course.id === "1A" ? t("courses.course1A") : course.id === "1B" ? t("courses.course1B") : course.id}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 md:text-sm">
              {course.lessons.length} {t("home.lessons")} · {course.lessons.reduce((sum, l) => sum + l.count, 0)} {t("home.words")}
            </p>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lessons.map((lesson, index) => {
            const percent = selectLessonProgress({ progress }, lesson.lesson);
            const lessonMastery = getLessonMastery(lesson.lesson, progress.words);
            return (
              <motion.article
                key={lesson.lesson}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-lg font-black text-white shadow-lg">
                    {lesson.lesson}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <WordBadge tone={percent === 100 ? "green" : "violet"}>
                      {lesson.count} {t("home.words")}
                    </WordBadge>
                    <MasteryBadge level={lessonMastery.percent >= 80 ? MASTERY_LEVELS.MASTERED : lessonMastery.percent >= 50 ? MASTERY_LEVELS.PRACTICED : lessonMastery.percent >= 20 ? MASTERY_LEVELS.LEARNING : MASTERY_LEVELS.NEW} size="xs" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-black">{t("card.lesson", { lesson: lesson.lesson })}</h3>
                <p className="mt-1.5 min-h-10 text-xs capitalize text-slate-600 dark:text-slate-300">{t(lesson.category)}</p>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                  <span>{lessonMastery.mastered}/{lessonMastery.total} {t("study.mastered")}</span>
                  <Link className="text-sky-600 transition group-hover:translate-x-1 dark:text-sky-300" to={`/lesson/${lesson.lesson}/flashcards`}>
                    {t("button.continue")}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <GlassCard className="relative overflow-hidden p-6 md:p-10">
        <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-sky-300/25 blur-3xl md:block" />
        <WordBadge tone="green">{t("courses.selectCourse", { defaultValue: "Select Course" })}</WordBadge>
        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-6xl">
          {t("courses.title", { defaultValue: "Choose your course" })}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg md:leading-8">
          {t("courses.subtitle", { defaultValue: "Select the K-TALIM book you want to study" })}
        </p>
      </GlassCard>

      <section className="grid gap-4 sm:grid-cols-2">
        {courses.map((course, index) => {
          const courseLabel = course.id === "1A" ? t("courses.course1A") : course.id === "1B" ? t("courses.course1B") : course.id;
          const lessonRange = `${course.lessons[0]?.lesson}–${course.lessons[course.lessons.length - 1]?.lesson}`;
          const wordCount = course.lessons.reduce((sum, l) => sum + l.count, 0);
          const description =
            course.id === "1A"
              ? t("courses.description1A", { defaultValue: "Foundation vocabulary from the first book" })
              : course.id === "1B"
              ? t("courses.description1B", { defaultValue: "Advanced vocabulary from the second book" })
              : "";
          const mastery = getCourseMastery(course.id, progress.words);

          return (
            <motion.article
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/courses/${course.id}`} className="group block">
                <GlassCard className="relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-300/20 blur-2xl transition group-hover:scale-110" />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-xl font-black text-white shadow-lg">
                        {course.id}
                      </div>
                      <WordBadge tone="green">{wordCount} {t("home.words")}</WordBadge>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{courseLabel}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t("card.lesson", { lesson: lessonRange })} · {course.lessons.length} {t("home.lessons")}
                    </p>
                    {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
                    <div className="flex items-center justify-between rounded-2xl bg-slate-950/5 p-3 dark:bg-white/10">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-300">{t("courses.mastery")}</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{mastery.mastered} / {mastery.total}</p>
                      </div>
                      <MasteryBadge level={mastery.percent >= 80 ? MASTERY_LEVELS.MASTERED : mastery.percent >= 50 ? MASTERY_LEVELS.PRACTICED : mastery.percent >= 20 ? MASTERY_LEVELS.LEARNING : MASTERY_LEVELS.NEW} />
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white transition group-hover:scale-105">
                        {t("courses.openCourse", { defaultValue: "Open Course" })}
                        <span className="transition group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}
