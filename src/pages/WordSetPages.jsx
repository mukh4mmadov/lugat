import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import LessonAudio from "../components/LessonAudio";
import AnkiSettingsPanel from "../components/anki/AnkiSettingsPanel";
import AnkiStats from "../components/anki/AnkiStats";
import { getWordKey, meaning } from "../data";
import { useHasTopik2Cards, useTopikWords } from "../lib/useTopikWords";
import { readCard, todayCounts } from "../lib/anki";
import { STATE } from "../lib/fsrs";
import { allLessonSets, allUnitSets, everyUnitSet, lessonSet, setStats, setSubtitle, setTitle, unitSet } from "../lib/wordSets";
import { selectAnkiOptions, selectReviewCount } from "../store";

function useSetRows(sets, levels) {
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const vocab = useTopikWords(levels);
  return useMemo(
    () => sets.map((set) => ({ set, stats: setStats(progress, set, options) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sets, progress, options, vocab],
  );
}

function DueBadge({ count, className = "" }) {
  const { t } = useTranslation();
  if (!count) return null;
  return <span className={`inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-black text-white shadow-md shadow-rose-500/30 ${className}`}>🔁 {t("sets.due", { count })}</span>;
}

function Bar({ stats }) {
  const width = (value) => `${(value / Math.max(1, stats.total)) * 100}%`;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
      <span className="bg-emerald-500" style={{ width: width(stats.learned) }} />
      <span className="bg-amber-400" style={{ width: width(stats.learning) }} />
    </div>
  );
}

function SetTile({ set, stats }) {
  const { t, i18n } = useTranslation();
  return (
    <Link to={set.home} className={`block min-w-0 rounded-3xl border bg-white/70 p-4 transition hover:-translate-y-0.5 dark:bg-white/5 ${stats.due ? "border-rose-300 dark:border-rose-400/40" : "border-slate-200 hover:border-sky-300 dark:border-white/10"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-black text-white ${set.kind === "lesson" ? "bg-gradient-to-br from-sky-400 to-violet-500" : "bg-gradient-to-br from-emerald-400 to-sky-500"}`}>{set.n}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-black">{set.kind === "lesson" ? t("card.lesson", { lesson: set.n }) : setSubtitle(set, t, i18n.language)}</p>
          <p className="truncate text-xs text-slate-500 first-letter:uppercase dark:text-slate-400">
            {set.kind === "lesson" ? setSubtitle(set, t, i18n.language) : t("units.unit", { n: set.n })} · {t("units.words", { count: stats.total })}
          </p>
        </div>
      </div>
      <div className="mt-3"><Bar stats={stats} /></div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("units.learned", { done: stats.learned, total: stats.total })}</p>
        <DueBadge count={stats.due} />
      </div>
    </Link>
  );
}

function TodayStrip({ onSettings }) {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const today = todayCounts(progress, options);
  const studied = (today.new || 0) + (today.learn || 0) + (today.review || 0);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Mini label={t("anki.todayCards")} value={studied} />
      <Mini label={t("anki.todayMinutes")} value={Math.round((today.ms || 0) / 60000)} />
      {onSettings && (
        <button type="button" onClick={onSettings} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black dark:border-white/10">⚙ {t("anki.settings.title")}</button>
      )}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="min-w-[6.5rem] rounded-xl bg-slate-950/5 px-3 py-2 dark:bg-white/10">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

const LEVELS = [
  { id: "basic", ko: "기초" },
  { id: "t1", ko: "초급" },
  { id: "t2b", ko: "중급" },
  { id: "t2c", ko: "고급" },
];
const LESSON_STAGE = 8;
const levelOf = (set) => (set.kind === "lesson" ? "basic" : set.unit.band);
const stageOf = (set) => (set.kind === "lesson" ? Math.floor((set.n - 1) / LESSON_STAGE) + 1 : set.unit.stage);
const total = (rows, field) => rows.reduce((sum, row) => sum + row.stats[field], 0);
const OLD_TABS = { units: "t1", units2: "t2b" };

function stagesOf(rows) {
  const stages = [];
  for (const row of rows) {
    const n = stageOf(row.set);
    let stage = stages.find((item) => item.n === n);
    if (!stage) {
      stage = { n, rows: [] };
      stages.push(stage);
    }
    stage.rows.push(row);
  }
  return stages;
}

function current(list) {
  const done = (item) => total(item.rows, "learned") >= total(item.rows, "total");
  const started = (item) => item.rows.some((row) => row.stats.learned || row.stats.learning);
  return list.find((item) => started(item) && !done(item)) || list.find((item) => !done(item)) || list[0];
}

function Stage({ stage, open }) {
  const { t, i18n } = useTranslation();
  const names = [...new Set(stage.rows.map(({ set }) => (set.kind === "lesson" ? setSubtitle(set, t, i18n.language) : set.unit.title[String(i18n.language).slice(0, 2)] || set.unit.title.uz)))];
  const due = total(stage.rows, "due");
  return (
    <details open={open} className="group/stage rounded-2xl border border-slate-200 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-black">{t("sets.stage", { n: stage.n })}</span>
          <span className="block truncate text-xs text-slate-500 first-letter:uppercase dark:text-slate-400">{names.slice(0, 3).join(", ")}{names.length > 3 ? " …" : ""}</span>
          <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">{t("units.learned", { done: total(stage.rows, "learned"), total: total(stage.rows, "total") })}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <DueBadge count={due} />
          <span aria-hidden="true" className="text-slate-400 transition group-open/stage:rotate-180">▾</span>
        </span>
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stage.rows.map(({ set, stats }) => <SetTile key={set.key} set={set} stats={stats} />)}
      </div>
    </details>
  );
}

function Level({ level, rows, open, onToggle }) {
  const { t } = useTranslation();
  const stages = useMemo(() => stagesOf(rows), [rows]);
  const now = current(stages);
  const words = total(rows, "total");
  const learned = total(rows, "learned");
  const due = total(rows, "due");
  const count = level.id === "basic" ? t("home.lessonCount", { count: rows.length }) : t("units.count", { count: rows.length });
  return (
    <details id={`level-${level.id}`} open={open} onToggle={(event) => onToggle(event.currentTarget.open)} className="group/level scroll-mt-20 rounded-3xl border border-slate-200 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-5">
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-black text-white" lang="ko">{level.ko}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black md:text-xl">{t(`sets.level.${level.id}`)}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t(`sets.level.${level.id}Text`)}</span>
          <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">{t("sets.stages", { count: stages.length })} · {count} · {t("units.learned", { done: learned, total: words })}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <DueBadge count={due} />
          <span aria-hidden="true" className="text-slate-400 transition group-open/level:rotate-180">▾</span>
        </span>
      </summary>
      {open && (
        <div className="mt-3 space-y-2">
          <Bar stats={{ total: words, learned, learning: total(rows, "learning") }} />
          {stages.map((stage) => <Stage key={stage.n} stage={stage} open={stage === now} />)}
        </div>
      )}
    </details>
  );
}

export function StudyHub() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const asked = params.get("level") || OLD_TABS[params.get("tab")] || null;
  const [showSettings, setShowSettings] = useState(false);
  const [chosen, setChosen] = useState(asked ? [asked] : null);
  const lessons = useMemo(() => allLessonSets(), []);
  const units = useMemo(() => allUnitSets("topik1"), []);
  const units2 = useMemo(() => allUnitSets("topik2"), []);
  const hasTopik2 = useHasTopik2Cards();
  const wantsTopik2 = hasTopik2 || (chosen || []).some((id) => id.startsWith("t2"));
  const lessonRows = useSetRows(lessons);
  const unitRows = useSetRows(units);
  const unit2Rows = useSetRows(units2, wantsTopik2 ? ["topik1", "topik2"] : ["topik1"]);
  const levels = useMemo(() => {
    const all = [...lessonRows, ...unitRows, ...unit2Rows];
    return LEVELS.map((level) => ({ ...level, rows: all.filter((row) => levelOf(row.set) === level.id) }));
  }, [lessonRows, unitRows, unit2Rows]);
  const open = chosen || [current(levels).id];

  useEffect(() => {
    if (asked) document.getElementById(`level-${asked}`)?.scrollIntoView({ block: "start" });
  }, [asked]);

  const toggle = (id, isOpen) => {
    if (isOpen === open.includes(id)) return;
    setChosen(isOpen ? [...open, id] : open.filter((item) => item !== id));
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">어휘 · {t("sets.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-black md:text-4xl">{t("sets.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{t("sets.subtitle")}</p>
        <TodayStrip onSettings={() => setShowSettings(true)} />
      </GlassCard>

      <AnkiStats />

      <div className="space-y-3">
        {levels.map((level) => <Level key={level.id} level={level} rows={level.rows} open={open.includes(level.id)} onToggle={(isOpen) => toggle(level.id, isOpen)} />)}
      </div>
      {showSettings && <AnkiSettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export function ReviewHub() {
  const { t } = useTranslation();
  const sets = useMemo(() => [...allLessonSets(), ...everyUnitSet()], []);
  const hasTopik2 = useHasTopik2Cards();
  const rows = useSetRows(sets, hasTopik2 ? ["topik1", "topik2"] : ["topik1"]);
  const due = rows.filter((row) => row.stats.due > 0).sort((a, b) => b.stats.due - a.stats.due);
  const total = useSelector(selectReviewCount);
  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 dark:text-rose-300">복습 · {t("nav.review")}</p>
        <h1 className="mt-1 text-2xl font-black md:text-4xl">{total ? t("sets.reviewTitle", { count: total }) : t("sets.allCaughtUp")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{total ? t("sets.reviewText") : t("sets.allCaughtUpText")}</p>
        <TodayStrip />
        {!total && <Link to="/study" className="mt-4 inline-flex rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("sets.chooseSet")}</Link>}
      </GlassCard>
      {total > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {due.map(({ set, stats }) => (
            <div key={set.key} className="space-y-2">
              <SetTile set={set} stats={stats} />
              <Link to={set.cards} className="block rounded-2xl bg-rose-500 px-4 py-2.5 text-center text-sm font-black text-white shadow-lg shadow-rose-500/20">▶ {t("sets.reviewNow", { count: stats.due })}</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, tone = "" }) {
  return (
    <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/10">
      <p className={`text-xl font-black tabular-nums ${tone}`}>{value}</p>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function lastStudied(at, t) {
  if (!at) return t("sets.never");
  const startOf = (time) => new Date(time).setHours(0, 0, 0, 0);
  const days = Math.round((startOf(Date.now()) - startOf(at)) / 864e5);
  if (days <= 0) return t("sets.today");
  if (days === 1) return t("sets.yesterday");
  return t("sets.daysAgo", { count: days });
}

function SetHome({ set }) {
  const { t, i18n } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const vocab = useTopikWords(set.level ? [set.level] : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => set.words(), [set, vocab]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => setStats(progress, set, options), [progress, set, options, vocab]);
  const [showWords, setShowWords] = useState(false);
  const [level, setLevel] = useState(0);
  const levels = [...new Set(words.map((word) => word.level).filter(Boolean))].sort();
  const listed = level ? words.filter((word) => word.level === level) : words;
  const last = lastStudied(stats.last, t);
  const neighbour = (n) => (set.kind === "lesson" ? lessonSet(n) : unitSet(n, set.level));
  const previous = neighbour(set.n - 1);
  const next = neighbour(set.n + 1);
  const backTo = set.list;

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-7">
        <Link to={backTo} className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t(set.kind === "lesson" ? "sets.allLessons" : "sets.allUnits")}</Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black md:text-3xl">{setTitle(set, t, i18n.language)}</h1>
            {set.kind === "lesson" && <p className="text-sm text-slate-500 first-letter:uppercase dark:text-slate-400">{setSubtitle(set, t, i18n.language)}</p>}
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t(`sets.level.${levelOf(set)}`)} · {t("sets.stage", { n: stageOf(set) })}</p>
          </div>
          <DueBadge count={stats.due} className="text-xs" />
        </div>
        <div className="mt-4"><Bar stats={stats} /></div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <StatTile label={t("sets.stat.learned")} value={`${stats.learned}/${stats.total}`} tone="text-emerald-600 dark:text-emerald-300" />
          <StatTile label={t("sets.stat.learning")} value={stats.learning} tone="text-amber-600 dark:text-amber-300" />
          <StatTile label={t("sets.stat.new")} value={stats.fresh} tone="text-sky-600 dark:text-sky-300" />
          <StatTile label={t("sets.stat.due")} value={stats.due} tone={stats.due ? "text-rose-600 dark:text-rose-300" : ""} />
          <StatTile label={t("sets.stat.accuracy")} value={stats.accuracy === null || stats.accuracy === undefined ? "—" : `${stats.accuracy}%`} />
          <StatTile label={t("sets.stat.last")} value={last} />
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to={set.study} className="rounded-3xl bg-sky-500 p-5 text-white shadow-xl shadow-sky-500/25 transition hover:-translate-y-0.5">
          <p className="text-2xl">📘</p>
          <p className="mt-1 text-lg font-black">{t("sets.study")}</p>
          <p className="text-sm opacity-90">{t("sets.studyText", { count: stats.fresh })}</p>
        </Link>
        <Link to={set.cards} className={`relative rounded-3xl p-5 shadow-xl transition hover:-translate-y-0.5 ${stats.due ? "bg-rose-500 text-white shadow-rose-500/25" : "border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"}`}>
          <p className="text-2xl">🃏</p>
          <p className="mt-1 text-lg font-black">{t("sets.cards")}</p>
          <p className={`text-sm ${stats.due ? "opacity-90" : "text-slate-500 dark:text-slate-400"}`}>{stats.due ? t("sets.reviewNow", { count: stats.due }) : t("sets.cardsText")}</p>
        </Link>
      </div>

      {set.kind === "lesson" && (
        <>
          <LessonAudio lesson={set.n} />
          <GlassCard className="p-4 md:p-5">
            <h2 className="text-sm font-black">{t("sets.practice")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black sm:grid-cols-5">
              {[
                ["quiz", t("practice.quiz")],
                ["listening", t("practice.listening")],
                ["writing", t("practice.writing")],
                ["dictation", t("dictation.title")],
                ["grammar", t("nav.grammar")],
              ].map(([path, label]) => (
                <Link key={path} to={path === "grammar" ? "/grammar" : `/topic/${set.n}/${path}`} className="rounded-xl border border-slate-200 px-3 py-2.5 text-center hover:border-sky-300 dark:border-white/10">{label}</Link>
              ))}
            </div>
          </GlassCard>
        </>
      )}

      <GlassCard className="p-4 md:p-5">
        <button type="button" onClick={() => setShowWords((value) => !value)} aria-expanded={showWords} className="flex w-full items-center justify-between text-left text-sm font-black">
          <span>{t("sets.wordList")} · {words.length || stats.total}</span>
          <span aria-hidden="true">{showWords ? "▴" : "▾"}</span>
        </button>
        {showWords && levels.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black" role="group">
            {[0, ...levels].map((value) => (
              <button key={value} type="button" onClick={() => setLevel(value)} aria-pressed={level === value} className={`rounded-full border px-3 py-1 ${level === value ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 dark:border-white/10"}`}>
                {value ? t("word.level", { level: value }) : t("word.levelAll")}
              </button>
            ))}
          </div>
        )}
        {showWords && (
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-white/10">
            {listed.map((word) => {
              const card = readCard(progress, getWordKey(word));
              const tone = !card || card.state === STATE.new ? "bg-slate-300 dark:bg-white/20" : card.state === STATE.review ? "bg-emerald-500" : "bg-amber-400";
              return (
                <li key={getWordKey(word)} className="flex items-center gap-3 py-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} aria-hidden="true" />
                  <span className="font-bold" lang="ko">{word.korean}</span>
                  {word.level > 1 && <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{t("word.level", { level: word.level })}</span>}
                  <span className="min-w-0 flex-1 truncate text-right text-sm text-slate-500 dark:text-slate-400">{meaning(word)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      <div className="flex justify-between gap-2 text-sm font-black">
        {previous ? <Link to={previous.home} className="rounded-xl border border-slate-200 px-4 py-2 dark:border-white/10">← {previous.kind === "lesson" ? t("card.lesson", { lesson: previous.n }) : t("units.unit", { n: previous.n })}</Link> : <span />}
        {next ? <Link to={next.home} className="rounded-xl border border-slate-200 px-4 py-2 dark:border-white/10">{next.kind === "lesson" ? t("card.lesson", { lesson: next.n }) : t("units.unit", { n: next.n })} →</Link> : <span />}
      </div>
    </div>
  );
}

export function LessonHome() {
  const { lessonId } = useParams();
  const set = useMemo(() => lessonSet(lessonId), [lessonId]);
  if (!set) return <Navigate to="/study" replace />;
  return <SetHome key={set.key} set={set} />;
}

export function UnitHome() {
  const { level, unitId } = useParams();
  const set = useMemo(() => unitSet(unitId, level), [unitId, level]);
  if (!set) return <Navigate to="/study" replace />;
  return <SetHome key={set.key} set={set} />;
}
