import { supabase } from "./supabase";

// Calls /api/admin with the current session. Throws an Error whose `status`
// is the HTTP status (503 means the server has no service role key).
export async function adminRequest(params, body) {
  const { data } = await supabase.auth.getSession();
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/admin${query ? `?${query}` : ""}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${data.session?.access_token || ""}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}
