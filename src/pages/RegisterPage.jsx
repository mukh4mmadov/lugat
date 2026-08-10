import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import LanguageSelector from "../components/LanguageSelector";
import { supabase } from "../lib/supabase";

function getDaysInMonth(month, year) {
  if (!month || !year) return 31;
  const m = Number(month);
  const y = Number(year);
  if (m === 2) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return isLeap ? 29 : 28;
  }
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[m - 1] || 31;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = t("register.firstNameRequired");
    if (!form.lastName.trim()) next.lastName = t("register.lastNameRequired");
    const day = Number(form.birthDay);
    const month = Number(form.birthMonth);
    const year = Number(form.birthYear);
    if (!form.birthDay || !form.birthMonth || !form.birthYear) {
      next.birthDate = t("register.birthDateRequired");
    } else {
      const daysInMonth = getDaysInMonth(form.birthMonth, form.birthYear);
      if (day < 1 || day > daysInMonth) next.birthDate = t("register.birthDateInvalid");
      else if (month < 1 || month > 12) next.birthDate = t("register.birthDateInvalid");
      else if (year < 1940 || year > 2015) next.birthDate = t("register.birthYearRange");
    }
    if (!form.email.trim()) next.email = t("register.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("register.validEmail");
    if (!form.password || form.password.length < 8) next.password = t("register.passwordMinLength");
    if (form.password !== form.confirmPassword) next.confirmPassword = t("register.passwordMismatch");
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const birthDate = `${form.birthYear}-${form.birthMonth.padStart(2, "0")}-${form.birthDay.padStart(2, "0")}`;
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            birth_date: birthDate,
          },
        },
      });
      if (error) {
        setGeneralError(error.message || t("register.genericError"));
      } else if (data?.user) {
        setSuccessMessage(t("register.confirmEmailMessage"));
        setForm({ firstName: "", lastName: "", birthDay: "", birthMonth: "", birthYear: "", email: "", password: "", confirmPassword: "" });
      }
    } catch {
      setGeneralError(t("register.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) {
        setGeneralError(error.message || t("register.genericError"));
        setLoading(false);
      }
    } catch {
      setGeneralError(t("register.genericError"));
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
                {t("register.title")}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("register.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("register.firstName")}
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={update("firstName")}
                    className={inputClassName}
                    placeholder={t("register.firstName")}
                  />
                  {errors.firstName && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("register.lastName")}
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={update("lastName")}
                    className={inputClassName}
                    placeholder={t("register.lastName")}
                  />
                  {errors.lastName && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("register.dateOfBirth")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      value={form.birthDay}
                      onChange={update("birthDay")}
                      className={inputClassName}
                      placeholder={t("register.day")}
                      min="1"
                      max={getDaysInMonth(form.birthMonth, form.birthYear)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={form.birthMonth}
                      onChange={update("birthMonth")}
                      className={inputClassName}
                      placeholder={t("register.month")}
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={form.birthYear}
                      onChange={update("birthYear")}
                      className={inputClassName}
                      placeholder={t("register.year")}
                      min="1940"
                      max="2015"
                    />
                  </div>
                </div>
                {errors.birthDate && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("register.email")}
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
                  {t("register.password")}
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

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("register.confirmPassword")}
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  className={inputClassName}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.confirmPassword}</p>}
              </div>

              {generalError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {generalError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="action-btn w-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 disabled:opacity-50"
              >
                {loading ? t("common.loading") : t("register.signUp")}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("register.or")}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="action-btn mt-4 w-full bg-white text-slate-900 border border-slate-200 dark:bg-white/5 dark:text-white dark:border-white/10 disabled:opacity-50"
            >
              {t("register.googleSignUp")}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {t("register.hasAccount")}{" "}
              <Link to="/login" className="font-black text-sky-600 underline dark:text-sky-300">{t("register.login")}</Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
