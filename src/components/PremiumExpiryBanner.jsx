import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { premiumUntil } from "../lib/premium";

const DAY = 86400000;
const DISMISSED_KEY = "k-talim:premium-expiry-dismissed";

// Three days before Premium ends: a reminder to extend it (payment is a
// one-time transfer, so nothing renews by itself).
export default function PremiumExpiryBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const until = premiumUntil(user);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === new Date().toDateString();
    } catch {
      return false;
    }
  });
  if (!until || dismissed) return null;
  const daysLeft = Math.ceil((new Date(until).getTime() - Date.now()) / DAY);
  if (daysLeft > 3) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, new Date().toDateString());
    } catch {
      // Hide for this visit only.
    }
    setDismissed(true);
  };

  return (
    <div role="status" className="relative z-40 flex items-center justify-center gap-3 bg-violet-600 px-4 py-2 text-sm font-bold text-white">
      <span className="min-w-0 text-center">⭐ {t("premiumExpiry.text", { count: Math.max(daysLeft, 0) })}</span>
      <Link to="/premium" className="shrink-0 rounded-lg bg-white/20 px-3 py-1 text-xs font-black hover:bg-white/30">{t("premiumExpiry.extend")}</Link>
      <button type="button" onClick={dismiss} aria-label={t("common.close")} className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/20">✕</button>
    </div>
  );
}
