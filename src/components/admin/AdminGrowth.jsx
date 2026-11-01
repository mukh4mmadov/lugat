import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { timeAgo } from "../../lib/dates";
import { Panel, ServerNotice, StatTile } from "../../pages/AdminPage";

const LEAGUE_ICONS = ["🥉", "🥈", "🥇", "💎", "👑"];

// Weekly leagues (with the biggest XP gains, to spot cheating), invites and
// push reminders.
export default function AdminGrowth() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "growth" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(body) {
    setBusy(true);
    try {
      await adminRequest({}, body);
      await load();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  const who = (id) => data.emails[id] || id.slice(0, 8);
  const userLink = (id) => <Link to={`/admin/users?user=${id}`} className="font-bold hover:underline">{who(id)}</Link>;
  const empty = <p className="text-sm text-slate-500">{t("admin.noData")}</p>;

  return (
    <div className="space-y-5">
      <ServerNotice error={error} onRetry={load} />
      {!data && !error && <div className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile tone="amber" label={t("admin.growth.inLeagues")} value={data.top.length ? data.leagues.reduce((sum, league) => sum + league.members, 0) : 0} hint={data.week} />
            <StatTile tone="emerald" label={t("admin.growth.invites")} value={data.referrals.filter((row) => !row.revoked).length} hint={t("admin.growth.counted", { count: data.referrals.filter((row) => row.qualified_at && !row.revoked).length })} />
            <StatTile tone="rose" label={t("admin.growth.suspicious")} value={data.referrals.filter((row) => row.sharedDevice && !row.revoked).length} />
            <StatTile tone="sky" label={t("admin.growth.pushUsers")} value={data.pushUsers} />
          </section>

          <Panel title={t("admin.growth.leagues")}>
            <div className="grid grid-cols-5 gap-2 text-center">
              {data.leagues.map((league) => (
                <div key={league.league} className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                  <p className="text-2xl">{LEAGUE_ICONS[league.league - 1]}</p>
                  <p className="text-lg font-black">{league.members}</p>
                  <p className="text-[10px] font-bold text-slate-500">{t("admin.growth.groups", { count: league.groups })}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t("admin.growth.topGains")}>
            <p className="mb-2 text-xs text-slate-500">{t("admin.growth.topGainsHint")}</p>
            {data.top.length ? (
              <ol className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {data.top.map((row, index) => (
                  <li key={row.user_id} className={`flex flex-wrap items-center gap-2 py-2 ${row.excluded ? "opacity-50" : ""}`}>
                    <span className="w-6 text-xs font-black text-slate-400">{index + 1}</span>
                    <span className="min-w-0 flex-1">{LEAGUE_ICONS[row.league - 1]} {userLink(row.user_id)} <span className="text-xs text-slate-500">· #{row.group_no}</span></span>
                    <span className="font-black tabular-nums text-amber-600">{row.gain} XP</span>
                    <button type="button" disabled={busy} onClick={() => run({ action: "leagueExclude", userId: row.user_id, week: data.week, value: !row.excluded })} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold disabled:opacity-50 dark:border-white/15">
                      {row.excluded ? t("admin.growth.include") : t("admin.growth.exclude")}
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              empty
            )}
          </Panel>

          <Panel title={t("admin.growth.referrals")}>
            {data.referrals.length ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {data.referrals.map((row) => (
                  <li key={row.referred} className={`flex flex-wrap items-center gap-2 py-2 ${row.revoked ? "opacity-50" : ""}`}>
                    <span className="min-w-0 flex-1">
                      {userLink(row.referrer)} → {userLink(row.referred)}
                      <span className="ml-2 text-xs text-slate-500">{timeAgo(row.created_at, i18n.language)}</span>
                    </span>
                    {row.qualified_at ? <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">✓ {t("admin.growth.qualified")}</span> : <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-white/10">{t("admin.growth.pending")}</span>}
                    {!row.confirmed && <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{t("admin.badge.unconfirmed")}</span>}
                    {row.sharedDevice && <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">⚠️ {t("admin.growth.sharedDevice")}</span>}
                    <button type="button" disabled={busy} onClick={() => run({ action: "referralRevoke", userId: row.referred, value: !row.revoked })} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold disabled:opacity-50 dark:border-white/15">
                      {row.revoked ? t("admin.growth.restore") : t("admin.growth.revoke")}
                    </button>
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
