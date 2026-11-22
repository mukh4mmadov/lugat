// One pdf.js document per paper URL, shared by the question crops and the
// full-page viewer. pdf.js is loaded on demand so it never weighs down pages
// that don't show a paper.
//
// Papers are large scans (13–22 MB). pdf.js can fetch only the parts a page
// needs, but Supabase Storage does not expose the Accept-Ranges header to the
// browser, so pdf.js would download the whole file before showing a page near
// its end. The pages are therefore fetched here with Range requests (the size
// comes from a HEAD request). A copy already in the service worker's cache
// answers with the whole file, which is used as is. Once a paper is open, the
// whole file is fetched once in the background so the service worker can keep
// it for offline use, unless the device asks to save data.
const documents = new Map();
const CHUNK = 256 * 1024;

async function pdfjsModule() {
  const [pdfjs, worker] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

async function openWithRanges(pdfjs, url) {
  const head = await fetch(url, { method: "HEAD" });
  const length = Number(head.headers.get("content-length"));
  if (!head.ok || !Number.isFinite(length) || length <= 0) throw new Error("no length");
  const transport = new pdfjs.PDFDataRangeTransport(length, null);
  let whole = null;
  let task = null;
  const fetchRange = async (begin, end, tries = 3) => {
    try {
      const response = await fetch(url, { headers: { Range: `bytes=${begin}-${end - 1}` } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = new Uint8Array(await response.arrayBuffer());
      if (response.status === 200 && data.length === length) {
        // The whole file (from the service worker's cache, or a server that
        // ignored the range): keep it and hand over the part asked for.
        whole = data;
        transport.onDataRange(begin, data.slice(begin, end));
      } else {
        transport.onDataRange(begin, data);
      }
    } catch (error) {
      if (tries > 1) {
        window.setTimeout(() => fetchRange(begin, end, tries - 1), 1500);
        return;
      }
      // pdf.js has no way to hear that a part failed: close the document so
      // the waiting pages fail, and open it anew on the next try.
      documents.delete(url);
      task?.destroy();
      console.warn("Paper download failed:", error);
    }
  };
  transport.requestDataRange = (begin, end) => {
    if (whole) transport.onDataRange(begin, whole.slice(begin, end));
    else fetchRange(begin, end);
  };
  task = pdfjs.getDocument({ range: transport, length, rangeChunkSize: CHUNK, disableAutoFetch: true, disableStream: true });
  return task.promise;
}

function keepForOffline(url) {
  if (!navigator.serviceWorker?.controller || navigator.connection?.saveData) return;
  window.setTimeout(() => fetch(url).catch(() => {}), 8000);
}

export function loadPdf(url) {
  if (!documents.has(url)) {
    const promise = pdfjsModule().then((pdfjs) =>
      openWithRanges(pdfjs, url)
        .then((pdf) => {
          keepForOffline(url);
          return pdf;
        })
        .catch(() => pdfjs.getDocument({ url }).promise),
    );
    documents.set(url, promise);
    promise.catch(() => documents.delete(url));
  }
  return documents.get(url);
}
