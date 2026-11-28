import { useTranslation } from "react-i18next";

export default function MasteryBadge({ level, size = "sm" }) {
  const { t } = useTranslation();
  const colors = {
    new: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    learning: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    practiced: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    mastered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  };

  const sizeClasses =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : size === "lg"
      ? "px-3 py-1 text-sm"
      : "px-2 py-0.5 text-xs";

  const labelMap = {
    new: t("mastery.new"),
    learning: t("mastery.learning"),
    practiced: t("mastery.practiced"),
    mastered: t("mastery.mastered"),
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-black ${colors[level]} ${sizeClasses}`}
    >
      {labelMap[level] || level}
    </span>
  );
}
