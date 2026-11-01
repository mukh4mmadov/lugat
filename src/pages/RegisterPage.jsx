import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m as motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import LanguageSelector from "../components/LanguageSelector";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput";
import { authErrorMessage } from "../lib/authErrors";
import { rememberReturn, takeReturn } from "../lib/returnTo";

const confirmRedirect = () => `${window.location.origin}/auth/callback?type=signup`;

// Shown after sign-up when the account still has to be confirmed by email.
function EmailSentScreen({ email }) {
  const { t } = useTranslation();
  const [cooldown, setCooldown] = useState(60);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    setStatus("");
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmRedirect() } });
    setStatus(error ? authErrorMessage(error, t, "register.genericError") : t("register.emailResent"));
    setCooldown(60);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-[#07111f]">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <p className="text-5xl" aria-hidden="true">📬</p>
        <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{t("register.checkEmailTitle")}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t("register.checkEmailText", { email })}</p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t("register.checkSpam")}</p>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="mt-6 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-black disabled:opacity-50 dark:border-white/15 dark:text-white"
        >
          {cooldown > 0 ? t("register.resendIn", { seconds: cooldown }) : t("register.resend")}
        </button>
        {status && <p role="status" className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">{status}</p>}
        <Link to="/login" className="mt-4 block text-sm font-black text-sky-600 dark:text-sky-300">{t("register.goToLogin")}</Link>
      </GlassCard>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [form, setForm] = useState({ firstName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  // Come back to the page the learner was on once the account is ready.
  useEffect(() => {
    rememberReturn(location.state?.from?.pathname);
  }, [location.state]);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError("");
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = t("register.firstNameRequired");
    if (!form.email.trim()) next.email = t("register.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("register.validEmail");
    if (!form.password || form.password.length < 8) next.password = t("register.passwordMinLength");
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const fieldIds = { firstName: "register-first-name", email: "register-email", password: "register-password" };
      document.getElementById(fieldIds[Object.keys(validationErrors)[0]])?.focus();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { first_name: form.firstName.trim() }, emailRedirectTo: confirmRedirect() },
      });
      if (error) {
        setGeneralError(authErrorMessage(error, t, "register.genericError"));
      } else if (data?.session) {
        window.location.href = takeReturn();
      } else if (data?.user) {
        // Email confirmation is on: the account exists but isn't signed in yet.
        setSentTo(form.email.trim());
        setForm({ firstName: "", email: "", password: "" });
      }
    } catch {
      setGeneralError(t("register.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setGeneralError(authErrorMessage(error, t, "register.genericError"));
        setLoading(false);
      }
    } catch {
      setGeneralError(t("register.genericError"));
      setLoading(false);
    }
  };

  if (sentTo) return <EmailSentScreen email={sentTo} />;

  const inputClassName =
    "premium-input w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-bold text-slate-900 shadow-sm outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500";
  const labelClassName = "mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400";
  const errorText = (field, id) =>
    errors[field] && (
      <p id={id} className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
        {errors[field]}
      </p>
    );

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

      <div className="mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassCard className="relative overflow-hidden p-6 md:p-8">
            <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-sky-300/25 blur-3xl md:block" />
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t("register.title")}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("register.quickSubtitle")}</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="action-btn w-full border border-slate-200 bg-white text-slate-900 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {t("register.googleSignUp")}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("register.or")}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="register-first-name" className={labelClassName}>{t("register.firstName")}</label>
                <input
                  id="register-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={update("firstName")}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "register-first-name-error" : undefined}
                  className={inputClassName}
                  placeholder={t("register.firstName")}
                />
                {errorText("firstName", "register-first-name-error")}
              </div>
              <div>
                <label htmlFor="register-email" className={labelClassName}>{t("register.email")}</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                  className={inputClassName}
                  placeholder="email@example.com"
                />
                {errorText("email", "register-email-error")}
              </div>
              <div>
                <label htmlFor="register-password" className={labelClassName}>{t("register.password")}</label>
                <PasswordInput
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "register-password-error" : "register-password-hint"}
                  className={inputClassName}
                  placeholder={t("auth.passwordPlaceholder")}
                />
                {errors.password ? errorText("password", "register-password-error") : <p id="register-password-hint" className="mt-1 text-xs text-slate-500">{t("register.passwordMinLength")}</p>}
              </div>

              {generalError && (
                <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {generalError}
                </div>
              )}

              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("register.agreement")}{" "}
                <Link to="/terms" className="font-bold text-slate-700 underline dark:text-slate-300">{t("register.terms")}</Link>{" "}
                {t("register.and")}{" "}
                <Link to="/privacy" className="font-bold text-slate-700 underline dark:text-slate-300">{t("register.privacy")}</Link>
                {t("register.agreementEnd", { defaultValue: "" })} {t("register.recordingNotice")}
              </p>

              <button type="submit" disabled={loading} className="action-btn w-full bg-slate-950 text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
                {loading ? t("common.loading") : t("register.signUp")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {t("register.hasAccount")}{" "}
              <Link to="/login" state={location.state} className="font-black text-sky-600 underline dark:text-sky-300">{t("register.login")}</Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
