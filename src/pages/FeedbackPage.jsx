import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const categories = ["bug", "content", "audio", "progress", "other"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedbackPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error: loadError } = await supabase
      .from("feedback_tickets")
      .select("id, category, message, status, response, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (loadError) {
      setError(t("feedback.loadError"));
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }, [user, t]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
      setError(t("feedback.messageLength"));
      return;
    }
    setSending(true);
    const route = location.state?.from || "/";
    const lessonId = route.match(/\/(?:lesson|study)\/(\d+)/)?.[1] || null;
    const exerciseMode =
      route.match(/\/(flashcards|listening|quiz|writing)$/)?.[1] || null;
    const { error: submitError } = await supabase
      .from("feedback_tickets")
      .insert({
        user_id: user.id,
        category,
        message: trimmedMessage,
        route,
        lesson_id: lessonId,
        exercise_mode: exerciseMode,
        app_version: import.meta.env.VITE_APP_VERSION || "web",
        browser: navigator.userAgent.slice(0, 500),
      });
    setSending(false);
    if (submitError) {
      setError(t("feedback.submitError"));
      return;
    }
    setMessage("");
    setNotice(t("feedback.submitSuccess"));
    await loadTickets();
  }

  async function reopenTicket(ticketId) {
    setError("");
    const { error: reopenError } = await supabase.rpc(
      "reopen_feedback_ticket",
      { ticket_id: ticketId },
    );
    if (reopenError) {
      setError(t("feedback.submitError"));
      return;
    }
    await loadTickets();
  }

  if (!user) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-black">{t("feedback.title")}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          {t("feedback.loginRequired")}
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex rounded-2xl bg-sky-600 px-5 py-3 font-black text-white"
        >
          {t("nav.login")}
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard>
        <h1 className="text-2xl font-black">{t("feedback.title")}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("feedback.subtitle")}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label
            className="block text-sm font-bold"
            htmlFor="feedback-category"
          >
            {t("feedback.category")}
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="premium-input"
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {t(`feedback.category.${value}`)}
              </option>
            ))}
          </select>
          <label className="block text-sm font-bold" htmlFor="feedback-message">
            {t("feedback.message")}
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            minLength={10}
            maxLength={5000}
            required
            rows={6}
            className="premium-input resize-y"
            aria-describedby="feedback-message-count"
          />
          <div
            id="feedback-message-count"
            className="text-right text-xs text-slate-500"
          >
            {message.length}/5000
          </div>
          {error && (
            <p role="alert" className="text-sm font-bold text-rose-600">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm font-bold text-emerald-600">
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="action-btn bg-slate-950 text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            {sending ? t("common.loading") : t("feedback.submit")}
          </button>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-black">{t("feedback.myTickets")}</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">{t("common.loading")}</p>
        ) : tickets.length ? (
          <div className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {t(`feedback.category.${ticket.category}`)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/10">
                    {t(`feedback.status.${ticket.status}`)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    #{ticket.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="whitespace-pre-wrap text-sm">
                    {ticket.message}
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                {ticket.response && (
                  <div className="mt-3 rounded-xl border-l-4 border-sky-500 bg-sky-50 p-3 text-sm dark:bg-sky-500/10">
                    <p className="font-bold">{t("feedback.adminResponse")}</p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {ticket.response}
                    </p>
                  </div>
                )}
                {["resolved", "closed"].includes(ticket.status) && (
                  <button
                    type="button"
                    onClick={() => reopenTicket(ticket.id)}
                    className="mt-3 text-sm font-bold text-sky-600 underline dark:text-sky-300"
                  >
                    {t("feedback.reopen")}
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            {t("feedback.noTickets")}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
