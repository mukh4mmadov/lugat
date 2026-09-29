import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { supabase } from "../lib/supabase";

const statuses = ["open", "in_progress", "resolved", "closed"];
const priorities = ["low", "normal", "high", "urgent"];

function TicketEditor({ ticket, events, onSaved, t }) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [tags, setTags] = useState((ticket.tags || []).join(", "));
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || "");
  const [notes, setNotes] = useState(ticket.admin_notes || "");
  const [response, setResponse] = useState(ticket.response || "");
  const [duplicateOf, setDuplicateOf] = useState(ticket.duplicate_of || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const { error: updateError } = await supabase
      .from("feedback_tickets")
      .update({
        status,
        priority,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        response,
        duplicate_of: duplicateOf.trim() || null,
      })
      .eq("id", ticket.id);
    const { error: privateUpdateError } = updateError
      ? { error: updateError }
      : await supabase.from("feedback_ticket_admin").upsert(
          {
            ticket_id: ticket.id,
            assigned_to: assignedTo.trim() || null,
            admin_notes: notes,
          },
          { onConflict: "ticket_id" },
        );
    setSaving(false);
    if (privateUpdateError) {
      setError(t("feedback.adminSaveError"));
      return;
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    onSaved();
  }

  return (
    <article className="border-b border-slate-200 py-5 last:border-0 dark:border-white/10 relative">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            {t(`feedback.category.${ticket.category}`)} ·{" "}
            {new Date(ticket.created_at).toLocaleString()}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{ticket.message}</p>
          <p className="mt-2 break-all text-xs text-slate-500">
            {ticket.route} · {ticket.browser || ""}
          </p>
          {(ticket.lesson_id || ticket.exercise_mode) && (
            <p className="mt-1 text-xs text-slate-500">
              {ticket.lesson_id
                ? `${t("card.lesson", { lesson: ticket.lesson_id })} `
                : ""}
              {ticket.exercise_mode || ""}
            </p>
          )}
        </div>
        <span className="text-xs font-bold text-slate-500">{ticket.id}</span>
      </div>
      <form id={`ticket-form-${ticket.id}`} onSubmit={save} className="mt-5 grid gap-3 md:grid-cols-2 pb-20 md:pb-0">
        <label htmlFor={`ticket-status-${ticket.id}`} className="text-xs font-bold">
          {t("feedback.statusLabel")}
          <select
            id={`ticket-status-${ticket.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="premium-input mt-1"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {t(`feedback.status.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`ticket-priority-${ticket.id}`} className="text-xs font-bold">
          {t("feedback.priority")}
          <select
            id={`ticket-priority-${ticket.id}`}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="premium-input mt-1"
          >
            {priorities.map((value) => (
              <option key={value} value={value}>
                {t(`feedback.priority.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`ticket-tags-${ticket.id}`} className="text-xs font-bold">
          {t("feedback.tags")}
          <input
            id={`ticket-tags-${ticket.id}`}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="premium-input mt-1"
            placeholder="bug, mobile"
          />
        </label>
        <label htmlFor={`ticket-assigned-${ticket.id}`} className="text-xs font-bold">
          {t("feedback.assignedTo")}
          <input
            id={`ticket-assigned-${ticket.id}`}
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="premium-input mt-1"
            placeholder="User ID"
          />
        </label>
        <label htmlFor={`ticket-duplicate-${ticket.id}`} className="text-xs font-bold">
          {t("feedback.duplicateOf")}
          <input
            id={`ticket-duplicate-${ticket.id}`}
            value={duplicateOf}
            onChange={(event) => setDuplicateOf(event.target.value)}
            className="premium-input mt-1"
            placeholder="Ticket ID"
          />
        </label>
        <label htmlFor={`ticket-notes-${ticket.id}`} className="text-xs font-bold md:col-span-2">
          {t("feedback.internalNotes")}
          <textarea
            id={`ticket-notes-${ticket.id}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="premium-input mt-1"
          />
        </label>
        <label htmlFor={`ticket-response-${ticket.id}`} className="text-xs font-bold md:col-span-2">
          {t("feedback.reply")}
          <textarea
            id={`ticket-response-${ticket.id}`}
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            rows={3}
            className="premium-input mt-1"
          />
        </label>
        {error && (
          <p
            role="alert"
            className="text-sm font-bold text-rose-600 md:col-span-2"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="text-sm font-bold text-emerald-600 md:col-span-2"
          >
            {t("feedback.saveSuccess")}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="action-btn bg-slate-950 text-white disabled:opacity-50 dark:bg-white dark:text-slate-950 md:col-span-2 md:sticky md:bottom-0 md:mt-4"
        >
          {saving ? t("common.loading") : t("feedback.saveTicket")}
        </button>
      </form>
      {/* Mobile sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3 shadow-xl dark:bg-slate-900/95 dark:border-white/10 z-20">
        <button
          type="submit"
          form={ticket.id ? `ticket-form-${ticket.id}` : undefined}
          disabled={saving}
          className="w-full action-btn bg-slate-950 text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {saving ? t("common.loading") : t("feedback.saveTicket")}
        </button>
      </div>
      {events.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-2">
            {t("feedback.auditHistory")}
          </p>
          <ul className="space-y-1 text-xs text-slate-500">
            {events.map((event) => (
              <li key={event.id} className="flex items-center gap-2">
                <span className="font-mono text-slate-400">
                  {new Date(event.created_at).toLocaleString()}
                </span>
                <span className="font-bold capitalize">{event.event_type}</span>
                <span>·</span>
                <span>{event.actor_id || t("feedback.system")}</span>
                {event.metadata && (
                  <span className="text-slate-300">
                    {JSON.stringify(event.metadata)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function AdminFeedbackPage() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authorized, error: authError } =
      await supabase.rpc("is_feedback_admin");
    if (authError) {
      setError(
        t("feedback.permissionCheckFailed", { error: authError.message }),
      );
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (!authorized) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    const [
      { data, error: ticketError },
      { data: privateData, error: privateError },
      { data: eventData },
    ] = await Promise.all([
      supabase
        .from("feedback_tickets")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("feedback_ticket_admin").select("*"),
      supabase
        .from("feedback_ticket_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);
    if (ticketError || privateError) setError(t("feedback.loadError"));
    const privateByTicket = Object.fromEntries(
      (privateData || []).map((item) => [item.ticket_id, item]),
    );
    setTickets(
      (data || []).map((ticket) => ({
        ...ticket,
        ...privateByTicket[ticket.id],
      })),
    );
    setEvents(eventData || []);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <GlassCard>
        <p role="status">{t("common.loading")}</p>
      </GlassCard>
    );
  if (!isAdmin)
    return (
      <GlassCard>
        <h1 className="text-xl font-black">{t("feedback.accessDenied")}</h1>
        {error && (
          <p role="alert" className="mt-3 break-words text-sm text-rose-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/15"
        >
          {t("common.tryAgain")}
        </button>
      </GlassCard>
    );

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{t("feedback.adminTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("feedback.tickets", { count: tickets.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/15"
        >
          {t("common.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}
      {tickets.map((ticket) => (
        <TicketEditor
          key={ticket.id}
          ticket={ticket}
          events={events.filter((event) => event.ticket_id === ticket.id)}
          onSaved={load}
          t={t}
        />
      ))}
      {!tickets.length && (
        <p className="mt-6 text-sm text-slate-500">{t("feedback.noTickets")}</p>
      )}
    </GlassCard>
  );
}
