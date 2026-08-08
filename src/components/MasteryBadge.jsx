export default function MasteryBadge({ level, size = "sm" }) {
  const config = {
    new: {
      label: "New",
      bg: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
      icon: null,
    },
    learning: {
      label: "Learning",
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
      icon: null,
    },
    practiced: {
      label: "Practiced",
      bg: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
      icon: null,
    },
    mastered: {
      label: "Mastered",
      bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
      icon: "🎉",
    },
  };

  const c = config[level] || config.new;
  const sizeClasses =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : size === "lg"
      ? "px-3 py-1 text-sm"
      : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-black ${c.bg} ${sizeClasses}`}
    >
      {c.icon && <span className="mr-0.5">{c.icon}</span>}
      {c.label}
    </span>
  );
}
