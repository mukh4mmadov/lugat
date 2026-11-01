import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { drawResultCard, SITE_URL } from "../lib/resultCard";

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

// "Share result": the phone's share sheet with the image when available,
// otherwise download the image or share a text link to Telegram.
export default function ShareResult({ card, text, fileName = "k-talim-result" }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const message = `${text}\n${SITE_URL}`;

  async function share() {
    const canvas = drawResultCard({ ...card, footer: t("shareResult.footer") });
    const blob = await toBlob(canvas);
    const file = blob && new File([blob], `${fileName}.png`, { type: "image/png" });
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: message });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    setPreview(canvas.toDataURL("image/png"));
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={share} className="action-btn inline-flex items-center gap-2 bg-sky-500 text-white">
        <span aria-hidden="true">📤</span> {t("shareResult.button")}
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("shareResult.button")}
            className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4"
            onClick={() => setOpen(false)}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-4 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white" onClick={(event) => event.stopPropagation()}>
              {preview && <img src={preview} alt="" className="w-full rounded-2xl" />}
              <div className="mt-4 grid gap-2">
                <a
                  href={preview}
                  download={`${fileName}.png`}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white dark:bg-white dark:text-slate-950"
                >
                  ⬇ {t("shareResult.download")}
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(text)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-sky-500 px-4 py-3 text-center text-sm font-black text-white"
                >
                  ✈ {t("shareResult.telegram")}
                </a>
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-500">
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
