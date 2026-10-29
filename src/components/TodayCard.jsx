import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DAILY_GOALS, selectReviewCount, setDailyGoal } from "../store";
import { dailyKey } from "../lib/study";

const UZ_WEEKDAYS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const MODE_KEYS = { flashcards: "practice.flashcards", listening: "practice.listening", quiz: "practice.quiz", writing: "practice.writing", dictation: "dictation.title" };

function weekdayLabel(date, language) {
  if (language.startsWith("uz")) return UZ_WEEKDAYS[date.getDay()];
  try {
    return new Intl.DateTimeFormat(language, { weekday: "short" }).format(date).slice(0, 2);
  } catch {
    return UZ_WEEKDAYS[date.getDay()];
  }
}

// "Lesson 3 · Quiz" for a remembered path.
function placeLabel(path, t) {
  const [section, id, mode] = path.split("/").filter(Boolean);
  if (section === "topik") return "TOPIK I";
  const lesson = t("card.lesson", { lesson: id });
  if (section === "study") return `${lesson} · ${t("nav.study")}`;
  return mode && MODE_KEYS[mode] ? `${lesson} · ${t(MODE_KEYS[mode])}` : lesson;
}

function GoalRing({ value, goal }) {
  const ratio = Math.min(1, value / goal);
  const circumference = 2 * Math.PI * 42;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r="42" strokeWidth="11" className="fill-none stroke-slate-200 dark:stroke-white/10" />
      <circle
        cx="50"
        cy="50"
        r="42"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${circumference * ratio} ${circumference}`}
        className={`fill-none transition-all duration-700 ${ratio >= 1 ? "stroke-emerald-500" : "stroke-sky-500"}`}
      />
    </svg>
  );
}

// Daily goal, streak warning, last 7 days and "continue where you left off".
export default function TodayCard({ fallbackLesson }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.progress.stats);
  const goal = useSelector((state) => state.progress.settings.dailyGoal) || 20;
  const lastPlace = useSelector((state) => state.progress.lastPlace);
  const reviewCount = useSelector(selectReviewCount);
  const daily = stats.daily || {};
  const today = dailyKey();
  const done = daily[today] || 0;
  const yesterday = dailyKey(new Date(Date.now() - 864e5));
  const streakAtRisk = stats.streak > 0 && stats.lastStudyDate === yesterday && done === 0;
  const streak = stats.lastStudyDate === today || stats.lastStudyDate === yesterday ? stats.streak : 0;

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 864e5);
    const key = dailyKey(date);
    return { key, label: weekdayLabel(date, i18n.language), count: daily[key] || 0, today: key === today };
  });

  const continueTo = lastPlace?.path || `/study/${fallbackLesson}`;
  const continueLabel = lastPlace?.path ? placeLabel(lastPlace.path, t) : t("card.lesson", { lesson: fallbackLesson });

  return (
    <div className="relative z-10 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black md:text-3xl">{t("today.title")}</h2>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          {t("today.goal")}
          <select
            value={goal}
            onChange={(event) => dispatch(setDailyGoal(Number(event.target.value)))}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-800 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            {DAILY_GOALS.map((value) => (
              <option key={value} value={value}>
                {t("today.answers", { count: value })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <GoalRing value={done} goal={goal} />
          <span className="absolute inset-0 grid place-items-center text-center">
            <span>
              <span className="block text-2xl font-black tabular-nums">{done}</span>
              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">/ {goal}</span>
            </span>
          </span>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-base font-black">
            {done >= goal ? `🎉 ${t("today.goalReached")}` : t("today.left", { count: goal - done })}
          </p>
          <p className={`text-sm font-bold ${streakAtRisk ? "text-amber-600 dark:text-amber-300" : "text-slate-600 dark:text-slate-300"}`}>
            {streakAtRisk
              ? `⚠️ ${t("today.streakRisk", { count: stats.streak })}`
              : streak > 0
                ? `🔥 ${t("today.streak", { count: streak })}`
                : t("today.startStreak")}
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label={t("today.week")}>
        {week.map((day) => {
          const reached = day.count >= goal;
          const level = day.count === 0 ? 0 : reached ? 3 : day.count >= goal / 2 ? 2 : 1;
          const tones = [
            "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
            "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
            "bg-sky-300 text-sky-950 dark:bg-sky-500/50 dark:text-white",
            "bg-emerald-500 text-white",
          ];
          return (
            <li key={day.key} className="text-center" title={t("today.answers", { count: day.count })}>
              <span className={`mx-auto grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${tones[level]} ${day.today ? "ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}>
                {reached ? "✓" : day.count || ""}
              </span>
              <span className={`mt-1 block text-[11px] font-bold ${day.today ? "text-sky-600 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"}`}>{day.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Link
          to={continueTo}
          className="inline-flex min-w-0 items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
        >
          <span aria-hidden="true">▶</span>
          <span className="truncate">
            {lastPlace?.path ? t("today.continue") : t("today.start")}: {continueLabel}
          </span>
        </Link>
        {reviewCount > 0 && (
          <Link
            to="/review"
            className="rounded-2xl border border-slate-200 bg-white/75 px-5 py-3 font-black text-slate-800 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            🔁 {t("today.review", { count: reviewCount })}
          </Link>
        )}
      </div>
    </div>
  );
}
