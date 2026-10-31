import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { formatDate, timeAgo } from "../../lib/dates";
import { Panel, ServerNotice, StatTile } from "../../pages/AdminPage";

const BAN_OPTIONS = [24, 24 * 7, 24 * 3650];

// Live calls: who is waiting or talking now, reports to review, and bans.
export default function AdminSpeaking() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("open");

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "speaking" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  async function run(...bodies) {
    setBusy(true);
    try {
      for (const body of bodies) await adminRequest({}, body);
      await load();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  const who = (id) => (id ? data.emails[id] || id.slice(0, 8) : "—");
  const userLink = (id) => <Link to={`/admin/users?user=${id}`} className="font-bold hover:underline">{who(id)}</Link>;
  const reports = data?.reports.filter((report) => filter === "all" || report.status === filter) || [];
  const bannedIds = new Set((data?.bans || []).map((ban) => ban.user_id));
  const empty = <p className="text-sm text-slate-500">{t("admin.noData")}</p>;

  return (
    <div className="space-y-5">
      <ServerNotice error={error} onRetry={load} />
      {!data && !error && <div className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile tone="sky" label={t("admin.live.waiting")} value={data.queue.length} />
            <StatTile tone="emerald" label={t("admin.live.active")} value={data.active.length} />
            <StatTile tone="violet" label={t("admin.live.today")} value={data.stats.callsToday} hint={t("speaking.minutesShort", { count: data.stats.minutesToday })} />
            <StatTile tone={data.stats.openReports ? "rose" : "emerald"} label={t("admin.live.openReports")} value={data.stats.openReports} />
          </section>

          <Panel
            title={t("admin.live.reports")}
            action={
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-slate-900">
                {["open", "resolved", "dismissed", "all"].map((value) => <option key={value} value={value}>{t(`admin.live.status.${value}`)}</option>)}
              </select>
            }
          >
            {reports.length ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {reports.map((report) => (
                  <li key={report.id} className="space-y-1.5 py-3">
                    <p>⚠️ {userLink(report.reported)} <span className="text-slate-500">← {who(report.reporter)}</span></p>
                    <p className="text-xs text-slate-500">
                      {t(`live.reason.${report.reason}`)} · {timeAgo(report.created_at, i18n.language)}{report.note ? ` · “${report.note}”` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {BAN_OPTIONS.map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          disabled={busy}
                          onClick={() => run({ action: "speakingBan", userId: report.reported, hours, reason: `report ${report.id}` }, { action: "reportStatus", reportId: report.id, status: "resolved" })}
                          className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-black text-white disabled:opacity-50"
                        >
                          ⛔ {t(`admin.live.ban.${hours}`)}
                        </button>
                      ))}
                      {report.status === "open" ? (
                        <button type="button" disabled={busy} onClick={() => run({ action: "reportStatus", reportId: report.id, status: "dismissed" })} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold disabled:opacity-50 dark:border-white/15">{t("admin.live.dismiss")}</button>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold dark:bg-white/10">{t(`admin.live.status.${report.status}`)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              empty
            )}
          </Panel>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title={t("admin.live.activeCalls")}>
              {data.active.length ? (
                <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                  {data.active.map((call) => (
                    <li key={call.id} className="flex flex-wrap items-center gap-2 py-2">
                      <span className="min-w-0 flex-1">{userLink(call.caller)} ↔ {userLink(call.callee)}</span>
                      <span className="text-xs text-slate-500">{call.connected_at ? timeAgo(call.connected_at, i18n.language) : t("live.connecting")}</span>
                      <button type="button" disabled={busy} onClick={() => run({ action: "endCall", callId: call.id })} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-black text-white disabled:opacity-50">{t("admin.live.endCall")}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                empty
              )}
            </Panel>
            <Panel title={t("admin.live.bans")}>
              {data.bans.length ? (
                <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                  {data.bans.map((ban) => (
                    <li key={ban.user_id} className="flex flex-wrap items-center gap-2 py-2">
                      <span className="min-w-0 flex-1">{userLink(ban.user_id)} <span className="text-xs text-slate-500">· {formatDate(ban.until, i18n.language)} · {ban.reason}</span></span>
                      <button type="button" disabled={busy} onClick={() => run({ action: "speakingBan", userId: ban.user_id, hours: 0 })} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold disabled:opacity-50 dark:border-white/15">{t("admin.live.unban")}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                empty
              )}
            </Panel>
          </div>

          <Panel title={t("admin.live.recent")}>
            {data.recent.length ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {data.recent.map((call) => (
                  <li key={call.id} className="flex flex-wrap items-center gap-2 py-2">
                    <span className="min-w-0 flex-1">
                      {userLink(call.caller)}{bannedIds.has(call.caller) ? " ⛔" : ""} ↔ {userLink(call.callee)}{bannedIds.has(call.callee) ? " ⛔" : ""}
                    </span>
                    <span className="text-xs text-slate-500">{t("speaking.minutesShort", { count: Math.round(call.seconds / 60) })} · {timeAgo(call.created_at, i18n.language)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              empty
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
