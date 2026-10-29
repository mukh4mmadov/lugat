import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import SeoulMap from "../components/SeoulMap";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../lib/dates";
import { BADGES, FREEZES_PER_MONTH, LEVEL_TITLES, levelProgress, levelTitle } from "../lib/gamification";
import { isPremium } from "../lib/premium";
import { dailyKey } from "../lib/study";
import { supabase } from "../lib/supabase";

async function rewardsRequest(method, body) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch("/api/rewards", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error || "failed"), { payload });
  return payload;
}

function StreakReward() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    rewardsRequest("GET").then((data) => setStatus(data.streak7)).catch(() => {});
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function claim() {
    setBusy(true);
    setMessage("");
    try {
      const data = await rewardsRequest("POST", { kind: "streak7" });
      setStatus(data.streak7);
      setMessage(t("rewards.claimed", { date: formatDate(data.premiumUntil, i18n.language) }));
      await refreshUser?.();
    } catch (error) {
      if (error.payload?.streak7) setStatus(error.payload.streak7);
      setMessage(t("rewards.claimFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (!user) return <p className="text-sm text-slate-500"><Link to="/login" className="font-bold underline">{t("nav.login")}</Link> · {t("rewards.signIn")}</p>;
  if (!status) return null;
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
      <p className="font-black">🎁 {t("rewards.streakTitle", { days: status.required })}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("rewards.streakText", { days: status.required, premium: status.days })}</p>
      {status.available ? (
        <button type="button" disabled={busy} onClick={claim} className="mt-3 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-60">
          {busy ? t("common.loading") : t("rewards.claim", { count: status.days })}
        </button>
      ) : status.nextAt ? (
        <p className="mt-3 text-sm font-bold text-violet-700 dark:text-violet-200">✓ {t("rewards.nextAt", { date: formatDate(status.nextAt, i18n.language) })}</p>
      ) : (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-violet-200 dark:bg-violet-500/20">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min(100, (status.streak / status.required) * 100)}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{t("rewards.progress", { streak: status.streak, required: status.required })}</p>
        </div>
      )}
      {message && <p className="mt-2 text-sm font-bold">{message}</p>}
    </div>
  );
}

export default function AchievementsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const progress = useSelector((state) => state.progress);
  const xp = progress.xp || 0;
  const { level, current, needed, percent } = levelProgress(xp);
  const title = levelTitle(level);
  const nextTitle = LEVEL_TITLES.find((item) => item.from > level);
  const today = dailyKey();
  const todayXp = progress.xpToday?.day === today ? progress.xpToday.amount : 0;
  const yesterday = dailyKey(new Date(Date.now() - 864e5));
  const streak = [today, yesterday].includes(progress.stats.lastStudyDate) ? progress.stats.streak : 0;
  const month = today.slice(0, 7);
  const freezesUsed = progress.streakFreezes?.month === month ? progress.streakFreezes.used : 0;
  const premium = isPremium(user);
  const earned = progress.badges || {};
  const earnedCount = BADGES.filter((badge) => earned[badge.id]).length;

  useEffect(() => {
    if (window.location.hash === "#journey") document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="px-1 text-2xl font-black md:text-3xl">🏅 {t("xp.pageTitle")}</h1>

      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.75rem] bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-xl">
            <span className="text-xs font-black uppercase tracking-wide opacity-90">{t("xp.levelWord")}</span>
            <span className="-mt-3 text-4xl font-black">{level}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black">
              {title.icon} <span lang="ko">{title.ko}</span> · {t(`xp.title.${title.id}`)}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("xp.total", { xp: xp.toLocaleString() })} · {t("xp.today", { xp: todayXp })}</p>
            {needed > 0 ? (
              <>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {t("xp.toNext", { xp: (needed - current).toLocaleString(), level: level + 1 })}
                  {nextTitle && ` · ${nextTitle.icon} ${t(`xp.title.${nextTitle.id}`)} — ${t("xp.level", { level: nextTitle.from })}`}
                </p>
              </>
            ) : (
              <p className="mt-3 font-black text-amber-600">👑 {t("xp.maxLevel")}</p>
            )}
          </div>
        </div>
        <details className="relative mt-4 text-sm">
          <summary className="cursor-pointer font-bold text-sky-600 dark:text-sky-300">{t("xp.howToEarn")}</summary>
          <ul className="mt-2 grid gap-1 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            {["correct", "dictation", "goal", "session", "grammar", "story", "topik", "speaking"].map((key) => (
              <li key={key}>• {t(`xp.rule.${key}`)}</li>
            ))}
          </ul>
        </details>
      </GlassCard>

      <GlassCard className="!p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-black">🔥 {streak}</p>
            <p className="text-xs font-bold text-slate-500">{t("xp.streakDays")}</p>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-black">🧊 {t("xp.freezes")}</p>
            <p className="text-slate-600 dark:text-slate-300">
              {premium ? t("xp.freezesLeft", { left: FREEZES_PER_MONTH - freezesUsed, total: FREEZES_PER_MONTH }) : t("xp.freezesPremium", { count: FREEZES_PER_MONTH })}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <StreakReward />
        </div>
      </GlassCard>

      <GlassCard className="!p-5">
        <h2 className="text-xl font-black">🏆 {t("xp.badges")} <span className="text-base text-slate-500">{earnedCount}/{BADGES.length}</span></h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {BADGES.map((badge) => {
            const at = earned[badge.id];
            return (
              <li
                key={badge.id}
                className={`rounded-2xl border p-3 text-center ${at ? "border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-500/10" : "border-slate-200 bg-slate-50 opacity-70 dark:border-white/10 dark:bg-white/5"}`}
              >
                <p className={`text-3xl ${at ? "" : "grayscale"}`} aria-hidden="true">{at ? badge.icon : "🔒"}</p>
                <p className="mt-1 text-sm font-black leading-tight">{t(`badge.${badge.id}`)}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{at ? formatDate(at, i18n.language) : t(`badgeHint.${badge.id}`)}</p>
              </li>
            );
          })}
        </ul>
      </GlassCard>

      <GlassCard className="!p-5" >
        <div id="journey" className="scroll-mt-24">
          <SeoulMap />
        </div>
      </GlassCard>
    </div>
  );
}
