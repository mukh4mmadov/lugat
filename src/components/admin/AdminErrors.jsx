import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { timeAgo } from "../../lib/dates";
import { Panel, ServerNotice } from "../../pages/AdminPage";

// Errors learners hit in the browser (app_errors), grouped by message, so
// broken pages are found without waiting for someone to report them.
export default function AdminErrors() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "errors" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clear = async (message) => {
    await adminRequest({}, { action: "clearError", message }).catch(() => {});
    load();
  };

  return (
    <div className="space-y-4">
      <ServerNotice error={error} onRetry={load} />
      <Panel title={t("adminErrors.title", { count: data?.total || 0 })} action={<button type="button" onClick={load} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-black dark:border-white/15">{t("common.refresh", { defaultValue: "Refresh" })}</button>}>
        <p className="mb-3 text-xs text-slate-500">{t("adminErrors.text")}</p>
        {!data && !error && <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />}
        {data && !data.errors.length && <p className="py-6 text-center text-sm text-slate-500">{t("adminErrors.none")}</p>}
        <ul className="space-y-2">
          {data?.errors.map((item) => (
            <li key={item.message} className="rounded-2xl border border-slate-100 p-3 text-sm dark:border-white/5">
              <button type="button" onClick={() => setOpen(open === item.message ? null : item.message)} className="w-full text-left">
                <span className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
                  <span>{t(`adminErrors.kind.${item.kind}`)} · {t("adminErrors.times", { count: item.count })} · {t("adminErrors.users", { count: item.users })}</span>
                  <span className="shrink-0">{timeAgo(item.lastAt, i18n.language)}</span>
                </span>
                <span className="mt-1 block break-words font-mono text-xs font-bold text-rose-700 dark:text-rose-300">{item.message}</span>
                <span className="mt-1 block truncate text-xs text-slate-500">{item.paths.join(", ")}</span>
              </button>
              {open === item.message && (
                <div className="mt-2 space-y-2">
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-100 p-2 text-[11px] dark:bg-white/5">{item.stack || "—"}</pre>
                  <p className="text-[11px] text-slate-500">{item.userAgent}</p>
                  <button type="button" onClick={() => clear(item.message)} className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-black dark:border-white/15">{t("adminErrors.fixed")}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
