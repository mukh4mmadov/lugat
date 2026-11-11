import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { lessonInfo } from "../../data";
import { SPEAKING_LEVELS } from "../../data/speakingTopics";
import { TOPIK_EXAMS } from "../../data/topik/exams";
import { adminRequest } from "../../lib/adminApi";
import { refreshContentOverrides } from "../../lib/contentOverrides";
import { refreshCustomTopik } from "../../lib/customTopik";
import { supabase } from "../../lib/supabase";
import { loadTextOverrides } from "../../lib/textOverrides";
import { refreshWordOverrides } from "../../lib/wordOverrides";
import { Panel } from "../../pages/AdminPage";
import ContentHistory from "./ContentHistory";

const KINDS = ["lesson", "word", "story", "grammar", "topic", "topik"];
const LANGS3 = ["uz", "en", "ru"];
const LANGS4 = ["ko", "uz", "en", "ru"];
const TOPIK_QUESTIONS = 70;
const FIRST_READING = 31;

const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";
const label = "mb-1 block text-xs font-black text-slate-500";
const smallButton = "rounded-lg px-2.5 py-1 text-xs font-black";

// Table rows are lists of text; these turn them into the shape the site reads.
const quizRow = {
  columns: ["question", "option1", "option2", "option3", "option4", "correct"],
  read: ([question, options = [], index = 0]) => [question, options[0] || "", options[1] || "", options[2] || "", options[3] || "", String(index + 1)],
  write: ([question, a, b, c, d, correct]) => [question, [a, b, c, d].filter(Boolean), Number(correct) - 1],
};
const hintQuizRow = {
  columns: [...quizRow.columns, "hint"],
  read: (row) => [...quizRow.read(row), row[3] || ""],
  write: (cells) => [...quizRow.write(cells), ...(cells[6] ? [cells[6]] : [])],
};
const textRow = (columns) => ({ columns, read: (row) => row, write: (cells) => cells });
const mistakeRow = {
  columns: ["wrong", "right", "uz", "en", "ru"],
  read: ([wrong, right, text = {}]) => [wrong, right, text.uz || "", text.en || "", text.ru || ""],
  write: ([wrong, right, uz, en, ru]) => [wrong, right, { uz, en, ru }],
};
const topicQuestionRow = {
  columns: LANGS4,
  read: (row) => LANGS4.map((lang) => row[lang] || ""),
  write: ([ko, uz, en, ru]) => ({ ko, uz, en, ru }),
};

const FORMS = {
  lesson: [
    { key: "course", type: "select", options: ["1A", "1B"] },
    { key: "category", type: "langs", langs: LANGS3 },
  ],
  word: [
    { key: "lesson", type: "number" },
    { key: "korean" },
    { key: "romanization" },
    { key: "uzbek" },
    { key: "english" },
    { key: "russian" },
    { key: "example", type: "langs", langs: LANGS4 },
  ],
  story: [
    { key: "lesson", type: "number" },
    { key: "emoji" },
    { key: "title", type: "langs", langs: LANGS4 },
    { key: "words", type: "list" },
    { key: "lines", type: "rows", row: textRow(LANGS4) },
    { key: "questions", type: "rows", row: quizRow },
  ],
  grammar: [
    { key: "lesson", type: "number" },
    { key: "pattern" },
    { key: "title", type: "langs", langs: LANGS3 },
    { key: "explain", type: "langs", langs: LANGS3 },
    { key: "rules", type: "rows", row: textRow(LANGS4) },
    { key: "examples", type: "rows", row: textRow(LANGS4) },
    { key: "mistakes", type: "rows", row: mistakeRow },
    { key: "quiz", type: "rows", row: hintQuizRow },
  ],
  topic: [
    { key: "level", type: "select", options: SPEAKING_LEVELS },
    { key: "emoji" },
    { key: "ko" },
    { key: "uz" },
    { key: "en" },
    { key: "ru" },
    { key: "words", type: "list" },
    { key: "questions", type: "rows", row: topicQuestionRow },
  ],
};

const REQUIRED = {
  lesson: ["category"],
  word: ["lesson", "korean", "uzbek"],
  story: ["lesson", "title", "lines"],
  grammar: ["lesson", "pattern", "title", "explain"],
  topic: ["level", "ko", "uz", "questions"],
  topik: ["number", "title", "pdf"],
};

const stamp = () => Date.now().toString(36);

function blank(kind) {
  const values = Object.fromEntries((FORMS[kind] || []).map((item) => {
    if (item.type === "langs") return [item.key, Object.fromEntries(item.langs.map((lang) => [lang, ""]))];
    if (item.type === "rows" || item.type === "list") return [item.key, []];
    if (item.type === "select") return [item.key, item.options[0]];
    return [item.key, ""];
  }));
  if (kind === "story") values.emoji = "📖";
  if (kind === "topic") values.emoji = "💬";
  if (kind === "lesson") values.course = "1B";
  if (kind !== "topik") return values;
  const paper = TOPIK_EXAMS[0];
  return {
    number: "", title: "", form: "", pdf: "", audio: "", listeningMinutes: paper.listeningMinutes, readingMinutes: paper.readingMinutes,
    rows: Array.from({ length: TOPIK_QUESTIONS }, (_, index) => {
      const sample = paper.questions[index];
      return [index + 1, index + 1 < FIRST_READING ? "listening" : "reading", sample?.points || 3, sample?.page || 1, ""];
    }),
  };
}

const filled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some((item) => String(item).trim());
  return String(value ?? "").trim() !== "";
};

function RowsField({ row, value, onChange }) {
  const { t } = useTranslation();
  const rows = value.map(row.read);
  const write = (next) => onChange(next.map(row.write));
  return (
    <div className="space-y-2">
      {rows.map((cells, rowIndex) => (
        <div key={rowIndex} className="rounded-xl border border-slate-100 p-2 dark:border-white/5">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {row.columns.map((column, cellIndex) => (
              <input key={column} value={cells[cellIndex] ?? ""} placeholder={t(`studio.col.${column}`)} aria-label={t(`studio.col.${column}`)} onChange={(event) => write(rows.map((item, index) => (index === rowIndex ? item.map((cell, position) => (position === cellIndex ? event.target.value : cell)) : item)))} className={field} />
            ))}
          </div>
          <button type="button" onClick={() => write(rows.filter((_, index) => index !== rowIndex))} className={`${smallButton} mt-1 text-rose-600`}>✕ {t("studio.removeRow")}</button>
        </div>
      ))}
      <button type="button" onClick={() => write([...rows, row.columns.map(() => "")])} className={`${smallButton} bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200`}>+ {t("studio.addRow")}</button>
    </div>
  );
}

function FormField({ item, value, onChange }) {
  const { t } = useTranslation();
  if (item.type === "langs") {
    return (
      <div className="grid gap-1.5">
        {item.langs.map((lang) => (
          <label key={lang} className="grid grid-cols-[2rem_1fr] items-start gap-2 text-xs font-bold uppercase text-slate-500">
            <span className="pt-2.5">{lang}</span>
            <textarea value={value?.[lang] || ""} rows={item.key === "explain" ? 3 : 1} onChange={(event) => onChange({ ...value, [lang]: event.target.value })} className={`${field} normal-case`} />
          </label>
        ))}
      </div>
    );
  }
  if (item.type === "rows") return <RowsField row={item.row} value={value || []} onChange={onChange} />;
  if (item.type === "list") return <input value={(value || []).join(", ")} onChange={(event) => onChange(event.target.value.split(",").map((word) => word.trim()).filter(Boolean))} placeholder={t("studio.listHint")} className={field} />;
  if (item.type === "select") {
    return <select value={value} onChange={(event) => onChange(event.target.value)} className={field}>{item.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  }
  return <input type={item.type === "number" ? "number" : "text"} min={item.type === "number" ? 1 : undefined} value={value ?? ""} onChange={(event) => onChange(item.type === "number" ? Number(event.target.value) || "" : event.target.value)} className={field} />;
}

// A paper is its PDF, its recording and the answer key.
function TopikForm({ id, data, set }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");

  async function upload(file, name, key) {
    if (!file) return;
    setUploading(key);
    setError("");
    const path = `${id}/${name}`;
    const { error: uploadError } = await supabase.storage.from("topik-papers").upload(path, file, { upsert: true, contentType: file.type });
    setUploading("");
    if (uploadError) return setError(uploadError.message);
    set(key, supabase.storage.from("topik-papers").getPublicUrl(path).data.publicUrl);
  }

  const setRow = (index, position, value) => set("rows", data.rows.map((row, rowIndex) => (rowIndex === index ? row.map((cell, cellIndex) => (cellIndex === position ? value : cell)) : row)));

  function applyPaste(text) {
    setPaste(text);
    const digits = text.replace(/[^1-4]/g, "");
    set("rows", data.rows.map((row, index) => [row[0], row[1], row[2], row[3], digits[index] ? Number(digits[index]) : row[4]]));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className={label}>{t("studio.field.number")}<input type="number" min="1" value={data.number} onChange={(event) => set("number", Number(event.target.value) || "")} className={`${field} mt-1`} /></label>
        <label className={label}>{t("studio.field.form")}<input value={data.form} onChange={(event) => set("form", event.target.value)} className={`${field} mt-1`} /></label>
        <label className={label}>{t("studio.field.title")}<input value={data.title} onChange={(event) => set("title", event.target.value)} className={`${field} mt-1`} /></label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={label}>{t("studio.field.pdf")} {data.pdf && "✓"}<input type="file" accept="application/pdf" onChange={(event) => upload(event.target.files[0], "paper.pdf", "pdf")} className="mt-1 block w-full text-xs" /></label>
        <label className={label}>{t("studio.field.audio")} {data.audio && "✓"}<input type="file" accept="audio/mpeg" onChange={(event) => upload(event.target.files[0], "listening.mp3", "audio")} className="mt-1 block w-full text-xs" /></label>
      </div>
      {uploading && <p role="status" className="text-xs font-bold text-sky-600">{t("studio.uploading")}</p>}
      {error && <p role="alert" className="text-xs font-bold text-rose-600">{error}</p>}
      <label className={label}>{t("studio.pasteAnswers")}<textarea value={paste} onChange={(event) => applyPaste(event.target.value)} rows={2} placeholder="3 2 1 2 1 2 2 4 …" className={`${field} mt-1 font-mono`} /></label>
      <details>
        <summary className="cursor-pointer text-xs font-black text-slate-500">{t("studio.answerTable")}</summary>
        <div className="mt-2 grid max-h-80 gap-1 overflow-y-auto">
          <p className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-1 text-[11px] font-bold text-slate-500"><span>№</span><span>{t("studio.col.correct")}</span><span>{t("studio.col.points")}</span><span>{t("studio.col.page")}</span></p>
          {data.rows.map((row, index) => (
            <div key={row[0]} className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-1 text-xs">
              <span className="font-bold tabular-nums">{row[0]}</span>
              <input value={row[4]} maxLength={1} aria-label={`${row[0]} ${t("studio.col.correct")}`} onChange={(event) => setRow(index, 4, /^[1-4]$/.test(event.target.value) ? Number(event.target.value) : "")} className={field} />
              <input type="number" min="1" value={row[2]} aria-label={`${row[0]} ${t("studio.col.points")}`} onChange={(event) => setRow(index, 2, Number(event.target.value) || 1)} className={field} />
              <input type="number" min="1" value={row[3]} aria-label={`${row[0]} ${t("studio.col.page")}`} onChange={(event) => setRow(index, 3, Number(event.target.value) || 1)} className={field} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

const previewLink = (kind, id, data) => ({
  lesson: `/study/${data.lesson}?draft=1`,
  word: `/study/${data.lesson}?draft=1`,
  story: `/stories/${id}?draft=1`,
  grammar: `/grammar/${id}?draft=1`,
  topic: "/speaking?draft=1",
  topik: `/topik/${id}reading?draft=1`,
}[kind]);

function itemTitle(kind, row) {
  const data = row.data || {};
  if (kind === "lesson") return `${data.lesson} · ${data.category?.uz || ""}`;
  if (kind === "word") return `${data.korean} · ${data.uzbek}`;
  if (kind === "story") return `${data.emoji || ""} ${data.title?.uz || data.title?.ko || ""}`;
  if (kind === "grammar") return data.pattern;
  if (kind === "topic") return `${data.emoji || ""} ${data.uz}`;
  return data.title;
}

// New lessons, words, stories, grammar, topics and TOPIK papers, without code:
// draft, see it as a learner would, publish; every save can be undone.
export default function AdminStudio() {
  const { t } = useTranslation();
  const [kind, setKind] = useState("word");
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("content_overrides").select("kind, item_id, data, hidden, updated_at").like("item_id", "x-%").order("updated_at", { ascending: false });
    setRows(data || []);
    return data || [];
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => rows.filter((row) => row.kind === kind), [rows, kind]);
  const nextLesson = useMemo(() => Math.max(lessonInfo.filter((lesson) => !lesson.custom).length, ...rows.filter((row) => row.kind === "lesson").map((row) => row.data.lesson)) + 1, [rows]);

  function pickKind(next) {
    setKind(next);
    setEdit(null);
    setMessage(null);
  }

  function startNew() {
    const base = `x-${kind}-${stamp()}`;
    setEdit({ id: kind === "story" ? `${base}-a` : base, data: blank(kind), hidden: true, created: false });
    setMessage(null);
  }

  const set = (key, value) => setEdit((current) => ({ ...current, data: { ...current.data, [key]: value } }));

  async function refreshSite() {
    await Promise.all([refreshContentOverrides(), refreshWordOverrides(), refreshCustomTopik(), loadTextOverrides()]);
    return load();
  }

  function problem() {
    const missing = REQUIRED[kind].find((key) => !filled(edit.data[key]));
    if (missing) return t("studio.missing", { field: t(`studio.field.${missing}`) });
    if (kind === "topik" && edit.data.rows.some((row) => !row[4])) return t("studio.missingAnswers");
    return "";
  }

  async function save(hidden) {
    const text = problem();
    if (text) return setMessage({ ok: false, text });
    setBusy(true);
    setMessage(null);
    const data = kind === "lesson" ? { ...edit.data, lesson: edit.data.lesson || nextLesson } : edit.data;
    try {
      await adminRequest({}, { action: "content", kind, itemId: edit.id, data, hidden });
      if (kind === "lesson") {
        await Promise.all(LANGS3.map((language) => adminRequest({}, { action: "textSave", language, key: `lesson.${data.lesson}.category`, value: data.category[language] || data.category.uz })));
      }
      await refreshSite();
      setEdit((current) => ({ ...current, data, hidden, created: true }));
      setMessage({ ok: true, text: t(hidden ? "studio.savedDraft" : "studio.published") });
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(t("studio.deleteConfirm"))) return;
    setBusy(true);
    try {
      await adminRequest({}, { action: "content", kind, itemId: edit.id, revert: true });
      await refreshSite();
      setEdit(null);
      setMessage({ ok: true, text: t("studio.deleted") });
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function afterRestore() {
    const fresh = await refreshSite();
    const row = fresh.find((item) => item.kind === kind && item.item_id === edit.id);
    if (row) setEdit({ id: row.item_id, data: row.data, hidden: row.hidden, created: true });
    else setEdit(null);
  }

  return (
    <div className="space-y-4">
      <Panel title={t("studio.title")}>
        <p className="mb-3 text-xs text-slate-500">{t("studio.text")}</p>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((item) => (
            <button key={item} type="button" aria-pressed={kind === item} onClick={() => pickKind(item)} className={`rounded-xl px-3 py-2 text-xs font-black ${kind === item ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>{t(`studio.kind.${item}`)}</button>
          ))}
        </div>
        <button type="button" onClick={startNew} className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white">+ {t("studio.new")}</button>
        {items.length > 0 && (
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-white/5">
            {items.map((row) => (
              <li key={row.item_id}>
                <button type="button" onClick={() => { setEdit({ id: row.item_id, data: row.data, hidden: row.hidden, created: true }); setMessage(null); }} className="flex w-full items-center justify-between gap-2 py-2 text-left">
                  <span className="min-w-0 truncate font-bold">{itemTitle(kind, row)}</span>
                  <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black ${row.hidden ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"}`}>{t(row.hidden ? "studio.draft" : "studio.live")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {edit && (
        <Panel key={edit.id} title={t(`studio.kind.${kind}`)}>
          <div className="space-y-3">
            {kind === "lesson" && <p className="text-sm font-bold">{t("card.lesson", { lesson: edit.data.lesson || nextLesson })}</p>}
            {kind === "topik" ? <TopikForm id={edit.id} data={edit.data} set={set} /> : FORMS[kind].map((item) => (
              <div key={item.key}>
                <p className={label}>{t(`studio.field.${item.key}`)}{REQUIRED[kind].includes(item.key) && " *"}</p>
                <FormField item={item} value={edit.data[item.key]} onChange={(value) => set(item.key, value)} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => save(true)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black disabled:opacity-50 dark:border-white/15">{t("studio.saveDraft")}</button>
              {edit.created && <a href={previewLink(kind, edit.id, edit.data)} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black dark:border-white/15">{t("studio.preview")}</a>}
              <button type="button" disabled={busy} onClick={() => save(false)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{t("studio.publish")}</button>
              {edit.created && <button type="button" disabled={busy} onClick={remove} className="rounded-xl px-4 py-2 text-sm font-black text-rose-600 disabled:opacity-50">{t("studio.delete")}</button>}
            </div>
            {message && <p role={message.ok ? "status" : "alert"} className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
            {edit.created && <ContentHistory kind={kind} itemId={edit.id} onRestored={afterRestore} />}
          </div>
        </Panel>
      )}
      {!edit && message && <p role="status" className="px-1 text-sm font-bold text-emerald-600">{message.text}</p>}
    </div>
  );
}
