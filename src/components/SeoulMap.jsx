import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VISITED_PERCENT } from "../data/seoulMap";
import { useJourney } from "../hooks/useJourney";

// A winding path of lessons as places in Seoul. `compact` shows only the
// stretch around where the learner is now.
export default function SeoulMap({ compact = false }) {
  const { t, i18n } = useTranslation();
  const { places, visited, current } = useJourney();
  const language = i18n.language;
  const shown = compact && current ? places.slice(Math.max(0, current.lesson - 3), current.lesson + 2) : places;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-black">🗺️ {t("journey.title")}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("journey.progress", { visited, total: places.length })}</p>
        </div>
        {compact && (
          <Link to="/achievements#journey" className="text-sm font-bold text-sky-600 dark:text-sky-300">{t("journey.fullMap")} →</Link>
        )}
      </div>
      <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-7 before:top-4 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-emerald-300 before:via-sky-300 before:to-slate-200 dark:before:from-emerald-500/50 dark:before:via-sky-500/40 dark:before:to-white/10">
        {shown.map((place, index) => {
          const done = place.percent >= VISITED_PERCENT;
          const here = current?.lesson === place.lesson;
          const offset = compact ? "" : index % 2 ? "sm:ml-16" : "sm:ml-4";
          return (
            <li key={place.lesson} className={`relative flex items-center gap-3 ${offset}`}>
              <Link
                to={`/lesson/${place.lesson}/flashcards`}
                aria-label={`${t("card.lesson", { lesson: place.lesson })}: ${place[language] || place.en}`}
                className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 text-2xl shadow-lg transition hover:scale-105 ${
                  done
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/20"
                    : here
                      ? "animate-pulse border-sky-500 bg-white dark:bg-slate-900"
                      : "border-slate-200 bg-slate-100 grayscale dark:border-white/10 dark:bg-white/5"
                }`}
              >
                {place.emoji}
                {done && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs text-white">✓</span>}
              </Link>
              <div className={`min-w-0 flex-1 rounded-2xl px-3 py-2 ${here ? "bg-sky-50 ring-2 ring-sky-300 dark:bg-sky-500/10 dark:ring-sky-400/40" : ""}`}>
                <p className="truncate text-sm font-black">
                  <span lang="ko">{place.ko}</span> <span className="font-semibold text-slate-500">· {place[language] || place.en}</span>
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>{t("card.lesson", { lesson: place.lesson })}</span>
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <span className={`block h-full rounded-full ${done ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${place.percent}%` }} />
                  </span>
                  <span>{place.percent}%</span>
                  {here && <span className="text-sky-600 dark:text-sky-300">📍 {t("journey.youAreHere")}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
