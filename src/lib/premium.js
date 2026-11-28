import { useSyncExternalStore } from "react";


export const TELEGRAM_USERNAME = "mukh4mmadov";

export const PREMIUM_PLANS = [
  { id: "month", months: 1, days: 30, price: 29000 },
  { id: "quarter", months: 3, days: 90, price: 69000 },
  { id: "year", months: 12, days: 365, price: 199000 },
];

const PRICES_KEY = "k-talim:premium-prices";
const priceListeners = new Set();
let pricesVersion = 0;

function applyPrices(prices) {
  PREMIUM_PLANS.forEach((plan) => {
    if (Number.isInteger(prices?.[plan.id])) plan.price = prices[plan.id];
  });
  pricesVersion += 1;
  priceListeners.forEach((listener) => listener());
}

function watchPrices(listener) {
  priceListeners.add(listener);
  return () => priceListeners.delete(listener);
}

export function usePremiumPrices() {
  useSyncExternalStore(watchPrices, () => pricesVersion);
}

try {
  applyPrices(JSON.parse(localStorage.getItem(PRICES_KEY) || "null"));
} catch {
}

export async function loadPremiumPrices(supabase) {
  const { data, error } = await supabase.rpc("get_premium_prices");
  if (error || !data) return;
  applyPrices(data);
  try {
    localStorage.setItem(PRICES_KEY, JSON.stringify(data));
  } catch {
  }
}

export function premiumUntil(user) {
  const value = user?.app_metadata?.premium_until;
  return value && new Date(value).getTime() > Date.now() ? value : null;
}

export function isPremium(user) {
  return Boolean(premiumUntil(user));
}

export function formatPrice(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function telegramOrderLink(message) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}
