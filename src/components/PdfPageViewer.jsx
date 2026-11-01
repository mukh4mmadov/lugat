import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// pdf.js is loaded on demand so it never weighs down pages that don't show a paper.
const documentCache = new Map();

async function loadDocument(url) {
  if (!documentCache.has(url)) {
    const promise = (async () => {
      const [pdfjs, worker] = await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs.getDocument({ url }).promise;
    })();
    documentCache.set(url, promise);
    promise.catch(() => documentCache.delete(url));
  }
  return documentCache.get(url);
}

const ZOOM_STEPS = [1, 1.25, 1.5, 2];

export default function PdfPageViewer({ url, page, className = "", maxHeightClass = "max-h-[75vh]" }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(page || 1);
  const [pageCount, setPageCount] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return undefined;
    let cancelled = false;
    let renderTask = null;
    setStatus((value) => (value === "ready" ? "rendering" : "loading"));
    loadDocument(url)
      .then(async (pdf) => {
        if (cancelled) return;
        setPageCount(pdf.numPages);
        const target = Math.min(Math.max(1, currentPage), pdf.numPages);
        const pdfPage = await pdf.getPage(target);
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const scale = (width / base.width) * ZOOM_STEPS[zoomIndex];
        const viewport = pdfPage.getViewport({ scale });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        renderTask = pdfPage.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
          transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
        });
        await renderTask.promise;
        if (!cancelled) setStatus("ready");
      })
      .catch((error) => {
        if (!cancelled && error?.name !== "RenderingCancelledException") setStatus("error");
      });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [url, currentPage, width, zoomIndex, reloadKey]);

  const controlClass =
    "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-200 dark:hover:bg-white/10";

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900 ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-2 py-1.5 dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex items-center gap-1">
          <button type="button" className={controlClass} disabled={currentPage <= 1} onClick={() => setCurrentPage((value) => value - 1)} aria-label={t("topik.pdfPrevPage")}>‹</button>
          <span className="min-w-16 text-center text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
            {currentPage}{pageCount ? ` / ${pageCount}` : ""}
          </span>
          <button type="button" className={controlClass} disabled={pageCount > 0 && currentPage >= pageCount} onClick={() => setCurrentPage((value) => value + 1)} aria-label={t("topik.pdfNextPage")}>›</button>
          {page && currentPage !== page && (
            <button type="button" className="ml-1 rounded-lg bg-sky-100 px-2 py-1 text-xs font-black text-sky-700 dark:bg-sky-500/15 dark:text-sky-200" onClick={() => setCurrentPage(page)}>
              {t("topik.pdfBackToQuestion")}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={controlClass} disabled={zoomIndex === 0} onClick={() => setZoomIndex((value) => value - 1)} aria-label={t("topik.zoomOut")}>−</button>
          <span className="w-11 text-center text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">{Math.round(ZOOM_STEPS[zoomIndex] * 100)}%</span>
          <button type="button" className={controlClass} disabled={zoomIndex === ZOOM_STEPS.length - 1} onClick={() => setZoomIndex((value) => value + 1)} aria-label={t("topik.zoomIn")}>+</button>
          <a href={`${url}#page=${currentPage}`} target="_blank" rel="noreferrer" className={controlClass} aria-label={t("topik.openPaperPage", { number: currentPage })} title={t("topik.openPaperPage", { number: currentPage })}>↗</a>
        </div>
      </div>
      <div ref={containerRef} className={`relative overflow-auto bg-white ${maxHeightClass}`}>
        <canvas ref={canvasRef} className={`block ${status === "error" ? "hidden" : ""}`} aria-label={t("topik.paperPage", { number: currentPage })} role="img" />
        {(status === "loading" || status === "rendering") && (
          <div className={`flex items-center justify-center gap-3 p-10 text-sm font-bold text-slate-500 ${status === "rendering" ? "absolute inset-0 bg-white/60" : "min-h-[24rem]"}`}>
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
            {t("topik.loadingPaper")}
          </div>
        )}
        {status === "error" && (
          <div className="flex min-h-[20rem] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-bold text-rose-600">{t("topik.paperError")}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">{t("topik.retry")}</button>
            <a href={`${url}#page=${currentPage}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-sky-600 underline">{t("topik.openPaperPage", { number: currentPage })}</a>
          </div>
        )}
      </div>
    </div>
  );
}
