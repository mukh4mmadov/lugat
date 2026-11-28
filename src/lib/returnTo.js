import { readLastRoute } from "./feedback";

const KEY = "k-talim:return-to";
const AUTH_PAGES = /^\/(login|register|auth|complete-profile|reset-password|forgot-password)/;

export function rememberReturn(path) {
  const target = path || readLastRoute();
  if (!target || !target.startsWith("/") || AUTH_PAGES.test(target)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ path: target, at: Date.now() }));
  } catch {
  }
}

export function takeReturn(fallback = "/") {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    localStorage.removeItem(KEY);
    if (saved?.path && Date.now() - saved.at < 86400000 && !AUTH_PAGES.test(saved.path)) return saved.path;
  } catch {
  }
  return fallback;
}
