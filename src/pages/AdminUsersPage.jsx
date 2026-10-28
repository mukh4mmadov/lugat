import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../lib/adminApi";
import { formatDate, timeAgo } from "../lib/dates";
import { lookupWord, Panel, ServerNotice, StatTile, useAdminContext } from "./AdminPage";

const DAY = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 25;

const FILTERS = {
  all: () => true,
  active: (user) => user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() <= 7 * DAY,
  inactive: (user) => !user.lastActiveAt || Date.now() - new Date(user.lastActiveAt).getTime() > 30 * DAY,
  premium: (user) => user.premium,
  admin: (user) => user.admin,
  banned: (user) => user.banned,
  noProfile: (user) => !user.name,
};

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  lastActive: (a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0),
  words: (a, b) => b.progress.wordsKnown - a.progress.wordsKnown,
  streak: (a, b) => b.progress.streak - a.progress.streak,
};

function Badges({ user }) {
  const { t } = useTranslation();
  return (
    <span className="flex flex-wrap gap-1">
      {user.admin && <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-black uppercase text-white dark:bg-white dark:text-slate-900">{t("admin.badge.admin")}</span>}
      {user.premium && <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{t("admin.badge.premium")}</span>}
      {user.banned && <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">{t("admin.badge.banned")}</span>}
      {!user.confirmed && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">{t("admin.badge.unconfirmed")}</span>}
    </span>
  );
}

function downloadCsv(users) {
  const columns = ["email", "name", "birthYear", "provider", "createdAt", "lastActiveAt", "premiumUntil", "admin", "banned", "wordsKnown", "wordsStarted", "streak", "studyMinutes"];
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = users.map((user) => columns.map((column) => cell(column in user ? user[column] : user.progress[column])).join(","));
  const blob = new Blob([`\uFEFF${columns.join(",")}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `k-talim-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function ConfirmDelete({ user, onCancel, onConfirm, busy }) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");
  const expected = user.email || user.id;
  return (
    <div className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-400/30 dark:bg-rose-500/10">
      <p className="text-sm font-bold text-rose-800 dark:text-rose-100">{t("admin.user.deleteConfirm", { email: expected })}</p>
      <input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={expected} className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm dark:border-rose-400/30 dark:bg-slate-900" />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-white/15">{t("common.cancel", { defaultValue: "Cancel" })}</button>
        <button type="button" disabled={typed.trim() !== expected || busy} onClick={onConfirm} className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white disabled:opacity-40">
          {t("admin.user.deleteForever")}
        </button>
      </div>
    </div>
  );
}

function UserDrawer({ userId, currentUserId, onClose, onChanged, onDeleted }) {
  const { t, i18n } = useTranslation();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const target = document.getElementById("overlay-root") || document.body;

  const load = useCallback(async () => {
    setError(null);
    try {
      setDetail(await adminRequest({ action: "user", id: userId }));
    } catch (requestError) {
      setError(requestError);
    }
  }, [userId]);

  useEffect(() => {
    setDetail(null);
    setConfirmDelete(false);
    setMessage(null);
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function run(action, payload, success) {
    setBusy(action);
    setMessage(null);
    try {
      await adminRequest({}, { action, userId, ...payload });
      setMessage({ ok: true, text: success });
      if (action === "delete") {
        onDeleted(userId);
        onClose();
        return;
      }
      await load();
      onChanged();
    } catch (requestError) {
      setMessage({ ok: false, text: requestError.message });
    } finally {
      setBusy("");
    }
  }

  const self = userId === currentUserId;
  const progress = detail?.progress;
  const accuracy = progress && progress.correct + progress.wrong ? Math.round((progress.correct * 100) / (progress.correct + progress.wrong)) : null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={detail?.email || t("admin.user.title")}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col bg-slate-50 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
          <div className="min-w-0">
            <p className="truncate text-base font-black">{detail?.name || detail?.email || t("common.loading")}</p>
            {detail?.name && <p className="truncate text-xs text-slate-500">{detail.email}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={t("topik.closeSheet")} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black dark:bg-white/10">✕</button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <ServerNotice error={error} onRetry={load} />
          {!detail && !error && <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />}
          {detail && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badges user={detail} />
                <span className="text-xs text-slate-500">{detail.provider} · {t("admin.user.joined", { date: formatDate(detail.createdAt, i18n.language) })}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatTile label={t("admin.user.known")} value={progress.wordsKnown} hint={t("admin.user.started", { count: progress.wordsStarted })} />
                <StatTile tone="emerald" label={t("admin.user.accuracy")} value={accuracy === null ? "—" : `${accuracy}%`} hint={`${progress.correct} / ${progress.correct + progress.wrong}`} />
                <StatTile tone="amber" label={t("admin.user.streak")} value={`🔥 ${progress.streak}`} hint={t("admin.kpi.minutes", { count: progress.studyMinutes })} />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-white p-3 text-sm dark:bg-white/5">
                <dt className="text-slate-500">{t("admin.user.lastActive")}</dt>
                <dd className="text-right font-bold">{timeAgo(detail.lastActiveAt, i18n.language)}</dd>
                <dt className="text-slate-500">{t("admin.user.lastSignIn")}</dt>
                <dd className="text-right font-bold">{timeAgo(detail.lastSignInAt, i18n.language)}</dd>
                <dt className="text-slate-500">{t("admin.user.birthYear")}</dt>
                <dd className="text-right font-bold">{detail.birthYear || "—"}</dd>
                <dt className="text-slate-500">{t("admin.user.premiumUntil")}</dt>
                <dd className="text-right font-bold">{detail.premium ? formatDate(detail.premiumUntil, i18n.language) : "—"}</dd>
                <dt className="text-slate-500">ID</dt>
                <dd className="truncate text-right font-mono text-xs">{detail.id}</dd>
              </dl>

              <Panel title={t("admin.user.actions")}>
                <p className="mb-2 text-xs font-bold text-slate-500">{t("admin.badge.premium")}</p>
                <div className="flex flex-wrap gap-2">
                  {[30, 90, 365].map((days) => (
                    <button key={days} type="button" disabled={Boolean(busy)} onClick={() => run("premium", { days }, t("admin.user.premiumGiven", { count: days }))} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50">
                      +{t("admin.user.days", { count: days })}
                    </button>
                  ))}
                  {detail.premium && (
                    <button type="button" disabled={Boolean(busy)} onClick={() => run("premium", { days: 0 }, t("admin.user.premiumRemoved"))} className="rounded-xl border border-violet-300 px-3 py-2 text-xs font-black text-violet-700 disabled:opacity-50 dark:text-violet-200">
                      {t("admin.user.removePremium")}
                    </button>
                  )}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" disabled={Boolean(busy) || (self && detail.admin)} onClick={() => run("admin", { value: !detail.admin }, detail.admin ? t("admin.user.adminRemoved") : t("admin.user.adminGiven"))} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold disabled:opacity-40 dark:border-white/15">
                    {detail.admin ? t("admin.user.removeAdmin") : t("admin.user.makeAdmin")}
                  </button>
                  <button type="button" disabled={Boolean(busy) || self} onClick={() => run("ban", { value: !detail.banned }, detail.banned ? t("admin.user.unbanned") : t("admin.user.bannedDone"))} className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm font-bold text-amber-700 disabled:opacity-40 dark:border-amber-400/30 dark:text-amber-200">
                    {detail.banned ? t("admin.user.unban") : t("admin.user.ban")}
                  </button>
                </div>
                {!self && !confirmDelete && (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="mt-2 w-full rounded-xl px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
                    {t("admin.user.delete")}
                  </button>
                )}
                {confirmDelete && <ConfirmDelete user={detail} busy={busy === "delete"} onCancel={() => setConfirmDelete(false)} onConfirm={() => run("delete", {}, "")} />}
                {message && (
                  <p role={message.ok ? "status" : "alert"} className={`mt-3 text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
                )}
              </Panel>

              {detail.lessons.length > 0 && (
                <Panel title={t("admin.user.lessons")}>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {detail.lessons.map((lesson) => (
                      <div key={lesson.lesson} className="rounded-xl bg-slate-100 p-2 text-center dark:bg-white/5" title={`${lesson.known}/${lesson.started}`}>
                        <p className="text-[10px] font-bold text-slate-500">{lesson.lesson}</p>
                        <p className="text-sm font-black tabular-nums">{lesson.known}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {detail.weakWords.length > 0 && (
                <Panel title={t("admin.user.weakWords")}>
                  <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                    {detail.weakWords.map((entry) => {
                      const word = lookupWord(entry.key);
                      return (
                        <li key={entry.key} className="flex items-center justify-between gap-3 py-1.5">
                          <span className="truncate"><b>{word?.korean || entry.key}</b> <span className="text-slate-500">{word?.uzbek}</span></span>
                          <span className="shrink-0 text-xs font-bold text-rose-600">{t("admin.mistakes", { count: entry.wrong })}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              )}

              {(detail.tickets.length > 0 || detail.aiSessions.length > 0) && (
                <Panel title={t("admin.user.activity")}>
                  {detail.tickets.map((ticket) => (
                    <Link key={ticket.id} to={`/admin/feedback?ticket=${ticket.id}`} className="mb-2 block rounded-xl border border-slate-100 p-2.5 text-sm hover:border-sky-300 dark:border-white/5">
                      <span className="text-xs font-bold text-slate-500">{t(`feedback.category.${ticket.category}`)} · {t(`feedback.status.${ticket.status}`)} · {formatDate(ticket.created_at, i18n.language)}</span>
                      <span className="mt-1 line-clamp-2 block">{ticket.message}</span>
                    </Link>
                  ))}
                  {detail.aiSessions.length > 0 && (
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      {t("admin.user.aiSessions", { count: detail.aiSessions.length })} · {timeAgo(detail.aiSessions[0].updated_at, i18n.language)}
                    </p>
                  )}
                </Panel>
              )}
            </>
          )}
        </div>
      </aside>
    </div>,
    target,
  );
}

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const { currentUserId } = useAdminContext();
  const [params, setParams] = useSearchParams();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const openId = params.get("user");

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminRequest({ action: "users" });
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    if (!users) return [];
    const needle = query.trim().toLowerCase();
    return users
      .filter(FILTERS[filter])
      .filter((user) => !needle || `${user.email} ${user.name} ${user.id}`.toLowerCase().includes(needle))
      .sort(SORTS[sort]);
  }, [users, query, filter, sort]);

  useEffect(() => setPage(0), [query, filter, sort]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const shown = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const counts = useMemo(() => Object.fromEntries(Object.entries(FILTERS).map(([key, test]) => [key, users ? users.filter(test).length : 0])), [users]);

  const open = (id) => setParams(id ? { user: id } : {});
  const close = useCallback(() => setParams({}), [setParams]);

  return (
    <div className="space-y-4">
      <ServerNotice error={error} onRetry={load} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.users.search")}
          aria-label={t("admin.users.search")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 md:max-w-sm"
        />
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={t("admin.users.sort")} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-900">
          {Object.keys(SORTS).map((key) => (
            <option key={key} value={key}>{t(`admin.users.sort.${key}`)}</option>
          ))}
        </select>
        <div className="flex gap-2 md:ml-auto">
          <button type="button" onClick={load} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-white/15">{t("common.refresh", { defaultValue: "Refresh" })}</button>
          <button type="button" disabled={!visible.length} onClick={() => downloadCsv(visible)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">CSV ↓</button>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.keys(FILTERS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${filter === key ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300"}`}
          >
            {t(`admin.users.filter.${key}`)} <span className="opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {!users && !error && <div className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}

      {users && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-black">{t("admin.users.col.user")}</th>
                <th className="px-4 py-3 font-black">{t("admin.users.col.joined")}</th>
                <th className="px-4 py-3 font-black">{t("admin.users.col.active")}</th>
                <th className="px-4 py-3 text-right font-black">{t("admin.users.col.words")}</th>
                <th className="px-4 py-3 text-right font-black">{t("admin.users.col.streak")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {shown.map((user) => (
                <tr key={user.id} onClick={() => open(user.id)} className="cursor-pointer transition hover:bg-sky-50/60 dark:hover:bg-white/5">
                  <td className="max-w-xs px-4 py-3">
                    <button type="button" onClick={() => open(user.id)} className="block max-w-full truncate text-left font-bold">{user.name || user.email}</button>
                    <span className="mt-0.5 flex items-center gap-2">
                      {user.name && <span className="truncate text-xs text-slate-500">{user.email}</span>}
                      <Badges user={user} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt, i18n.language)}</td>
                  <td className="px-4 py-3 text-slate-500">{timeAgo(user.lastActiveAt, i18n.language)}</td>
                  <td className="px-4 py-3 text-right font-black tabular-nums">{user.progress.wordsKnown}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{user.progress.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-slate-100 dark:divide-white/5 md:hidden">
            {shown.map((user) => (
              <li key={user.id}>
                <button type="button" onClick={() => open(user.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{user.name || user.email}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{timeAgo(user.lastActiveAt, i18n.language)} · {t("admin.wordsKnown", { count: user.progress.wordsKnown })}</span>
                    <span className="mt-1 block"><Badges user={user} /></span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </li>
            ))}
          </ul>
          {!shown.length && <p className="p-6 text-center text-sm text-slate-500">{t("admin.users.empty")}</p>}
          {pageCount > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-white/10">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-xl px-3 py-1.5 font-bold disabled:opacity-30">‹</button>
              <span className="font-bold tabular-nums text-slate-500">{page + 1} / {pageCount} · {visible.length}</span>
              <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)} className="rounded-xl px-3 py-1.5 font-bold disabled:opacity-30">›</button>
            </div>
          )}
        </div>
      )}

      {openId && <UserDrawer userId={openId} currentUserId={currentUserId} onClose={close} onChanged={load} onDeleted={(id) => setUsers((list) => list.filter((user) => user.id !== id))} />}
    </div>
  );
}
