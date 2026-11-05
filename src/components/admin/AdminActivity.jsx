import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { lessonInfo } from "../../data";
import { adminRequest } from "../../lib/adminApi";
import { Panel, ServerNotice, StatTile } from "../../pages/AdminPage";

// One series of bars. A bar's value shows on hover or tap, and in the table.
function Bars({ title, rows }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...rows.map((row) => row.value));
  const shown = hover ?? rows[rows.length - 1];
  return (
    <Panel title={title}>
      <p className="mb-2 flex h-5 justify-between gap-2 text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
        <span>{shown ? `${shown.label}: ${shown.value}` : ""}</span>
        <span className="text-xs font-semibold text-slate-500">{t("adminActivity.most", { count: max })}</span>
      </p>
      <div className="flex h-36 items-end gap-0.5 border-b border-slate-200 dark:border-white/10" onMouseLeave={() => setHover(null)}>
        {rows.map((row) => (
          <div key={row.label} onMouseEnter={() => setHover(row)} onClick={() => setHover(row)} className="flex h-full min-w-0 flex-1 items-end">
            <div className="w-full rounded-t bg-sky-500" style={{ height: `${(row.value / max) * 100}%`, minHeight: row.value ? 2 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{rows[0]?.label}</span>
        <span>{rows[rows.length - 1]?.label}</span>
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-bold text-slate-500">{t("adminActivity.table")}</summary>
        <ul className="mt-1 max-h-48 overflow-y-auto tabular-nums">
          {[...rows].reverse().map((row) => <li key={row.label} className="flex justify-between py-0.5"><span>{row.label}</span><span>{row.value}</span></li>)}
        </ul>
      </details>
    </Panel>
  );
}

// How the site is used: from data already saved in learners' progress, plus
// how much of each AI service was used.
export default function AdminActivity() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "activity" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <div className="space-y-4"><ServerNotice error={error} onRetry={load} />{!error && <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />}</div>;

  const usage = data.usage;
  // Every lesson, in order, so the place where learners stop can be seen.
  const learners = new Map(data.lessons.map((lesson) => [lesson.lesson, lesson.learners]));
  const lessonRows = lessonInfo.map(({ lesson }) => ({ label: t("card.lesson", { lesson }), value: learners.get(lesson) || 0 }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatTile tone="sky" label={t("adminActivity.aiMessages")} value={usage.aiMessages} hint={t("adminActivity.days14")} />
        <StatTile tone="violet" label={t("adminActivity.grammar")} value={usage.grammarChecks} hint={t("adminActivity.days14")} />
        <StatTile tone="emerald" label={t("adminActivity.speaking")} value={t("speaking.minutesShort", { count: Math.round(usage.speakingSeconds / 60) })} hint={t("adminActivity.days14")} />
        <StatTile tone="amber" label={t("adminActivity.koreaAi")} value={usage.koreaAi} hint={t("adminActivity.days14")} />
      </div>
      <p className="px-1 text-xs text-slate-500">{t("adminActivity.note")}</p>
      <Bars title={t("adminActivity.activeUsers")} rows={data.days.map((day) => ({ label: day.day, value: day.users }))} />
      <Bars title={t("adminActivity.answers")} rows={data.days.map((day) => ({ label: day.day, value: day.answers }))} />
      <Bars title={t("adminActivity.lessons")} rows={lessonRows} />
      <Panel title={t("adminActivity.exercises")}>
        <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
          {data.exercises.map((item) => <li key={item.type} className="flex justify-between py-1.5"><span>{t(`exercise.${item.type}`, item.type)}</span><span className="font-bold tabular-nums">{item.correct}</span></li>)}
        </ul>
      </Panel>
    </div>
  );
}
