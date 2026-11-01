// The official Central Bank of Uzbekistan rate for the Korean won, so
// tuition can be shown in so'm.
//
//   GET /api/fx   → { ccy: "KRW", rate: <so'm per 1 won>, date, source }

let cache = { at: 0, value: null };
const SOURCE = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/KRW/";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    if (!cache.value || Date.now() - cache.at > 6 * 3600000) {
      const response = await fetch(SOURCE, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`CBU ${response.status}`);
      const [row] = await response.json();
      const rate = Number(row.Rate) / (Number(row.Nominal) || 1);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error("Bad rate");
      cache = { at: Date.now(), value: { ccy: "KRW", rate, date: row.Date, source: "https://cbu.uz" } };
    }
    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    return res.status(200).json(cache.value);
  } catch (error) {
    console.error("FX error:", error);
    if (cache.value) return res.status(200).json(cache.value);
    return res.status(503).json({ error: "Rate unavailable" });
  }
}
