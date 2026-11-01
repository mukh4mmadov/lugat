import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { registerSW } from "virtual:pwa-register";

// A new version never reloads the page by itself in the middle of a lesson or
// a TOPIK exam: the learner taps "Update", or it applies while the tab is in
// the background.
export default function PWAUpdate() {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const updateRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return undefined;
    let updateInterval;
    updateRef.current = registerSW({
      onNeedRefresh() {
        setShowUpdate(true);
      },
      onRegistered(registration) {
        if (registration) updateInterval = setInterval(() => registration.update(), 30 * 60 * 1000);
      },
      onRegisterError(error) {
        console.error("PWA registration error:", error);
      },
    });
    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    if (!showUpdate) return undefined;
    const applyInBackground = () => {
      if (document.visibilityState === "hidden") updateRef.current?.(true);
    };
    document.addEventListener("visibilitychange", applyInBackground);
    return () => document.removeEventListener("visibilitychange", applyInBackground);
  }, [showUpdate]);

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
            <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{t("pwa.updateAvailable")}</p>
            <button
              type="button"
              disabled={refreshing}
              onClick={() => {
                setRefreshing(true);
                updateRef.current?.(true);
              }}
              className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {refreshing ? t("pwa.refreshing") : t("pwa.updateNow")}
            </button>
            <button type="button" onClick={() => setShowUpdate(false)} aria-label={t("common.close")} className="rounded-lg px-2 py-1 text-slate-400">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
