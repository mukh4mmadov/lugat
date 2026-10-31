import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { EDITABLE_FIELDS, allContent, contentOverride, originalContent, refreshContentOverrides } from "../../lib/contentOverrides";

const input = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";
const small = "rounded-lg px-2.5 py-1 text-xs font-black";
const isStrings = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
const isStringObject = (value) => value && typeof value === "object" && !Array.isArray(value) && Object.values(value).every((item) => typeof item === "string");

function itemLabel(kind, item, t) {
  if (kind === "story") return `${item.emoji} ${t("card.lesson", { lesson: item.lesson })} · ${item.title.ko}`;
  if (kind === "grammar") return `${t("card.lesson", { lesson: item.lesson })} · ${item.pattern}`;
  return `${item.emoji} ${item.ko} · ${item.level}`;
}

// One field, edited in the form its shape suggests: text, a set of
// translations, a table of rows, or raw JSON for anything more nested.
function FieldEditor({ value, onChange, onInvalid }) {
  const [json, setJson] = useState(() => JSON.stringify(value, null, 1));
  const [jsonError, setJsonError] = useState(false);

  if (typeof value === "string") return <input value={value} onChange={(event) => onChange(event.target.value)} className={input} />;

  if (isStrings(value)) {
    return <input value={value.join(", ")} onChange={(event) => onChange(event.target.value.split(",").map((word) => word.trim()).filter(Boolean))} className={input} />;
  }

  if (isStringObject(value)) {
    return (
      <div className="grid gap-1.5">
        {Object.entries(value).map(([key, text]) => (
          <label key={key} className="grid grid-cols-[2rem_1fr] items-start gap-2 text-xs font-bold text-slate-500">
            <span className="pt-2 uppercase">{key}</span>
            <textarea value={text} rows={text.length > 80 ? 3 : 1} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className={input} />
          </label>
        ))}
      </div>
    );
  }

  const rows = Array.isArray(value) && value.length && value.every((row) => isStrings(row) || isStringObject(row)) ? value : null;
  if (rows) {
    const template = rows[0];
    const keys = Array.isArray(template) ? template.map((_, index) => index) : Object.keys(template);
    const setCell = (rowIndex, key, text) =>
      onChange(rows.map((row, index) => (index !== rowIndex ? row : Array.isArray(row) ? row.map((cell, cellIndex) => (cellIndex === key ? text : cell)) : { ...row, [key]: text })));
    const blank = Array.isArray(template) ? template.map(() => "") : Object.fromEntries(keys.map((key) => [key, ""]));
    return (
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-xl border border-slate-100 p-2 dark:border-white/5">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {keys.map((key) => (
                <input key={key} value={row[key] ?? ""} onChange={(event) => setCell(rowIndex, key, event.target.value)} aria-label={String(key)} className={input} />
              ))}
            </div>
            <div className="mt-1.5 flex gap-1.5">
              <button type="button" disabled={rowIndex === 0} onClick={() => onChange(rows.map((item, index) => (index === rowIndex - 1 ? rows[rowIndex] : index === rowIndex ? rows[rowIndex - 1] : item)))} className={`${small} bg-slate-100 disabled:opacity-30 dark:bg-white/10`}>↑</button>
              <button type="button" onClick={() => onChange(rows.filter((_, index) => index !== rowIndex))} className={`${small} text-rose-600`}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...rows, blank])} className={`${small} bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200`}>+</button>
      </div>
    );
  }

  return (
    <textarea
      value={json}
      rows={8}
      spellCheck={false}
      onChange={(event) => {
        setJson(event.target.value);
        try {
          onChange(JSON.parse(event.target.value));
          setJsonError(false);
          onInvalid(false);
        } catch {
          setJsonError(true);
          onInvalid(true);
        }
      }}
      className={`${input} font-mono text-xs ${jsonError ? "border-rose-400" : ""}`}
    />
  );
}

// Lets admins change or hide any story, grammar point or speaking topic; the
// change reaches learners without a redeploy (see src/lib/contentOverrides.js).
export default function ContentEditor() {
  const { t } = useTranslation();
  const [kind, setKind] = useState("story");
  const [itemId, setItemId] = useState(() => allContent("story")[0].id);
  const [draft, setDraft] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [version, setVersion] = useState(0);

  const items = allContent(kind);
  const original = useMemo(() => originalContent(kind, itemId), [kind, itemId]);
  const override = useMemo(() => contentOverride(kind, itemId), [kind, itemId, version]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshContentOverrides().then(() => setVersion((value) => value + 1));
  }, []);

  useEffect(() => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    setDraft(Object.fromEntries(EDITABLE_FIELDS[kind].filter((field) => item[field] !== undefined).map((field) => [field, structuredClone(item[field])])));
    setHidden(Boolean(override?.hidden));
    setInvalid(false);
  }, [kind, itemId, items, override]);

  function pickKind(next) {
    setKind(next);
    setItemId(allContent(next)[0].id);
    setMessage(null);
  }

  async function save(revert) {
    setBusy(true);
    setMessage(null);
    const changed = Object.fromEntries(Object.entries(draft).filter(([field, value]) => JSON.stringify(value) !== JSON.stringify(original?.[field])));
    try {
      await adminRequest({}, revert ? { action: "content", kind, itemId, revert: true } : { action: "content", kind, itemId, data: changed, hidden });
      await refreshContentOverrides();
      setVersion((value) => value + 1);
      setMessage({ ok: true, text: revert ? t("admin.edit.reverted") : t("admin.edit.saved") });
    } catch (error) {
      setMessage({ ok: false, text: error.status === 500 ? t("admin.edit.noTable") : error.message });
    } finally {
      setBusy(false);
    }
  }

  const marker = (id) => {
    const row = contentOverride(kind, id);
    return row ? (row.hidden ? " 🙈" : " ✎") : "";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["story", "grammar", "topic"].map((option) => (
          <button key={option} type="button" onClick={() => pickKind(option)} aria-pressed={kind === option} className={`rounded-full px-3.5 py-1.5 text-xs font-black ${kind === option ? "bg-sky-600 text-white" : "bg-slate-100 dark:bg-white/10"}`}>
            {t(`admin.edit.kind.${option}`)}
          </button>
        ))}
      </div>
      <select value={itemId} onChange={(event) => { setItemId(event.target.value); setMessage(null); }} className={input}>
        {items.map((item) => <option key={item.id} value={item.id}>{itemLabel(kind, item, t)}{marker(item.id)}</option>)}
      </select>

      {draft && (
        <div key={`${kind}:${itemId}:${version}`} className="space-y-3">
          {Object.entries(draft).map(([field, value]) => (
            <div key={field}>
              <p className="mb-1 text-xs font-black uppercase text-slate-500">
                {field}
                {JSON.stringify(value) !== JSON.stringify(original?.[field]) && <span className="ml-2 normal-case text-amber-600">● {t("admin.edit.changed")}</span>}
              </p>
              <FieldEditor value={value} onChange={(next) => setDraft((current) => ({ ...current, [field]: next }))} onInvalid={setInvalid} />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
            {t("admin.edit.hide")}
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || invalid} onClick={() => save(false)} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">{t("common.save")}</button>
            {override && (
              <button type="button" disabled={busy} onClick={() => save(true)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-white/15">{t("admin.edit.revert")}</button>
            )}
          </div>
          {invalid && <p className="text-xs font-bold text-rose-600">{t("admin.edit.badJson")}</p>}
          {message && <p role={message.ok ? "status" : "alert"} className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
        </div>
      )}
    </div>
  );
}
