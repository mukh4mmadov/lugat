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
  window.location.reload();
  return true;
}

export function reportError(error, kind = "error") {
  const message = String(error?.message || error || "Unknown error").slice(0, 500);
  if (sent.size >= MAX_REPORTS || sent.has(message)) return;
  sent.add(message);
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
const IGNORED = /ResizeObserver loop|Script error\.?$|AbortError|The user aborted|NotAllowedError|play\(\) request was interrupted|^(TypeError: )?(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)$/i;

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
