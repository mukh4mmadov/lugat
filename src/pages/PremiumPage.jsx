import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/dates";
import { PREMIUM_PLANS, TELEGRAM_USERNAME, formatPrice, premiumUntil, telegramOrderLink } from "../lib/premium";

// Free vs premium, honest about what is live and what is coming.
const FEATURES = [
  { key: "lessons", free: "full", premium: "full" },
  { key: "topik35", free: "full", premium: "full" },
  { key: "ai", free: "limited", premium: "full" },
  { key: "speaking", free: "limited", premium: "full" },
  { key: "topikMore", free: "none", premium: "soon" },
  { key: "aiReview", free: "limited", premium: "full" },
  { key: "stats", free: "limited", premium: "soon" },
];

function Cell({ value }) {
  const { t } = useTranslation();
  if (value === "full") return <span className="font-black text-emerald-600 dark:text-emerald-300">✓</span>;
  if (value === "none") return <span className="text-slate-300 dark:text-slate-600">—</span>;
  if (value === "soon") return <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{t("premium.soon")}</span>;
  return <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("premium.limited")}</span>;
}

export default function PremiumPage() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [plan, setPlan] = useState("quarter");
  const [copied, setCopied] = useState(false);
  const until = premiumUntil(user);
  const selected = PREMIUM_PLANS.find((item) => item.id === plan);

  useEffect(() => {
    // Pick up premium granted by the admin while the page was closed.
    if (user) refreshUser?.().catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const message = t("premium.orderMessage", {
    plan: t(`premium.plan.${selected.id}`),
    price: formatPrice(selected.price),
    email: user?.email || "",
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <GlassCard className="relative overflow-hidden text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">K-TALIM Premium</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight md:text-5xl">{t("premium.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{t("premium.subtitle")}</p>
        {until && (
          <p role="status" className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-black text-white">
            ⭐ {t("premium.activeUntil", { date: formatDate(until, i18n.language) })}
          </p>
        )}
      </GlassCard>

      <section aria-label={t("premium.plansLabel")} className="grid gap-4 md:grid-cols-3">
        {PREMIUM_PLANS.map((item) => {
          const monthly = Math.round(item.price / item.months / 100) * 100;
          const saving = Math.round((1 - monthly / PREMIUM_PLANS[0].price) * 100);
          const active = plan === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlan(item.id)}
              aria-pressed={active}
              className={`relative rounded-3xl border-2 p-6 text-left transition ${
                active
                  ? "border-violet-500 bg-white shadow-xl shadow-violet-500/10 dark:bg-white/10"
                  : "border-slate-200 bg-white/70 hover:border-violet-300 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {item.id === "quarter" && (
                <span className="absolute -top-3 left-6 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-black uppercase text-white">{t("premium.popular")}</span>
              )}
              <p className="text-sm font-black text-slate-500 dark:text-slate-400">{t(`premium.plan.${item.id}`)}</p>
              <p className="mt-2 text-3xl font-black tabular-nums">
                {formatPrice(item.price)} <span className="text-base font-bold text-slate-500">{t("premium.currency")}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {item.months > 1 ? t("premium.perMonth", { price: formatPrice(monthly) }) : t("premium.billedMonthly")}
              </p>
              {saving > 0 && <p className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">−{saving}%</p>}
            </button>
          );
        })}
      </section>

      <GlassCard className="space-y-4">
        <h2 className="text-xl font-black">{t("premium.howTitle")}</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-black text-white">{step}</span>
              <span className="text-sm leading-6 text-slate-700 dark:text-slate-200">{t(`premium.step${step}`, { username: TELEGRAM_USERNAME })}</span>
            </li>
          ))}
        </ol>
        {user ? (
          <div className="space-y-3">
            <a
              href={telegramOrderLink(message)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-6 py-4 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5"
            >
              ✈️ {t("premium.buyTelegram", { plan: t(`premium.plan.${selected.id}`), price: formatPrice(selected.price) })}
            </a>
            <div className="rounded-2xl border border-dashed border-slate-300 p-3 text-sm dark:border-white/15">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("premium.messageHint", { username: TELEGRAM_USERNAME })}</p>
              <p className="mt-1 whitespace-pre-line font-semibold">{message}</p>
              <button type="button" onClick={copy} className="mt-2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-black dark:border-white/15">
                {copied ? t("premium.copied") : t("premium.copy")}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("premium.signInFirst")}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Link to="/register" className="rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white">{t("nav.register", { defaultValue: "Register" })}</Link>
              <Link to="/login" state={{ from: { pathname: "/premium" } }} className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-black dark:border-white/15">{t("nav.login")}</Link>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-black">{t("premium.compareTitle")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-black">{t("premium.feature")}</th>
                <th className="w-24 px-2 py-3 text-center font-black">{t("premium.free")}</th>
                <th className="w-24 px-2 py-3 text-center font-black text-violet-600 dark:text-violet-300">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {FEATURES.map((feature) => (
                <tr key={feature.key}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{t(`premium.f.${feature.key}`)}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t(`premium.f.${feature.key}Hint`)}</p>
                  </td>
                  <td className="px-2 py-3 text-center"><Cell value={feature.free} /></td>
                  <td className="px-2 py-3 text-center"><Cell value={feature.premium} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
