import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getSpeakingTopic } from "../../data/speakingTopics";
import { adminRequest } from "../../lib/adminApi";
import { formatDate, timeAgo } from "../../lib/dates";
import { BADGES } from "../../lib/gamification";
import { formatPrice, PREMIUM_PLANS } from "../../lib/premium";
import { Panel, StatTile } from "../../pages/AdminPage";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";
const button = "rounded-xl px-3 py-2 text-xs font-black disabled:opacity-50";

function ProfileForm({ detail, busy, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(detail.profile);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run("profile", { ...form, gender: form.gender || null, koreanLevel: form.koreanLevel || null }, t("admin.powers.saved"));
      }}
      className="grid gap-2 sm:grid-cols-2"
    >
      <input value={form.firstName} onChange={set("firstName")} placeholder={t("settings.firstName")} className={input} />
      <input value={form.lastName} onChange={set("lastName")} placeholder={t("settings.lastName")} className={input} />
      <input value={form.birthYear || ""} onChange={set("birthYear")} inputMode="numeric" placeholder={t("admin.user.birthYear")} className={input} />
      <select value={form.gender || ""} onChange={set("gender")} className={input}>
        <option value="">{t("admin.powers.genderUnset")}</option>
        <option value="male">{t("speaking.gender.male")}</option>
        <option value="female">{t("speaking.gender.female")}</option>
      </select>
      <select value={form.koreanLevel || ""} onChange={set("koreanLevel")} className={`${input} sm:col-span-2`}>
        <option value="">{t("admin.powers.levelUnset")}</option>
        {["beginner", "intermediate", "advanced"].map((level) => <option key={level} value={level}>{t(`speaking.level.${level}`)}</option>)}
      </select>
      <button type="submit" disabled={Boolean(busy)} className={`${button} bg-slate-950 text-white dark:bg-white dark:text-slate-950 sm:col-span-2`}>{t("common.save")}</button>
    </form>
  );
}

function PremiumSale({ busy, run }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState(PREMIUM_PLANS[0]);
  const [amount, setAmount] = useState(String(PREMIUM_PLANS[0].price));
  const [note, setNote] = useState("");
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <select
        value={plan.id}
        onChange={(event) => {
          const next = PREMIUM_PLANS.find((item) => item.id === event.target.value);
          setPlan(next);
          setAmount(String(next.price));
        }}
        className={input}
      >
        {PREMIUM_PLANS.map((item) => <option key={item.id} value={item.id}>{t("admin.user.days", { count: item.days })}</option>)}
      </select>
      <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={t("admin.powers.amount")} className={input} />
      <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} placeholder={t("admin.powers.note")} className={input} />
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() => run("premium", { days: plan.days, amount: Number(amount) || 0, note }, t("admin.user.premiumGiven", { count: plan.days }))}
        className={`${button} bg-violet-600 text-white sm:col-span-3`}
      >
        ⭐ {t("admin.powers.sell", { days: plan.days, amount: formatPrice(Number(amount) || 0) })}
      </button>
    </div>
  );
}

function ChatViewer({ sessions }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  async function show(id) {
    if (open === id) {
      setOpen(null);
      return;
    }
    setOpen(id);
    setLoading(true);
    try {
      setMessages((await adminRequest({ action: "messages", sessionId: id })).messages);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <ul className="space-y-2">
      {sessions.map((session) => (
        <li key={session.id} className="rounded-xl border border-slate-100 dark:border-white/5">
          <button type="button" onClick={() => show(session.id)} className="flex w-full items-center justify-between gap-2 p-2.5 text-left text-sm">
            <span className="truncate font-bold">💬 {session.title || t("admin.powers.untitled")}</span>
            <span className="shrink-0 text-xs text-slate-500">{timeAgo(session.updated_at, i18n.language)} {open === session.id ? "▴" : "▾"}</span>
          </button>
          {open === session.id && (
            <div className="max-h-80 space-y-2 overflow-y-auto border-t border-slate-100 p-2.5 text-sm dark:border-white/5">
              {loading && <p className="text-slate-500">{t("common.loading")}</p>}
              {messages.map((message, index) => (
                <p key={index} className={`whitespace-pre-wrap rounded-xl px-3 py-2 ${message.role === "user" ? "ml-6 bg-sky-50 dark:bg-sky-500/10" : "mr-6 bg-slate-100 dark:bg-white/5"}`}>
                  {message.content}
                </p>
              ))}
              {!loading && !messages.length && <p className="text-slate-500">—</p>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// Everything an admin can see and change for one learner, beyond the basics.
export default function UserPowers({ detail, busy, run }) {
  const { t, i18n } = useTranslation();
  const [xp, setXp] = useState("100");
  const [streak, setStreak] = useState(String(detail.progress.streak || 0));
  const [badge, setBadge] = useState(BADGES[0].id);
  const [confirmReset, setConfirmReset] = useState(false);
  const progress = detail.progress;
  const hasBadge = detail.badgeIds.includes(badge);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <StatTile tone="amber" label="XP" value={progress.xp.toLocaleString()} hint={t("xp.level", { level: progress.level })} />
        <StatTile tone="violet" label={t("xp.badges")} value={progress.badges} hint={`📐 ${progress.grammarDone} · 📖 ${progress.storiesRead}`} />
        <StatTile tone="sky" label={t("nav.speaking")} value={t("speaking.minutesShort", { count: progress.speakingMinutes })} hint={t("admin.powers.sessions", { count: detail.speakingSessions.length })} />
      </div>

      <Panel title={t("admin.powers.profile")}>
        <ProfileForm detail={detail} busy={busy} run={run} />
      </Panel>

      <Panel title={t("admin.powers.account")}>
        <div className="flex flex-wrap gap-2">
          {!detail.confirmed && (
            <button type="button" disabled={Boolean(busy)} onClick={() => run("confirmEmail", {}, t("admin.powers.confirmed"))} className={`${button} bg-emerald-600 text-white`}>✓ {t("admin.powers.confirmEmail")}</button>
          )}
          <button type="button" disabled={Boolean(busy)} onClick={() => run("resetPassword", {}, t("admin.powers.resetSent"))} className={`${button} border border-slate-300 dark:border-white/15`}>🔑 {t("admin.powers.resetPassword")}</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => run("resetSpeaking", {}, t("admin.powers.speakingReset"))} className={`${button} border border-slate-300 dark:border-white/15`}>🎙 {t("admin.powers.resetSpeaking")}</button>
          {detail.speakingBan ? (
            <button type="button" disabled={Boolean(busy)} onClick={() => run("speakingBan", { hours: 0 }, t("admin.live.unbanned"))} className={`${button} border border-rose-300 text-rose-600`}>⛔ {t("admin.live.bannedUntil", { date: formatDate(detail.speakingBan.until, i18n.language) })} · {t("admin.live.unban")}</button>
          ) : (
            <button type="button" disabled={Boolean(busy)} onClick={() => run("speakingBan", { hours: 24 * 7, reason: "admin" }, t("admin.live.bannedDone"))} className={`${button} border border-rose-300 text-rose-600`}>⛔ {t("admin.live.banWeek")}</button>
          )}
        </div>
        {detail.reportsAgainst?.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-rose-700 dark:text-rose-200">
            {detail.reportsAgainst.map((report) => (
              <li key={report.created_at}>⚠️ {t(`live.reason.${report.reason}`)} · {formatDate(report.created_at, i18n.language)}{report.note ? ` · “${report.note}”` : ""}</li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={t("admin.powers.sellPremium")}>
        <PremiumSale busy={busy} run={run} />
        {detail.premiumLog.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {detail.premiumLog.map((entry) => (
              <li key={entry.created_at}>
                {formatDate(entry.created_at, i18n.language)} · +{entry.days} · {formatPrice(entry.amount)} {t("premium.currency")}{entry.note ? ` · ${entry.note}` : ""}
              </li>
            ))}
          </ul>
        )}
        {detail.rewards.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">🎁 {detail.rewards.map((reward) => `${reward.kind} +${reward.days} (${formatDate(reward.claimed_at, i18n.language)})`).join(", ")}</p>
        )}
      </Panel>

      <Panel title={t("admin.powers.progressTools")}>
        <p className="mb-3 text-xs text-slate-500">{t("admin.powers.progressHint")}</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input value={xp} onChange={(event) => setXp(event.target.value.replace(/[^\d-]/g, ""))} inputMode="numeric" className={input} aria-label="XP" />
          <button type="button" disabled={Boolean(busy)} onClick={() => run("progress", { xpDelta: Number(xp) || 0 }, t("admin.powers.xpChanged"))} className={`${button} bg-amber-400 text-amber-950`}>⚡ {t("admin.powers.addXp")}</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => run("progress", { xpDelta: -(Number(xp) || 0) }, t("admin.powers.xpChanged"))} className={`${button} border border-amber-300`}>− XP</button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input value={streak} onChange={(event) => setStreak(event.target.value.replace(/\D/g, ""))} inputMode="numeric" className={input} aria-label={t("speaking.streak")} />
          <button type="button" disabled={Boolean(busy)} onClick={() => run("progress", { streak: Number(streak) || 0 }, t("admin.powers.streakSet"))} className={`${button} bg-orange-500 text-white`}>🔥 {t("admin.powers.setStreak")}</button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select value={badge} onChange={(event) => setBadge(event.target.value)} className={input}>
            {BADGES.map((item) => <option key={item.id} value={item.id}>{item.icon} {t(`badge.${item.id}`)}{detail.badgeIds.includes(item.id) ? " ✓" : ""}</option>)}
          </select>
          <button type="button" disabled={Boolean(busy)} onClick={() => run("progress", { badge, badgeValue: !hasBadge }, t("admin.powers.badgeChanged"))} className={`${button} ${hasBadge ? "border border-rose-300 text-rose-600" : "bg-violet-600 text-white"}`}>
            {hasBadge ? t("admin.powers.revokeBadge") : t("admin.powers.giveBadge")}
          </button>
        </div>
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-3 text-xs font-bold text-rose-600 underline">{t("admin.powers.resetProgress")}</button>
        ) : (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm dark:bg-rose-500/10">
            <p className="font-bold text-rose-700 dark:text-rose-200">{t("admin.powers.resetConfirm")}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" disabled={Boolean(busy)} onClick={() => { setConfirmReset(false); run("progress", { reset: true }, t("admin.powers.progressReset")); }} className={`${button} bg-rose-600 text-white`}>{t("admin.powers.resetYes")}</button>
              <button type="button" onClick={() => setConfirmReset(false)} className={`${button} border border-slate-300`}>{t("common.cancel")}</button>
            </div>
          </div>
        )}
      </Panel>

      {detail.aiSessions.length > 0 && (
        <Panel title={t("admin.powers.aiChats")}>
          <ChatViewer sessions={detail.aiSessions} />
        </Panel>
      )}

      {detail.speakingSessions.length > 0 && (
        <Panel title={t("admin.powers.speakingHistory")}>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
            {detail.speakingSessions.map((session) => {
              const topic = getSpeakingTopic(session.topic_id);
              return (
                <li key={session.id} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="truncate">{session.kind === "ai" ? "🤖" : "👥"} {topic ? `${topic.emoji} ${topic.ko}` : "—"}</span>
                  <span className="shrink-0 text-xs text-slate-500">{t("speaking.minutesShort", { count: Math.max(1, Math.round(session.seconds / 60)) })} · {session.turns} · {timeAgo(session.started_at, i18n.language)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}
