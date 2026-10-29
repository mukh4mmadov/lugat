import { supabase } from "./supabase";

// Calls api/speaking-ai.js with the learner's session. Errors carry the HTTP
// status (429 = daily time used up) and the response body.
export async function speakingRequest(method, body) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch("/api/speaking-ai", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    error.data = payload;
    throw error;
  }
  return payload;
}

export const formatMinutes = (seconds) => Math.floor((seconds || 0) / 60);
