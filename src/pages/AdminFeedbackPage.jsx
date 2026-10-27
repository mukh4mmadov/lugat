import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { formatDate, timeAgo } from "../lib/dates";

const statuses = ["open", "in_progress", "resolved", "closed"];
const priorities = ["low", "normal", "high", "urgent"];
const categories = ["bug", "content", "audio", "progress", "other"];

const STATUS_TONE = {
  open: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  closed: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
};
const PRIORITY_TONE = {
  low: "text-slate-400",
  normal: "text-slate-500",
  high: "text-amber-600 dark:text-amber-300",
  urgent: "text-rose-600 dark:text-rose-300",
};

function StatusPill({ status }) {
  const { t } = useTranslation();
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${STATUS_TONE[status]}`}>{t(`feedback.status.${status}`)}</span>;
}

function TicketEditor({ ticket, events, onSaved, onBack }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(() => ({
    status: ticket.status,
    priority: ticket.priority,
    tags: (ticket.tags || []).join(", "),
    assignedTo: ticket.assigned_to || "",
    notes: ticket.admin_notes || "",
    response: ticket.response || "",
    duplicateOf: ticket.duplicate_of || "",
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function save(overrides = {}) {
    const next = { ...form, ...overrides };
    setForm(next);
    setSaving(true);
    setMessage(null);
    const { error: updateError } = await supabase
      .from("feedback_tickets")
      .update({
        status: next.status,
        priority: next.priority,
        tags: next.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        response: next.response,
        duplicate_of: next.duplicateOf.trim() || null,
      })
      .eq("id", ticket.id);
    const { error: privateError } = updateError
      ? { error: updateError }
      : await supabase.from("feedback_ticket_admin").upsert(
          { ticket_id: ticket.id, assigned_to: next.assignedTo.trim() || null, admin_notes: next.notes },
          { onConflict: "ticket_id" },
        );
    setSaving(false);
    if (privateError) {
      setMessage({ ok: false, text: t("feedback.adminSaveError") });
      return;
    }
    setMessage({ ok: true, text: t("feedback.saveSuccess") });
    onSaved();
  }

  const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 p-4 dark:border-white/10">
        <button type="button" onClick={onBack} className="mb-3 text-sm font-bold text-sky-600 dark:text-sky-300 lg:hidden">‹ {t("admin.feedback.back")}</button>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <StatusPill status={ticket.status} />
          <span>{t(`feedback.category.${ticket.category}`)}</span>
          <span>·</span>
          <span>{formatDate(ticket.created_at, i18n.language)}</span>
          <Link to={`/admin/users?user=${ticket.user_id}`} className="ml-auto text-sky-600 dark:text-sky-300">{t("admin.feedback.reporter")} →</Link>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7">{ticket.message}</p>
        <p className="mt-2 break-all text-xs text-slate-500">
          {ticket.route}
          {ticket.lesson_id ? ` · ${t("card.lesson", { lesson: ticket.lesson_id })}` : ""}
          {ticket.exercise_mode ? ` · ${ticket.exercise_mode}` : ""}
          {ticket.browser ? ` · ${ticket.browser}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ticket.status !== "in_progress" && (
            <button type="button" disabled={saving} onClick={() => save({ status: "in_progress" })} className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">{t("admin.feedback.take")}</button>
          )}
          {ticket.status !== "resolved" && (
            <button type="button" disabled={saving} onClick={() => save({ status: "resolved" })} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">{t("admin.feedback.resolve")}</button>
          )}
          {ticket.status !== "closed" && (
            <button type="button" disabled={saving} onClick={() => save({ status: "closed" })} className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-black disabled:opacity-50 dark:border-white/15">{t("admin.feedback.close")}</button>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
      >
        <label className="block text-xs font-bold">
          {t("feedback.reply")}
          <textarea value={form.response} onChange={set("response")} rows={4} className={field} placeholder={t("admin.feedback.replyHint")} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold">
            {t("feedback.statusLabel")}
            <select value={form.status} onChange={set("status")} className={field}>
              {statuses.map((value) => <option key={value} value={value}>{t(`feedback.status.${value}`)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold">
            {t("feedback.priority")}
            <select value={form.priority} onChange={set("priority")} className={field}>
              {priorities.map((value) => <option key={value} value={value}>{t(`feedback.priority.${value}`)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold">
            {t("feedback.tags")}
            <input value={form.tags} onChange={set("tags")} className={field} placeholder="bug, mobile" />
          </label>
          <label className="block text-xs font-bold">
            {t("feedback.duplicateOf")}
            <input value={form.duplicateOf} onChange={set("duplicateOf")} className={field} placeholder="Ticket ID" />
          </label>
          <label className="block text-xs font-bold sm:col-span-2">
            {t("feedback.assignedTo")}
            <input value={form.assignedTo} onChange={set("assignedTo")} className={field} placeholder="User ID" />
          </label>
        </div>
        <label className="block text-xs font-bold">
          {t("feedback.internalNotes")}
          <textarea value={form.notes} onChange={set("notes")} rows={3} className={field} />
        </label>

        {events.length > 0 && (
          <details className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
            <summary className="cursor-pointer font-black uppercase text-slate-500">{t("feedback.auditHistory")} · {events.length}</summary>
            <ul className="mt-2 space-y-1.5 text-slate-500">
              {events.map((event) => (
                <li key={event.id}>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{event.event_type}</span> · {timeAgo(event.created_at, i18n.language)}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <span className="ml-1 break-all">
                      {Object.entries(event.metadata).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`).join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
          {message && <p role={message.ok ? "status" : "alert"} className={`mb-2 text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
            {saving ? t("common.loading") : t("feedback.saveTicket")}
          </button>
        </div>
      </form>
    </article>
  );
}

export default function AdminFeedbackPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const selectedId = params.get("ticket");

  const load = useCallback(async () => {
    setError("");
    const [{ data, error: ticketError }, { data: privateData, error: privateError }, { data: eventData }] = await Promise.all([
      supabase.from("feedback_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback_ticket_admin").select("*"),
      supabase.from("feedback_ticket_events").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    if (ticketError || privateError) setError(t("feedback.loadError"));
    const privateByTicket = Object.fromEntries((privateData || []).map((item) => [item.ticket_id, item]));
    setTickets((data || []).map((ticket) => ({ ...ticket, ...privateByTicket[ticket.id] })));
    setEvents(eventData || []);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const result = { active: 0, all: tickets.length };
    tickets.forEach((ticket) => {
      result[ticket.status] = (result[ticket.status] || 0) + 1;
      if (ticket.status === "open" || ticket.status === "in_progress") result.active += 1;
    });
    return result;
  }, [tickets]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tickets.filter(
      (ticket) =>
        (status === "all" || (status === "active" ? ["open", "in_progress"].includes(ticket.status) : ticket.status === status)) &&
        (category === "all" || ticket.category === category) &&
        (!needle || `${ticket.message} ${ticket.route} ${(ticket.tags || []).join(" ")} ${ticket.id}`.toLowerCase().includes(needle)),
    );
  }, [tickets, status, category, query]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) || null;
  const select = (id) => setParams(id ? { ticket: id } : {});

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.feedback.search")}
          aria-label={t("admin.feedback.search")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 md:max-w-sm"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t("admin.feedback.category")} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-900">
          <option value="all">{t("admin.feedback.allCategories")}</option>
          {categories.map((value) => <option key={value} value={value}>{t(`feedback.category.${value}`)}</option>)}
        </select>
        <button type="button" onClick={load} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-white/15 md:ml-auto">{t("common.refresh", { defaultValue: "Refresh" })}</button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {["active", ...statuses, "all"].map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={status === key}
            onClick={() => setStatus(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${status === key ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300"}`}
          >
            {key === "active" ? t("admin.feedback.active") : key === "all" ? t("admin.feedback.all") : t(`feedback.status.${key}`)} <span className="opacity-70">{counts[key] || 0}</span>
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ul className={`space-y-2 ${selected ? "hidden lg:block" : ""}`}>
          {loading && <li className="h-40 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
          {!loading && !visible.length && (
            <li className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/15">{t("feedback.noTickets")}</li>
          )}
          {visible.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                onClick={() => select(ticket.id)}
                className={`w-full rounded-2xl border p-3.5 text-left transition ${
                  ticket.id === selectedId
                    ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                    : "border-slate-200 bg-white/80 hover:border-sky-300 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <StatusPill status={ticket.status} />
                  <span>{t(`feedback.category.${ticket.category}`)}</span>
                  <span className={`ml-auto ${PRIORITY_TONE[ticket.priority]}`}>{ticket.priority !== "normal" ? t(`feedback.priority.${ticket.priority}`) : ""}</span>
                  <span>{timeAgo(ticket.created_at, i18n.language)}</span>
                </span>
                <span className="mt-2 line-clamp-2 block text-sm font-semibold leading-6">{ticket.message}</span>
                {ticket.response && <span className="mt-1 block text-xs font-bold text-emerald-600 dark:text-emerald-300">✓ {t("admin.feedback.replied")}</span>}
              </button>
            </li>
          ))}
        </ul>

        <div className={`${selected ? "" : "hidden lg:block"}`}>
          {selected ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col">
              <TicketEditor
                key={selected.id}
                ticket={selected}
                events={events.filter((event) => event.ticket_id === selected.id)}
                onSaved={load}
                onBack={() => select(null)}
              />
            </div>
          ) : (
            <div className="grid h-60 place-items-center rounded-3xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 dark:border-white/15">
              {t("admin.feedback.pick")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
