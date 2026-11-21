// Words are studied one lesson or one TOPIK unit at a time: the learner picks
// a set, then learns, reviews and practises inside it. Each set keeps its own
// numbers, and a red badge shows where words wait for review.
import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import LessonAudio from "../components/LessonAudio";
import AnkiSettingsPanel from "../components/anki/AnkiSettingsPanel";
import AnkiStats from "../components/anki/AnkiStats";
import { getWordKey, meaning } from "../data";
import { useTopikWords } from "../lib/useTopikWords";
import { readCard, todayCounts } from "../lib/anki";
import { STATE } from "../lib/fsrs";
import { allLessonSets, allUnitSets, lessonSet, setStats, setSubtitle, setTitle, unitSet } from "../lib/wordSets";
import { selectAnkiOptions, selectReviewCount } from "../store";

function useSetRows(sets) {
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const vocab = useTopikWords();
  return useMemo(
    () => sets.map((set) => ({ set, stats: setStats(progress, set, options) })),
    // vocab: unit numbers appear once the TOPIK list has loaded.
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

// /study: pick a lesson or a TOPIK unit.
export function StudyHub() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "units" ? "units" : "lessons";
  const [showSettings, setShowSettings] = useState(false);
  const lessons = useMemo(() => allLessonSets(), []);
  const units = useMemo(() => allUnitSets(), []);
  const lessonRows = useSetRows(lessons);
  const unitRows = useSetRows(units);
  const rows = tab === "units" ? unitRows : lessonRows;
  const dueIn = (list) => list.reduce((sum, row) => sum + row.stats.due, 0);
  const tabs = [
    { id: "lessons", label: t("sets.tab.lessons"), count: lessons.length, due: dueIn(lessonRows) },
    { id: "units", label: t("sets.tab.units"), count: units.length, due: dueIn(unitRows) },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">어휘 · {t("sets.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-black md:text-4xl">{t("sets.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{t("sets.subtitle")}</p>
        <TodayStrip onSettings={() => setShowSettings(true)} />
      </GlassCard>

      <AnkiStats />

      <div className="grid grid-cols-2 gap-2" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setParams(item.id === "units" ? { tab: "units" } : {}, { replace: true })}
            className={`relative rounded-2xl border px-3 py-3 text-sm font-black transition ${tab === item.id ? "border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/25" : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"}`}
          >
            {item.label} <span className="opacity-70">· {item.count}</span>
            {item.due > 0 && <span className="absolute -right-1 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-black text-white">{item.due}</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ set, stats }) => <SetTile key={set.key} set={set} stats={stats} />)}
      </div>
      {showSettings && <AnkiSettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

// /review: every lesson and unit with words to review today.
export function ReviewHub() {
  const { t } = useTranslation();
  const sets = useMemo(() => [...allLessonSets(), ...allUnitSets()], []);
  const rows = useSetRows(sets);
  const due = rows.filter((row) => row.stats.due > 0).sort((a, b) => b.stats.due - a.stats.due);
  // A word can be in both a lesson and a unit; the total counts it once.
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

// "Today", "Yesterday", "3 days ago".
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
  const vocab = useTopikWords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => set.words(), [set, vocab]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => setStats(progress, set, options), [progress, set, options, vocab]);
  const [showWords, setShowWords] = useState(false);
  // Topic decks mark each word's TOPIK level; the list can show one level.
  const [level, setLevel] = useState(0);
  const levels = [...new Set(words.map((word) => word.level).filter(Boolean))].sort();
  const listed = level ? words.filter((word) => word.level === level) : words;
  const last = lastStudied(stats.last, t);
  const neighbour = (n) => (set.kind === "lesson" ? lessonSet(n) : unitSet(n));
  const previous = neighbour(set.n - 1);
  const next = neighbour(set.n + 1);
  const backTo = set.kind === "lesson" ? "/study" : "/study?tab=units";

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-7">
        <Link to={backTo} className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t(set.kind === "lesson" ? "sets.allLessons" : "sets.allUnits")}</Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black md:text-3xl">{setTitle(set, t, i18n.language)}</h1>
            {set.kind === "lesson" && <p className="text-sm text-slate-500 first-letter:uppercase dark:text-slate-400">{setSubtitle(set, t, i18n.language)}</p>}
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
  const { unitId } = useParams();
  const set = useMemo(() => unitSet(unitId), [unitId]);
  if (!set) return <Navigate to="/study?tab=units" replace />;
  return <SetHome key={set.key} set={set} />;
}
