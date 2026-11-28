const PRODUCTION = ["https://lugat-six.vercel.app", "https://ktalim.uz", "https://www.ktalim.uz"];
const LOCAL = ["http://localhost:5173", "http://localhost:3000"];

export const ALLOWED_ORIGINS = process.env.VERCEL_ENV === "production" ? PRODUCTION : [...PRODUCTION, ...LOCAL];

export const originAllowed = (origin) => Boolean(origin) && ALLOWED_ORIGINS.includes(origin);

export function clientIp(req) {
  const header = (name) => {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  return header("x-real-ip") || header("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
