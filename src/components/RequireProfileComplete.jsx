import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function RequireProfileComplete({ children }) {
  const { t } = useTranslation();
  const { user, profileComplete, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return undefined;
    }
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07111f] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20">
          {!timedOut && (
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
          )}
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {timedOut ? t("auth.profileSlowTitle") : t("auth.profileLoading")}
          </h2>
          <p
            role={timedOut ? "alert" : "status"}
            className="mt-2 text-sm text-slate-600 dark:text-slate-300"
          >
            {timedOut
              ? t("auth.profileSlowText")
              : t("auth.profileLoadingText")}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            {t("auth.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (user && !profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
