export const DEFAULT_PROMO_CODES = [{ code: "KTALIM7", days: 7, until: "2026-12-31T23:59:59+05:00", active: true }];

export const PROMO_CODE = /^[A-Z0-9_-]{3,24}$/;
export const normalizePromoCode = (code) => String(code || "").replace(/\s+/g, "").toUpperCase();

export function validPromoCodes(value) {
  return (
    Array.isArray(value) &&
    value.length <= 20 &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        PROMO_CODE.test(String(item.code)) &&
        Number.isInteger(item.days) &&
        item.days >= 1 &&
        item.days <= 365 &&
        typeof item.active === "boolean" &&
        (item.until === null || (typeof item.until === "string" && Number.isFinite(Date.parse(item.until)))),
    ) &&
    new Set(value.map((item) => item.code)).size === value.length
  );
}
