import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PREMIUM_PLANS, formatPrice, usePremiumPrices } from "../lib/premium";

// The cheapest monthly price, from the yearly plan.
const fromPerMonth = () => Math.min(...PREMIUM_PLANS.map((plan) => Math.round(plan.price / plan.months / 100) * 100));

// Shown wherever a free limit runs out: what ran out, what Premium gives,
// and the price, with one button to the Premium page.
export default function UpgradeCard({ feature, onNavigate, className = "" }) {
  const { t } = useTranslation();
  usePremiumPrices();
  return (
    <div className={`rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 text-left dark:border-violet-400/30 dark:from-violet-500/10 dark:to-fuchsia-500/10 ${className}`}>
      <p className="text-sm font-black text-violet-900 dark:text-violet-100">⭐ {t(`upgrade.${feature}.title`)}</p>
      <p className="mt-1 text-xs leading-5 text-violet-800/90 dark:text-violet-100/80">{t(`upgrade.${feature}.text`)}</p>
      <Link to="/premium" onClick={onNavigate} className="mt-3 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-violet-600/25">
        {t("upgrade.button", { price: formatPrice(fromPerMonth()) })}
      </Link>
    </div>
  );
}
