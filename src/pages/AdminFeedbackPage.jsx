import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CategoryLabel, MessageThread, PriorityPill, Stars, StatusPill, UnreadDot } from "../components/FeedbackUI";
import { formatDate, timeAgo } from "../lib/dates";
import {
  ACTIVE,
  CATEGORIES,
  MESSAGE_MAX,
  OVERDUE_MS,
  PRIORITIES,
  PRIORITY_RANK,
  STATUSES,
  formatDuration,
  needsReply,
  notifyUnreadChanged,
  shortBrowser,
  shortId,
  ticketTitle,
  waitingMs,
} from "../lib/feedback";
import { supabase } from "../lib/supabase";
import { Panel, StatTile, useAdminContext } from "./AdminPage";

const DAY = 24 * 60 * 60 * 1000;
const VIEWS = ["needs_reply", "ai_answered", "active", "open", "in_progress", "resolved", "closed", "all"];
const SORTS = ["activity", "newest", "oldest", "priority", "waiting"];

const inViewFilter = {
  needs_reply: needsReply,
  ai_answered: (ticket) => ticket.ai_state === "answered",
  active: (ticket) => ACTIVE.has(ticket.status),
  all: () => true,
};
const matchesView = (ticket, view) => (inViewFilter[view] ? inViewFilter[view](ticket) : ticket.status === view);

const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

const control =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

function personLabel(people, id, fallback) {
  if (!id) return fallback;
  const person = people.get(id);
  return person?.name || person?.email || shortId(id);
}

function isTyping(target) {
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName) || target?.isContentEditable;
}

// --- Stats -----------------------------------------------------------------

function useStats(tickets) {
  return useMemo(() => {
    const now = Date.now();
    const recent = tickets.filter((ticket) => now - new Date(ticket.created_at).getTime() <= 30 * DAY);
    const active = tickets.filter((ticket) => ACTIVE.has(ticket.status));
    const rated = tickets.filter((ticket) => ticket.rating);
    const intake = Array.from({ length: 30 }, (_, index) => ({ date: new Date(now - (29 - index) * DAY).toISOString().slice(0, 10), count: 0 }));
    const byDate = new Map(intake.map((day) => [day.date, day]));
    const byCategory = {};
    const tags = {};
    recent.forEach((ticket) => {
      const day = byDate.get(String(ticket.created_at).slice(0, 10));
      if (day) day.count += 1;
      byCategory[ticket.category] = (byCategory[ticket.category] || 0) + 1;
    });
    active.forEach((ticket) => (ticket.tags || []).forEach((tag) => (tags[tag] = (tags[tag] || 0) + 1)));
    return {
      needsReply: tickets.filter(needsReply).length,
      overdue: tickets.filter((ticket) => waitingMs(ticket) > OVERDUE_MS).length,
      unassigned: active.filter((ticket) => !ticket.assigned_to).length,
      important: active.filter((ticket) => ticket.priority === "urgent" || ticket.priority === "high").length,
      new7: tickets.filter((ticket) => now - new Date(ticket.created_at).getTime() <= 7 * DAY).length,
      firstResponse: average(recent.filter((ticket) => ticket.first_response_at).map((ticket) => new Date(ticket.first_response_at) - new Date(ticket.created_at))),
      resolution: average(recent.filter((ticket) => ticket.resolved_at).map((ticket) => new Date(ticket.resolved_at) - new Date(ticket.created_at))),
      rating: average(rated.map((ticket) => ticket.rating)),
      ratedCount: rated.length,
      intake,
      recentCount: recent.length,
      byCategory,
      tags: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 12),
    };
  }, [tickets]);
}

function Insights({ stats, onTag }) {
  const { t, i18n } = useTranslation();
  const max = Math.max(1, ...stats.intake.map((day) => day.count));
  const categoryMax = Math.max(1, ...Object.values(stats.byCategory));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Panel title={t("admin.feedback.intake30", { count: stats.recentCount })}>
        <div className="flex h-28 items-end gap-[2px] border-b border-slate-300 dark:border-white/15">
          {stats.intake.map((day) => (
            <span
              key={day.date}
              title={`${formatDate(day.date, i18n.language)}: ${day.count}`}
              className="block flex-1 rounded-t-[3px] bg-sky-500 dark:bg-sky-400"
              style={{ height: day.count ? `${Math.max(6, (day.count / max) * 100)}%` : "2px", opacity: day.count ? 1 : 0.35 }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
          <span>{formatDate(stats.intake[0].date, i18n.language)}</span>
          <span>{formatDate(stats.intake.at(-1).date, i18n.language)}</span>
        </div>
      </Panel>
      <Panel title={t("admin.feedback.byCategory")}>
        <div className="space-y-2">
          {CATEGORIES.map(({ id }) => (
            <div key={id} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-2 text-sm">
              <span className="truncate font-bold"><CategoryLabel category={id} /></span>
              <span className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <span className="block h-full rounded-full bg-violet-500" style={{ width: `${((stats.byCategory[id] || 0) / categoryMax) * 100}%` }} />
              </span>
              <span className="text-right text-xs font-black tabular-nums">{stats.byCategory[id] || 0}</span>
            </div>
          ))}
        </div>
        {stats.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {stats.tags.map(([tag, count]) => (
              <button key={tag} type="button" onClick={() => onTag(tag)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold hover:bg-sky-100 dark:bg-white/10 dark:hover:bg-sky-500/20">
                #{tag} · {count}
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// --- Ticket detail ---------------------------------------------------------

function TagEditor({ tags, suggestions, onChange }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const add = () => {
    const tag = value.trim().toLowerCase().replace(/^#/, "").replace(/,/g, "");
    setValue("");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 dark:border-white/10 dark:bg-slate-900">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">
          #{tag}
          <button type="button" aria-label={`${t("feedback.delete")} ${tag}`} onClick={() => onChange(tags.filter((item) => item !== tag))} className="opacity-70 hover:opacity-100">×</button>
        </span>
      ))}
      <input
        value={value}
        list="feedback-tag-suggestions"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          } else if (event.key === "Backspace" && !value && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={tags.length ? "" : t("admin.feedback.addTag")}
        aria-label={t("feedback.tags")}
        className="min-w-[6rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
      />
      <datalist id="feedback-tag-suggestions">
        {suggestions.map((tag) => <option key={tag} value={tag} />)}
      </datalist>
    </div>
  );
}

function describeEvent(event, t, people) {
  const before = event.previous_value || {};
  const after = event.new_value || {};
  if (event.event_type === "assigned") {
    return after.assigned_to ? t("admin.feedback.ev.assigned", { name: personLabel(people, after.assigned_to) }) : t("admin.feedback.ev.unassigned");
  }
  if (event.event_type === "rated") return t("admin.feedback.ev.rated", { count: after.rating });
  if (event.event_type !== "ticket_updated") return t("admin.feedback.ev.other");
  const changes = [];
  if (before.status !== after.status) changes.push(`${t("feedback.statusLabel")}: ${t(`feedback.status.${before.status}`)} → ${t(`feedback.status.${after.status}`)}`);
  if (before.priority !== after.priority) changes.push(`${t("feedback.priority")}: ${t(`feedback.priority.${before.priority}`)} → ${t(`feedback.priority.${after.priority}`)}`);
  if (JSON.stringify(before.tags || []) !== JSON.stringify(after.tags || [])) changes.push(`${t("admin.feedback.tagsShort")}: ${(after.tags || []).map((tag) => `#${tag}`).join(" ") || "—"}`);
  if (before.duplicate_of !== after.duplicate_of) changes.push(after.duplicate_of ? t("admin.feedback.ev.duplicate", { id: shortId(after.duplicate_of) }) : t("admin.feedback.ev.notDuplicate"));
  return changes.join(" · ") || t("admin.feedback.ev.other");
}

function SavedReplies({ replies, currentText, onInsert, onChanged }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.from("feedback_saved_replies").insert({ title: title.trim(), body: currentText.trim() });
    setSaving(false);
    if (saveError) {
      setError(t("feedback.adminSaveError"));
      return;
    }
    setTitle("");
    onChanged();
  }

  async function remove(reply) {
    if (!window.confirm(t("admin.feedback.confirmDeleteSaved", { title: reply.title }))) return;
    await supabase.from("feedback_saved_replies").delete().eq("id", reply.id);
    onChanged();
  }

  return (
    <details className="group rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
      <summary className="cursor-pointer select-none text-xs font-black text-slate-600 dark:text-slate-300">
        📋 {t("admin.feedback.savedReplies")} · {replies.length}
      </summary>
      <ul className="mt-2 space-y-1">
        {replies.map((reply) => (
          <li key={reply.id} className="flex items-center gap-2">
            <button type="button" onClick={() => onInsert(reply.body)} title={reply.body} className="min-w-0 flex-1 truncate rounded-lg px-2 py-1 text-left font-semibold hover:bg-white dark:hover:bg-white/10">
              {reply.title}
            </button>
            <button type="button" onClick={() => remove(reply)} aria-label={`${t("feedback.delete")} ${reply.title}`} className="px-1 text-slate-400 hover:text-rose-600">×</button>
          </li>
        ))}
        {!replies.length && <li className="px-2 text-xs text-slate-500">{t("admin.feedback.noSaved")}</li>}
      </ul>
      <div className="mt-2 flex gap-2 border-t border-slate-200 pt-2 dark:border-white/10">
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder={t("admin.feedback.savedTitle")} className={`${control} !py-1.5`} />
        <button type="button" disabled={saving || !title.trim() || !currentText.trim()} onClick={save} className="shrink-0 rounded-xl bg-slate-950 px-3 text-xs font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">
          {t("admin.feedback.saveCurrent")}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{t("admin.feedback.savedHint")}</p>
      {error && <p className="mt-1 text-xs font-bold text-rose-600">{error}</p>}
    </details>
  );
}

function TicketDetail({ ticket, tickets, people, admins, currentUserId, savedReplies, onSavedRepliesChanged, onPatch, onAssign, onDelete, onSelect, onFilterReporter, onBack, prevId, nextId }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("reply");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);

  const reporter = people.get(ticket.user_id);
  const reporterTickets = tickets.filter((item) => item.user_id === ticket.user_id);
  const firstName = reporter?.name?.split(" ")[0] || "";

  const loadThread = useCallback(async () => {
    const [{ data: messageData, error: messageError }, { data: eventData }] = await Promise.all([
      supabase.from("feedback_messages").select("*").eq("ticket_id", ticket.id).order("created_at"),
      supabase.from("feedback_ticket_events").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: false }),
    ]);
    if (messageError) setError(t("feedback.loadError"));
    setMessages(messageData || []);
    setEvents(eventData || []);
    setLoading(false);
  }, [ticket.id, t]);

  useEffect(() => {
    loadThread();
  }, [loadThread, ticket.updated_at, ticket.last_message_at]);

  const thread = useMemo(
    () => [
      { id: "first", role: "user", body: ticket.message, created_at: ticket.created_at, author: reporter?.name || reporter?.email || t("admin.feedback.learner") },
      ...messages.map((message) => ({
        ...message,
        role: message.author_role,
        author: message.ai
          ? `🤖 ${t("admin.feedback.ai.author")}`
          : message.author_role === "admin"
            ? personLabel(people, message.author_id, t("feedback.team"))
            : reporter?.name || reporter?.email || t("admin.feedback.learner"),
        canDelete: message.internal && message.author_id === currentUserId,
      })),
    ],
    [ticket, messages, people, reporter, currentUserId, t],
  );

  const otherTickets = useMemo(
    () =>
      tickets
        .filter((item) => item.id !== ticket.id)
        .sort((a, b) => (b.user_id === ticket.user_id) - (a.user_id === ticket.user_id) || (b.category === ticket.category) - (a.category === ticket.category))
        .slice(0, 60),
    [tickets, ticket.id, ticket.user_id, ticket.category],
  );
  const tagSuggestions = useMemo(() => [...new Set(tickets.flatMap((item) => item.tags || []))].sort(), [tickets]);

  async function send(resolve) {
    if (!text.trim()) return;
    setSending(true);
    setError("");
    const { error: sendError } = await supabase.from("feedback_messages").insert({
      ticket_id: ticket.id,
      author_id: currentUserId,
      author_role: "admin",
      internal: mode === "note",
      body: text.trim(),
    });
    if (!sendError && resolve) await onPatch([ticket.id], { status: "resolved" });
    // A sent reply makes the assistant's draft obsolete.
    if (!sendError && mode === "reply" && ticket.ai_draft) await supabase.from("feedback_tickets").update({ ai_draft: "" }).eq("id", ticket.id);
    setSending(false);
    if (sendError) {
      setError(t("feedback.adminSaveError"));
      return;
    }
    setText("");
    if (!ticket.assigned_to && mode === "reply") onAssign([ticket.id], currentUserId);
    else onPatch([ticket.id], {}, { reloadOnly: true });
    loadThread();
  }

  async function deleteNote(message) {
    if (!window.confirm(t("admin.feedback.confirmDeleteNote"))) return;
    await supabase.from("feedback_messages").delete().eq("id", message.id);
    loadThread();
  }

  function insertSaved(body) {
    const filled = body.replaceAll("{name}", firstName).replace(/\s+([,!.])/g, "$1");
    setMode("reply");
    setText((current) => (current.trim() ? `${current.trim()}\n\n${filled}` : filled));
    textRef.current?.focus();
  }

  const finished = !ACTIVE.has(ticket.status);
  const waiting = waitingMs(ticket);

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-slate-200 p-4 dark:border-white/10">
        <div className="mb-3 flex items-center gap-2">
          <button type="button" onClick={onBack} className="text-sm font-bold text-sky-600 dark:text-sky-300 lg:hidden">‹ {t("admin.feedback.back")}</button>
          <span className="ml-auto flex gap-1">
            <button type="button" disabled={!prevId} onClick={() => onSelect(prevId)} aria-label={t("admin.feedback.prev")} title={`${t("admin.feedback.prev")} (K)`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 font-black disabled:opacity-30 dark:border-white/10">↑</button>
            <button type="button" disabled={!nextId} onClick={() => onSelect(nextId)} aria-label={t("admin.feedback.next")} title={`${t("admin.feedback.next")} (J)`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 font-black disabled:opacity-30 dark:border-white/10">↓</button>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} />
          <CategoryLabel category={ticket.category} />
          {waiting > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${waiting > OVERDUE_MS ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200" : "bg-slate-100 dark:bg-white/10"}`}>
              ⏱ {t("admin.feedback.waiting", { time: formatDuration(waiting, t) })}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(ticket.id).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            title={t("admin.feedback.copyId")}
            className="ml-auto font-mono hover:text-sky-600"
          >
            {copied ? `✓ ${t("admin.feedback.copied")}` : `#${shortId(ticket.id)}`}
          </button>
        </div>
        <h2 className="mt-2 text-lg font-black leading-snug">{ticketTitle(ticket)}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t("feedback.statusLabel")}>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={ticket.status === status}
              onClick={() => ticket.status !== status && onPatch([ticket.id], { status })}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                ticket.status === status ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-200 text-slate-600 hover:border-sky-300 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              {t(`feedback.status.${status}`)}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-white/10">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-500">{t("admin.feedback.reporter")}</h3>
            <p className="mt-1 truncate font-black">{reporter?.name || reporter?.email || shortId(ticket.user_id)}</p>
            {reporter?.name && <p className="truncate text-xs text-slate-500">{reporter.email}</p>}
            {reporter?.created_at && <p className="text-xs text-slate-500">{t("admin.feedback.joined", { date: formatDate(reporter.created_at, i18n.language) })}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              <button type="button" onClick={() => onFilterReporter(ticket.user_id)} className="text-sky-600 dark:text-sky-300">
                {t("admin.feedback.reportsBy", { count: reporterTickets.length })}
              </button>
              <Link to={`/admin/users?user=${ticket.user_id}`} className="text-sky-600 dark:text-sky-300">{t("admin.feedback.profile")} →</Link>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-white/10">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-500">{t("admin.feedback.context")}</h3>
            <dl className="mt-1 space-y-0.5 text-xs">
              <div className="flex gap-1"><dt className="text-slate-500">{t("feedback.page")}:</dt><dd className="min-w-0 truncate"><Link to={ticket.route} className="font-mono text-sky-600 dark:text-sky-300">{ticket.route}</Link></dd></div>
              {(ticket.lesson_id || ticket.exercise_mode) && (
                <div className="flex gap-1"><dt className="text-slate-500">{t("admin.feedback.lesson")}:</dt><dd>{[ticket.lesson_id && t("card.lesson", { lesson: ticket.lesson_id }), ticket.exercise_mode].filter(Boolean).join(" · ")}</dd></div>
              )}
              {ticket.browser && <div className="flex gap-1"><dt className="text-slate-500">{t("admin.feedback.device")}:</dt><dd title={ticket.browser}>{shortBrowser(ticket.browser)}{ticket.screen ? ` · ${ticket.screen}` : ""}</dd></div>}
              <div className="flex gap-1"><dt className="text-slate-500">{t("admin.feedback.sent")}:</dt><dd>{formatDate(ticket.created_at, i18n.language, { time: true })}{ticket.language ? ` · ${ticket.language.toUpperCase()}` : ""}{ticket.app_version ? ` · ${ticket.app_version}` : ""}</dd></div>
              {ticket.first_response_at && <div className="flex gap-1"><dt className="text-slate-500">{t("admin.feedback.firstReply")}:</dt><dd>{formatDuration(new Date(ticket.first_response_at) - new Date(ticket.created_at), t)}</dd></div>}
            </dl>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold">
            {t("feedback.priority")}
            <select value={ticket.priority} onChange={(event) => onPatch([ticket.id], { priority: event.target.value })} className={`${control} mt-1`}>
              {PRIORITIES.map((value) => <option key={value} value={value}>{t(`feedback.priority.${value}`)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold">
            {t("admin.feedback.assignee")}
            <span className="mt-1 flex gap-2">
              <select value={ticket.assigned_to || ""} onChange={(event) => onAssign([ticket.id], event.target.value || null)} className={control}>
                <option value="">{t("admin.feedback.unassigned")}</option>
                {admins.map((admin) => <option key={admin.user_id} value={admin.user_id}>{admin.user_id === currentUserId ? `${t("admin.feedback.me")} (${admin.email})` : admin.name || admin.email}</option>)}
              </select>
              {ticket.assigned_to !== currentUserId && (
                <button type="button" onClick={() => onAssign([ticket.id], currentUserId)} className="shrink-0 rounded-xl border border-slate-200 px-2.5 text-xs font-black dark:border-white/10">{t("admin.feedback.takeIt")}</button>
              )}
            </span>
          </label>
          <div className="block text-xs font-bold sm:col-span-2">
            <span className="mb-1 block">{t("feedback.tags")}</span>
            <TagEditor tags={ticket.tags || []} suggestions={tagSuggestions} onChange={(tags) => onPatch([ticket.id], { tags })} />
          </div>
          <label className="block text-xs font-bold sm:col-span-2">
            {t("feedback.duplicateOf")}
            <span className="mt-1 flex gap-2">
              <select value={ticket.duplicate_of || ""} onChange={(event) => onPatch([ticket.id], { duplicate_of: event.target.value || null })} className={control}>
                <option value="">{t("admin.feedback.notDuplicate")}</option>
                {ticket.duplicate_of && !otherTickets.some((item) => item.id === ticket.duplicate_of) && <option value={ticket.duplicate_of}>#{shortId(ticket.duplicate_of)}</option>}
                {otherTickets.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{shortId(item.id)} · {item.user_id === ticket.user_id ? "👤 " : ""}{ticketTitle(item).slice(0, 60)}
                  </option>
                ))}
              </select>
              {ticket.duplicate_of && (
                <button type="button" onClick={() => onSelect(ticket.duplicate_of)} className="shrink-0 rounded-xl border border-slate-200 px-2.5 text-xs font-black dark:border-white/10">{t("admin.feedback.open")} →</button>
              )}
            </span>
          </label>
        </div>

        {ticket.rating && (
          <div className="rounded-2xl bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
            <Stars value={ticket.rating} size="text-base" label={t("feedback.ratedLabel", { count: ticket.rating })} />
            {ticket.rating_comment && <p className="mt-1 whitespace-pre-wrap">“{ticket.rating_comment}”</p>}
          </div>
        )}

        <section aria-label={t("admin.feedback.conversation")}>
          {loading ? <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" /> : <MessageThread messages={thread} viewer="admin" onDelete={deleteNote} />}
        </section>

        {events.length > 0 && (
          <details className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
            <summary className="cursor-pointer font-black uppercase text-slate-500">{t("feedback.auditHistory")} · {events.length}</summary>
            <ol className="mt-2 space-y-1.5 border-l-2 border-slate-200 pl-3 dark:border-white/10">
              {events.map((event) => (
                <li key={event.id}>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{personLabel(people, event.actor_id, t("feedback.system"))}</span>
                  <span className="text-slate-500"> · {timeAgo(event.created_at, i18n.language)}</span>
                  <p className="text-slate-600 dark:text-slate-300">{describeEvent(event, t, people)}</p>
                </li>
              ))}
            </ol>
          </details>
        )}

        <button type="button" onClick={() => onDelete([ticket.id])} className="text-xs font-bold text-rose-600 underline dark:text-rose-300">
          🗑 {t("admin.feedback.deleteTicket")}
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(false);
        }}
        className="space-y-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center gap-1" role="tablist">
          {[
            ["reply", `💬 ${t("admin.feedback.replyTab")}`],
            ["note", `🔒 ${t("admin.feedback.noteTab")}`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={`rounded-lg px-3 py-1 text-xs font-black ${mode === key ? (key === "note" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100" : "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-100") : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-semibold text-slate-400">{mode === "reply" ? t("admin.feedback.replyHint") : t("admin.feedback.noteHint")}</span>
        </div>
        {mode === "reply" && ticket.ai_draft && !text.trim() && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-400/20 dark:bg-violet-500/10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wide text-violet-700 dark:text-violet-200">🤖 {t("admin.feedback.ai.draft")}</span>
              <button type="button" onClick={() => insertSaved(ticket.ai_draft)} className="ml-auto rounded-lg bg-violet-600 px-3 py-1 text-xs font-black text-white">
                {t("admin.feedback.ai.useDraft")}
              </button>
            </div>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{ticket.ai_draft}</p>
          </div>
        )}
        <textarea
          ref={textRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              send(false);
            }
          }}
          maxLength={MESSAGE_MAX}
          rows={3}
          placeholder={mode === "reply" ? (finished ? t("admin.feedback.replyFinished") : t("feedback.writeReply")) : t("admin.feedback.notePlaceholder")}
          className={`${control} resize-y !text-[15px] !font-normal leading-6 ${mode === "note" ? "!border-amber-300 !bg-amber-50 dark:!bg-amber-500/10" : ""}`}
        />
        {mode === "reply" && <SavedReplies replies={savedReplies} currentText={text} onInsert={insertSaved} onChanged={onSavedRepliesChanged} />}
        {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={sending || !text.trim()} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">
            {sending ? t("common.loading") : mode === "note" ? t("admin.feedback.addNote") : t("feedback.send")}
          </button>
          {mode === "reply" && !finished && (
            <button type="button" disabled={sending || !text.trim()} onClick={() => send(true)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40">
              {t("admin.feedback.sendResolve")}
            </button>
          )}
          <span className="ml-auto hidden self-center text-[11px] font-semibold text-slate-400 sm:inline">Ctrl + Enter</span>
        </div>
      </form>
    </article>
  );
}

// Turns the feedback assistant (api/feedback-ai.js) on or off for everyone.
function AiSwitch() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "feedback_ai_enabled")
      .maybeSingle()
      .then(({ data }) => setEnabled(data ? data.value !== false : true));
  }, []);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({ value: next, updated_at: new Date().toISOString() }).eq("key", "feedback_ai_enabled");
    setSaving(false);
    if (!error) setEnabled(next);
  }

  if (enabled === null) return <span className="ml-auto" />;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={saving}
      onClick={toggle}
      title={t("admin.feedback.ai.switchHint")}
      className={`ml-auto flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
        enabled ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100" : "border-slate-300 text-slate-500 dark:border-white/15"
      }`}
    >
      <span aria-hidden="true" className={`relative h-4 w-7 rounded-full transition ${enabled ? "bg-violet-600" : "bg-slate-300 dark:bg-white/20"}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${enabled ? "left-3.5" : "left-0.5"}`} />
      </span>
      🤖 {t("admin.feedback.ai.switch")}
    </button>
  );
}

// --- Page ------------------------------------------------------------------

export default function AdminFeedbackPage() {
  const { t, i18n } = useTranslation();
  const { currentUserId } = useAdminContext();
  const [params, setParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [people, setPeople] = useState(new Map());
  const [savedReplies, setSavedReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("active");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState("activity");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(new Set());
  const [showInsights, setShowInsights] = useState(false);
  const selectedId = params.get("ticket");
  const reporterFilter = params.get("reporter");

  const loadSavedReplies = useCallback(async () => {
    const { data } = await supabase.from("feedback_saved_replies").select("*").order("title");
    setSavedReplies(data || []);
  }, []);

  const load = useCallback(async () => {
    setError("");
    const [{ data, error: ticketError }, { data: privateData }] = await Promise.all([
      supabase.from("feedback_tickets").select("*").order("last_message_at", { ascending: false }).limit(2000),
      supabase.from("feedback_ticket_admin").select("ticket_id, assigned_to"),
    ]);
    if (ticketError) {
      setError(t("feedback.loadError"));
      setLoading(false);
      return;
    }
    const assigned = new Map((privateData || []).map((row) => [row.ticket_id, row.assigned_to]));
    const rows = (data || []).map((ticket) => ({ ...ticket, assigned_to: assigned.get(ticket.id) || null }));
    setTickets(rows);
    setLoading(false);
    const ids = [...new Set(rows.map((ticket) => ticket.user_id))];
    const { data: peopleData } = await supabase.rpc("feedback_people", { p_ids: ids });
    if (peopleData) setPeople(new Map(peopleData.map((person) => [person.user_id, person])));
  }, [t]);

  useEffect(() => {
    load();
    loadSavedReplies();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load, loadSavedReplies]);

  const admins = useMemo(() => [...people.values()].filter((person) => person.is_admin).sort((a, b) => (a.email || "").localeCompare(b.email || "")), [people]);
  const stats = useStats(tickets);

  const counts = useMemo(() => Object.fromEntries(VIEWS.map((key) => [key, tickets.filter((ticket) => matchesView(ticket, key)).length])), [tickets]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^#/, "");
    const list = tickets.filter((ticket) => {
      if (!matchesView(ticket, view)) return false;
      if (category !== "all" && ticket.category !== category) return false;
      if (priority !== "all" && ticket.priority !== priority) return false;
      if (assignee === "me" && ticket.assigned_to !== currentUserId) return false;
      if (assignee === "none" && ticket.assigned_to) return false;
      if (!["all", "me", "none"].includes(assignee) && ticket.assigned_to !== assignee) return false;
      if (reporterFilter && ticket.user_id !== reporterFilter) return false;
      if (!needle) return true;
      const person = people.get(ticket.user_id);
      return `${ticket.subject} ${ticket.message} ${ticket.route} ${(ticket.tags || []).join(" ")} ${ticket.id} ${person?.email || ""} ${person?.name || ""}`
        .toLowerCase()
        .includes(needle);
    });
    const time = (value) => new Date(value).getTime();
    const sorters = {
      activity: (a, b) => time(b.last_message_at) - time(a.last_message_at),
      newest: (a, b) => time(b.created_at) - time(a.created_at),
      oldest: (a, b) => time(a.created_at) - time(b.created_at),
      priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || time(b.last_message_at) - time(a.last_message_at),
      waiting: (a, b) => waitingMs(b) - waitingMs(a),
    };
    return list.sort(sorters[sort]);
  }, [tickets, view, category, priority, assignee, reporterFilter, query, sort, people, currentUserId]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) || null;
  const selectedIndex = visible.findIndex((ticket) => ticket.id === selectedId);
  const prevId = selectedIndex > 0 ? visible[selectedIndex - 1].id : null;
  const nextId = selectedIndex >= 0 && selectedIndex < visible.length - 1 ? visible[selectedIndex + 1].id : null;

  const updateParams = useCallback(
    (changes) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
        return next;
      });
    },
    [setParams],
  );
  const select = useCallback((id) => updateParams({ ticket: id }), [updateParams]);

  // Opening a ticket marks it read for the team.
  useEffect(() => {
    if (!selected?.admin_unread) return;
    setTickets((current) => current.map((ticket) => (ticket.id === selected.id ? { ...ticket, admin_unread: false } : ticket)));
    supabase.from("feedback_tickets").update({ admin_unread: false }).eq("id", selected.id).then(notifyUnreadChanged);
  }, [selected?.id, selected?.admin_unread]);

  // J / K move through the list, Esc closes the ticket.
  useEffect(() => {
    const onKey = (event) => {
      if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "j" || key === "k") {
        const target = key === "j" ? (selectedIndex < 0 ? visible[0]?.id : nextId) : prevId;
        if (target) select(target);
      } else if (key === "escape" && selectedId) {
        select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, selectedIndex, nextId, prevId, selectedId, select]);

  async function patch(ids, fields, { reloadOnly = false } = {}) {
    if (!reloadOnly && Object.keys(fields).length) {
      setTickets((current) => current.map((ticket) => (ids.includes(ticket.id) ? { ...ticket, ...fields } : ticket)));
      const { error: updateError } = await supabase.from("feedback_tickets").update(fields).in("id", ids);
      if (updateError) setError(t("feedback.adminSaveError"));
      notifyUnreadChanged();
    }
    await load();
  }

  async function assign(ids, userId) {
    setTickets((current) => current.map((ticket) => (ids.includes(ticket.id) ? { ...ticket, assigned_to: userId } : ticket)));
    const { error: assignError } = await supabase
      .from("feedback_ticket_admin")
      .upsert(ids.map((id) => ({ ticket_id: id, assigned_to: userId })), { onConflict: "ticket_id" });
    if (assignError) setError(t("feedback.adminSaveError"));
    await load();
  }

  async function remove(ids) {
    if (!window.confirm(t("admin.feedback.confirmDelete", { count: ids.length }))) return;
    const { error: deleteError } = await supabase.from("feedback_tickets").delete().in("id", ids);
    if (deleteError) setError(t("feedback.adminSaveError"));
    if (ids.includes(selectedId)) select(null);
    setChecked(new Set());
    notifyUnreadChanged();
    await load();
  }

  const toggleCheck = (id) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const checkedIds = [...checked].filter((id) => tickets.some((ticket) => ticket.id === id));
  const allVisibleChecked = visible.length > 0 && visible.every((ticket) => checked.has(ticket.id));
  const reporter = reporterFilter ? people.get(reporterFilter) : null;
  const filtersActive = category !== "all" || priority !== "all" || assignee !== "all" || query || reporterFilter;
  const selectClass = "rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold dark:border-white/10 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <section aria-label={t("admin.summary")} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <button type="button" onClick={() => setView("needs_reply")} className="text-left">
          <StatTile tone={stats.overdue ? "rose" : "sky"} label={t("admin.feedback.stat.needsReply")} value={stats.needsReply} hint={t("admin.feedback.stat.overdue", { count: stats.overdue })} />
        </button>
        <button type="button" onClick={() => { setView("active"); setAssignee("none"); }} className="text-left">
          <StatTile tone="amber" label={t("admin.feedback.stat.unassigned")} value={stats.unassigned} hint={t("admin.feedback.stat.important", { count: stats.important })} />
        </button>
        <StatTile tone="violet" label={t("admin.feedback.stat.new7")} value={stats.new7} hint={t("admin.feedback.stat.total", { count: tickets.length })} />
        <StatTile label={t("admin.feedback.stat.firstResponse")} value={stats.firstResponse == null ? "—" : formatDuration(stats.firstResponse, t)} hint={t("admin.feedback.stat.last30")} />
        <StatTile tone="emerald" label={t("admin.feedback.stat.resolution")} value={stats.resolution == null ? "—" : formatDuration(stats.resolution, t)} hint={t("admin.feedback.stat.last30")} />
        <StatTile tone="amber" label={t("admin.feedback.stat.rating")} value={stats.rating == null ? "—" : `★ ${stats.rating.toFixed(1)}`} hint={t("admin.feedback.stat.ratings", { count: stats.ratedCount })} />
      </section>

      <div className="flex items-center gap-3">
        <button type="button" aria-expanded={showInsights} onClick={() => setShowInsights((value) => !value)} className="text-sm font-bold text-sky-600 dark:text-sky-300">
          {showInsights ? "▾" : "▸"} {t("admin.feedback.insights")}
        </button>
        <AiSwitch />
        <button type="button" onClick={load} className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold dark:border-white/15">
          ↻ {t("common.refresh")}
        </button>
      </div>
      {showInsights && <Insights stats={stats} onTag={(tag) => { setQuery(`#${tag}`); setView("all"); }} />}

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {VIEWS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${
              view === key ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300"
            }`}
          >
            {t(`admin.feedback.view.${key}`)} <span className="opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.feedback.search")}
          aria-label={t("admin.feedback.search")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 md:w-72"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t("admin.feedback.category")} className={selectClass}>
          <option value="all">{t("admin.feedback.allCategories")}</option>
          {CATEGORIES.map(({ id, icon }) => <option key={id} value={id}>{icon} {t(`feedback.category.${id}`)}</option>)}
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label={t("feedback.priority")} className={selectClass}>
          <option value="all">{t("admin.feedback.allPriorities")}</option>
          {PRIORITIES.map((value) => <option key={value} value={value}>{t(`feedback.priority.${value}`)}</option>)}
        </select>
        <select value={assignee} onChange={(event) => setAssignee(event.target.value)} aria-label={t("admin.feedback.assignee")} className={selectClass}>
          <option value="all">{t("admin.feedback.anyAssignee")}</option>
          <option value="me">{t("admin.feedback.mine")}</option>
          <option value="none">{t("admin.feedback.unassigned")}</option>
          {admins.filter((admin) => admin.user_id !== currentUserId).map((admin) => <option key={admin.user_id} value={admin.user_id}>{admin.name || admin.email}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={t("admin.feedback.sort")} className={selectClass}>
          {SORTS.map((value) => <option key={value} value={value}>{t(`admin.feedback.sortBy.${value}`)}</option>)}
        </select>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setPriority("all");
              setAssignee("all");
              setQuery("");
              updateParams({ reporter: null });
            }}
            className="text-xs font-bold text-slate-500 underline"
          >
            {t("admin.feedback.clearFilters")}
          </button>
        )}
      </div>

      {reporterFilter && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
          👤 {t("admin.feedback.onlyFrom", { name: reporter?.email || shortId(reporterFilter) })}
          <button type="button" onClick={() => updateParams({ reporter: null })} className="ml-auto text-xs font-black underline">{t("admin.feedback.showAll")}</button>
        </p>
      )}

      {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}

      {checkedIds.length > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-300 bg-white/95 p-2.5 shadow-lg backdrop-blur dark:border-sky-400/30 dark:bg-slate-900/95">
          <span className="px-1 text-sm font-black">{t("admin.feedback.selected", { count: checkedIds.length })}</span>
          <select value="" onChange={(event) => event.target.value && patch(checkedIds, { status: event.target.value })} aria-label={t("feedback.statusLabel")} className={selectClass}>
            <option value="">{t("admin.feedback.setStatus")}</option>
            {STATUSES.map((value) => <option key={value} value={value}>{t(`feedback.status.${value}`)}</option>)}
          </select>
          <select value="" onChange={(event) => event.target.value && patch(checkedIds, { priority: event.target.value })} aria-label={t("feedback.priority")} className={selectClass}>
            <option value="">{t("admin.feedback.setPriority")}</option>
            {PRIORITIES.map((value) => <option key={value} value={value}>{t(`feedback.priority.${value}`)}</option>)}
          </select>
          <button type="button" onClick={() => assign(checkedIds, currentUserId)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black dark:border-white/10">{t("admin.feedback.takeIt")}</button>
          <button type="button" onClick={() => patch(checkedIds, { admin_unread: false })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black dark:border-white/10">{t("admin.feedback.markRead")}</button>
          <button type="button" onClick={() => remove(checkedIds)} className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-black text-rose-600 dark:border-rose-400/30 dark:text-rose-300">{t("feedback.delete")}</button>
          <button type="button" onClick={() => setChecked(new Set())} className="ml-auto px-2 text-xs font-bold text-slate-500 underline">{t("admin.feedback.clearSelection")}</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className={selected ? "hidden lg:block" : ""}>
          {visible.length > 0 && (
            <label className="mb-2 flex items-center gap-2 px-1 text-xs font-bold text-slate-500">
              <input
                type="checkbox"
                checked={allVisibleChecked}
                onChange={() => setChecked(allVisibleChecked ? new Set() : new Set(visible.map((ticket) => ticket.id)))}
                className="h-4 w-4 accent-sky-600"
              />
              {t("admin.feedback.selectAll", { count: visible.length })}
              <span className="ml-auto hidden font-semibold text-slate-400 xl:inline">J / K · Esc</span>
            </label>
          )}
          <ul className="space-y-2">
            {loading && <li className="h-40 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
            {!loading && !visible.length && (
              <li className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/15">
                {view === "needs_reply" && !filtersActive ? `🎉 ${t("admin.feedback.inboxZero")}` : t("feedback.noneInFilter")}
              </li>
            )}
            {visible.map((ticket) => {
              const person = people.get(ticket.user_id);
              const waiting = waitingMs(ticket);
              return (
                <li key={ticket.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checked.has(ticket.id)}
                    onChange={() => toggleCheck(ticket.id)}
                    aria-label={ticketTitle(ticket)}
                    className="mt-4 h-4 w-4 shrink-0 accent-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => select(ticket.id)}
                    className={`min-w-0 flex-1 rounded-2xl border p-3 text-left transition ${
                      ticket.id === selectedId
                        ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                        : "border-slate-200 bg-white/80 hover:border-sky-300 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {ticket.admin_unread && <UnreadDot label={t("admin.feedback.unread")} />}
                      <StatusPill status={ticket.status} />
                      {ticket.priority !== "normal" && <PriorityPill priority={ticket.priority} />}
                      <span className="truncate">{CATEGORIES.find((item) => item.id === ticket.category)?.icon} {person?.email || shortId(ticket.user_id)}</span>
                      <span className="ml-auto shrink-0">{timeAgo(ticket.last_message_at, i18n.language)}</span>
                    </span>
                    <span className={`mt-1.5 line-clamp-2 block text-sm leading-6 ${ticket.admin_unread ? "font-black" : "font-semibold"}`}>{ticketTitle(ticket)}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                      {waiting > 0 ? (
                        <span className={waiting > OVERDUE_MS ? "text-rose-600 dark:text-rose-300" : "text-amber-600 dark:text-amber-300"}>
                          ⏱ {t("admin.feedback.waiting", { time: formatDuration(waiting, t) })}
                        </span>
                      ) : ticket.last_message_by === "admin" && ACTIVE.has(ticket.status) ? (
                        <span className="text-emerald-600 dark:text-emerald-300">✓ {t("admin.feedback.replied")}</span>
                      ) : null}
                      {ticket.ai_state && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">🤖 {t(`admin.feedback.ai.${ticket.ai_state}`)}</span>}
                      {ticket.assigned_to && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">👤 {ticket.assigned_to === currentUserId ? t("admin.feedback.me") : personLabel(people, ticket.assigned_to)}</span>}
                      {(ticket.tags || []).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-white/10 dark:text-slate-300">#{tag}</span>)}
                      {ticket.rating && <span className="text-amber-500">★ {ticket.rating}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={selected ? "" : "hidden lg:block"}>
          {selected ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col">
              <TicketDetail
                key={selected.id}
                ticket={selected}
                tickets={tickets}
                people={people}
                admins={admins}
                currentUserId={currentUserId}
                savedReplies={savedReplies}
                onSavedRepliesChanged={loadSavedReplies}
                onPatch={patch}
                onAssign={assign}
                onDelete={remove}
                onSelect={select}
                onFilterReporter={(id) => updateParams({ reporter: id, ticket: null })}
                onBack={() => select(null)}
                prevId={prevId}
                nextId={nextId}
              />
            </div>
          ) : (
            <div className="grid h-60 place-items-center rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500 dark:border-white/15">
              {t("admin.feedback.pick")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
