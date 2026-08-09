import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const backdropConfig = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1],
};

const modalConfig = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
};

export default function IELTSRecommendationModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowPreview(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const openWebsite = () => {
    window.open('https://mukh4mmadovoriginal.vercel.app/', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop - uses Grid for more reliable centering */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropConfig}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
            }}
          >
            {/* Page scale animation - removed to prevent flicker */}
            {/* No page scale - prevents flickering */}

            {/* Modal Card - Grid centered, no transforms */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ ...modalConfig, delay: 0.08 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
              style={{
                boxShadow: '0 24px 96px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.08)'
              }}
            >
              {/* Header - English only, no flag */}
              <div className="relative p-5 pb-3">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  {t('ielts.title')}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.16, duration: 0.4 }}
                  className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  {t('ielts.description')}
                </motion.p>
              </div>

              {/* Preview Card - Premium browser window */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mx-5 mb-4 overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-lg dark:border-white/8 dark:from-slate-800/50 dark:to-slate-900/50"
              >
                {/* Browser window header */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200/50 dark:border-white/10">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>

                {/* Preview content */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
                  
                  <AnimatePresence mode="wait">
                    {!showPreview ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="space-y-3">
                          <div className="h-4 w-32 rounded bg-slate-300 dark:bg-slate-700 animate-pulse" />
                          <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                          <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-4"
                      >
                        <div className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                          {t('ielts.preview.title')}
                        </div>
                        
                        <div className="w-full max-w-[220px] space-y-1.5 text-center text-xs">
                          <div className="rounded-lg bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">
                            <div className="font-medium text-slate-700 dark:text-slate-300">{t('ielts.preview.aiExplanations')}</div>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">
                            <div className="font-medium text-slate-700 dark:text-slate-300">{t('ielts.preview.vocabulary')}</div>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">
                            <div className="font-medium text-slate-700 dark:text-slate-300">{t('ielts.preview.bandScore')}</div>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">
                            <div className="font-medium text-slate-700 dark:text-slate-300">{t('ielts.preview.realPassages')}</div>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {t('ielts.preview.url')}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 p-5 pt-0 sm:flex-row">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.24, duration: 0.3 }}
                  onClick={openWebsite}
                  className="flex-1 rounded-2xl bg-slate-900 px-5 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t('ielts.openButton')}
                    <motion.span
                      className="transition-transform"
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.3 }}
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-2.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                >
                  {t('ielts.continueButton')}
                </motion.button>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                className="pb-4 pt-1 text-center"
              >
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t('ielts.footer')}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
