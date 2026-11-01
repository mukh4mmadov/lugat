import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Admin notifications (admin_notifications table): new deletion requests,
// support requests and replies, call reports and sign-ups. Each admin marks
// them seen; the bell shows how many are not seen yet.
const CHANGED = "admin-notifications-changed";

const changed = () => window.dispatchEvent(new Event(CHANGED));

export async function markNotificationSeen(id) {
  const { data } = await supabase.auth.getSession();
  const adminId = data.session?.user.id;
  if (!adminId) return;
  await supabase.from("admin_notification_reads").upsert({ notification_id: id, admin_id: adminId }, { ignoreDuplicates: true });
  changed();
}

export async function markAllNotificationsSeen() {
  await supabase.rpc("admin_mark_all_seen");
  changed();
}

// The unseen count, kept fresh: live on new rows, on focus and every minute.
export function useAdminUnseen(enabled) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return undefined;
    }
    let cancelled = false;
    const refresh = async () => {
      const { data, error } = await supabase.rpc("admin_unseen_count");
      if (!cancelled && !error) setCount(Number(data) || 0);
    };
    refresh();
    const channel = supabase
      .channel(`admin-notifications-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, refresh)
      .subscribe();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener(CHANGED, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      window.clearInterval(timer);
      window.removeEventListener(CHANGED, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [enabled]);
  return count;
}

export { CHANGED as ADMIN_NOTIFICATIONS_CHANGED };
