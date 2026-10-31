import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import AiConversation from "../components/speaking/AiConversation";
import LiveCall from "../components/speaking/LiveCall";
import SpeakingSetup from "../components/speaking/SpeakingSetup";
import TopicWheel from "../components/speaking/TopicWheel";
import { allWords, meaning } from "../data";
import { LEVEL_ICONS, SPEAKING_LEVELS, getSpeakingTopic, localized, topicsForLevel } from "../data/speakingTopics";
import "../lib/contentOverrides";
import { useAuth } from "../hooks/useAuth";
import { timeAgo } from "../lib/dates";
import { formatMinutes, speakingRequest } from "../lib/speakingApi";
import { speakKorean } from "../lib/speech";
import { supabase } from "../lib/supabase";
import { dailyKey } from "../lib/study";

const TABS = ["talk", "topics", "invite", "me"];
const TAB_ICONS = { talk: "🎙", topics: "🎡", invite: "🎁", me: "👤" };
const INVITE_REWARDS = [
  [2, 1],
  [5, 7],
  [10, 30],
  [20, 90],
];

function useStreak() {
  const stats = useSelector((state) => state.progress.stats);
  const today = dailyKey();
  const yesterday = dailyKey(new Date(Date.now() - 864e5));
  return stats.lastStudyDate === today || stats.lastStudyDate === yesterday ? stats.streak : 0;
}

// A level suggestion for the setup form from how many words the learner has met.
function useSuggestedLevel() {
  const words = useSelector((state) => state.progress.words);
  const count = Object.keys(words).length;
  return count > 600 ? "advanced" : count > 250 ? "intermediate" : "beginner";
}

function UsageBar({ status }) {
  const { t } = useTranslation();
  if (!status) return null;
  const used = Math.min(status.usedSeconds, status.limitSeconds);
  const percent = status.limitSeconds ? Math.round((used / status.limitSeconds) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>{t("speaking.today")}</span>
        <span>
          {status.premium
            ? t("speaking.premiumUnlimited")
            : t("speaking.usage", { used: formatMinutes(used), limit: formatMinutes(status.limitSeconds) })}
        </span>
      </div>
      {!status.premium && (
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className={`h-full rounded-full ${percent >= 100 ? "bg-rose-500" : "bg-orange-500"}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, onTalk }) {
  const { t, i18n } = useTranslation();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const language = i18n.language;
  return (
    <GlassCard className="!p-5">
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{topic.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black" lang="ko">{topic.ko}</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{localized(topic, language)} · {LEVEL_ICONS[topic.level]} {t(`speaking.level.${topic.level}`)}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {topic.questions.map((question) => (
          <li key={question.ko} className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
            <button type="button" onClick={() => speakKorean(question.ko, rate)} className="text-left font-bold" lang="ko">• {question.ko} 🔊</button>
            <p className="text-sm text-slate-600 dark:text-slate-300">{localized(question, language)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {topic.words.map((ko) => {
          const word = allWords.find((item) => item.korean === ko);
          return (
            <span key={ko} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
              <span lang="ko">{ko}</span>
              {word && <span className="font-semibold opacity-80"> · {meaning(word, language)}</span>}
            </span>
          );
        })}
      </div>
      <button type="button" onClick={() => onTalk(topic)} className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600">
        🎙 {t("speaking.talkAboutThis")}
      </button>
    </GlassCard>
  );
}

function StartSheet({ status, level, onLevel, partner, onPartner, want, onWant, liveStatus, onStart, onClose }) {
  const { t } = useTranslation();
  const choice = (active) => `flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-black ${active ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-slate-200 dark:border-white/10"}`;
  const liveBlocked = liveStatus && liveStatus.status !== "ok";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="speaking-start-title" onClick={onClose}>
      <div className="w-full max-w-md space-y-5 rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <h2 id="speaking-start-title" className="text-center text-xl font-black">{t("speaking.whoWith")}</h2>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={partner === "ai"} onClick={() => onPartner("ai")} className={choice(partner === "ai")}>
            <span className="text-2xl">🤖</span>
            {t("speaking.partner.ai")}
          </button>
          <button type="button" aria-pressed={partner === "people"} onClick={() => onPartner("people")} className={choice(partner === "people")}>
            <span className="text-2xl">👥</span>
            {t("speaking.partner.people")}
          </button>
        </div>
        {partner === "people" && (
          <div>
            <p className="text-sm font-black">{t("live.partnerGender")}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[["any", "🌐"], ["male", "👨"], ["female", "👩"]].map(([value, icon]) => (
                <button key={value} type="button" aria-pressed={want === value} onClick={() => onWant(value)} className={`rounded-2xl border-2 px-2 py-2.5 text-sm font-black ${want === value ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-slate-200 dark:border-white/10"}`}>
                  {icon} {t(`live.want.${value}`)}
                </button>
              ))}
            </div>
            {liveBlocked && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{t(`live.problem.${liveStatus.status}`, { defaultValue: t("live.problem.connect") })}</p>}
          </div>
        )}
        <div>
          <p className="text-sm font-black">{t("speaking.setup.level")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SPEAKING_LEVELS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={level === value}
                onClick={() => onLevel(value)}
                className={`rounded-2xl border-2 px-2 py-2.5 text-sm font-black ${level === value ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-slate-200 dark:border-white/10"}`}
              >
                {LEVEL_ICONS[value]} {t(`speaking.level.${value}`)}
              </button>
            ))}
          </div>
        </div>
        <UsageBar status={status} />
        <button type="button" onClick={onStart} disabled={partner === "people" && liveBlocked} className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 font-black text-white hover:bg-orange-600 disabled:opacity-50">
          {partner === "people" ? `👥 ${t("live.findPartner")}` : `🎲 ${t("speaking.startRandom")}`}
        </button>
        <button type="button" onClick={onClose} className="w-full text-sm font-bold text-slate-500">{t("common.cancel")}</button>
      </div>
    </div>
  );
}

function SessionList({ sessions }) {
  const { t, i18n } = useTranslation();
  if (!sessions?.length) return <p className="py-6 text-center text-sm text-slate-500">{t("speaking.noSessions")}</p>;
  return (
    <ul className="divide-y divide-slate-100 dark:divide-white/10">
      {sessions.map((session) => {
        const topic = getSpeakingTopic(session.topic_id);
        return (
          <li key={session.id} className="flex items-center gap-3 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-xl dark:bg-orange-500/10">{topic?.emoji || "🎙"}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{session.kind === "ai" ? "🤖 " : "👥 "}{topic ? localized(topic, i18n.language) : t("speaking.freeTalk")}</p>
              <p className="text-xs text-slate-500">{timeAgo(session.started_at, i18n.language)}</p>
            </div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{t("speaking.minutesShort", { count: Math.max(1, Math.round((session.seconds || 0) / 60)) })}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function SpeakingPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get("tab")) ? params.get("tab") : "talk";
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [level, setLevel] = useState(null);
  const [wheelLevel, setWheelLevel] = useState(null);
  const [picked, setPicked] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [partnerKind, setPartnerKind] = useState("ai");
  const [want, setWant] = useState("any");
  const [live, setLive] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const streak = useStreak();
  const suggestedLevel = useSuggestedLevel();

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const data = await speakingRequest("GET");
      setStatus(data);
      setLevel((current) => current || data.profile?.korean_level || null);
      setWheelLevel((current) => current || data.profile?.korean_level || "beginner");
    } catch {
      setLoadError(t("speaking.loadFailed"));
    }
  }, [t]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    if (sheet && partnerKind === "people") supabase.rpc("speaking_live_status").then(({ data }) => setLiveStatus(data));
  }, [sheet, partnerKind]);

  const wheelTopics = useMemo(() => topicsForLevel(wheelLevel || "beginner"), [wheelLevel]);
  const selectTab = (next) => setParams(next === "talk" ? {} : { tab: next }, { replace: true });
  const profile = status?.profile || {};
  const needsSetup = status && (!profile.gender || !profile.korean_level);
  const currentLevel = level || profile.korean_level || "beginner";

  function startConversation(topic, chosenLevel = currentLevel) {
    setSheet(false);
    setConversation({ topic, level: chosenLevel });
    window.scrollTo({ top: 0 });
  }

  function startRandom() {
    const options = topicsForLevel(currentLevel);
    const topic = options[Math.floor(Math.random() * options.length)];
    if (partnerKind === "people") {
      setSheet(false);
      setLive({ topic, level: currentLevel, want });
      window.scrollTo({ top: 0 });
      return;
    }
    startConversation(topic, currentLevel);
  }

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-xl">
        <GlassCard className="text-center">
          <p className="text-5xl">🎙</p>
          <h1 className="mt-3 text-2xl font-black">{t("speaking.title")}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("speaking.signInText")}</p>
          <Link to="/login" state={{ from: { pathname: "/speaking" } }} className="mt-5 inline-block rounded-2xl bg-orange-500 px-6 py-3 font-black text-white">{t("speaking.signIn")}</Link>
        </GlassCard>
      </div>
    );
  }

  if (live) {
    return (
      <LiveCall
        level={live.level}
        want={live.want}
        topic={live.topic}
        status={status}
        onClose={() => {
          setLive(null);
          load();
        }}
        onTalkToAi={() => {
          setLive(null);
          startConversation(live.topic, live.level);
        }}
      />
    );
  }

  if (conversation) {
    return (
      <AiConversation
        key={`${conversation.topic.id}-${conversation.level}`}
        topic={conversation.topic}
        level={conversation.level}
        premium={Boolean(status?.premium)}
        onClose={() => {
          setConversation(null);
          load();
        }}
      />
    );
  }

  if (needsSetup || editing) {
    return (
      <div className="mx-auto max-w-xl">
        <GlassCard>
          <SpeakingSetup
            userId={user.id}
            initial={profile}
            suggestedLevel={suggestedLevel}
            onCancel={editing ? () => setEditing(false) : null}
            onSaved={(saved) => {
              setEditing(false);
              setLevel(saved.korean_level);
              setWheelLevel(saved.korean_level);
              setStatus((current) => ({ ...current, profile: { ...current.profile, ...saved } }));
            }}
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex flex-wrap items-center gap-2 px-1">
        <h1 className="mr-auto text-2xl font-black md:text-3xl">🎙 {t("speaking.title")}</h1>
        {status && !status.premium && (
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black shadow-sm dark:bg-white/10">
            ⏱ {t("speaking.usage", { used: formatMinutes(Math.min(status.usedSeconds, status.limitSeconds)), limit: formatMinutes(status.limitSeconds) })}
          </span>
        )}
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black shadow-sm dark:bg-white/10">🔥 {streak}</span>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase text-orange-800 dark:bg-orange-500/20 dark:text-orange-100">
          {LEVEL_ICONS[currentLevel]} {t(`speaking.level.${currentLevel}`)}
        </span>
      </header>

      <div role="tablist" aria-label={t("speaking.title")} className="grid grid-cols-4 gap-1 rounded-2xl bg-white/70 p-1 dark:bg-white/5">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => selectTab(key)}
            className={`rounded-xl px-2 py-2.5 text-xs font-black transition sm:text-sm ${tab === key ? "bg-orange-500 text-white shadow" : "text-slate-600 dark:text-slate-300"}`}
          >
            <span aria-hidden="true" className="hidden sm:inline">{TAB_ICONS[key]} </span>
            {t(`speaking.tab.${key}`)}
          </button>
        ))}
      </div>

      {loadError && (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          {loadError} <button type="button" onClick={load} className="underline">{t("common.tryAgain")}</button>
        </p>
      )}
      {status && status.enabled === false && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{t("speaking.disabled")}</p>
      )}

      {tab === "talk" && (
        <>
          <GlassCard className="flex flex-col items-center !py-10 text-center">
            <button
              type="button"
              onClick={() => setSheet(true)}
              disabled={!status || status.enabled === false}
              className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-2xl shadow-orange-300/60 transition hover:scale-105 disabled:opacity-50 dark:shadow-black/40"
              aria-label={t("speaking.tapToStart")}
            >
              <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
            <h2 className="mt-6 text-2xl font-black">{t("speaking.tapToStart")}</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">{t("speaking.tapToStartText")}</p>
            <div className="mt-6 w-full max-w-sm">
              <UsageBar status={status} />
            </div>
            {status && !status.premium && (
              <Link to="/premium" className="mt-3 text-xs font-bold text-violet-600 underline dark:text-violet-300">⭐ {t("speaking.unlimitedPremium")}</Link>
            )}
          </GlassCard>
          <GlassCard className="!p-5">
            <h2 className="font-black">🕘 {t("speaking.recent")}</h2>
            <SessionList sessions={status?.recent?.filter((session) => session.turns > 0).slice(0, 5)} />
          </GlassCard>
        </>
      )}

      {tab === "topics" && (
        <>
          <GlassCard className="!p-5 text-center">
            <h2 className="text-xl font-black">🎲 {t("speaking.spinTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("speaking.spinText")}</p>
            <div className="mt-4 flex justify-center gap-2">
              {SPEAKING_LEVELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={wheelLevel === value}
                  onClick={() => {
                    setWheelLevel(value);
                    setPicked(null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${wheelLevel === value ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
                >
                  {LEVEL_ICONS[value]} {t(`speaking.level.${value}`)}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <TopicWheel key={wheelLevel} topics={wheelTopics} onPick={setPicked} />
            </div>
          </GlassCard>
          {picked && <TopicCard topic={picked} onTalk={(topic) => startConversation(topic, topic.level)} />}
          <GlassCard className="!p-5">
            <h2 className="font-black">{t("speaking.allTopics")}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {wheelTopics.map((topic) => (
                <li key={topic.id}>
                  <button type="button" onClick={() => setPicked(topic)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 text-left hover:border-orange-300 dark:border-white/10 dark:bg-white/5">
                    <span className="text-2xl" aria-hidden="true">{topic.emoji}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-black" lang="ko">{topic.ko}</span>
                      <span className="block truncate text-xs text-slate-500">{localized(topic, i18n.language)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </GlassCard>
        </>
      )}

      {tab === "invite" && (
        <GlassCard className="!p-6">
          <p className="text-4xl">🎁</p>
          <h2 className="mt-2 text-xl font-black">{t("speaking.inviteTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("speaking.inviteText")}</p>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INVITE_REWARDS.map(([friends, days]) => (
              <li key={friends} className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-center dark:border-orange-400/20 dark:bg-orange-500/10">
                <p className="text-2xl font-black">{friends}</p>
                <p className="text-xs font-bold text-slate-500">{t("speaking.friends", { count: friends })}</p>
                <p className="mt-1 text-sm font-black text-orange-700 dark:text-orange-200">⭐ {t("speaking.premiumDays", { count: days })}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold dark:bg-white/10">🚧 {t("speaking.inviteSoon")}</p>
        </GlassCard>
      )}

      {tab === "me" && status && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["⏱", t("speaking.totalMinutes"), formatMinutes(status.totals?.seconds)],
              ["💬", t("speaking.totalSessions"), status.totals?.sessions || 0],
              ["🔥", t("speaking.streak"), streak],
            ].map(([icon, label, value]) => (
              <GlassCard key={label} className="!p-4 text-center">
                <p className="text-2xl">{icon}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
                <p className="text-xs font-bold text-slate-500">{label}</p>
              </GlassCard>
            ))}
          </div>
          {!status.premium && (
            <Link to="/premium" className="block rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5 text-white shadow-xl">
              <p className="text-lg font-black">⭐ {t("speaking.premiumCardTitle")}</p>
              <p className="mt-1 text-sm opacity-90">{t("speaking.premiumCardText")}</p>
            </Link>
          )}
          <GlassCard className="!p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{profile.gender === "female" ? "👩" : "👨"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-black">{profile.first_name || user?.email}</p>
                <p className="text-sm text-slate-500">{t(`speaking.gender.${profile.gender}`)} · {LEVEL_ICONS[currentLevel]} {t(`speaking.level.${currentLevel}`)}</p>
              </div>
              <button type="button" onClick={() => setEditing(true)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-black dark:border-white/15">✏️ {t("speaking.editProfile")}</button>
            </div>
          </GlassCard>
          <GlassCard className="!p-5">
            <h2 className="font-black">📜 {t("speaking.history")}</h2>
            <SessionList sessions={status.recent?.filter((session) => session.turns > 0)} />
          </GlassCard>
          <div className="grid grid-cols-2 gap-3 text-sm font-bold">
            <Link to="/leaderboard" className="rounded-2xl bg-white/80 p-4 text-center shadow-sm dark:bg-white/5">🏆 {t("leaderboard.title")}</Link>
            <Link to="/feedback" className="rounded-2xl bg-white/80 p-4 text-center shadow-sm dark:bg-white/5">✉️ {t("nav.feedback")}</Link>
          </div>
        </>
      )}

      {sheet && (
        <StartSheet
          status={status}
          level={currentLevel}
          onLevel={setLevel}
          partner={partnerKind}
          onPartner={setPartnerKind}
          want={want}
          onWant={setWant}
          liveStatus={liveStatus}
          onStart={startRandom}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}
