import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "./GlassCard";
import { supabase } from "../lib/supabase";

const LEAGUES = [
  { id: 1, key: "bronze", icon: "🥉", tone: "from-amber-700 to-orange-500" },
  { id: 2, key: "silver", icon: "🥈", tone: "from-slate-500 to-slate-300" },
  { id: 3, key: "gold", icon: "🥇", tone: "from-yellow-500 to-amber-300" },
  { id: 4, key: "sapphire", icon: "💎", tone: "from-sky-600 to-cyan-400" },
  { id: 5, key: "diamond", icon: "👑", tone: "from-violet-600 to-fuchsia-400" },
];
const ZONE = 5;

function timeLeft(endsAt, t) {
  const ms = Math.max(0, Date.parse(endsAt) - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? t("league.leftDays", { days, hours }) : t("league.leftHours", { hours, minutes: Math.floor((ms % 3600000) / 60000) });
}

// This week's league group: 30 learners ranked by XP earned this week. The
// top 5 move up a league on Monday and the bottom 5 move down.
export default function LeagueBoard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase.rpc("my_league").then(({ data: result, error: rpcError }) => {
      if (rpcError) setError(true);
      else setData(result);
    });
  }, []);

  if (error) return <GlassCard className="text-center text-sm font-bold text-rose-600">{t("leaderboard.error")}</GlassCard>;
  if (!data) return <div className="h-48 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />;

  const league = LEAGUES[(data.league || 1) - 1];
  const members = data.members || [];
  const size = members.length;
  return (
    <div className="space-y-4">
      <div className={`rounded-3xl bg-gradient-to-r ${league.tone} p-5 text-white shadow-xl`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl drop-shadow">{league.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wider opacity-80">{t("league.thisWeek")}</p>
            <h2 className="text-2xl font-black">{t(`league.name.${league.key}`)}</h2>
            <p className="text-sm font-bold opacity-90">⏳ {timeLeft(data.ends_at, t)}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-1">
          {LEAGUES.map((item) => (
            <span key={item.id} className={`grid h-9 flex-1 place-items-center rounded-xl text-lg ${item.id === league.id ? "bg-white/90" : "bg-white/20 opacity-70"}`} title={t(`league.name.${item.key}`)}>{item.icon}</span>
          ))}
        </div>
      </div>

      {!data.joined ? (
        <GlassCard className="text-center">
          <p className="text-4xl">⚡</p>
          <p className="mt-2 font-black">{t("league.joinTitle")}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("league.joinText")}</p>
          <Link to="/" className="mt-4 inline-block rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">{t("league.startLearning")}</Link>
        </GlassCard>
      ) : (
        <GlassCard className="!p-3 md:!p-4">
          <p className="px-2 pb-2 text-xs font-bold text-slate-500">{t("league.rules")}</p>
          <ol className="space-y-1">
            {members.map((member, index) => {
              const rank = index + 1;
              const up = rank <= ZONE && member.xp > 0 && league.id < 5;
              const down = size >= 10 && rank > size - ZONE && league.id > 1;
              return (
                <li key={index}>
                  {rank === ZONE + 1 && league.id < 5 && <p className="my-1 border-t-2 border-dashed border-emerald-400 pt-1 text-center text-[10px] font-black uppercase text-emerald-600">▲ {t("league.promotionZone")}</p>}
                  {down && rank === size - ZONE + 1 && <p className="my-1 border-t-2 border-dashed border-rose-400 pt-1 text-center text-[10px] font-black uppercase text-rose-600">▼ {t("league.demotionZone")}</p>}
                  <div className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${member.me ? "bg-sky-50 ring-2 ring-sky-300 dark:bg-sky-500/10" : ""}`}>
                    <span className={`w-7 shrink-0 text-center text-sm font-black tabular-nums ${up ? "text-emerald-600" : down ? "text-rose-600" : ""}`}>{rank}</span>
                    <span className="min-w-0 flex-1 truncate font-bold">
                      {member.name || t("league.anonymous")}
                      {member.me && <span className="ml-2 text-xs font-black text-sky-600 dark:text-sky-300">({t("leaderboard.you")})</span>}
                    </span>
                    <span className="shrink-0 text-sm font-black tabular-nums text-amber-600 dark:text-amber-300">{member.xp} XP</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </GlassCard>
      )}
    </div>
  );
}
