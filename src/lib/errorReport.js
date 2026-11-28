import { supabase } from "./supabase";

const RELOAD_KEY = "k-talim:new-version-reload";
const HARD_RELOAD_KEY = "k-talim:new-version-hard-reload";
const MAX_REPORTS = 5;
const sent = new Set();

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading (CSS )?chunk|ChunkLoadError|not a valid JavaScript MIME type|Unable to preload CSS/i;

export function isChunkError(error) {
  return CHUNK_ERROR.test(String(error?.message || error || ""));
}

async function activateNewWorker() {
  const registration = await navigator.serviceWorker?.getRegistration?.().catch(() => null);
  if (!registration) return;
  await registration.update().catch(() => {});
  const worker = registration.waiting || registration.installing;
  if (!worker) return;
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 15000);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    const skip = () => worker.state === "installed" && worker.postMessage({ type: "SKIP_WAITING" });
    worker.addEventListener("statechange", skip);
    skip();
  });
}

export async function dropOldCopy() {
  const keys = await window.caches?.keys?.().catch(() => []) || [];
  await Promise.all(keys.filter((key) => key.includes("precache")).map((key) => window.caches.delete(key).catch(() => {})));
}

let reloading = false;

export function reloadForNewVersion() {
  if (reloading) return true;
  const now = Date.now();
  try {
    if (now - (Number(sessionStorage.getItem(RELOAD_KEY)) || 0) >= 30000) {
      sessionStorage.setItem(RELOAD_KEY, String(now));
      reloading = true;
      activateNewWorker().finally(() => window.location.reload());
      return true;
    }
    if (now - (Number(sessionStorage.getItem(HARD_RELOAD_KEY)) || 0) >= 300000) {
      sessionStorage.setItem(HARD_RELOAD_KEY, String(now));
      reloading = true;
      dropOldCopy().finally(() => window.location.reload());
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

const ROBOT = /bot\b|crawler|spider|slurp|Google-InspectionTool|Chrome-Lighthouse|HeadlessChrome|bingpreview|facebookexternalhit/i;

async function runningLatest() {
  const own = new URL(import.meta.url).pathname.split("/").pop();
  try {
    const response = await fetch("/app.html", { cache: "no-store" });
    if (!response.ok) return true;
    return (await response.text()).includes(own);
  } catch {
    return true;
  }
}

async function chunkIsMissing(error) {
  if (navigator.onLine === false) return false;
  const url = String(error?.message || error || "").match(/https?:\/\/\S+?\.(?:m?js|css)\b/)?.[0];
  if (url) {
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (response.ok) return false;
    } catch {
      return false;
    }
  }
  return runningLatest();
}

export async function reportError(error, kind = "error") {
  const message = String(error?.message || error || "Unknown error").slice(0, 500);
  if (reloading || sent.size >= MAX_REPORTS || sent.has(message) || ROBOT.test(navigator.userAgent)) return;
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
