// Shared constants and helpers for the feedback pages (learner and admin).

export const CATEGORIES = [
  { id: "bug", icon: "🐞" },
  { id: "content", icon: "📝" },
  { id: "audio", icon: "🔊" },
  { id: "progress", icon: "📈" },
  { id: "idea", icon: "💡" },
  { id: "other", icon: "💬" },
];
export const CATEGORY_ICON = Object.fromEntries(CATEGORIES.map((category) => [category.id, category.icon]));

export const STATUSES = ["open", "in_progress", "resolved", "closed"];
export const PRIORITIES = ["low", "normal", "high", "urgent"];
export const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 };
export const ACTIVE = new Set(["open", "in_progress"]);

export const STATUS_TONE = {
  open: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  closed: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
};
export const PRIORITY_TONE = {
  low: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
  normal: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;
export const SUBJECT_MAX = 120;
// A ticket waiting this long for a team reply is flagged as overdue.
export const OVERDUE_MS = 48 * 60 * 60 * 1000;

// Layout remembers the last page the learner was on so a report can say
// where the problem happened.
export const LAST_ROUTE_KEY = "k-talim:last-route";
// Fired after anything that changes unread counts so the nav badge refreshes.
export const UNREAD_EVENT = "k-talim:feedback-unread";

export function notifyUnreadChanged() {
  window.dispatchEvent(new Event(UNREAD_EVENT));
}

export function readLastRoute() {
  try {
    return window.sessionStorage.getItem(LAST_ROUTE_KEY) || "/";
  } catch {
    return "/";
  }
}

export function routeContext(route) {
  return {
    lessonId: route.match(/\/(?:lesson|study)\/(\d+)/)?.[1] || null,
    exerciseMode: route.match(/\/(flashcards|listening|quiz|writing)$/)?.[1] || null,
  };
}

export const shortId = (id) => String(id || "").slice(0, 8);

export function ticketTitle(ticket) {
  if (ticket.subject?.trim()) return ticket.subject.trim();
  const firstLine = String(ticket.message || "").split("\n")[0].trim();
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine;
}

// "Chrome 130 · Android" from a user agent string.
export function shortBrowser(ua) {
  if (!ua) return "";
  // Most specific first: Edge, Opera and others also say "Chrome".
  const browsers = [
    ["Edge", /Edg\/(\d+)/],
    ["Opera", /OPR\/(\d+)/],
    ["Yandex", /YaBrowser\/(\d+)/],
    ["Samsung", /SamsungBrowser\/(\d+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/(\d+)/],
    ["Chrome", /(?:Chrome|CriOS)\/(\d+)/],
    ["Safari", /Version\/(\d+).*Safari/],
  ];
  const name = browsers.map(([label, pattern]) => [label, ua.match(pattern)]).find(([, match]) => match);
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return [name && `${name[0]} ${name[1][1]}`, os].filter(Boolean).join(" · ") || ua.slice(0, 40);
}

// Compact duration such as "45m", "3h", "2d" using translated unit letters.
export function formatDuration(ms, t) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return t("feedback.unit.m", { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 48) return t("feedback.unit.h", { count: hours });
  return t("feedback.unit.d", { count: Math.round(hours / 24) });
}

// A ticket the team still owes a reply on.
export const needsReply = (ticket) => ACTIVE.has(ticket.status) && ticket.last_message_by !== "admin";

export function waitingMs(ticket) {
  return needsReply(ticket) ? Date.now() - new Date(ticket.last_message_at || ticket.created_at).getTime() : 0;
}

// Maps a Supabase error to a translation key.
export function errorKey(error, fallback = "feedback.submitError") {
  const text = `${error?.message || ""} ${error?.details || ""}`;
  // "rate limit exceeded" comes from the older insert trigger in production.
  if (/rate_limited|rate limit/i.test(text)) return "feedback.rateLimited";
  if (text.includes("ticket_not_found")) return "feedback.notFound";
  return fallback;
}
