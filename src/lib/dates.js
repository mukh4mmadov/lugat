// Date formatting in the app language. Browsers ship little or no Uzbek locale
// data ("2026 M10 2", "-2 d"), so Uzbek is formatted by hand.

const UZ_MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const UZ_UNITS = { year: "yil", month: "oy", week: "hafta", day: "kun", hour: "soat", minute: "daqiqa" };
const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const pad = (value) => String(value).padStart(2, "0");
const isUzbek = (language) => String(language || "").startsWith("uz");

export function formatDate(value, language, { time = false } = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  if (isUzbek(language)) {
    const day = `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
    return time ? `${day}, ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
  }
  try {
    return date.toLocaleString(language, time ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
  } catch {
    return time ? date.toLocaleString() : date.toLocaleDateString();
  }
}

export function timeAgo(value, language) {
  if (!value) return "—";
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  if (Number.isNaN(seconds)) return "—";
  if (Math.abs(seconds) < 60) {
    if (isUzbek(language)) return "hozirgina";
    try {
      return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(0, "second");
    } catch {
      return "—";
    }
  }
  const [unit, size] = UNITS.find(([, length]) => Math.abs(seconds) >= length) || ["minute", 60];
  const amount = Math.round(seconds / size);
  if (isUzbek(language)) {
    if (amount === 0) return "hozirgina";
    if (unit === "day" && amount === -1) return "kecha";
    if (unit === "day" && amount === 1) return "ertaga";
    return amount < 0 ? `${-amount} ${UZ_UNITS[unit]} oldin` : `${amount} ${UZ_UNITS[unit]}dan keyin`;
  }
  try {
    return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(amount, unit);
  } catch {
    return formatDate(value, language);
  }
}
