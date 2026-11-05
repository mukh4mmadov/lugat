import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { timeAgo } from "../../lib/dates";
import { ADMIN_NOTIFICATIONS_CHANGED, markAllNotificationsSeen, markNotificationSeen } from "../../lib/adminNotifications";
import { Panel } from "../../pages/AdminPage";

const ICONS = { deletion: "🗑", ticket: "✉️", ticketReply: "💬", report: "⚠️", signup: "👋", aiAnswer: "🤖" };
const PAGE = 50;

function detailText(t, item) {
  const data = item.data || {};
  if (item.kind === "deletion") return [data.email, data.reason].filter(Boolean).join(" — ");
  if (item.kind === "report") return [t(`live.reason.${data.reason}`, { defaultValue: data.reason }), data.note].filter(Boolean).join(" — ");
  if (item.kind === "signup") return data.name || "";
  if (item.kind === "aiAnswer") return [data.email, data.question, data.declined ? t("admin.ai.declined") : data.answer].filter(Boolean).join(" — ");
  return data.text || "";
}

// Every admin notification, newest first; unseen ones stand out. Opening one
// marks it seen and goes to the thing it is about.
export default function AdminNotifications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [seen, setSeen] = useState(new Set());
  const [limit, setLimit] = useState(PAGE);
  const [filter, setFilter] = useState("unseen");

  const load = useCallback(async () => {
    const [{ data: rows }, { data: reads }] = await Promise.all([
      supabase.from("admin_notifications").select("id, kind, data, link, created_at").order("created_at", { ascending: false }).limit(limit),
      supabase.from("admin_notification_reads").select("notification_id").order("read_at", { ascending: false }).limit(5000),
    ]);
    setItems(rows || []);
    setSeen(new Set((reads || []).map((row) => row.notification_id)));
  }, [limit]);

  useEffect(() => {
    load();
    window.addEventListener(ADMIN_NOTIFICATIONS_CHANGED, load);
    const channel = supabase
      .channel(`admin-notifications-list-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, load)
      .subscribe();
    return () => {
      window.removeEventListener(ADMIN_NOTIFICATIONS_CHANGED, load);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const open = async (item) => {
    if (!seen.has(item.id)) await markNotificationSeen(item.id);
    navigate(item.link);
  };

  const unseenCount = items ? items.filter((item) => !seen.has(item.id)).length : 0;
  const shown = (items || []).filter((item) => filter === "all" || !seen.has(item.id));

  return (
    <Panel
      title={t("adminNotifications.title")}
      action={
        unseenCount > 0 && (
          <button type="button" onClick={markAllNotificationsSeen} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-black dark:border-white/15">
            {t("adminNotifications.markAll")}
          </button>
        )
      }
    >
      <div className="mb-3 flex gap-2">
        {["unseen", "all"].map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-black ${filter === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 dark:bg-white/10"}`}
          >
            {t(`adminNotifications.filter.${key}`)}
            {key === "unseen" && unseenCount > 0 && <span className="ml-1.5 rounded-full bg-rose-600 px-1.5 text-white">{unseenCount}</span>}
          </button>
        ))}
      </div>
      {!items && <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />}
      {items && !shown.length && <p className="py-6 text-center text-sm text-slate-500">{t(filter === "unseen" ? "adminNotifications.allSeen" : "adminNotifications.empty")}</p>}
      <ul className="space-y-2">
        {shown.map((item) => {
          const unseen = !seen.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => open(item)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm transition hover:border-sky-300 ${unseen ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10" : "border-slate-100 dark:border-white/5"}`}
              >
                <span aria-hidden="true" className="text-lg">{ICONS[item.kind] || "🔔"}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={unseen ? "font-black" : "font-bold"}>{t(`adminNotifications.kind.${item.kind}`)}</span>
                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(item.created_at, i18n.language)}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-slate-600 dark:text-slate-300">{detailText(t, item)}</span>
                </span>
                {unseen && <span aria-label={t("adminNotifications.new")} className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600" />}
              </button>
            </li>
          );
        })}
      </ul>
      {items && items.length >= limit && (
        <button type="button" onClick={() => setLimit((value) => value + PAGE)} className="mt-3 w-full rounded-xl border border-slate-300 py-2 text-sm font-bold dark:border-white/15">
          {t("adminNotifications.more")}
        </button>
      )}
    </Panel>
  );
}
