import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../lib/adminApi";
import { formatDate, timeAgo } from "../lib/dates";
import { formatPrice } from "../lib/premium";
import { Panel, ServerNotice, StatTile } from "./AdminPage";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

const TOGGLES = ["ai_chat_enabled", "speaking_enabled", "live_speaking_enabled", "feedback_ai_enabled"];
// Limits, with the unit shown to admins; speaking time is stored in seconds.
const LIMITS = [
  ["ai_free_daily", 10, 1],
  ["ai_premium_daily", 200, 1],
  ["grammar_free_daily", 5, 1],
  ["speaking_free_seconds", 600, 60],
  ["speaking_premium_seconds", 7200, 60],
];

function LimitRow({ name, value, scale, busy, onSave }) {
  const { t } = useTranslation();
  const [text, setText] = useState(String(Math.round(value / scale)));
  useEffect(() => setText(String(Math.round(value / scale))), [value, scale]);
  const changed = Number(text) * scale !== value;
  return (
    <div className="grid grid-cols-[1fr_6rem_auto] items-center gap-2 border-b border-slate-100 py-2 text-sm dark:border-white/5">
      <span>
        <span className="block font-bold">{t(`admin.settings.${name}`)}</span>
        <span className="text-xs text-slate-500">{t(scale === 60 ? "admin.settings.minutesDay" : "admin.settings.perDay")}</span>
      </span>
      <input value={text} onChange={(event) => setText(event.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label={t(`admin.settings.${name}`)} className={`${input} text-right tabular-nums`} />
      <button type="button" disabled={busy || !changed || text === ""} onClick={() => onSave(name, Number(text) * scale)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white disabled:opacity-30 dark:bg-white dark:text-slate-950">
        {t("common.save")}
      </button>
    </div>
  );
}

function AnnouncementForm({ value, busy, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(value);
  useEffect(() => setForm(value), [value]);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave("announcement", { active: Boolean(form.active), text: form.text.trim(), link: form.link.trim(), until: form.until || null });
      }}
      className="space-y-2"
    >
      <textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} maxLength={300} rows={2} placeholder={t("admin.announce.text")} className={input} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} placeholder={t("admin.announce.link")} className={input} />
        <label className="text-xs font-bold text-slate-500">
          {t("admin.announce.until")}
          <input type="date" value={form.until ? form.until.slice(0, 10) : ""} onChange={(event) => setForm({ ...form, until: event.target.value ? `${event.target.value}T23:59:59+05:00` : null })} className={`${input} mt-1`} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
        {t("admin.announce.active")}
      </label>
      <button type="submit" disabled={busy || (form.active && !form.text.trim()) || (form.link && !/^(https:\/\/|\/)/.test(form.link.trim()))} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">
        {t("common.save")}
      </button>
      <p className="text-xs text-slate-500">{t("admin.announce.hint")}</p>
    </form>
  );
}

// Site switches, daily limits and the announcement banner, all stored in
// app_settings so they change without a redeploy.
export function AdminSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSettings((await adminRequest({ action: "settings" })).settings);
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(key, value) {
    setBusy(true);
    setMessage(null);
    try {
      await adminRequest({}, { action: "setting", key, value });
      setSettings((current) => ({ ...current, [key]: value }));
      setMessage({ ok: true, text: t("admin.powers.saved") });
    } catch (requestError) {
      setMessage({ ok: false, text: requestError.message });
    } finally {
      setBusy(false);
    }
  }

  const announcement = { active: false, text: "", link: "", until: null, ...(settings?.announcement || {}) };

  return (
    <div className="space-y-5">
      <ServerNotice error={error} onRetry={load} />
      {!settings && !error && <div className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
      {settings && (
        <>
          {message && <p role={message.ok ? "status" : "alert"} className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title={t("admin.settings.features")}>
              <ul className="space-y-2">
                {TOGGLES.map((key) => {
                  const on = settings[key] !== false;
                  return (
                    <li key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/5">
                      <span>
                        <span className="block text-sm font-bold">{t(`admin.settings.${key}`)}</span>
                        <span className="text-xs text-slate-500">{on ? t("admin.settings.on") : t("admin.settings.off")}</span>
                      </span>
                      <button type="button" role="switch" aria-checked={on} disabled={busy} onClick={() => save(key, !on)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`}>
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title={t("admin.settings.limits")}>
              {LIMITS.map(([key, fallback, scale]) => (
                <LimitRow key={key} name={key} scale={scale} value={Number.isFinite(Number(settings[key])) ? Number(settings[key]) : fallback} busy={busy} onSave={save} />
              ))}
            </Panel>
          </div>
          <Panel title={t("admin.announce.title")}>
            <AnnouncementForm value={announcement} busy={busy} onSave={save} />
          </Panel>
        </>
      )}
    </div>
  );
}

function describe(entry, emails, t) {
  const details = entry.details || {};
  const parts = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
  return [t(`admin.journal.action.${entry.action}`, { defaultValue: entry.action }), entry.target_user ? emails[entry.target_user] || entry.target_user : null, parts.join(" · ")].filter(Boolean).join(" — ");
}

// Premium sales and every change an admin made.
export function AdminJournal() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminRequest({ action: "journal" }));
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = data?.sales.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  const month = data?.sales.filter((sale) => Date.now() - new Date(sale.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000).reduce((sum, sale) => sum + sale.amount, 0) || 0;

  return (
    <div className="space-y-5">
      <ServerNotice error={error} onRetry={load} />
      {!data && !error && <div className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />}
      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatTile tone="emerald" label={t("admin.journal.month")} value={formatPrice(month)} hint={t("premium.currency")} />
            <StatTile tone="violet" label={t("admin.journal.total")} value={formatPrice(total)} hint={t("admin.journal.salesCount", { count: data.sales.filter((sale) => sale.amount > 0).length })} />
            <StatTile label={t("admin.journal.actions")} value={data.entries.length} />
          </section>

          <Panel title={t("admin.journal.sales")}>
            {data.sales.length ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {data.sales.map((sale) => (
                  <li key={sale.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <Link to={`/admin/users?user=${sale.user_id}`} className="min-w-0 flex-1 truncate font-bold">{data.emails[sale.user_id] || "—"}</Link>
                    <span className="text-xs text-slate-500">{sale.days ? `+${t("admin.user.days", { count: sale.days })}` : t("admin.user.premiumRemoved")}</span>
                    <span className="font-black tabular-nums text-emerald-600">{formatPrice(sale.amount)}</span>
                    <span className="w-full text-xs text-slate-500 sm:w-auto">{formatDate(sale.created_at, i18n.language)}{sale.note ? ` · ${sale.note}` : ""}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{t("admin.noData")}</p>
            )}
          </Panel>

          <Panel title={t("admin.journal.log")}>
            {data.entries.length ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
                {data.entries.map((entry) => (
                  <li key={entry.id} className="py-2">
                    <p className="break-words">{describe(entry, data.emails, t)}</p>
                    <p className="text-xs text-slate-500">{data.emails[entry.admin_id] || "—"} · {timeAgo(entry.created_at, i18n.language)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{t("admin.noData")}</p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
