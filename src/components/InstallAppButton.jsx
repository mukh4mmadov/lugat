import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallAppButton() {
  const { t } = useTranslation();
  const { isIOS, triggerInstall } = useInstallPrompt();
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (justInstalled) {
      const timer = setTimeout(() => setJustInstalled(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justInstalled]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

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
          if (outcome === "accepted") {
            setJustInstalled(true);
          } else if (outcome === "unsupported") {
            setShowUnsupportedMessage(true);
          } else if (outcome === "dismissed") {
            showToastMessage(t("pwa.installDismissed"));
          }
        }}
        className="whitespace-nowrap rounded-full border border-slate-200 bg-white/70 px-2 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white sm:px-3 sm:text-xs lg:px-4 lg:py-2 lg:text-sm"
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
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t("nav.installApp")}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSInstructions(false)}
                  aria-label={t("common.close")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-500/15">
                  <svg
                    className="h-8 w-8 text-sky-600 dark:text-sky-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {t("pwa.iosInstructions")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showUnsupportedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowUnsupportedMessage(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t("nav.installApp")}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t("pwa.unsupportedInstructions")}
              </p>
              <button
                type="button"
                onClick={() => setShowUnsupportedMessage(false)}
                className="mt-5 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950"
              >
                {t("common.close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[70] rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-xl dark:bg-white dark:text-slate-950"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
