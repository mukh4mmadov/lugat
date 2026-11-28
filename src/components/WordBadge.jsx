export default function WordBadge({ children, tone = "sky" }) {
  const colors = {
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${colors[tone]}`}>{children}</span>;
}
