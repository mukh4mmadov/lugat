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
