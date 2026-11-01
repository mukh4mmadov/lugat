import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { REGIONS } from "../../data/korea/guide";
import { UNIVERSITIES } from "../../data/korea/universities";
import { formatSom, formatWon, regionName, uniName, useWonRate } from "../../lib/studyKorea";

const PAGE = 24;
const input = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

// Where a fact comes from, and when it was checked.
export function SourceNote({ sources, field }) {
  const { t } = useTranslation();
  const list = (sources || []).filter((source) => !field || source.field === field);
  if (!list.length) return null;
  return (
    <span className="text-[11px] text-slate-500">
      {list.map((source, index) => (
        <span key={source.url + index}>
          {index > 0 && " · "}
          {t("korea.source")}:{" "}
          <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.publisher || source.name}</a>
          {source.date && `, ${source.date}`}
          {source.note && ` (${t(`korea.sourceNote.${source.note.replace(/ /g, "_")}`, { defaultValue: source.note })})`}
        </span>
      ))}
    </span>
  );
}

export function IeqasBadge({ uni, compact = false }) {
  const { t } = useTranslation();
  const { degree, language, excellent } = uni.ieqas;
  if (degree === "scrutiny" || language === "scrutiny") {
    return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-black text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">⚠️ {t("korea.ieqas.scrutiny")}</span>;
  }
  if (excellent) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">🏅 {t("korea.ieqas.excellent")}</span>;
  if (degree === "certified" || language === "certified") return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">✓ {t("korea.ieqas.certified")}</span>;
  return compact ? null : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{t("korea.ieqas.none")}</span>;
}

function UniversityCard({ uni, selected, onToggle, rate }) {
  const { t, i18n } = useTranslation();
  const som = formatSom(uni.tuition, rate, t);
  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
      <Link to={`/korea/u/${uni.id}`} className="min-w-0">
        <p className="truncate text-base font-black">{uniName(uni, i18n.language)}</p>
        <p className="truncate text-xs text-slate-500" lang="ko">{uni.ko} · {regionName(uni.region, i18n.language)}</p>
      </Link>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <IeqasBadge uni={uni} />
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold dark:bg-white/10">{t(`korea.kind.${uni.kind}`)}</span>
        {uni.founding && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold dark:bg-white/10">{t(`korea.founding.${uni.founding}`)}</span>}
      </div>
      <p className="mt-3 text-sm">
        <span className="font-black tabular-nums">{formatWon(uni.tuition)}</span>
        <span className="text-xs text-slate-500"> / {t("korea.perYear")}</span>
        {som && <span className="block text-xs font-bold text-slate-500">≈ {som}</span>}
      </p>
      <div className="mt-auto flex gap-2 pt-3">
        <Link to={`/korea/u/${uni.id}`} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black text-white dark:bg-white dark:text-slate-950">{t("korea.details")}</Link>
        <button type="button" onClick={() => onToggle(uni.id)} aria-pressed={selected} className={`rounded-xl px-3 py-2 text-xs font-black ${selected ? "bg-sky-600 text-white" : "border border-slate-300 dark:border-white/15"}`}>
          {selected ? "✓ " : "+ "}{t("korea.compare")}
        </button>
      </div>
    </li>
  );
}

export function CompareTable({ ids, onClose }) {
  const { t, i18n } = useTranslation();
  const rate = useWonRate();
  const list = ids.map((id) => UNIVERSITIES.find((uni) => uni.id === id)).filter(Boolean);
  const rows = [
    [t("korea.region"), (uni) => regionName(uni.region, i18n.language)],
    [t("korea.type"), (uni) => `${t(`korea.kind.${uni.kind}`)}${uni.founding ? ` · ${t(`korea.founding.${uni.founding}`)}` : ""}`],
    [t("korea.tuition"), (uni) => `${formatWon(uni.tuition)}${formatSom(uni.tuition, rate, t) ? ` (≈ ${formatSom(uni.tuition, rate, t)})` : ""}`],
    [t("korea.entranceFee"), (uni) => (uni.entranceFee ? formatWon(uni.entranceFee) : "0")],
    [t("korea.ieqas.title"), (uni) => <IeqasBadge uni={uni} />],
    [t("korea.languageProgram"), (uni) => (uni.ieqas.language === "certified" ? `✓ ${t("korea.ieqas.certified")}` : uni.ieqas.language === "scrutiny" ? `⚠️ ${t("korea.ieqas.scrutiny")}` : "—")],
  ];
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">{t("korea.compareTitle")}</h2>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-1.5 font-black dark:bg-white/10">✕</button>
        </div>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr>
              <th className="w-36" />
              {list.map((uni) => (
                <th key={uni.id} className="p-2 align-top">
                  <Link to={`/korea/u/${uni.id}`} className="font-black underline-offset-2 hover:underline">{uniName(uni, i18n.language)}</Link>
                  <span className="block text-xs font-normal text-slate-500" lang="ko">{uni.ko}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td className="p-2 text-xs font-bold text-slate-500">{label}</td>
                {list.map((uni) => <td key={uni.id} className="p-2">{value(uni)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3"><SourceNote sources={list[0]?.sources.filter((source) => source.field !== "site")} /></p>
      </div>
    </div>
  );
}

// The searchable, filterable list of universities.
export default function Catalog() {
  const { t, i18n } = useTranslation();
  const rate = useWonRate();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [kind, setKind] = useState("university");
  const [founding, setFounding] = useState("");
  const [ieqas, setIeqas] = useState("certified");
  const [maxTuition, setMaxTuition] = useState(0);
  const [sort, setSort] = useState("featured");
  const [shown, setShown] = useState(PAGE);
  const [compare, setCompare] = useState([]);
  const [comparing, setComparing] = useState(false);

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = UNIVERSITIES.filter((uni) => {
      if (needle && !`${uni.ko} ${uni.en || ""} ${uni.romanized}`.toLowerCase().includes(needle)) return false;
      if (region && uni.region !== region) return false;
      if (kind && uni.kind !== kind) return false;
      if (founding && uni.founding !== founding) return false;
      if (ieqas === "certified" && uni.ieqas.degree !== "certified" && uni.ieqas.language !== "certified") return false;
      if (ieqas === "excellent" && !uni.ieqas.excellent) return false;
      if (ieqas === "noScrutiny" && (uni.ieqas.degree === "scrutiny" || uni.ieqas.language === "scrutiny")) return false;
      if (maxTuition && (!uni.tuition || uni.tuition > maxTuition * 1e6)) return false;
      return true;
    });
    const sorters = {
      featured: () => 0,
      cheap: (a, b) => (a.tuition || 9e9) - (b.tuition || 9e9),
      expensive: (a, b) => (b.tuition || 0) - (a.tuition || 0),
      name: (a, b) => uniName(a, i18n.language).localeCompare(uniName(b, i18n.language)),
    };
    return [...filtered].sort(sorters[sort]);
  }, [query, region, kind, founding, ieqas, maxTuition, sort, i18n.language]);

  const toggle = (id) => setCompare((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-3)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShown(PAGE); }} placeholder={t("korea.search")} aria-label={t("korea.search")} className={`${input} col-span-2`} />
        <select value={region} onChange={(event) => setRegion(event.target.value)} className={input} aria-label={t("korea.region")}>
          <option value="">{t("korea.allRegions")}</option>
          {Object.keys(REGIONS).map((key) => <option key={key} value={key}>{regionName(key, i18n.language)}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className={input} aria-label={t("korea.sort")}>
          {["featured", "cheap", "expensive", "name"].map((key) => <option key={key} value={key}>{t(`korea.sortBy.${key}`)}</option>)}
        </select>
        <select value={kind} onChange={(event) => setKind(event.target.value)} className={input} aria-label={t("korea.type")}>
          <option value="">{t("korea.allTypes")}</option>
          {["university", "college", "graduate"].map((key) => <option key={key} value={key}>{t(`korea.kind.${key}`)}</option>)}
        </select>
        <select value={founding} onChange={(event) => setFounding(event.target.value)} className={input} aria-label={t("korea.founding.title")}>
          <option value="">{t("korea.founding.all")}</option>
          <option value="public">{t("korea.founding.public")}</option>
          <option value="private">{t("korea.founding.private")}</option>
        </select>
        <select value={ieqas} onChange={(event) => setIeqas(event.target.value)} className={input} aria-label={t("korea.ieqas.title")}>
          {["certified", "excellent", "noScrutiny", "all"].map((key) => <option key={key} value={key}>{t(`korea.ieqasFilter.${key}`)}</option>)}
        </select>
        <select value={maxTuition} onChange={(event) => setMaxTuition(Number(event.target.value))} aria-label={t("korea.maxTuition")} className={input}>
            <option value={0}>{t("korea.maxTuition")}: {t("korea.any")}</option>
            {[4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>≤ ₩{value} mln</option>)}
        </select>
      </div>

      <p className="text-sm font-bold text-slate-500">{t("korea.found", { count: list.length })}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, shown).map((uni) => <UniversityCard key={uni.id} uni={uni} rate={rate} selected={compare.includes(uni.id)} onToggle={toggle} />)}
      </ul>
      {shown < list.length && (
        <button type="button" onClick={() => setShown(shown + PAGE)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-black dark:border-white/15">{t("korea.showMore", { count: list.length - shown })}</button>
      )}
      {compare.length > 0 && (
        <div className="sticky bottom-20 z-30 flex items-center justify-between gap-3 rounded-2xl bg-sky-600 px-4 py-3 text-white shadow-xl md:bottom-4">
          <span className="text-sm font-black">{t("korea.selected", { count: compare.length })}</span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setCompare([])} className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-black">{t("common.cancel")}</button>
            <button type="button" disabled={compare.length < 2} onClick={() => setComparing(true)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-sky-700 disabled:opacity-50">{t("korea.compareNow")}</button>
          </span>
        </div>
      )}
      {comparing && <CompareTable ids={compare} onClose={() => setComparing(false)} />}
      <p className="text-[11px] text-slate-500">{t("korea.dataNote")}</p>
    </div>
  );
}
