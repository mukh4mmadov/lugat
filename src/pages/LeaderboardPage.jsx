import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import LeagueBoard from "../components/LeagueBoard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/dates";
import { setHideFromLeaderboard } from "../store";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const hidden = useSelector((state) => Boolean(state.progress.settings.hideFromLeaderboard));
  const [tab, setTab] = useState(() => (user ? "league" : "week"));
  const tabs = user ? ["league", "week", "speaking", "all"] : ["week", "speaking", "all"];
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    try {
      const response = await fetch("/api/leaderboard", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error(String(response.status));
      setData(await response.json());
    } catch {
      setError(t("leaderboard.error"));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load, user?.id, hidden]);

  // Signed-in learners start on their league once the session has loaded.
  const signedIn = Boolean(user);
  useEffect(() => {
    if (signedIn) setTab((current) => (current === "week" ? "league" : current));
  }, [signedIn]);

  const board = data?.[tab];
  const unit = { week: "leaderboard.answers", all: "leaderboard.words", speaking: "leaderboard.minutes" }[tab];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-black md:text-3xl">🏆 {t("leaderboard.title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`leaderboard.${tab}Hint`)}</p>
      </header>

      <div role="tablist" className={`grid gap-1 rounded-2xl bg-white/70 p-1 dark:bg-white/5 ${tabs.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {tabs.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-2 py-2.5 text-xs font-black transition sm:text-sm ${tab === key ? "bg-slate-950 text-white shadow dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"}`}
          >
            {t(`leaderboard.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === "league" && <LeagueBoard />}

      {tab !== "league" && board?.me && (
        <GlassCard className="!p-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("leaderboard.yourRank")}</p>
          <p className="mt-1 text-2xl font-black">
            #{board.me.rank} <span className="text-base font-bold text-slate-500">/ {board.me.of}</span>
            <span className="ml-3 text-base text-sky-600 dark:text-sky-300">{t(unit, { count: board.me.score })}</span>
          </p>
        </GlassCard>
      )}

      {tab !== "league" && <GlassCard className="!p-3 md:!p-4">
        {error && (
          <p role="alert" className="p-4 text-center text-sm font-bold text-rose-600">
            {error}{" "}
            <button type="button" onClick={load} className="underline">{t("common.tryAgain")}</button>
          </p>
        )}
        {!data && !error && <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />}
        {board && !board.rows.length && <p className="p-6 text-center text-sm font-semibold text-slate-500">{t("leaderboard.empty")}</p>}
        {board && board.rows.length > 0 && (
          <ol className="divide-y divide-slate-100 dark:divide-white/5">
            {board.rows.map((row) => (
              <li key={`${row.rank}-${row.name}`} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${row.me ? "bg-sky-50 dark:bg-sky-500/10" : ""}`}>
                <span className="w-9 shrink-0 text-center text-lg font-black tabular-nums">{MEDALS[row.rank - 1] || row.rank}</span>
                <span className="min-w-0 flex-1 truncate font-bold">
                  {row.name}
                  {row.me && <span className="ml-2 text-xs font-black text-sky-600 dark:text-sky-300">({t("leaderboard.you")})</span>}
                </span>
                {row.streak > 0 && <span className="shrink-0 text-xs font-bold text-amber-600 dark:text-amber-300">🔥{row.streak}</span>}
                <span className="w-24 shrink-0 text-right text-sm font-black tabular-nums">{t(unit, { count: row.score })}</span>
              </li>
            ))}
          </ol>
        )}
        {data && <p className="mt-2 px-3 text-right text-[11px] font-semibold text-slate-400">{t("admin.updated", { time: timeAgo(data.generatedAt, i18n.language) })}</p>}
      </GlassCard>}

      {user ? (
        <label className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold dark:bg-white/5">
          <input type="checkbox" checked={!hidden} onChange={(event) => dispatch(setHideFromLeaderboard(!event.target.checked))} className="h-5 w-5 accent-sky-600" />
          <span>
            {t("leaderboard.showMe")}
            <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{t("leaderboard.privacy")}</span>
          </span>
        </label>
      ) : (
        <p className="rounded-2xl bg-white/70 p-4 text-center text-sm font-semibold dark:bg-white/5">
          {t("leaderboard.joinHint")}{" "}
          <Link to="/register" className="font-black text-sky-600 underline dark:text-sky-300">{t("nav.register")}</Link>
        </p>
      )}
    </div>
  );
}
