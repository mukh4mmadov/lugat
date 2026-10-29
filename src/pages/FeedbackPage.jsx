import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { CategoryLabel, MessageThread, Stars, StatusPill, UnreadDot } from "../components/FeedbackUI";
import { useAuth } from "../hooks/useAuth";
import { formatDate, timeAgo } from "../lib/dates";
import {
  ACTIVE,
  CATEGORIES,
  MESSAGE_MAX,
  MESSAGE_MIN,
  SUBJECT_MAX,
  errorKey,
  notifyUnreadChanged,
  readLastRoute,
  routeContext,
  shortBrowser,
  shortId,
  ticketTitle,
} from "../lib/feedback";
import { supabase } from "../lib/supabase";

const DRAFT_KEY = "k-talim:feedback-draft";
const LIST_COLUMNS = "id, category, subject, message, status, user_unread, last_message_at, last_message_by, created_at, rating";

function readDraft() {
  try {
    return JSON.parse(window.localStorage.getItem(DRAFT_KEY)) || {};
  } catch {
    return {};
  }
}

function writeDraft(draft) {
  try {
    if (draft) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // The draft is only a convenience.
  }
}

function Notice({ tone = "error", children }) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
    info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-100",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${tones[tone]}`}>
      {children}
    </p>
  );
}

function NewReportForm({ onCreated }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [draft] = useState(readDraft);
  const [category, setCategory] = useState(draft.category || "");
  const [subject, setSubject] = useState(draft.subject || "");
  const [message, setMessage] = useState(draft.message || "");
  const [attachDevice, setAttachDevice] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const route = location.state?.from || readLastRoute();
  const { lessonId, exerciseMode } = routeContext(route);
  const browser = navigator.userAgent.slice(0, 500);
  const screen = `${window.innerWidth}×${window.innerHeight}`;
  const length = message.trim().length;

  useEffect(() => {
    writeDraft(category || subject || message ? { category, subject, message } : null);
  }, [category, subject, message]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!category) {
      setError(t("feedback.pickCategory"));
      return;
    }
    if (length < MESSAGE_MIN || length > MESSAGE_MAX) {
      setError(t("feedback.messageLength"));
      return;
    }
    setSending(true);
    const { data, error: submitError } = await supabase.rpc("create_feedback_ticket", {
      p_category: category,
      p_subject: subject.trim(),
      p_message: message.trim(),
      p_route: route,
      p_lesson_id: lessonId,
      p_exercise_mode: exerciseMode,
      p_app_version: import.meta.env.VITE_APP_VERSION || "web",
      p_browser: attachDevice ? browser : null,
      p_language: i18n.language,
      p_screen: attachDevice ? screen : null,
    });
    setSending(false);
    if (submitError) {
      setError(t(errorKey(submitError)));
      return;
    }
    writeDraft(null);
    onCreated(data);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-black">1. {t("feedback.whatAbout")}</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map(({ id, icon }) => (
            <label
              key={id}
              className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3 transition focus-within:ring-2 focus-within:ring-sky-400 ${
                category === id
                  ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                  : "border-slate-200 bg-white/70 hover:border-sky-300 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <input type="radio" name="category" value={id} checked={category === id} onChange={() => setCategory(id)} className="sr-only" />
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <span className="text-sm font-black">{t(`feedback.category.${id}`)}</span>
              <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">{t(`feedback.categoryHint.${id}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="feedback-subject" className="block text-sm font-black">
          2. {t("feedback.subject")} <span className="font-semibold text-slate-400">({t("feedback.optional")})</span>
        </label>
        <input
          id="feedback-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={SUBJECT_MAX}
          placeholder={t("feedback.subjectPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-semibold outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/10"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback-message" className="block text-sm font-black">3. {t("feedback.message")}</label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={MESSAGE_MAX}
          rows={6}
          placeholder={t(`feedback.placeholder.${category || "other"}`)}
          aria-describedby="feedback-message-count"
          className="w-full resize-y rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base leading-7 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/10"
        />
        <div id="feedback-message-count" className="flex justify-between text-xs font-semibold text-slate-500">
          <span>{length > 0 && length < MESSAGE_MIN ? t("feedback.minChars", { count: MESSAGE_MIN - length }) : length ? t("feedback.draftSaved") : ""}</span>
          <span className="tabular-nums">{message.length}/{MESSAGE_MAX}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
        <p className="font-black">{t("feedback.attached")}</p>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
          <li>
            📍 {t("feedback.page")}: <span className="font-mono text-xs">{route}</span>
            {lessonId && ` · ${t("card.lesson", { lesson: lessonId })}`}
            {exerciseMode && ` · ${exerciseMode}`}
          </li>
          {attachDevice && <li>💻 {shortBrowser(browser)} · {screen}</li>}
        </ul>
        <label className="mt-3 flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={attachDevice} onChange={(event) => setAttachDevice(event.target.checked)} className="h-4 w-4 accent-sky-600" />
          {t("feedback.attachDevice")}
        </label>
      </div>

      {error && <Notice>{error}</Notice>}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-slate-950 sm:w-auto"
      >
        {sending ? t("common.loading") : t("feedback.submit")}
      </button>
    </form>
  );
}

function TicketList({ tickets, loading, onNew }) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState("all");
  const visible = tickets.filter((ticket) => filter === "all" || (filter === "active") === ACTIVE.has(ticket.status));

  if (loading) return <div className="h-40 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />;
  if (!tickets.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15">
        <p className="text-4xl" aria-hidden="true">📭</p>
        <p className="mt-2 font-bold">{t("feedback.noTickets")}</p>
        <button type="button" onClick={onNew} className="mt-4 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white">
          {t("feedback.newReport")}
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["all", "active", "finished"].map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${filter === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
          >
            {t(`feedback.filter.${key}`)}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map((ticket) => (
          <li key={ticket.id}>
            <Link
              to={`/feedback/${ticket.id}`}
              className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-sky-300 ${
                ticket.user_unread ? "border-sky-300 bg-sky-50/80 dark:border-sky-400/40 dark:bg-sky-500/10" : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <StatusPill status={ticket.status} />
                <CategoryLabel category={ticket.category} />
                {ticket.user_unread && (
                  <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-300">
                    <UnreadDot label={t("feedback.newReply")} /> {t("feedback.newReply")}
                  </span>
                )}
                <span className="ml-auto">{timeAgo(ticket.last_message_at || ticket.created_at, i18n.language)}</span>
              </span>
              <span className={`mt-2 block text-[15px] ${ticket.user_unread ? "font-black" : "font-bold"}`}>{ticketTitle(ticket)}</span>
              <span className="mt-1 block text-xs text-slate-500">
                {ticket.last_message_by === "admin" ? t("feedback.lastFromTeam") : t("feedback.lastFromYou")} · #{shortId(ticket.id)}
              </span>
            </Link>
          </li>
        ))}
        {!visible.length && <li className="p-6 text-center text-sm text-slate-500">{t("feedback.noneInFilter")}</li>}
      </ul>
    </div>
  );
}

function FeedbackHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "mine" ? "mine" : "new";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("feedback_tickets")
      .select(LIST_COLUMNS)
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });
    if (loadError) setError(t("feedback.loadError"));
    else setTickets(data || []);
    setLoading(false);
  }, [user.id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const unread = tickets.filter((ticket) => ticket.user_unread).length;
  const active = tickets.filter((ticket) => ACTIVE.has(ticket.status)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-black md:text-3xl">{t("feedback.title")}</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t("feedback.subtitle")}</p>
      </header>

      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-white/70 p-1 dark:bg-white/5">
        {[
          ["new", `✍️ ${t("feedback.newReport")}`],
          ["mine", `📬 ${t("feedback.myTickets")}`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams(key === "mine" ? { tab: "mine" } : {}, { replace: true })}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition ${tab === key ? "bg-slate-950 text-white shadow dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"}`}
          >
            {label}
            {key === "mine" && tickets.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${unread ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-white/15 dark:text-slate-200"}`}>
                {unread ? t("feedback.unreadCount", { count: unread }) : active || tickets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <Notice>{error}</Notice>}

      <GlassCard className="!p-5 md:!p-7">
        {tab === "new" ? (
          <NewReportForm onCreated={(id) => navigate(`/feedback/${id}`, { state: { created: true } })} />
        ) : (
          <TicketList tickets={tickets} loading={loading} onNew={() => setParams({}, { replace: true })} />
        )}
      </GlassCard>
    </div>
  );
}

function StatusTracker({ status }) {
  const { t } = useTranslation();
  const steps = ["open", "in_progress", "resolved"];
  const current = status === "closed" ? 2 : steps.indexOf(status);
  return (
    <ol className="flex items-center gap-1 text-[11px] font-black sm:text-xs">
      {steps.map((step, index) => (
        <li key={step} className="flex flex-1 items-center gap-1">
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
              index <= current ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10"
            }`}
          >
            {index < current || (index === 2 && current === 2) ? "✓" : index + 1}
          </span>
          <span className={index <= current ? "" : "text-slate-400"}>
            {index === 2 && status === "closed" ? t("feedback.status.closed") : t(`feedback.track.${step}`)}
          </span>
          {index < 2 && <span className={`mx-1 h-0.5 flex-1 rounded ${index < current ? "bg-sky-600" : "bg-slate-200 dark:bg-white/10"}`} />}
        </li>
      ))}
    </ol>
  );
}

function RatingCard({ ticket, onRated }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (ticket.rating) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
        <Stars value={ticket.rating} size="text-lg" label={t("feedback.ratedLabel", { count: ticket.rating })} />
        {t("feedback.thanksRating")}
      </div>
    );
  }

  async function submit() {
    setSaving(true);
    setError("");
    const { error: rateError } = await supabase.rpc("rate_feedback_ticket", { p_ticket_id: ticket.id, p_rating: rating, p_comment: comment });
    setSaving(false);
    if (rateError) setError(t(errorKey(rateError)));
    else onRated();
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-400/20 dark:bg-amber-500/10">
      <p className="font-black">{t("feedback.rateTitle")}</p>
      <div className="mt-2">
        <Stars value={rating} onChange={setRating} label={t("feedback.rateTitle")} />
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={2}
            placeholder={t("feedback.rateComment")}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900"
          />
          {error && <p className="mt-2 text-sm font-bold text-rose-600">{error}</p>}
          <button type="button" disabled={saving} onClick={submit} className="mt-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
            {saving ? t("common.loading") : t("feedback.sendRating")}
          </button>
        </>
      )}
    </div>
  );
}

function TicketView({ ticketId }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created] = useState(Boolean(location.state?.created));

  const load = useCallback(async () => {
    const [{ data, error: ticketError }, { data: messageData }] = await Promise.all([
      supabase.from("feedback_tickets").select("*").eq("id", ticketId).maybeSingle(),
      supabase.from("feedback_messages").select("id, author_role, body, created_at").eq("ticket_id", ticketId).order("created_at"),
    ]);
    if (ticketError) setError(t("feedback.loadError"));
    setTicket(data || null);
    setMessages(messageData || []);
    setLoading(false);
    if (data?.user_unread) {
      await supabase.rpc("mark_feedback_ticket_read", { p_ticket_id: ticketId });
      notifyUnreadChanged();
    }
  }, [ticketId, t]);

  useEffect(() => {
    load();
    // Pick up team replies when the learner comes back to the tab.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const thread = useMemo(() => {
    if (!ticket) return [];
    const you = t("feedback.you");
    const team = t("feedback.team");
    return [
      { id: "first", role: "user", body: ticket.message, created_at: ticket.created_at, author: you },
      ...messages.map((message) => ({ ...message, role: message.author_role, author: message.author_role === "admin" ? team : you })),
    ];
  }, [ticket, messages, t]);

  async function send(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    setError("");
    const { error: replyError } = await supabase.rpc("reply_feedback_ticket", { p_ticket_id: ticketId, p_body: reply.trim() });
    setBusy(false);
    if (replyError) {
      setError(t(errorKey(replyError)));
      return;
    }
    setReply("");
    load();
  }

  async function markSolved() {
    setBusy(true);
    setError("");
    const { error: closeError } = await supabase.rpc("close_feedback_ticket", { p_ticket_id: ticketId });
    setBusy(false);
    if (closeError) setError(t(errorKey(closeError)));
    else load();
  }

  const back = (
    <Link to="/feedback?tab=mine" className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 dark:text-sky-300">
      ← {t("feedback.myTickets")}
    </Link>
  );

  if (loading) return <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />;
  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {back}
        <GlassCard className="text-center">
          <p className="font-bold">{error || t("feedback.notFound")}</p>
        </GlassCard>
      </div>
    );
  }

  const finished = !ACTIVE.has(ticket.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {back}
      {created && <Notice tone="success">✓ {t("feedback.submitSuccess")}</Notice>}

      <GlassCard className="!p-5 md:!p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <StatusPill status={ticket.status} />
          <CategoryLabel category={ticket.category} />
          <span className="ml-auto font-mono">#{shortId(ticket.id)}</span>
        </div>
        <h1 className="mt-3 text-xl font-black leading-snug md:text-2xl">{ticketTitle(ticket)}</h1>
        <p className="mt-1 text-xs font-semibold text-slate-500">{t("feedback.sentOn", { date: formatDate(ticket.created_at, i18n.language, { time: true }) })}</p>
        <div className="mt-5">
          <StatusTracker status={ticket.status} />
        </div>
        {!finished && ticket.last_message_by !== "admin" && (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">⏳ {t("feedback.waitingTeam")}</p>
        )}
        {ticket.duplicate_of && <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">🔗 {t("feedback.mergedNote")}</p>}
      </GlassCard>

      <GlassCard className="!p-4 md:!p-6">
        <MessageThread messages={thread} viewer="user" />

        {finished && (
          <div className="mt-5">
            <RatingCard ticket={ticket} onRated={load} />
          </div>
        )}

        <form onSubmit={send} className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
          <label htmlFor="feedback-reply" className="sr-only">{t("feedback.writeReply")}</label>
          <textarea
            id="feedback-reply"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) send(event);
            }}
            maxLength={MESSAGE_MAX}
            rows={3}
            placeholder={finished ? t("feedback.replyReopens") : t("feedback.writeReply")}
            className="w-full resize-y rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] leading-6 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/10"
          />
          {error && <p role="alert" className="mt-2 text-sm font-bold text-rose-600">{error}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="submit" disabled={busy || !reply.trim()} className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">
              {busy ? t("common.loading") : finished ? t("feedback.sendAndReopen") : t("feedback.send")}
            </button>
            {!finished && (
              <button type="button" disabled={busy} onClick={markSolved} className="rounded-2xl border border-emerald-300 px-4 py-2.5 text-sm font-black text-emerald-700 disabled:opacity-40 dark:border-emerald-400/30 dark:text-emerald-300">
                ✓ {t("feedback.markSolved")}
              </button>
            )}
            <span className="ml-auto hidden text-[11px] font-semibold text-slate-400 sm:inline">Ctrl + Enter</span>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default function FeedbackPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ticketId } = useParams();

  if (!user) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <p className="text-4xl" aria-hidden="true">💬</p>
        <h1 className="mt-2 text-2xl font-black">{t("feedback.title")}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{t("feedback.loginRequired")}</p>
        <Link to="/login" className="mt-5 inline-flex rounded-2xl bg-sky-600 px-5 py-3 font-black text-white">
          {t("nav.login")}
        </Link>
      </GlassCard>
    );
  }

  return ticketId ? <TicketView key={ticketId} ticketId={ticketId} /> : <FeedbackHome />;
}
