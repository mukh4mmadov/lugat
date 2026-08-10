import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ShareCardCanvas from "./ShareCardCanvas";

const backdropConfig = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

const modalConfig = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};

const TEMPLATES = [
  { id: "wordCount", icon: "📝", labelKey: "share.templateWordCount" },
  { id: "streak", icon: "🔥", labelKey: "share.templateStreak" },
  { id: "mastery", icon: "🏆", labelKey: "share.templateMastery" },
];

export default function ShareModal({ isOpen, onClose, selectedTemplate, onSelectTemplate, progress }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCanvas = () => {
    if (canvasRef.current) return canvasRef.current;
    const existing = document.querySelector("canvas");
    return existing;
  };

  const downloadCard = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    setIsGenerating(true);
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ktalim-${selectedTemplate || "card"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCard = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    setIsGenerating(true);
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const file = new File([blob], `ktalim-${selectedTemplate || "card"}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "K-TALIM Progress",
          text: "Check out my Korean learning progress on K-TALIM!",
          files: [file],
        });
      } else {
        await downloadCard();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && navigator.share && navigator.canShare;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropConfig}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={modalConfig}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t("share.title")}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("share.close")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mb-4 text-sm font-bold text-slate-600 dark:text-slate-300">{t("share.selectTemplate")}</p>

            <div className="mb-6 grid gap-3">
              {TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onSelectTemplate(template.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <span className={`text-sm font-black ${isSelected ? "text-sky-700 dark:text-sky-200" : "text-slate-700 dark:text-slate-200"}`}>
                        {t(template.labelKey)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ShareCardCanvas ref={canvasRef} template={selectedTemplate} progress={progress} />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={downloadCard}
                    disabled={isGenerating}
                    className="action-btn flex-1 bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  >
                    {t("share.download")}
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={shareCard}
                      disabled={isGenerating}
                      className="action-btn flex-1 bg-sky-500 text-white"
                    >
                      {t("share.share")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
