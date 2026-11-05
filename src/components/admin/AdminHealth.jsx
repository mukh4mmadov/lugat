import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { timeAgo } from "../../lib/dates";
import { Panel, ServerNotice, StatTile } from "../../pages/AdminPage";

// Is the site well right now: AI failures, a live check of both models, and
// which model answers first.
export default function AdminHealth() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "health" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runCheck() {
    setBusy(true);
    setCheck(null);
    try {
      setCheck((await adminRequest({}, { action: "aiCheck" })).models);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function prefer(value) {
    setBusy(true);
    try {
      await adminRequest({}, { action: "setting", key: "ai_prefer_backup", value });
      await load();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <div className="space-y-4"><ServerNotice error={error} onRetry={load} />{!error && <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />}</div>;

  const first = data.preferBackup ? data.models.backup : data.models.main;
  return (
    <div className="space-y-4">
      <ServerNotice error={error} onRetry={load} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatTile tone={data.ai.learnersFailed ? "amber" : "emerald"} label={t("adminHealth.learnersFailed")} value={data.ai.learnersFailed} hint={t("adminHealth.day")} />
        <StatTile tone="sky" label={t("adminHealth.mainFailed")} value={data.ai.mainFailed} hint={t("adminHealth.mainFailedHint")} />
        <StatTile tone="violet" label={t("adminHealth.speakingFailed")} value={data.speakingFailed} hint={t("adminHealth.day")} />
        <Link to="/admin/errors" className="block"><StatTile tone="amber" label={t("adminHealth.siteErrors")} value={data.siteErrors} hint={t("adminHealth.day")} /></Link>
      </div>
      {data.ai.lastFailure && <p className="px-1 text-xs text-slate-500">{t("adminHealth.lastFailure", { time: timeAgo(data.ai.lastFailure, i18n.language) })}</p>}

      <Panel title={t("adminHealth.checkTitle")}>
        <p className="mb-3 text-xs text-slate-500">{t("adminHealth.checkText")}</p>
        <button type="button" disabled={busy} onClick={runCheck} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{busy && !check ? t("common.loading") : t("adminHealth.check")}</button>
        {check && (
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-white/5">
            {check.map((item) => (
              <li key={item.model} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 break-all font-mono text-xs">{item.model}</span>
                <span className={`shrink-0 font-bold tabular-nums ${item.ok ? "text-emerald-600" : "text-rose-600"}`}>{item.ok ? `✓ ${(item.ms / 1000).toFixed(1)} s` : `✕ ${item.status || t("adminHealth.timeout")}`}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={t("adminHealth.modelTitle")}>
        <p className="mb-1 text-sm">{t("adminHealth.modelNow")} <b className="break-all font-mono text-xs">{first}</b></p>
        <p className="mb-3 text-xs text-slate-500">{t("adminHealth.modelText")}</p>
        <button type="button" disabled={busy} onClick={() => prefer(!data.preferBackup)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black disabled:opacity-50 dark:border-white/15">
          {data.preferBackup ? t("adminHealth.useMain") : t("adminHealth.useBackup")}
        </button>
      </Panel>

      <Panel title={t("adminHealth.alertsTitle")}>
        <p className="text-sm">{t("adminHealth.alertsText")}</p>
        <p className={`mt-2 text-sm font-bold ${data.adminDevices ? "text-emerald-600" : "text-rose-600"}`}>
          {data.adminDevices ? t("adminHealth.devices", { count: data.adminDevices }) : t("adminHealth.noDevices")}
        </p>
      </Panel>
    </div>
  );
}
