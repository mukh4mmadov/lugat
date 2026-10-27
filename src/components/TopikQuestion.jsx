import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Renders paper regions (passages, notices, pictures) straight from the exam
// PDF, so what the learner sees is exactly the printed paper.
const RENDER_SCALE = 2.5;
const MAX_CACHED_PAGES = 6;
const documents = new Map();
const pageCanvases = new Map();

async function loadDocument(url) {
  if (!documents.has(url)) {
    const promise = (async () => {
      const [pdfjs, worker] = await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs.getDocument({ url }).promise;
    })();
    documents.set(url, promise);
    promise.catch(() => documents.delete(url));
  }
  return documents.get(url);
}

function renderPage(url, pageNumber) {
  const key = `${url}#${pageNumber}`;
  if (!pageCanvases.has(key)) {
    const promise = loadDocument(url).then(async (pdf) => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      return canvas;
    });
    pageCanvases.set(key, promise);
    promise.catch(() => pageCanvases.delete(key));
    // Keep only the most recent pages in memory.
    while (pageCanvases.size > MAX_CACHED_PAGES) pageCanvases.delete(pageCanvases.keys().next().value);
  }
  return pageCanvases.get(key);
}

// eslint-disable-next-line react-refresh/only-export-components
export function preloadPaperPages(url, pages) {
  pages.forEach((page) => renderPage(url, page).catch(() => {}));
}

// Bounds of the printed (non-white) pixels, so a region shows its frame, text
// or picture edge to edge without the page margins around it.
function inkBounds(context, width, height) {
  const { data } = context.getImageData(0, 0, width, height);
  let top = height, bottom = -1, left = width, right = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index] < 225 || data[index + 1] < 225 || data[index + 2] < 225) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (bottom < 0) return { x: 0, y: 0, w: width, h: height };
  const pad = Math.round(6 * RENDER_SCALE);
  const x = Math.max(0, left - pad);
  const y = Math.max(0, top - pad);
  return { x, y, w: Math.min(width, right + pad) - x, h: Math.min(height, bottom + pad) - y };
}

export function PaperCrop({ url, box, label, className = "", zoomable = false }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState({ w: (box.x1 - box.x0) * RENDER_SCALE, h: (box.y1 - box.y0) * RENDER_SCALE });
  const [zoomSrc, setZoomSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    renderPage(url, box.page)
      .then((source) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        const width = Math.round((box.x1 - box.x0) * RENDER_SCALE);
        const height = Math.round((box.y1 - box.y0) * RENDER_SCALE);
        const scratch = document.createElement("canvas");
        scratch.width = width;
        scratch.height = height;
        const scratchContext = scratch.getContext("2d", { willReadFrequently: true });
        scratchContext.fillStyle = "#fff";
        scratchContext.fillRect(0, 0, width, height);
        scratchContext.drawImage(source, box.x0 * RENDER_SCALE, box.y0 * RENDER_SCALE, width, height, 0, 0, width, height);
        const trim = inkBounds(scratchContext, width, height);
        canvas.width = trim.w;
        canvas.height = trim.h;
        canvas.getContext("2d").drawImage(scratch, trim.x, trim.y, trim.w, trim.h, 0, 0, trim.w, trim.h);
        setSize({ w: trim.w, h: trim.h });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [url, box.page, box.x0, box.x1, box.y0, box.y1, attempt]);

  // About 1.7 screen pixels per paper point keeps the paper's text readable.
  const maxWidth = Math.round((size.w / RENDER_SCALE) * 1.7);
  const openZoom = () => zoomable && status === "ready" && setZoomSrc(canvasRef.current.toDataURL("image/png"));

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg bg-white ${zoomable ? "cursor-zoom-in" : ""} ${className}`}
        style={{ aspectRatio: `${size.w} / ${size.h}`, maxWidth: `${maxWidth}px` }}
        onClick={openZoom}
        title={zoomable ? t("topik.tapToZoom") : undefined}
      >
        <canvas ref={canvasRef} role="img" aria-label={label} className={`h-full w-full ${status === "ready" ? "" : "invisible"}`} />
        {status === "loading" && <div className="absolute inset-0 animate-pulse bg-slate-100" />}
        {status === "error" && (
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="absolute inset-0 grid place-items-center bg-slate-50 text-sm font-bold text-rose-600">
            {t("topik.paperError")} · {t("topik.retry")}
          </button>
        )}
      </div>
      {/* A hint below the crop: a badge on top of it would cover the paper's text. */}
      {zoomable && status === "ready" && (
        <button type="button" onClick={openZoom} className="mx-auto mt-1 block text-[11px] font-bold text-slate-400 md:hidden">
          🔍 {t("topik.tapToZoom")}
        </button>
      )}
      {zoomSrc && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-slate-950/90" onClick={() => setZoomSrc(null)}>
          <button type="button" onClick={() => setZoomSrc(null)} className="m-3 self-end rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-900">✕</button>
          <div className="min-h-0 flex-1 overflow-auto p-3" onClick={(event) => event.stopPropagation()}>
            <img src={zoomSrc} alt={label} className="mx-auto max-w-none rounded-lg bg-white" style={{ width: `${Math.round(size.w / RENDER_SCALE * 2.2)}px` }} />
          </div>
        </div>
      )}
    </>
  );
}

const MARKS = { 1: "①", 2: "②", 3: "③", 4: "④" };
const FILLED = { 1: "❶", 2: "❷", 3: "❸", 4: "❹" };

// One exam question as it appears on the computer-based test: the block
// instruction, any shared passage, the question with its printed material, and
// the four choices to click.
export default function TopikQuestion({ exam, question, selected, onSelect, review = null, showShared = true }) {
  const { t } = useTranslation();
  const content = exam.content?.[question.number];
  if (!content) return null;
  const [from, to] = content.group;
  const isPicture = content.options.some((option) => option.box);
  const short = !isPicture && content.options.every((option) => option.text.length <= 10);
  const layout = isPicture ? "grid-cols-2" : short ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1";

  const optionTone = (id) => {
    if (review) {
      if (id === question.answer) return "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-100";
      if (id === selected) return "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-100";
      return "border-slate-200 bg-white opacity-60 dark:border-white/10 dark:bg-white/5";
    }
    if (id === selected) return "border-[#17305a] bg-sky-50 text-[#17305a] ring-2 ring-[#17305a]/40 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-100";
    return "border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";
  };

  return (
    <article className="space-y-4">
      <div className="rounded-2xl border-l-4 border-[#17305a] bg-white px-4 py-3 shadow-sm dark:border-sky-400 dark:bg-slate-900">
        <p className="text-[15px] font-bold leading-7 md:text-base">
          <span className="mr-1 text-slate-500">※ [{from}~{to}]</span> {content.instruction}
        </p>
      </div>

      {showShared && content.shared && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 md:p-4">
          <PaperCrop url={exam.pdf} box={content.shared} label={content.instruction} className="mx-auto" zoomable />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 md:p-6">
        <p className="text-lg font-black leading-8 md:text-xl">
          <span className="mr-2 text-[#17305a] dark:text-sky-300">{question.number}.</span>
          {content.prompt}
          <span className="ml-2 text-sm font-bold text-slate-500 dark:text-slate-400">({question.points}점)</span>
        </p>
        {content.stem && <PaperCrop url={exam.pdf} box={content.stem} label={t("topik.questionNumber", { number: question.number })} className="mx-auto mt-4" zoomable />}

        <div className={`mt-5 grid gap-2.5 ${layout}`} role="radiogroup" aria-label={t("topik.chooseAnswer", { number: question.number })}>
          {content.options.map((option) => {
            const active = selected === option.id;
            const mark = (review ? option.id === question.answer || active : active) ? FILLED[option.id] : MARKS[option.id];
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={Boolean(review)}
                onClick={() => onSelect?.(option.id)}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition md:p-4 ${optionTone(option.id)} ${isPicture ? "flex-col items-stretch" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl font-black leading-none">{mark}</span>
                  {option.text && <span className="text-[17px] font-semibold leading-7 md:text-lg">{option.text}</span>}
                  {review && option.id === question.answer && <span className="ml-auto text-xs font-black text-emerald-600 dark:text-emerald-300">✓</span>}
                </span>
                {option.box && <PaperCrop url={exam.pdf} box={option.box} label={`${MARKS[option.id]}`} className="mx-auto w-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
