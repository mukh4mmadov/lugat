import { createClient } from "@supabase/supabase-js";

// ICE servers for live speaking calls. With Cloudflare TURN configured
// (CLOUDFLARE_TURN_KEY_ID and CLOUDFLARE_TURN_API_TOKEN) each signed-in
// learner gets short-lived TURN credentials, so calls also connect on mobile
// networks; without them only public STUN servers are returned.
//
//   GET /api/turn   Authorization: Bearer <session>   → { iceServers, turn }

const STUN = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
const TTL_SECONDS = 2 * 60 * 60;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Not configured" });

  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: "Sign in first." });
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error } = await db.auth.getUser(token);
  if (error || !auth?.user) return res.status(401).json({ error: "Sign in first." });

  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;
  if (!keyId || !apiToken) return res.status(200).json({ iceServers: STUN, turn: false });

  try {
    const response = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: TTL_SECONDS }),
    });
    if (!response.ok) throw new Error(`Cloudflare TURN ${response.status}`);
    const data = await response.json();
    const iceServers = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
    return res.status(200).json({ iceServers: [...STUN, ...iceServers], turn: true });
  } catch (turnError) {
    console.error("TURN credentials failed:", turnError);
    return res.status(200).json({ iceServers: STUN, turn: false });
  }
}
