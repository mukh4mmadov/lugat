import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { levelProgress } from "../lib/gamification";

// The learner's level in the header, with progress to the next one.
export default function LevelChip() {
  const { t } = useTranslation();
  const xp = useSelector((state) => state.progress.xp || 0);
  const { level, percent } = levelProgress(xp);
  return (
    <Link
      to="/achievements"
      title={t("xp.chipTitle", { xp })}
      className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-black text-amber-800 shadow-sm transition hover:-translate-y-0.5 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <span aria-hidden="true">⚡</span>
      <span>{t("xp.levelShort", { level })}</span>
      <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-500/20 sm:block" aria-hidden="true">
        <span className="block h-full rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
      </span>
    </Link>
  );
}
