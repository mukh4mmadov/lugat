import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

// Messages from K-TALIM, shown when the learner opens the site, so they arrive
// even without push notifications. Closing one marks it as read.
export default function UserMessages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    supabase
      .from("user_messages")
      .select("id, title, body")
      .is("read_at", null)
      .order("created_at")
      .limit(5)
      .then(({ data }) => !cancelled && setMessages(data || []));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const message = messages[0];
  if (!message) return null;

  function dismiss() {
    supabase.rpc("mark_user_message_read", { p_id: message.id }).then(() => {});
    setMessages((list) => list.slice(1));
  }

  return (
    <div role="status" className="relative z-40 flex items-start justify-center gap-3 bg-sky-600 px-4 py-2 text-sm text-white">
      <span className="min-w-0 text-center">
        <b>📬 {message.title}</b> {message.body}
      </span>
      <button type="button" onClick={dismiss} aria-label={t("common.close")} className="shrink-0 rounded-lg px-2 py-0.5 hover:bg-white/20">✕</button>
    </div>
  );
}
