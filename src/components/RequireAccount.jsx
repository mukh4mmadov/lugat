import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { rememberReturn } from "../lib/returnTo";
import GlassCard from "./GlassCard";

export function AccountPrompt({ compact = false }) {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const remember = () => rememberReturn(`${pathname}${search}`);
  return (
    <GlassCard className={`text-center ${compact ? "p-5" : "mx-auto max-w-xl p-6 md:p-10"}`}>
      <p className="text-4xl">🔐</p>
      <h2 className="mt-2 text-xl font-black md:text-2xl">{t("account.requiredTitle")}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{t("account.requiredText")}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/register" onClick={remember} className="rounded-2xl bg-sky-500 px-6 py-3 font-black text-white shadow-lg shadow-sky-500/25">{t("account.signUp")}</Link>
        <Link to="/login" onClick={remember} className="rounded-2xl border border-slate-300 px-6 py-3 font-black dark:border-white/15">{t("account.logIn")}</Link>
      </div>
    </GlassCard>
  );
}

export default function RequireAccount({ children, compact = false }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  if (loading) return <GlassCard><p role="status">{t("common.loading")}</p></GlassCard>;
  if (!user) return <AccountPrompt compact={compact} />;
  return children;
}
