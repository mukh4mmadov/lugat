import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function PWAUpdate() {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let updateInterval;

    // Register service worker with auto-update callbacks
    const registerSW = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const { registerSW } = await import('virtual:pwa-register');
        
        registerSW({
          onNeedRefresh() {
            // Show update toast
            setShowUpdate(true);
            
            // Automatically refresh after 2 seconds
            setTimeout(() => {
              setRefreshing(true);
              window.location.reload();
            }, 2000);
          },
          onOfflineReady() {
            // App is ready to work offline
            console.log('PWA: Ready to work offline');
          },
          onRegistered(reg) {
            // Periodically check for updates every 30 minutes
            updateInterval = setInterval(() => {
              reg.update();
            }, 30 * 60 * 1000);
          },
          onRegisterError(error) {
            console.error('PWA registration error:', error);
          },
        });
      }
    };

    registerSW();

    // Cleanup interval on unmount
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
        >
          <div className="rounded-2xl border border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('pwa.updateAvailable')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {refreshing ? t('pwa.refreshing') : 'Updating automatically...'}
                </p>
              </div>
              {refreshing && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500" />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
