import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { adminRequest } from "../../lib/adminApi";
import { formatDate, timeAgo } from "../../lib/dates";
import { supabase } from "../../lib/supabase";
import { Panel, ServerNotice } from "../../pages/AdminPage";

const button = "rounded-xl px-3 py-2 text-xs font-black disabled:opacity-50";
const primary = `${button} bg-sky-600 text-white`;
const plain = `${button} border border-slate-300 dark:border-white/15`;
const row = "rounded-2xl border border-slate-100 p-3 text-sm dark:border-white/5";

function TicketRow({ ticket, onDone }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [text, setText] = useState(ticket.draft || "");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function send(close) {
    setBusy(true);
    setFailed(false);
    const { error } = await supabase.from("feedback_messages").insert({ ticket_id: ticket.id, author_id: user.id, author_role: "admin", internal: false, body: text.trim() });
    if (error) {
      setFailed(true);
      setBusy(false);
      return;
    }
    await supabase.from("feedback_tickets").update({ ai_draft: "", ...(close ? { status: "resolved" } : {}) }).eq("id", ticket.id);
    onDone();
  }

  return (
    <li className={row}>
      <p className="text-xs font-bold text-slate-500">{ticket.email} · {timeAgo(ticket.created_at, i18n.language)}</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{ticket.text}</p>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={2} maxLength={4000} placeholder={t("adminToday.replyPlaceholder")} aria-label={t("adminToday.replyPlaceholder")} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900" />
      {failed && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{t("feedback.adminSaveError")}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={busy || !text.trim()} onClick={() => send(true)} className={primary}>{t("adminToday.sendClose")}</button>
        <button type="button" disabled={busy || !text.trim()} onClick={() => send(false)} className={plain}>{t("adminToday.send")}</button>
        <Link to="/admin/feedback" className={plain}>{t("adminToday.open")}</Link>
      </div>
    </li>
  );
}

function Section({ title, items, children }) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-black text-slate-700 dark:text-slate-200">{title} · {items.length}</h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

// Everything that needs the admin today, in one list, each done where it stands.
export default function AdminToday() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "today" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(key, body) {
    setBusy(key);
    try {
      await adminRequest({}, body);
      await load();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy("");
    }
  }

  const total = data ? data.tickets.length + data.reports.length + data.deletions.length + data.errors.length + data.expiring.length + (data.aiFailed ? 1 : 0) : 0;

  return (
    <Panel title={t("adminToday.title")} action={data && <span className="text-sm font-black tabular-nums text-slate-500">{total}</span>}>
      <ServerNotice error={error} onRetry={load} />
      {!data && !error && <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />}
      {data && !total && <p className="py-5 text-center text-sm font-bold text-emerald-600">✅ {t("adminToday.clear")}</p>}
      {data && (
        <div className="space-y-4">
          {data.aiFailed > 0 && (
            <Link to="/admin/health" className={`${row} block border-rose-200 bg-rose-50 font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200`}>
              ⚠️ {t("adminToday.aiFailed", { count: data.aiFailed })}
            </Link>
          )}
          <Section title={t("adminToday.tickets")} items={data.tickets}>
            {data.tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onDone={load} />)}
          </Section>
          <Section title={t("adminToday.reports")} items={data.reports}>
            {data.reports.map((report) => (
              <li key={report.id} className={row}>
                <p className="text-xs font-bold text-slate-500">{report.email} · {timeAgo(report.created_at, i18n.language)}</p>
                <p className="mt-1 break-words"><b>{t(`live.reason.${report.reason}`)}</b> {report.note}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={Boolean(busy)} onClick={() => act(`r${report.id}`, { action: "reportStatus", reportId: report.id, status: "resolved" })} className={primary}>{t("adminToday.resolve")}</button>
                  <button type="button" disabled={Boolean(busy)} onClick={() => act(`r${report.id}`, { action: "reportStatus", reportId: report.id, status: "dismissed" })} className={plain}>{t("adminToday.dismiss")}</button>
                  <Link to={`/admin/users?user=${report.reported}`} className={plain}>{t("adminToday.openUser")}</Link>
                </div>
              </li>
            ))}
          </Section>
          <Section title={t("adminToday.deletions")} items={data.deletions}>
            {data.deletions.map((item) => (
              <li key={item.id} className={row}>
                <p className="text-xs font-bold text-slate-500">{item.email} · {timeAgo(item.created_at, i18n.language)}</p>
                <p className="mt-1 break-words">{item.reason}</p>
                <Link to={`/admin/users?user=${item.user_id}`} className={`${plain} mt-2 inline-block`}>{t("adminToday.openUser")}</Link>
              </li>
            ))}
          </Section>
          <Section title={t("adminToday.errors")} items={data.errors}>
            {data.errors.map((item) => (
              <li key={item.message} className={row}>
                <p className="text-xs font-bold text-slate-500">{t("adminToday.times", { count: item.count })}</p>
                <p className="mt-1 break-words">{item.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={Boolean(busy)} onClick={() => act(item.message, { action: "clearError", message: item.message })} className={plain}>{t("adminToday.clearError")}</button>
                  <Link to="/admin/errors" className={plain}>{t("adminToday.open")}</Link>
                </div>
              </li>
            ))}
          </Section>
          <Section title={t("adminToday.expiring")} items={data.expiring}>
            {data.expiring.map((item) => (
              <li key={item.id} className={`${row} flex flex-wrap items-center justify-between gap-2`}>
                <span className="min-w-0 break-all">{item.email} · {formatDate(item.until, i18n.language)}</span>
                <span className="flex gap-2">
                  <button type="button" disabled={Boolean(busy)} onClick={() => act(item.id, { action: "notifyUser", userId: item.id, title: t("adminToday.remindTitle"), body: t("adminToday.remindBody") })} className={primary}>{t("adminToday.remind")}</button>
                  <Link to={`/admin/users?user=${item.id}`} className={plain}>{t("adminToday.openUser")}</Link>
                </span>
              </li>
            ))}
          </Section>
        </div>
      )}
    </Panel>
  );
}
