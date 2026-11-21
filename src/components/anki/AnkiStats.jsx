import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../GlassCard";
import { cardStats } from "../../lib/anki";
import { selectAnkiOptions } from "../../store";

const BAND_KEYS = ["d1", "d7", "d21", "d90", "d90plus"];

function Bars({ values, labels, tone }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-3 flex h-28 items-end gap-1.5">
      {values.map((value, index) => (
        <div key={labels[index]} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-black tabular-nums">{value}</span>
          <span className={`w-full rounded-t-md ${tone}`} style={{ height: `${Math.max(4, (value / max) * 64)}px` }} />
          <span className="w-full truncate text-center text-[10px] font-bold text-slate-500 dark:text-slate-400">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

// Forecast and memory-strength bands for the learner's started cards.
export default function AnkiStats() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const stats = useMemo(() => cardStats(progress, options), [progress, options]);
  if (!stats.total) return null;
  const dueLabels = stats.due.map((_, index) => (index === 0 ? t("anki.today") : `+${index}`));
  return (
    <GlassCard className="p-4 md:p-5">
      <h2 className="text-lg font-black">📊 {t("anki.stats.title", { count: stats.total })}</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{t("anki.forecast")}</p>
          <Bars values={stats.due} labels={dueLabels} tone="bg-sky-500" />
        </div>
        <div>
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{t("anki.stats.intervals")}</p>
          <Bars values={stats.bands} labels={BAND_KEYS.map((key) => t(`anki.stats.${key}`))} tone="bg-emerald-500" />
        </div>
      </div>
    </GlassCard>
  );
}
