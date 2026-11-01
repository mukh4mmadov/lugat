import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceId } from "../lib/deviceId";
import { disablePush, enablePush, inviteLink, pushState } from "../lib/growth";
import { formatDate } from "../lib/dates";
import { supabase } from "../lib/supabase";

async function rewardsRequest(method, body) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch("/api/rewards", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || String(response.status));
  return payload;
}

// The learner's invite link, friends who joined and the Premium days earned.
export function InvitePanel() {
  const { t, i18n } = useTranslation();
  const [referral, setReferral] = useState(null);
  const [invite, setInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("my_referral", { p_device: getDeviceId() });
    setReferral(data);
    rewardsRequest("GET").then((result) => setInvite(result.invite)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!referral) return <div className="h-48 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />;
  const link = inviteLink(referral.code);
  const shareText = t("invite.shareText");

  async function share() {
    if (navigator.share) {
      navigator.share({ title: "K-TALIM", text: shareText, url: link }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(`${shareText} ${link}`);
    setCopied(true);
  }

  async function claim() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await rewardsRequest("POST", { kind: "invite" });
      setInvite(result.invite);
      setMessage({ ok: true, text: t("invite.claimed", { date: formatDate(result.premiumUntil, i18n.language) }) });
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const qualified = invite?.qualified ?? referral.qualified;
  const next = invite?.tiers.find((tier) => !tier.reached);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-4 text-center dark:border-orange-400/30 dark:bg-orange-500/10">
        <p className="text-xs font-black uppercase text-orange-700 dark:text-orange-200">{t("invite.yourCode")}</p>
        <p className="mt-1 font-mono text-3xl font-black tracking-[0.3em]">{referral.code}</p>
        <p className="mt-1 break-all text-xs text-slate-500">{link}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard?.writeText(link);
              setCopied(true);
            }}
            className="rounded-xl border border-orange-300 px-3 py-2.5 text-sm font-black"
          >
            {copied ? `✓ ${t("invite.copied")}` : `📋 ${t("invite.copy")}`}
          </button>
          <button type="button" onClick={share} className="rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-black text-white">📤 {t("invite.share")}</button>
        </div>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="mt-2 block rounded-xl bg-sky-500 px-3 py-2.5 text-sm font-black text-white">✈️ Telegram</a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-white/80 p-3 dark:bg-white/5">
          <p className="text-2xl font-black">{referral.invited}</p>
          <p className="text-xs font-bold text-slate-500">{t("invite.joined")}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 dark:bg-white/5">
          <p className="text-2xl font-black text-emerald-600">{qualified}</p>
          <p className="text-xs font-bold text-slate-500">{t("invite.counted")}</p>
        </div>
      </div>

      {invite && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {invite.tiers.map((tier) => (
            <li key={tier.friends} className={`rounded-2xl border p-3 text-center ${tier.claimed ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10" : tier.reached ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10" : "border-slate-200 dark:border-white/10"}`}>
              <p className="text-2xl font-black">{tier.friends}</p>
              <p className="text-xs font-bold text-slate-500">{t("speaking.friends", { count: tier.friends })}</p>
              <p className="mt-1 text-sm font-black text-orange-700 dark:text-orange-200">⭐ {t("speaking.premiumDays", { count: tier.days })}</p>
              {tier.claimed && <p className="mt-1 text-xs font-black text-emerald-600">✓ {t("invite.received")}</p>}
            </li>
          ))}
        </ul>
      )}
      {invite?.available > 0 && (
        <button type="button" disabled={busy} onClick={claim} className="w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white disabled:opacity-50">
          🎁 {t("invite.claim", { count: invite.available })}
        </button>
      )}
      {next && <p className="text-center text-sm font-bold text-slate-600 dark:text-slate-300">{t("invite.next", { count: next.friends - qualified, days: next.days })}</p>}
      {message && <p role={message.ok ? "status" : "alert"} className={`text-center text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
      <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-600 dark:bg-white/10 dark:text-slate-300">{t("invite.rules")}</p>
    </div>
  );
}

// Turns push reminders on or off for this browser.
export function PushToggle() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    pushState().then(setState).catch(() => setState({ supported: false }));
  }, []);

  if (!state) return null;
  if (!state.supported || !state.configured) {
    return <p className="text-xs text-slate-500">{t(state.supported ? "push.notReady" : "push.unsupported")}</p>;
  }

  async function toggle() {
    setBusy(true);
    try {
      if (state.on) await disablePush();
      else await enablePush(state.publicKey, i18n.language);
      setState(await pushState());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span>
        <span className="block text-sm font-bold">🔔 {t("push.title")}</span>
        <span className="block text-xs text-slate-500">{state.permission === "denied" ? t("push.blocked") : t("push.text")}</span>
      </span>
      <button type="button" role="switch" aria-checked={state.on} aria-label={t("push.title")} disabled={busy || state.permission === "denied"} onClick={toggle} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${state.on ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${state.on ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
