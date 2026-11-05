import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import i18n, { LANGUAGES, loadLanguage } from "../../lib/i18n";
import { supabase } from "../../lib/supabase";
import { loadTextOverrides } from "../../lib/textOverrides";
import { Panel } from "../../pages/AdminPage";

const SHOWN = 40;

function TextRow({ name, value, changed, onSave }) {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const [busy, setBusy] = useState(false);
  useEffect(() => setText(value), [value]);
  async function save(next) {
    setBusy(true);
    await onSave(name, next);
    setBusy(false);
  }
  return (
    <li className="rounded-xl border border-slate-100 p-2.5 dark:border-white/5">
      <p className="break-all font-mono text-[11px] text-slate-500">{name} {changed && <b className="text-violet-600">· {t("adminTexts.changed")}</b>}</p>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={2} maxLength={4000} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900" />
      <div className="mt-1 flex gap-2">
        <button type="button" disabled={busy || !text.trim() || text === value} onClick={() => save(text)} className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">{t("admin.ai.save")}</button>
        {changed && <button type="button" disabled={busy} onClick={() => save("")} className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-black disabled:opacity-50 dark:border-white/15">{t("adminTexts.restore")}</button>}
      </div>
    </li>
  );
}

// Every interface text, searchable, in each language. Saved text replaces the
// built-in one for all visitors; restoring brings the built-in one back.
export default function AdminTexts() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [query, setQuery] = useState("");
  const [bundle, setBundle] = useState({});
  const [changed, setChanged] = useState({});

  const load = useCallback(async () => {
    await loadLanguage(language);
    const { data } = await supabase.from("text_overrides").select("key").eq("language", language).limit(5000);
    setChanged(Object.fromEntries((data || []).map((row) => [row.key, true])));
    setBundle({ ...i18n.getResourceBundle(language, "translation") });
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const all = Object.entries(bundle).filter(([, value]) => typeof value === "string");
    return (needle ? all.filter(([key, value]) => `${key} ${value}`.toLowerCase().includes(needle)) : all.filter(([key]) => changed[key])).slice(0, SHOWN);
  }, [bundle, query, changed]);

  async function save(key, value) {
    await adminRequest({}, { action: "textSave", language, key, value });
    await loadTextOverrides();
    await load();
  }

  return (
    <Panel title={t("adminTexts.title")}>
      <p className="mb-3 text-xs text-slate-500">{t("adminTexts.text")}</p>
      <div className="mb-3 flex gap-2">
        <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t("adminTexts.title")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-900">
          {LANGUAGES.map((code) => <option key={code} value={code}>{code.toUpperCase()}</option>)}
        </select>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("adminTexts.search")} aria-label={t("adminTexts.search")} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900" />
      </div>
      {!rows.length && <p className="py-6 text-center text-sm text-slate-500">{t(query.trim() ? "adminTexts.none" : "adminTexts.hint")}</p>}
      <ul className="space-y-2">
        {rows.map(([key, value]) => <TextRow key={`${language}-${key}`} name={key} value={value} changed={Boolean(changed[key])} onSave={save} />)}
      </ul>
    </Panel>
  );
}
