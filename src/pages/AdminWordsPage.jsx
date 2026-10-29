import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { allWords, getWordKey, originalWord } from "../data";
import { formatDate } from "../lib/dates";
import { searchWords } from "../lib/search";
import { supabase } from "../lib/supabase";
import { refreshWordOverrides } from "../lib/wordOverrides";
import { Panel, StatTile } from "./AdminPage";

const FIELDS = ["uzbek", "english", "russian", "romanization"];
const EXAMPLE_FIELDS = ["ko", "uz", "en", "ru"];
const VIEWS = ["edited", "review", "all"];
const control =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

function formFor(word, override) {
  const base = originalWord(getWordKey(word)) || word;
  return {
    ...Object.fromEntries(FIELDS.map((field) => [field, override?.[field] ?? base[field] ?? ""])),
    example: Object.fromEntries(EXAMPLE_FIELDS.map((field) => [field, (override?.example || base.example || {})[field] || ""])),
    needsReview: override?.needs_review ?? Boolean(base.needsReview),
    note: override?.note || "",
  };
}

function WordEditor({ word, override, onSaved }) {
  const { t, i18n } = useTranslation();
  const key = getWordKey(word);
  const base = originalWord(key) || word;
  const [form, setForm] = useState(() => formFor(word, override));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => setForm(formFor(word, override)), [word, override]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    // Store only what differs from the built-in word, so later data fixes still apply.
    const changed = (field) => (form[field].trim() && form[field].trim() !== (base[field] || "") ? form[field].trim() : null);
    const exampleChanged = EXAMPLE_FIELDS.some((field) => form.example[field].trim() !== ((base.example || {})[field] || ""));
    const row = {
      word_key: key,
      ...Object.fromEntries(FIELDS.map((field) => [field, changed(field)])),
      example: exampleChanged && form.example.ko.trim() ? Object.fromEntries(EXAMPLE_FIELDS.map((field) => [field, form.example[field].trim()])) : null,
      needs_review: form.needsReview === Boolean(base.needsReview) ? null : form.needsReview,
      note: form.note.trim(),
    };
    const empty = FIELDS.every((field) => row[field] === null) && row.example === null && row.needs_review === null && !row.note;
    const { error } = empty
      ? await supabase.from("word_overrides").delete().eq("word_key", key)
      : await supabase.from("word_overrides").upsert(row, { onConflict: "word_key" });
    setSaving(false);
    if (error) {
      setMessage({ ok: false, text: error.code === "42P01" ? t("adminWords.noTable") : t("feedback.adminSaveError") });
      return;
    }
    setMessage({ ok: true, text: empty ? t("adminWords.reverted") : t("feedback.saveSuccess") });
    await refreshWordOverrides();
    onSaved();
  }

  async function revert() {
    if (!window.confirm(t("adminWords.confirmRevert"))) return;
    setSaving(true);
    await supabase.from("word_overrides").delete().eq("word_key", key);
    await refreshWordOverrides();
    setSaving(false);
    setMessage({ ok: true, text: t("adminWords.reverted") });
    onSaved();
  }

  const field = (name, label) => (
    <label className="block text-xs font-bold">
      {label}
      <input value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className={control} />
      {base[name] && form[name] !== base[name] && <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">{t("adminWords.original")}: {base[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-3xl font-black">{word.korean}</h3>
        <span className="text-xs font-bold text-slate-500">
          {t("card.lesson", { lesson: word.lesson })} · #{key}
        </span>
        {override && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
            {t("adminWords.editedOn", { date: formatDate(override.updated_at, i18n.language) })}
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("uzbek", "O'zbekcha")}
        {field("english", "English")}
        {field("russian", "Русский")}
        {field("romanization", t("adminWords.romanization"))}
      </div>
      <fieldset className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
        <legend className="px-1 text-xs font-black">{t("study.example")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLE_FIELDS.map((name) => (
            <label key={name} className="block text-xs font-bold uppercase">
              {name}
              <input
                value={form.example[name]}
                onChange={(event) => setForm({ ...form, example: { ...form.example, [name]: event.target.value } })}
                className={control}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.needsReview} onChange={(event) => setForm({ ...form, needsReview: event.target.checked })} className="h-4 w-4 accent-amber-500" />
        {t("adminWords.needsReview")}
      </label>
      <label className="block text-xs font-bold">
        {t("adminWords.note")}
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows={2} className={control} />
      </label>
      {message && <p role={message.ok ? "status" : "alert"} className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
          {saving ? t("common.loading") : t("feedback.saveTicket")}
        </button>
        {override && (
          <button type="button" disabled={saving} onClick={revert} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-white/15">
            ↺ {t("adminWords.revert")}
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminWordsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [overrides, setOverrides] = useState([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const selectedKey = params.get("word");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("word_overrides").select("*").order("updated_at", { ascending: false });
    setTableMissing(Boolean(error));
    setOverrides(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const overrideByKey = useMemo(() => new Map(overrides.map((row) => [row.word_key, row])), [overrides]);
  const needsReview = allWords.filter((word) => word.needsReview);

  const visible = useMemo(() => {
    let list = query.trim() ? searchWords(allWords, query, (word) => word.uzbek) : allWords;
    if (view === "edited") list = list.filter((word) => overrideByKey.has(getWordKey(word)));
    if (view === "review") list = list.filter((word) => word.needsReview);
    return list.slice(0, 200);
  }, [query, view, overrideByKey]);

  const selected = selectedKey ? allWords.find((word) => getWordKey(word) === selectedKey) : null;

  return (
    <div className="space-y-5">
      {tableMissing && (
        <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
          {t("adminWords.noTable")}
        </p>
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t("adminWords.total")} value={allWords.length} />
        <StatTile tone="violet" label={t("adminWords.edited")} value={overrides.length} />
        <StatTile tone="amber" label={t("adminWords.needsReview")} value={needsReview.length} />
        <StatTile tone="emerald" label={t("adminWords.withExamples")} value={allWords.filter((word) => word.example).length} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className={`space-y-3 ${selected ? "hidden lg:block" : ""}`}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("adminWords.search")}
            aria-label={t("adminWords.search")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5"
          />
          <div className="flex gap-2">
            {VIEWS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-black ${view === key ? "bg-sky-600 text-white" : "bg-white text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
              >
                {t(`adminWords.view.${key}`)}
              </button>
            ))}
          </div>
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 dark:divide-white/5 dark:border-white/10 dark:bg-white/5">
            {visible.map((word) => {
              const key = getWordKey(word);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setParams({ word: key })}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${key === selectedKey ? "bg-sky-50 dark:bg-sky-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}
                  >
                    <span className="w-14 shrink-0 text-xs font-bold text-slate-400">{key}</span>
                    <span className="font-black">{word.korean}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-500 dark:text-slate-400">{word.uzbek}</span>
                    {overrideByKey.has(key) && <span className="text-xs" title={t("adminWords.edited")}>✏️</span>}
                    {word.needsReview && <span className="text-xs" title={t("adminWords.needsReview")}>⚠️</span>}
                  </button>
                </li>
              );
            })}
            {!visible.length && <li className="p-6 text-center text-sm text-slate-500">{t("feedback.noneInFilter")}</li>}
          </ul>
        </div>

        <div className={selected ? "" : "hidden lg:block"}>
          {selected ? (
            <Panel>
              <button type="button" onClick={() => setParams({})} className="mb-3 text-sm font-bold text-sky-600 dark:text-sky-300 lg:hidden">
                ‹ {t("adminWords.back")}
              </button>
              <WordEditor word={selected} override={overrideByKey.get(selectedKey)} onSaved={load} />
            </Panel>
          ) : (
            <div className="grid h-60 place-items-center rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500 dark:border-white/15">
              {t("adminWords.pick")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
