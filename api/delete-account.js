import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return res
      .status(503)
      .json({ error: "Account deletion is not configured" });
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error: authError } = await supabase.auth.getUser(token);
  if (authError || !data.user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(
    data.user.id,
  );
  if (deleteError)
    return res.status(500).json({ error: "Account deletion failed" });
  return res.status(200).json({ success: true });
}
