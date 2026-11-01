import { createClient } from "@supabase/supabase-js";
import { pushAdminNotifications } from "./_lib/push.js";

// Learners cannot delete their own account. They send a deletion request
// with a reason; an admin checks the account and deletes it from the admin
// panel (api/admin.js). Until then all of the account's data stays.
//   POST /api/delete-account { reason } → the open request
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return res.status(503).json({ error: "Account deletion requests are not configured" });
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error: authError } = await supabase.auth.getUser(token);
  if (authError || !data.user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 1000) : "";
  if (reason.length < 3) return res.status(400).json({ error: "Write the reason first" });

  // One open request at a time: a second one only updates the reason.
  const { data: open } = await supabase
    .from("account_deletion_requests")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("status", "open")
    .maybeSingle();
  const query = open
    ? supabase.from("account_deletion_requests").update({ reason }).eq("id", open.id)
    : supabase.from("account_deletion_requests").insert({ user_id: data.user.id, email: data.user.email, reason });
  const { data: request, error } = await query.select("id, status, reason, created_at").single();
  if (error) return res.status(500).json({ error: "Could not send the request" });
  // A trigger has added an admin notification; push it to the admins now.
  await pushAdminNotifications(supabase).catch((pushError) => console.error("Admin push error:", pushError));
  return res.status(200).json({ request });
}
