import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import LanguageSelector from "../components/LanguageSelector";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message || t("forgotPassword.genericError"));
      } else {
        setSuccess(t("forgotPassword.successMessage"));
        setEmail("");
      }
    } catch {
      setError(t("forgotPassword.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "premium-input w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-bold text-slate-900 shadow-sm outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-base font-black text-white shadow-lg shadow-sky-500/25">
              K
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">K-TALIM</span>
          </Link>
          <LanguageSelector />
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-6 md:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {t("forgotPassword.title")}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("forgotPassword.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="action-btn w-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 disabled:opacity-50"
              >
                {loading ? t("common.loading") : t("forgotPassword.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              <Link to="/login" className="font-black text-sky-600 underline dark:text-sky-300">
                {t("forgotPassword.backToLogin")}
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
