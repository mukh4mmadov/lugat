import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { allWords, lessonInfo } from "../data";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState("loading");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setAccess("unauthenticated");
      return;
    }
    setAccess("loading");
    setError("");
    const { data: isAdmin, error: accessError } =
      await supabase.rpc("is_feedback_admin");
    if (accessError) {
      console.error("Admin access check error:", accessError);
      setError(t("feedback.permissionCheckFailed"));
      setAccess("error");
      return;
    }
    if (!isAdmin) {
      setAccess("denied");
      return;
    }

    setAccess("allowed");
    const { data, error: ticketError } = await supabase
      .from("feedback_tickets")
      .select("id, status");
    if (ticketError) {
      console.error("Error loading tickets:", ticketError);
      setError(t("feedback.loadError"));
      return;
    }
    setTickets(data || []);
  }, [t, user]);

  useEffect(() => {
    if (!authLoading) {
      load();
    }
  }, [load, authLoading]);

  if (authLoading || access === "loading") {
    return (
      <GlassCard>
        <p role="status">{t("common.loading")}</p>
      </GlassCard>
    );
  }

  if (access === "unauthenticated") {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-black">{t("feedback.accessDenied")}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {t("admin.needLogin")}
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-black text-white"
        >
          {t("common.login")}
        </Link>
      </GlassCard>
    );
  }

  if (access === "denied") {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-black">{t("feedback.accessDenied")}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {t("admin.noAdminAccess")}
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950"
        >
          {t("common.back")}
        </Link>
      </GlassCard>
    );
  }

  if (access === "error") {
    return (
      <GlassCard className="mx-auto max-w-2xl">
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
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const activeTickets = tickets.filter(
    (ticket) => ticket.status === "in_progress",
  ).length;
  const resolvedTickets = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(ticket.status),
  ).length;

  const tools = [
    {
      to: "/admin/feedback",
      title: t("admin.feedbackTitle"),
      description: t("admin.feedbackDescription"),
      value: tickets.length,
      detail: t("admin.feedbackOpen", { count: openTickets }),
    },
    {
      to: "/courses",
      title: t("admin.coursesTitle"),
      description: t("admin.coursesDescription"),
      value: lessonInfo.length,
      detail: t("admin.wordTotal", { count: allWords.length }),
    },
    {
      to: "/stats",
      title: t("admin.statsTitle"),
      description: t("admin.statsDescription"),
      value: activeTickets,
      detail: t("admin.resolvedCount", { count: resolvedTickets }),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-sky-600 dark:text-sky-300">
            {t("admin.eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">
            {t("admin.title")}
          </h1>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/15"
        >
          {t("common.refresh", { defaultValue: "Refresh" })}
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      <section
        aria-label={t("admin.summary")}
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          [t("admin.totalTickets"), tickets.length],
          [t("feedback.status.open"), openTickets],
          [t("feedback.status.in_progress"), activeTickets],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section
        aria-label={t("admin.tools")}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group rounded-2xl border border-slate-200 bg-white/75 p-5 transition hover:border-sky-400 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-sky-400/50 dark:hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">{tool.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {tool.description}
                </p>
              </div>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-300">
                {tool.value}
              </span>
            </div>
            <p className="mt-5 border-t border-slate-200 pt-3 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
              {tool.detail}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
