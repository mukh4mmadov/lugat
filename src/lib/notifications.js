// The learner's notifications (public.user_messages): admin messages, replies
// to feedback, Premium, invited friends and streak reminders. One shared list
// for the bell and the top bar, refreshed every two minutes while the tab is
// open and whenever the learner comes back to it.
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase";

const COLUMNS = "id, kind, title, body, link, data, important, created_at, read_at";
const REFRESH_MS = 2 * 60 * 1000;

let state = { userId: null, items: [], loaded: false };
const listeners = new Set();

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

async function load(userId) {
  const { data, error } = await supabase.from("user_messages").select(COLUMNS).order("created_at", { ascending: false }).limit(40);
  if (state.userId !== userId) return;
  if (error) {
    // Before the bell's database update: only the old admin messages exist.
    const old = await supabase.from("user_messages").select("id, title, body, created_at, read_at").order("created_at", { ascending: false }).limit(40);
    if (state.userId === userId) set({ items: (old.data || []).map((row) => ({ ...row, kind: "admin", data: {}, important: true })), loaded: true });
    return;
  }
  set({ items: data || [], loaded: true });
}

export function useNotifications(userId) {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );

  useEffect(() => {
    if (!userId) {
      set({ userId: null, items: [], loaded: false });
      return undefined;
    }
    if (state.userId !== userId) set({ userId, items: [], loaded: false });
    load(userId);
    const refresh = () => document.visibilityState === "visible" && load(userId);
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [userId]);

  return snapshot.userId === userId ? snapshot : { userId, items: [], loaded: false };
}

export function markRead(id) {
  const now = new Date().toISOString();
  set({ items: state.items.map((item) => (item.id === id && !item.read_at ? { ...item, read_at: now } : item)) });
  supabase.rpc("mark_user_message_read", { p_id: id }).then(() => {});
}

export function markAllRead() {
  const now = new Date().toISOString();
  const unread = state.items.filter((item) => !item.read_at).map((item) => item.id);
  if (!unread.length) return;
  set({ items: state.items.map((item) => (item.read_at ? item : { ...item, read_at: now })) });
  supabase.rpc("mark_all_user_messages_read").then(({ error }) => {
    // Before the database update: one by one.
    if (error) unread.forEach((id) => supabase.rpc("mark_user_message_read", { p_id: id }).then(() => {}));
  });
}
