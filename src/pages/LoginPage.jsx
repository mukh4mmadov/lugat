import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import LanguageSelector from "../components/LanguageSelector";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError("");
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = t("login.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("login.validEmail");
    if (!form.password) next.password = t("login.passwordRequired");
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) {
        setGeneralError(error.message || t("login.genericError"));
      } else if (data?.user) {
        window.location.href = "/";
      }
    } catch {
      setGeneralError(t("login.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) {
        setGeneralError(error.message || t("login.genericError"));
        setLoading(false);
      }
    } catch {
      setGeneralError(t("login.genericError"));
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
                {t("login.title")}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("login.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className={inputClassName}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("login.password")}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  className={inputClassName}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div />
                <Link to="/forgot-password" className="text-xs font-bold text-sky-600 underline dark:text-sky-300">
                  {t("login.forgotPassword")}
                </Link>
              </div>

              {generalError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {generalError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="action-btn w-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 disabled:opacity-50"
              >
                {loading ? t("common.loading") : t("login.submit")}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("login.or")}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="action-btn mt-4 w-full bg-white text-slate-900 border border-slate-200 dark:bg-white/5 dark:text-white dark:border-white/10 disabled:opacity-50"
            >
              {t("login.googleSignIn")}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {t("login.noAccount")}{" "}
              <Link to="/register" className="font-black text-sky-600 underline dark:text-sky-300">{t("login.signUp")}</Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
