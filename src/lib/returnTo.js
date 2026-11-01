import { readLastRoute } from "./feedback";

// Where to send a learner after signing in or up: the page they were on
// before opening Login/Register. Kept in localStorage (for a day) because
// the email confirmation link opens in a new tab.
const KEY = "k-talim:return-to";
const AUTH_PAGES = /^\/(login|register|auth|complete-profile|reset-password|forgot-password)/;

export function rememberReturn(path) {
  const target = path || readLastRoute();
  if (!target || !target.startsWith("/") || AUTH_PAGES.test(target)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ path: target, at: Date.now() }));
  } catch {
    // Without storage the learner lands on the home page.
  }
}

export function takeReturn(fallback = "/") {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    localStorage.removeItem(KEY);
    if (saved?.path && Date.now() - saved.at < 86400000 && !AUTH_PAGES.test(saved.path)) return saved.path;
  } catch {
    // Fall through.
  }
  return fallback;
}
