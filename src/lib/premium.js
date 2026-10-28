// Premium is stored as app_metadata.premium_until on the Supabase user. Only
// the server (admin dashboard) can change it; the app just reads it.
// Payment happens in Telegram: the learner messages the owner, pays, and the
// owner extends premium from /admin/users.

export const TELEGRAM_USERNAME = "mukh4mmadov";

export const PREMIUM_PLANS = [
  { id: "month", months: 1, days: 30, price: 29000 },
  { id: "quarter", months: 3, days: 90, price: 69000 },
  { id: "year", months: 12, days: 365, price: 199000 },
];

export function premiumUntil(user) {
  const value = user?.app_metadata?.premium_until;
  return value && new Date(value).getTime() > Date.now() ? value : null;
}

export function isPremium(user) {
  return Boolean(premiumUntil(user));
}

export function formatPrice(amount) {
  // "199 000": a plain space, whatever the browser's locale data uses.
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// A Telegram link that opens the owner's chat with the order already typed,
// so the owner can find the account in the admin dashboard by its email.
export function telegramOrderLink(message) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}
