import { createClient } from "@supabase/supabase-js";


function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const db = serviceClient();
  if (!db) return res.status(503).json({ error: "Leaderboard is not configured" });

  let viewerId = null;
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    const { data } = await db.auth.getUser(token);
    viewerId = data?.user?.id || null;
  }

  try {
    const { data, error } = await db.rpc("get_leaderboard", { p_viewer: viewerId });
    if (error) throw error;
    const board = (key) => {
      const part = data?.[key] || {};
      return { rows: (part.rows || []).map((row) => ({ ...row, me: Boolean(row.me) })), me: part.me || null, total: part.total || 0 };
    };
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json({ generatedAt: new Date().toISOString(), week: board("week"), all: board("all"), speaking: board("speaking") });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Leaderboard failed" });
  }
}
