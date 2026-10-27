import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { allWords, getWordKey, lessonInfo } from "../data";
import { TOPIK_EXAMS } from "../data/topik/exams";
import { adminRequest } from "../lib/adminApi";
import { formatDate, timeAgo } from "../lib/dates";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const wordsByKey = new Map(allWords.map((word) => [getWordKey(word), word]));

// eslint-disable-next-line react-refresh/only-export-components
export function lookupWord(key) {
  return wordsByKey.get(key) || null;
}

export function StatTile({ label, value, hint, tone = "sky" }) {
  const tones = {
    sky: "text-sky-600 dark:text-sky-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    violet: "text-violet-600 dark:text-violet-300",
    rose: "text-rose-600 dark:text-rose-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-black tabular-nums md:text-3xl ${tones[tone]}`}>{value ?? "—"}</p>
      {hint && <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 md:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-black md:text-lg">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// The admin area: one access check, a header and the section tabs. Sections
// read the shared state through useOutletContext().
export default function AdminPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState("loading");
  const [error, setError] = useState("");

  const check = useCallback(async () => {
    if (!user) {
      setAccess("unauthenticated");
      return;
    }
    setAccess("loading");
    setError("");
    const { data, error: accessError } = await supabase.rpc("is_feedback_admin");
    if (accessError) {
      console.error("Admin access check error:", accessError);
      setError(t("feedback.permissionCheckFailed"));
      setAccess("error");
      return;
    }
    setAccess(data ? "allowed" : "denied");
  }, [t, user]);

  useEffect(() => {
    if (!authLoading) check();
  }, [check, authLoading]);

  if (authLoading || access === "loading") {
    return (
      <GlassCard>
        <p role="status">{t("common.loading")}</p>
      </GlassCard>
    );
  }

  if (access !== "allowed") {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-black">{t("feedback.accessDenied")}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {access === "unauthenticated" ? t("admin.needLogin") : access === "denied" ? t("admin.noAdminAccess") : error}
        </p>
        {access === "unauthenticated" && (
          <Link to="/login" className="mt-4 inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-black text-white">
            {t("common.login")}
          </Link>
        )}
        {access === "denied" && (
          <Link to="/" className="mt-4 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950">
            {t("common.back")}
          </Link>
        )}
        {access === "error" && (
          <button type="button" onClick={check} className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/15">
            {t("common.tryAgain")}
          </button>
        )}
      </GlassCard>
    );
  }

  const tabs = [
    ["/admin", t("admin.tab.overview"), true],
    ["/admin/users", t("admin.tab.users")],
    ["/admin/feedback", t("admin.tab.feedback")],
    ["/admin/content", t("admin.tab.content")],
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-black uppercase tracking-wide text-sky-600 dark:text-sky-300">{t("admin.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">{t("admin.title")}</h1>
      </header>
      <nav aria-label={t("admin.tools")} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {tabs.map(([to, label, end]) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-4 py-2 text-sm font-black transition ${
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white/70 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet context={{ currentUserId: user.id }} />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminContext() {
  return useOutletContext();
}

export function ServerNotice({ error, onRetry }) {
  const { t } = useTranslation();
  if (!error) return null;
  return (
    <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
      <p className="font-black">{error.status === 503 ? t("admin.serverMissingTitle") : t("admin.loadFailed")}</p>
      <p className="mt-1 leading-6">{error.status === 503 ? t("admin.serverMissingText") : error.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-xl bg-amber-900 px-4 py-2 text-xs font-black text-white dark:bg-amber-200 dark:text-amber-950">
          {t("common.tryAgain")}
        </button>
      )}
    </div>
  );
}

function SignupChart({ days }) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = hover !== null ? days[hover] : null;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-500 dark:text-slate-400">{t("admin.signups30", { count: total })}</span>
        <span className="min-h-5 font-bold tabular-nums" aria-live="polite">
          {active ? `${formatDate(active.date, i18n.language)} · ${t("admin.signupsDay", { count: active.count })}` : ""}
        </span>
      </div>
      <div className="relative h-40" onMouseLeave={() => setHover(null)}>
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-slate-200 dark:border-white/10" />
        <span className="pointer-events-none absolute -top-2 right-0 bg-white px-1 text-[10px] font-bold text-slate-400 dark:bg-slate-900">{max}</span>
        <div className="flex h-full items-end gap-[2px] border-b border-slate-300 dark:border-white/15">
          {days.map((day, index) => (
            <button
              key={day.date}
              type="button"
              aria-label={`${day.date}: ${day.count}`}
              onMouseEnter={() => setHover(index)}
              onFocus={() => setHover(index)}
              onClick={() => setHover(index)}
              className="group flex h-full flex-1 items-end"
            >
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${hover === index ? "bg-sky-700 dark:bg-sky-300" : "bg-sky-500 dark:bg-sky-400"}`}
                style={{ height: day.count ? `${Math.max(4, (day.count / max) * 100)}%` : "2px", opacity: day.count ? 1 : 0.35 }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
        <span>{formatDate(days[0]?.date, i18n.language)}</span>
        <span>{formatDate(days.at(-1)?.date, i18n.language)}</span>
      </div>
    </div>
  );
}

function MeterRow({ label, value, max, detail }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-sm">
      <span className="font-bold">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <span className="block h-full rounded-full bg-sky-500" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </span>
      <span className="min-w-[5rem] text-right text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">{detail}</span>
    </div>
  );
}

export function AdminOverview() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Ticket counts come straight from Supabase so they work without the admin API.
    supabase
      .from("feedback_tickets")
      .select("status")
      .then(({ data: rows }) => setTickets(rows || []));
    try {
      setData(await adminRequest({ action: "overview" }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openTickets = tickets?.filter((ticket) => ticket.status === "open").length;
  const activeTickets = tickets?.filter((ticket) => ticket.status === "in_progress").length;
  const lessonMax = Math.max(1, ...(data?.learning.lessons || []).map((lesson) => lesson.learners));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {data ? t("admin.updated", { time: timeAgo(data.generatedAt, i18n.language) }) : loading ? t("common.loading") : ""}
        </p>
        <button type="button" onClick={load} disabled={loading} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50 dark:border-white/15">
          {loading ? t("common.loading") : t("common.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>

      <ServerNotice error={error} onRetry={load} />

      <section aria-label={t("admin.summary")} className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label={t("admin.kpi.users")} value={data?.users.total} hint={data && t("admin.kpi.newWeek", { count: data.users.new7 })} />
        <StatTile tone="emerald" label={t("admin.kpi.active7")} value={data?.learning.active7} hint={data && t("admin.kpi.activeToday", { count: data.learning.active1 })} />
        <StatTile tone="violet" label={t("admin.kpi.ai7")} value={data?.ai.messagesWeek} hint={data && t("admin.kpi.aiToday", { count: data.ai.messagesDay ?? 0 })} />
        <StatTile tone="amber" label={t("admin.kpi.openTickets")} value={openTickets} hint={tickets && t("admin.kpi.inProgress", { count: activeTickets })} />
        <StatTile tone="violet" label={t("admin.kpi.premium")} value={data?.users.premium} hint={data && t("admin.kpi.admins", { count: data.users.admins })} />
        <StatTile tone="emerald" label={t("admin.kpi.known")} value={data?.learning.totalKnown} hint={data && t("admin.kpi.minutes", { count: data.learning.totalMinutes })} />
      </section>

      {data && (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel title={t("admin.signupsTitle")}>
              <SignupChart days={data.signups} />
            </Panel>
            <Panel title={t("admin.accountsTitle")}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  [t("admin.acc.new30"), data.users.new30],
                  [t("admin.acc.signedIn7"), data.users.signedIn7],
                  [t("admin.acc.learners"), data.learning.learners],
                  [t("admin.acc.active30"), data.learning.active30],
                  [t("admin.acc.unconfirmed"), data.users.unconfirmed],
                  [t("admin.acc.noProfile"), data.users.withoutProfile],
                  [t("admin.acc.banned"), data.users.banned],
                  [t("admin.acc.aiSessions"), data.ai.sessionsWeek ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/5">
                    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                    <dd className="font-black tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(data.users.providers).map(([provider, count]) => (
                  <span key={provider} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/10">
                    {provider} · {count}
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title={t("admin.lessonsTitle")}>
              {data.learning.lessons.length ? (
                <div className="max-h-[22rem] space-y-2.5 overflow-y-auto pr-1">
                  {data.learning.lessons.map((lesson) => (
                    <MeterRow
                      key={lesson.lesson}
                      label={t("card.lesson", { lesson: lesson.lesson })}
                      value={lesson.learners}
                      max={lessonMax}
                      detail={t("admin.lessonLearners", { count: lesson.learners })}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t("admin.noData")}</p>
              )}
            </Panel>
            <Panel title={t("admin.hardestTitle")}>
              {data.learning.hardestWords.length ? (
                <ol className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.learning.hardestWords.map((entry, index) => {
                    const word = lookupWord(entry.key);
                    return (
                      <li key={entry.key} className="flex items-center gap-3 py-2 text-sm">
                        <span className="w-5 text-xs font-black text-slate-400">{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-black">{word?.korean || entry.key}</span>
                          <span className="ml-2 text-slate-500 dark:text-slate-400">{word?.uzbek}</span>
                        </span>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-rose-600 dark:text-rose-300">{t("admin.mistakes", { count: entry.wrong })}</span>
                        <span className="w-16 shrink-0 text-right text-xs font-bold tabular-nums text-slate-500">{t("admin.learnersShort", { count: entry.learners })}</span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">{t("admin.noData")}</p>
              )}
            </Panel>
          </div>

          <Panel title={t("admin.topLearnersTitle")} action={<Link to="/admin/users" className="text-sm font-bold text-sky-600 dark:text-sky-300">{t("admin.allUsers")} →</Link>}>
            {data.learning.topLearners.length ? (
              <ol className="grid gap-2 md:grid-cols-2">
                {data.learning.topLearners.map((learner, index) => (
                  <li key={learner.id}>
                    <Link to={`/admin/users?user=${learner.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-sky-300 dark:border-white/5 dark:hover:border-sky-400/40">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-black text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{learner.email}</span>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">
                        {t("admin.wordsKnown", { count: learner.wordsKnown })} · 🔥{learner.streak}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">{t("admin.noData")}</p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

export function AdminContent() {
  const { t } = useTranslation();
  const courses = useMemo(() => {
    const map = new Map();
    lessonInfo.forEach((lesson) => map.set(lesson.course, (map.get(lesson.course) || 0) + 1));
    return [...map.entries()];
  }, []);
  const missingRomanization = allWords.filter((word) => !word.romanization).length;
  const flagged = allWords.filter((word) => word.needsReview).length;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t("admin.content.lessons")} value={lessonInfo.length} hint={courses.map(([course, count]) => `${course}: ${count}`).join(" · ")} />
        <StatTile tone="emerald" label={t("admin.content.words")} value={allWords.length} />
        <StatTile tone="violet" label={t("admin.content.papers")} value={TOPIK_EXAMS.length} hint={t("admin.content.questions", { count: TOPIK_EXAMS.reduce((sum, exam) => sum + exam.questions.length, 0) })} />
        <StatTile tone={flagged + missingRomanization ? "amber" : "emerald"} label={t("admin.content.quality")} value={flagged + missingRomanization} hint={t("admin.content.qualityHint")} />
      </section>

      <Panel title={t("admin.content.topikTitle")}>
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {TOPIK_EXAMS.map((exam) => (
            <li key={exam.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <span className="font-black">{exam.level} · {exam.number}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {t("admin.content.questions", { count: exam.questions.length })} · {exam.listeningMinutes + exam.readingMinutes} min
              </span>
              <span className="ml-auto flex gap-2">
                <a href={exam.pdf} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10">PDF</a>
                <a href={exam.audio} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10">MP3</a>
                <Link to={`/topik/${exam.id}mock`} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{t("admin.content.open")}</Link>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/5 dark:text-slate-300">{t("admin.content.addPaper")}</p>
      </Panel>

      <Panel title={t("admin.content.lessonsTitle")}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {lessonInfo.map((lesson) => (
            <Link
              key={lesson.lesson}
              to={`/study/${lesson.lesson}`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2.5 text-sm transition hover:border-sky-300 dark:border-white/5 dark:hover:border-sky-400/40"
            >
              <span className="min-w-0 truncate">
                <span className="font-black">{t("card.lesson", { lesson: lesson.lesson })}</span>
                <span className="ml-2 text-xs text-slate-500">{t(lesson.category)}</span>
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">{lesson.words.length}</span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
