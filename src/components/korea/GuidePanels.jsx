import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../GlassCard";
import { INTAKES, OFFICIAL_LINKS, SCHOLARSHIPS, TOPIK_GUIDE, VISA_STEPS } from "../../data/korea/guide";
import { UNIVERSITIES } from "../../data/korea/universities";
import { useAuth } from "../../hooks/useAuth";
import { formatSom, formatWon, tr, uniName, useWonRate } from "../../lib/studyKorea";
import { listTopikAttempts } from "../../lib/topikAttempts";
import { supabase } from "../../lib/supabase";
import { IeqasBadge } from "./Catalog";

function OfficialLink({ link }) {
  const { i18n } = useTranslation();
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 underline-offset-2 hover:underline dark:bg-sky-500/10 dark:text-sky-200">
      🔗 {tr(link.name, i18n.language)}
    </a>
  );
}

export function ScholarshipsPanel() {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-4">
      {SCHOLARSHIPS.map((item) => (
        <GlassCard key={item.id} className="!p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-800 dark:bg-violet-500/20 dark:text-violet-100">{item.name}</span>
            <h3 className="flex-1 font-black">{tr(item.title, i18n.language)}</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {item.points.map((point, index) => <li key={index}>• {tr(point, i18n.language)}</li>)}
          </ul>
          {item.season && <p className="mt-3 text-xs font-bold text-slate-500">📅 {t(`korea.season.${item.season}`)}</p>}
          <div className="mt-3"><OfficialLink link={item.source} /></div>
        </GlassCard>
      ))}
      <GlassCard className="!p-5">
        <h3 className="font-black">🎓 {t("korea.topikTitle")}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {TOPIK_GUIDE.points.map((point, index) => <li key={index}>• {tr(point, i18n.language)}</li>)}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2"><OfficialLink link={TOPIK_GUIDE.source} /><OfficialLink link={OFFICIAL_LINKS.topik} /></div>
      </GlassCard>
      <p className="text-xs text-slate-500">{t("korea.checkOfficial")}</p>
    </div>
  );
}

export function VisaPanel() {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-4">
      <GlassCard className="!p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {VISA_STEPS.types.map((type) => (
            <div key={type.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-lg font-black">{type.id}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{tr(type.title, i18n.language)}</p>
            </div>
          ))}
        </div>
        <ol className="mt-4 space-y-3">
          {VISA_STEPS.steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm leading-6">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-600 text-xs font-black text-white">{index + 1}</span>
              <span>{tr(step, i18n.language)}</span>
            </li>
          ))}
        </ol>
      </GlassCard>
      <GlassCard className="!p-5">
        <h3 className="font-black">📄 {t("korea.documents")}</h3>
        <p className="mt-1 text-xs text-slate-500">{t("korea.documentsHint")}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {VISA_STEPS.documents.map((doc) => <li key={doc.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">• {tr(doc.label, i18n.language)}</li>)}
        </ul>
        <div className="mt-4 space-y-2">
          {VISA_STEPS.warnings.map((warning, index) => (
            <p key={index} className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
              ⚠️ {tr(warning.text, i18n.language)}{" "}
              <a href={warning.source.url} target="_blank" rel="noreferrer" className="font-bold underline">({warning.source.name})</a>
            </p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{VISA_STEPS.source.map((link) => <OfficialLink key={link.url} link={link} />)}</div>
      </GlassCard>
    </div>
  );
}

const LOCAL_PLAN = "k-talim:study-plan";
const EMPTY_PLAN = { targets: [], intake: "", degree: "bachelor", topik_goal: 3, checklist: {}, applications: {} };
const STATUSES = ["planning", "applied", "interview", "admitted", "rejected"];

function planRow(userId, plan) {
  return {
    user_id: userId,
    targets: plan.targets,
    intake: plan.intake || null,
    degree: plan.degree,
    topik_goal: plan.topik_goal,
    checklist: plan.checklist,
    applications: plan.applications,
    updated_at: new Date().toISOString(),
  };
}

function nextIntakes() {
  const now = new Date();
  const year = now.getFullYear();
  return [year, year + 1, year + 2].flatMap((y) => INTAKES.map((intake) => ({ id: `${y}-${intake.id}`, year: y, intake }))).filter(({ year: y, intake }) => new Date(y, intake.startMonth - 1, 1) > now).slice(0, 4);
}

function applicationOpens(planIntake) {
  const [year, id] = String(planIntake || "").split("-");
  const intake = INTAKES.find((item) => item.id === id);
  if (!intake) return null;
  const firstMonth = intake.applyMonths[0];
  const applyYear = intake.id === "spring" ? Number(year) - 1 : Number(year);
  return new Date(applyYear, firstMonth - 1, 1);
}

// The learner's own path: target universities, TOPIK goal, documents and applications.
export function MyPathPanel({ onOpenTab }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const rate = useWonRate();
  const [plan, setPlan] = useState(null);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let local = EMPTY_PLAN;
      try {
        local = { ...EMPTY_PLAN, ...JSON.parse(window.localStorage.getItem(LOCAL_PLAN) || "{}") };
      } catch {
        // Ignore a broken local copy.
      }
      if (user) {
        const { data, error } = await supabase.from("study_plans").select("*").eq("user_id", user.id).maybeSingle();
        if (cancelled) return;
        setPlan(data ? { ...EMPTY_PLAN, ...data } : local);
        if (error) return;
        // A plan made as a guest moves into the account, once.
        const guestPlan = JSON.stringify(local) !== JSON.stringify(EMPTY_PLAN);
        const moved = data || !guestPlan || !(await supabase.from("study_plans").upsert(planRow(user.id, local))).error;
        if (moved) window.localStorage.removeItem(LOCAL_PLAN);
      } else if (!cancelled) setPlan(local);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = useCallback(
    async (next) => {
      setPlan(next);
      setSaved(false);
      if (user) {
        await supabase.from("study_plans").upsert(planRow(user.id, next));
      } else {
        try {
          window.localStorage.setItem(LOCAL_PLAN, JSON.stringify(next));
        } catch {
          // Storage blocked: the plan lasts for this visit.
        }
      }
      setSaved(true);
    },
    [user],
  );

  // Opened from a university page with ?add=<id>: put it on the list.
  const addId = params.get("add");
  useEffect(() => {
    if (!plan || !addId) return;
    if (UNIVERSITIES.some((uni) => uni.id === addId) && !plan.targets.includes(addId) && plan.targets.length < 5) save({ ...plan, targets: [...plan.targets, addId] });
    setParams({ tab: "path" }, { replace: true });
  }, [plan, addId, save, setParams]);

  const best = useMemo(() => {
    const done = listTopikAttempts().filter((attempt) => attempt.status === "submitted" && attempt.result?.maxTotal === 200);
    return done.reduce((top, attempt) => (!top || attempt.result.total > top.result.total ? attempt : top), null);
  }, []);

  if (!plan) return <div className="h-48 animate-pulse rounded-3xl bg-white/60 dark:bg-white/5" />;

  const targets = plan.targets.map((id) => UNIVERSITIES.find((uni) => uni.id === id)).filter(Boolean);
  const matches = search.trim().length >= 2 ? UNIVERSITIES.filter((uni) => `${uni.ko} ${uni.en || ""} ${uni.romanized}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6) : [];
  const opens = applicationOpens(plan.intake);
  const daysToOpen = opens ? Math.ceil((opens - Date.now()) / 86400000) : null;
  const level = best?.result?.level || 0;
  const docsDone = VISA_STEPS.documents.filter((doc) => plan.checklist[doc.id]).length;
  const needsTopik = plan.degree !== "language";

  return (
    <div className="space-y-4">
      {!user && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{t("korea.path.guest")} <Link to="/login" className="underline">{t("common.login")}</Link></p>}

      <GlassCard className="!p-5">
        <h3 className="font-black">🎯 {t("korea.path.goal")}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select value={plan.degree} onChange={(event) => save({ ...plan, degree: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-slate-900">
            {["language", "bachelor", "master", "doctor"].map((value) => <option key={value} value={value}>{t(`korea.degree.${value}`)}</option>)}
          </select>
          <select value={plan.intake} onChange={(event) => save({ ...plan, intake: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-slate-900">
            <option value="">{t("korea.path.pickIntake")}</option>
            {nextIntakes().map(({ id, year, intake }) => <option key={id} value={id}>{year} · {tr(intake.title, i18n.language)}</option>)}
          </select>
          {needsTopik && (
            <select value={plan.topik_goal} onChange={(event) => save({ ...plan, topik_goal: Number(event.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-slate-900">
              {[2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{t("korea.path.topikGoal", { level: value })}</option>)}
            </select>
          )}
        </div>
        {opens && (
          <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
            📅 {daysToOpen > 0 ? t("korea.path.opensIn", { count: daysToOpen }) : t("korea.path.openNow")} {tr(INTAKES.find((item) => plan.intake.endsWith(item.id))?.window, i18n.language)}
          </p>
        )}
      </GlassCard>

      {needsTopik && (
        <GlassCard className="!p-5">
          <h3 className="font-black">📝 TOPIK</h3>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500" style={{ width: `${Math.min(100, (level / plan.topik_goal) * 100)}%` }} />
            </div>
            <span className="text-sm font-black tabular-nums">{level}/{plan.topik_goal}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {best ? t("korea.path.topikBest", { score: best.result.total, level: level || 0 }) : t("korea.path.topikNone")} {plan.topik_goal >= 3 && t("korea.path.topikTwo")}
          </p>
          <Link to="/topik" className="mt-3 inline-block rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">{t("korea.path.practice")}</Link>
        </GlassCard>
      )}

      <GlassCard className="!p-5">
        <h3 className="font-black">🏛 {t("korea.path.targets")}</h3>
        <ul className="mt-3 space-y-2">
          {targets.map((uni) => (
            <li key={uni.id} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/korea/u/${uni.id}`} className="min-w-0 flex-1 truncate font-black">{uniName(uni, i18n.language)}</Link>
                <IeqasBadge uni={uni} compact />
                <button type="button" onClick={() => save({ ...plan, targets: plan.targets.filter((id) => id !== uni.id) })} className="text-xs font-bold text-rose-600">✕</button>
              </div>
              <p className="mt-1 text-xs text-slate-500">{formatWon(uni.tuition)}{formatSom(uni.tuition, rate, t) ? ` ≈ ${formatSom(uni.tuition, rate, t)}` : ""} / {t("korea.perYear")}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {STATUSES.map((value) => (
                  <button key={value} type="button" onClick={() => save({ ...plan, applications: { ...plan.applications, [uni.id]: value } })} aria-pressed={(plan.applications[uni.id] || "planning") === value} className={`rounded-full px-2.5 py-1 text-[11px] font-black ${(plan.applications[uni.id] || "planning") === value ? "bg-sky-600 text-white" : "bg-slate-100 dark:bg-white/10"}`}>
                    {t(`korea.status.${value}`)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {targets.length < 5 && (
          <div className="mt-3">
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("korea.path.addTarget")} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-slate-900" />
            {matches.length > 0 && (
              <ul className="mt-1 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-white/5 dark:border-white/10">
                {matches.map((uni) => (
                  <li key={uni.id}>
                    <button type="button" onClick={() => { save({ ...plan, targets: [...new Set([...plan.targets, uni.id])] }); setSearch(""); }} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm">
                      <span className="truncate font-bold">{uniName(uni, i18n.language)} <span className="font-normal text-slate-500" lang="ko">{uni.ko}</span></span>
                      <span className="text-xs font-black text-sky-600">+</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!targets.length && <button type="button" onClick={() => onOpenTab("universities")} className="mt-3 text-sm font-bold text-sky-600 underline">{t("korea.path.browse")}</button>}
      </GlassCard>

      <GlassCard className="!p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-black">📄 {t("korea.documents")}</h3>
          <span className="text-sm font-black tabular-nums text-emerald-600">{docsDone}/{VISA_STEPS.documents.length}</span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {VISA_STEPS.documents.map((doc) => (
            <li key={doc.id}>
              <label className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5">
                <input type="checkbox" checked={Boolean(plan.checklist[doc.id])} onChange={(event) => save({ ...plan, checklist: { ...plan.checklist, [doc.id]: event.target.checked } })} className="h-4 w-4 accent-emerald-600" />
                <span className={plan.checklist[doc.id] ? "text-slate-400 line-through" : ""}>{tr(doc.label, i18n.language)}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onOpenTab("docs")} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-black text-white">✍️ {t("korea.tab.docs")}</button>
          <button type="button" onClick={() => onOpenTab("interview")} className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-black text-violet-800 dark:bg-violet-500/20 dark:text-violet-100">🎤 {t("korea.tab.interview")}</button>
        </div>
      </GlassCard>
      {saved && <p className="text-center text-xs font-bold text-emerald-600">✓ {t("admin.powers.saved")}</p>}
    </div>
  );
}
