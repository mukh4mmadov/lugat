import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { NO_VOICE_EVENT } from "../lib/speech";

const SEEN_KEY = "k-talim:voice-notice-seen";

function platform() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X/i.test(ua)) return "mac";
  return "other";
}

// How to install a Korean voice on this device.
export function VoiceHelp({ status }) {
  const { t } = useTranslation();
  return (
    <div className="text-sm leading-6">
      <p className="font-bold">{status === "unsupported" ? t("voice.unsupported") : t("voice.missing")}</p>
      {status !== "unsupported" && <p className="mt-1">{t(`voice.steps.${platform()}`)}</p>}
    </div>
  );
}

// Shown once per session the first time a word can't be pronounced.
export default function VoiceNotice() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const onMissing = (event) => {
      try {
        if (window.sessionStorage.getItem(SEEN_KEY)) return;
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Without storage the notice may show again; that's fine.
      }
      setStatus(event.detail || "missing");
    };
    window.addEventListener(NO_VOICE_EVENT, onMissing);
    return () => window.removeEventListener(NO_VOICE_EVENT, onMissing);
  }, []);

  if (!status) return null;
  return createPortal(
    <div role="alert" className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-md rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-2xl dark:border-amber-400/30 dark:bg-slate-900 dark:text-amber-100 md:bottom-6">
      <div className="flex gap-3">
        <span className="text-2xl" aria-hidden="true">🔇</span>
        <div className="min-w-0 flex-1">
          <VoiceHelp status={status} />
        </div>
        <button type="button" onClick={() => setStatus(null)} aria-label={t("common.close")} className="h-8 w-8 shrink-0 rounded-lg text-lg font-bold hover:bg-amber-100 dark:hover:bg-white/10">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
