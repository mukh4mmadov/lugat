import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallAppButton() {
  const { t } = useTranslation();
  const { canInstall, isIOS, triggerInstall } = useInstallPrompt();
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (justInstalled) {
      const timer = setTimeout(() => setJustInstalled(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justInstalled]);

  if (canInstall || isIOS || justInstalled) {
    return (
      <>
        <button
          type="button"
          onClick={async () => {
            if (isIOS) {
              setShowIOSInstructions(true);
              return;
            }
            const outcome = await triggerInstall();
            if (outcome === "accepted") setJustInstalled(true);
          }}
          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white lg:px-4 lg:py-2 lg:text-sm"
        >
          {justInstalled ? t("nav.installed") : t("nav.installApp")}
        </button>

        <AnimatePresence>
          {showIOSInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowIOSInstructions(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("nav.installApp")}</h3>
                  <button
                    type="button"
                    onClick={() => setShowIOSInstructions(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-500/15">
                    <svg className="h-8 w-8 text-sky-600 dark:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t("pwa.iosInstructions")}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
}
