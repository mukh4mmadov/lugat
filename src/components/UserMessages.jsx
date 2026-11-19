import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { markRead, useNotifications } from "../lib/notifications";

// Admin messages marked important also show as a bar at the top of the site,
// so they are seen even before the bell is opened. Closing one marks it read
// (it stays in the bell).
export default function UserMessages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items } = useNotifications(user?.id);
  const message = items.filter((item) => item.kind === "admin" && item.important && !item.read_at).at(-1);
  if (!message) return null;

  return (
    <div role="status" className="relative z-40 flex items-start justify-center gap-3 bg-sky-600 px-4 py-2 text-sm text-white">
      <button
        type="button"
        disabled={!message.link}
        onClick={() => {
          markRead(message.id);
          navigate(message.link);
        }}
        className="min-w-0 text-center disabled:cursor-default"
      >
        <b>📬 {message.title}</b> {message.body}
        {message.link && <span className="ml-1 underline">→</span>}
      </button>
      <button type="button" onClick={() => markRead(message.id)} aria-label={t("common.close")} className="shrink-0 rounded-lg px-2 py-0.5 hover:bg-white/20">✕</button>
    </div>
  );
}
