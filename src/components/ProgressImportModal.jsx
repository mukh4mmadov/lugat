import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const backdropConfig = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

const modalConfig = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};

export default function ProgressImportModal() {
  const { t } = useTranslation();
  const { pendingProgressImport, resolveProgressImport } = useAuth();

  if (!pendingProgressImport) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={backdropConfig}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={modalConfig}
          className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t("progressImport.title")}</h3>
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{t("progressImport.description")}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("progressImport.keepLocal")}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => resolveProgressImport(true)}
              className="action-btn flex-1 bg-slate-950 text-white dark:bg-white dark:text-slate-950"
            >
              {t("progressImport.save")}
            </button>
            <button
              type="button"
              onClick={() => resolveProgressImport(false)}
              className="action-btn flex-1 bg-white text-slate-900 border border-slate-200 dark:bg-white/5 dark:text-white dark:border-white/10"
            >
              {t("progressImport.dontSync")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
