import { supabase } from "./supabase";

// Errors are written to app_errors so admins can see what broke and where.
// A new deploy renames the site's code files, so a tab opened before it may
// ask for a file that no longer exists: that page reloads once to get the
// new version instead of showing an error.
const RELOAD_KEY = "k-talim:new-version-reload";
const MAX_REPORTS = 5;
const sent = new Set();

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading (CSS )?chunk|ChunkLoadError|not a valid JavaScript MIME type|Unable to preload CSS/i;

export function isChunkError(error) {
  return CHUNK_ERROR.test(String(error?.message || error || ""));
}

// A service worker from the old version keeps serving the old page, so a
// plain reload would ask for the same missing file again. Switch to the new
// worker first (installing it if the browser hasn't yet), then reload.
async function activateNewWorker() {
  const registration = await navigator.serviceWorker?.getRegistration?.().catch(() => null);
  if (!registration) return;
  await registration.update().catch(() => {});
  const worker = registration.waiting || registration.installing;
  if (!worker) return;
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 8000);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    const skip = () => worker.state === "installed" && worker.postMessage({ type: "SKIP_WAITING" });
    worker.addEventListener("statechange", skip);
    skip();
  });
}

// Reloads the page unless it already did in the last 30 seconds (then the
// file is really missing and reloading again would loop).
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  activateNewWorker().finally(() => window.location.reload());
  return true;
}

// Search engine and test robots render pages from old copies; their errors
// say nothing about what learners see.
const ROBOT = /bot\b|crawler|spider|slurp|Google-InspectionTool|Chrome-Lighthouse|HeadlessChrome|bingpreview|facebookexternalhit/i;

// A part of the site that failed to download is only the site's fault when
// the file is really gone; after a dropped connection it is still there.
async function chunkIsMissing(error) {
  if (navigator.onLine === false) return false;
  const url = String(error?.message || error || "").match(/https?:\/\/\S+?\.(?:m?js|css)\b/)?.[0];
  if (!url) return true;
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return !response.ok;
  } catch {
    return false;
  }
}

export async function reportError(error, kind = "error") {
  const message = String(error?.message || error || "Unknown error").slice(0, 500);
  if (sent.size >= MAX_REPORTS || sent.has(message) || ROBOT.test(navigator.userAgent)) return;
  sent.add(message);
  if (isChunkError(error) && !(await chunkIsMissing(error))) return;
  supabase
    .from("app_errors")
    .insert({
      kind: isChunkError(error) ? "chunk" : kind,
      message,
      stack: String(error?.stack || "").slice(0, 4000),
      path: (window.location.pathname + window.location.search).slice(0, 300),
      user_agent: navigator.userAgent.slice(0, 300),
      version: String(import.meta.env.VITE_APP_VERSION || "web").slice(0, 60),
    })
    .then(({ error: insertError }) => insertError && console.warn("Error report failed:", insertError.message));
}

// Browser noise that is not the site's fault.
// Offline requests are expected too.
const IGNORED = /ResizeObserver loop|Failed to update a ServiceWorker|Script error\.?$|AbortError|The user aborted|NotAllowedError|play\(\) request was interrupted|^(TypeError: )?(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)$/i;

export function watchErrors() {
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadForNewVersion()) event.preventDefault();
  });
  window.addEventListener("error", (event) => {
    const error = event.error || event.message;
    if (!error || IGNORED.test(String(error?.message || error))) return;
    reportError(error, "error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (!reason || IGNORED.test(String(reason?.message || reason)) || reason?.name === "AbortError") return;
    if (isChunkError(reason) && reloadForNewVersion()) return;
    reportError(reason, "rejection");
  });
}
