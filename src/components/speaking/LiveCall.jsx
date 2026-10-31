import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../GlassCard";
import { LEVEL_ICONS, getSpeakingTopic, localized } from "../../data/speakingTopics";
import { startCallRecording, uploadCallRecording } from "../../lib/callRecorder";
import { createPeerCall, liveCallsSupported } from "../../lib/peerCall";
import { speakKorean } from "../../lib/speech";
import { supabase } from "../../lib/supabase";
import { recordSpeaking } from "../../store";

const POLL_MS = 3000;
const OFFER_AI_AFTER = 45;
const CONNECT_TIMEOUT_MS = 25000;
const REPORT_REASONS = ["rude", "sexual", "spam", "silent", "underage", "other"];

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function Rating({ callId }) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(0);
  async function rate(value) {
    setStars(value);
    await supabase.rpc("rate_speaking_call", { p_call: callId, p_stars: value });
  }
  return (
    <div className="text-center">
      <p className="text-sm font-black">{t("live.rate")}</p>
      <div className="mt-2 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => rate(value)} aria-label={`${value}`} aria-pressed={stars === value} className={`text-3xl transition ${value <= stars ? "" : "opacity-30 grayscale"}`}>⭐</button>
        ))}
      </div>
      {stars > 0 && <p className="mt-1 text-xs font-bold text-emerald-600">{t("live.thanks")}</p>}
    </div>
  );
}

function ReportForm({ callId, onDone }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("rude");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    await supabase.rpc("report_speaking_user", { p_call: callId, p_reason: reason, p_note: note });
    setBusy(false);
    onDone();
  }
  return (
    <form onSubmit={submit} className="space-y-2 rounded-2xl bg-rose-50 p-3 dark:bg-rose-500/10">
      <p className="text-sm font-black text-rose-700 dark:text-rose-200">{t("live.reportTitle")}</p>
      <select value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm dark:border-rose-400/30 dark:bg-slate-900">
        {REPORT_REASONS.map((value) => <option key={value} value={value}>{t(`live.reason.${value}`)}</option>)}
      </select>
      <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={2} placeholder={t("live.reportNote")} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm dark:border-rose-400/30 dark:bg-slate-900" />
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white disabled:opacity-50">{t("live.reportSend")}</button>
      <p className="text-xs text-rose-700/80 dark:text-rose-200/80">{t("live.reportHint")}</p>
    </form>
  );
}

// A live call with another learner: looking for a partner, connecting, the
// conversation with a shared topic card, and rating or reporting afterwards.
export default function LiveCall({ level, want, topic: myTopic, status, onClose, onTalkToAi }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const [phase, setPhase] = useState("searching");
  const [problem, setProblem] = useState(null);
  const [waited, setWaited] = useState(0);
  const [waiting, setWaiting] = useState(0);
  const [online, setOnline] = useState(null);
  const [partner, setPartner] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [question, setQuestion] = useState(0);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [round, setRound] = useState(0);
  const peer = useRef(null);
  const audio = useRef(null);
  const callRef = useRef(null);
  const connectedAt = useRef(null);
  const endingRef = useRef(false);
  const pollRef = useRef(null);
  const remoteRef = useRef(null);
  const recorderRef = useRef(null);

  const remaining = status ? Math.max(0, status.limitSeconds - status.usedSeconds) : Infinity;
  const left = remaining - elapsed;
  const topic = getSpeakingTopic(partner?.topic_id) || myTopic;

  const finish = useCallback(
    async (reason) => {
      if (endingRef.current || !callRef.current) return;
      endingRef.current = true;
      const recording = recorderRef.current?.stop();
      recorderRef.current = null;
      peer.current?.close({ notify: reason !== "partner" });
      peer.current = null;
      const callId = callRef.current;
      const { data: seconds } = await supabase.rpc("end_speaking_call", { p_call: callId });
      if (recording) recording.then((blob) => uploadCallRecording(callId, blob));
      if (seconds > 0) dispatch(recordSpeaking({ seconds }));
      setEnded({ reason, seconds: seconds || 0 });
      setPhase("ended");
    },
    [dispatch],
  );

  // Look for a partner until matched.
  useEffect(() => {
    if (phase !== "searching") return undefined;
    if (!liveCallsSupported()) {
      setProblem("unsupported");
      return undefined;
    }
    let cancelled = false;
    let timer = null;
    const started = Date.now();
    const tick = setInterval(() => setWaited(Math.floor((Date.now() - started) / 1000)), 1000);
    supabase.rpc("speaking_online").then(({ data }) => !cancelled && setOnline(data));

    async function poll() {
      // A real promise: awaiting a Supabase builder twice would send it twice.
      pollRef.current = Promise.resolve(supabase.rpc("find_speaking_partner", { p_want: want, p_level: level, p_topic: myTopic?.id || null }));
      const { data, error } = await pollRef.current;
      if (cancelled) {
        // Matched just as the learner left: free the partner straight away.
        if (data?.status === "matched") supabase.rpc("end_speaking_call", { p_call: data.call_id });
        return;
      }
      if (error) {
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      if (data.status === "waiting") {
        setWaiting(Math.max(0, data.waiting - 1));
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      if (data.status === "matched") {
        callRef.current = data.call_id;
        endingRef.current = false;
        setPhase("connecting");
        return;
      }
      setProblem(data.status);
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [phase, want, level, myTopic, round]);

  // Leave the queue when the screen closes while searching, after any poll
  // still on its way, so it cannot put the learner back in.
  useEffect(() => () => {
    Promise.resolve(pollRef.current).finally(() => supabase.rpc("leave_speaking_queue"));
  }, []);

  // Connect to the partner.
  useEffect(() => {
    if (phase !== "connecting") return undefined;
    let cancelled = false;
    const callId = callRef.current;
    const timeout = setTimeout(() => !cancelled && !connectedAt.current && finish("noConnection"), CONNECT_TIMEOUT_MS);

    (async () => {
      const { data: info } = await supabase.rpc("speaking_call_info", { p_call: callId });
      if (cancelled || !info) return;
      setPartner(info);
      const call = createPeerCall({
        callId,
        role: info.role,
        onRemoteStream: (stream) => {
          remoteRef.current = stream;
          if (audio.current) audio.current.srcObject = stream;
        },
        onState: (state) => {
          if (state === "connected" && !connectedAt.current) {
            connectedAt.current = Date.now();
            try {
              recorderRef.current = startCallRecording(call.localStream(), remoteRef.current);
            } catch (error) {
              console.error("Could not start the call recording:", error);
            }
            supabase.rpc("mark_speaking_connected", { p_call: callId });
            setPhase("live");
          }
          if (state === "failed" || state === "closed") finish("lost");
        },
        onMessage: (message) => {
          if (message.type === "bye") finish("partner");
          if (message.type === "question") setQuestion(message.index);
        },
      });
      peer.current = call;
      try {
        await call.start();
      } catch (error) {
        if (!cancelled) finish(error?.name === "NotAllowedError" ? "mic" : "noConnection");
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [phase, finish]);

  // Call timer and the daily allowance.
  useEffect(() => {
    if (phase !== "live") return undefined;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - connectedAt.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "live" && left <= 0) finish("limit");
  }, [phase, left, finish]);

  // Hang up if the page closes mid-call.
  useEffect(() => () => {
    if (callRef.current && !endingRef.current) {
      const callId = callRef.current;
      recorderRef.current?.stop().then((blob) => uploadCallRecording(callId, blob));
      peer.current?.close();
      supabase.rpc("end_speaking_call", { p_call: callRef.current });
    }
  }, []);

  function nextQuestion() {
    const next = (question + 1) % (topic?.questions.length || 1);
    setQuestion(next);
    peer.current?.sendApp({ type: "question", index: next });
  }

  function searchAgain() {
    callRef.current = null;
    connectedAt.current = null;
    endingRef.current = false;
    setPartner(null);
    setEnded(null);
    setElapsed(0);
    setQuestion(0);
    setReporting(false);
    setReported(false);
    setBlocked(false);
    setProblem(null);
    setWaited(0);
    setPhase("searching");
    setRound((value) => value + 1);
  }

  if (problem && phase !== "ended") {
    return (
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-4 text-center">
          <p className="text-5xl">{problem === "limit" ? "⏱" : problem === "banned" ? "⛔" : "🙏"}</p>
          <p className="font-bold">{t(`live.problem.${problem}`, { defaultValue: t("live.problem.connect") })}</p>
          {problem === "limit" && <Link to="/premium" className="block rounded-2xl bg-violet-600 px-5 py-3 font-black text-white">⭐ {t("speaking.unlimitedPremium")}</Link>}
          {problem === "need_profile" && <Link to="/complete-profile" className="block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">{t("live.completeProfile")}</Link>}
          <button type="button" onClick={onTalkToAi} className="w-full rounded-2xl border border-orange-300 px-5 py-3 font-black text-orange-700 dark:text-orange-200">🤖 {t("live.talkToAi")}</button>
          <button type="button" onClick={onClose} className="w-full text-sm font-bold text-slate-500">{t("common.back")}</button>
        </GlassCard>
      </div>
    );
  }

  if (phase === "searching") {
    return (
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-5 text-center">
          <div className="relative mx-auto grid h-32 w-32 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-orange-400/30" />
            <span className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-4xl text-white">👥</span>
          </div>
          <div>
            <h2 className="text-xl font-black">{t("live.searching")}</h2>
            <p className="mt-1 text-sm text-slate-500">{LEVEL_ICONS[level]} {t(`speaking.level.${level}`)} · {t(`live.want.${want}`)} · {clock(waited)}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">
              {online !== null && t("live.online", { count: Math.max(online, 1) })}
              {waiting > 0 && ` · ${t("live.waitingOthers", { count: waiting })}`}
            </p>
          </div>
          {waited >= OFFER_AI_AFTER && (
            <div className="rounded-2xl bg-orange-50 p-3 text-sm dark:bg-orange-500/10">
              <p className="font-bold">{t("live.nobodyYet")}</p>
              <button type="button" onClick={onTalkToAi} className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white">🤖 {t("live.talkToAi")}</button>
            </div>
          )}
          <button type="button" onClick={onClose} className="w-full rounded-2xl border border-slate-300 px-5 py-3 font-bold dark:border-white/15">{t("common.cancel")}</button>
        </GlassCard>
      </div>
    );
  }

  if (phase === "ended") {
    return (
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-5 text-center">
          <p className="text-5xl">{ended?.seconds > 0 ? "🎉" : "📵"}</p>
          <div>
            <h2 className="text-xl font-black">{t(`live.ended.${ended?.reason || "self"}`, { defaultValue: t("live.ended.self") })}</h2>
            {ended?.seconds > 0 && <p className="mt-1 text-sm font-bold text-slate-500">{t("live.talkedFor", { time: clock(ended.seconds), name: partner?.name || "" })}</p>}
          </div>
          {partner && ended?.seconds > 0 && <Rating callId={callRef.current} />}
          {partner && (
            <div className="flex justify-center gap-2 text-sm">
              {!blocked && !reported && (
                <button type="button" onClick={async () => { await supabase.rpc("block_speaking_user", { p_user: partner.partner_id }); setBlocked(true); }} className="rounded-xl border border-slate-300 px-3 py-2 font-bold dark:border-white/15">🚫 {t("live.block")}</button>
              )}
              {!reported && !reporting && (
                <button type="button" onClick={() => setReporting(true)} className="rounded-xl border border-rose-300 px-3 py-2 font-bold text-rose-600">⚠️ {t("live.report")}</button>
              )}
            </div>
          )}
          {blocked && !reported && <p className="text-xs font-bold text-slate-500">{t("live.blocked")}</p>}
          {reporting && !reported && <ReportForm callId={callRef.current} onDone={() => { setReported(true); setReporting(false); }} />}
          {reported && <p className="text-sm font-bold text-emerald-600">{t("live.reported")}</p>}
          <div className="grid gap-2">
            {ended?.reason !== "limit" && <button type="button" onClick={searchAgain} className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">👥 {t("live.findAnother")}</button>}
            {ended?.reason === "limit" && <Link to="/premium" className="rounded-2xl bg-violet-600 px-5 py-3 font-black text-white">⭐ {t("speaking.unlimitedPremium")}</Link>}
            <button type="button" onClick={onClose} className="text-sm font-bold text-slate-500">{t("common.close")}</button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const current = topic?.questions[question % topic.questions.length];
  return (
    <div className="mx-auto max-w-md space-y-4">
      <audio ref={audio} autoPlay />
      <GlassCard className="text-center">
        <span className="text-5xl">{partner?.gender === "female" ? "👩" : "👨"}</span>
        <h2 className="mt-2 text-xl font-black">{partner?.name || "…"}</h2>
        <p className="text-sm text-slate-500">{partner && `${LEVEL_ICONS[partner.level] || ""} ${t(`speaking.level.${partner.level}`)}`}</p>
        <p className={`mt-3 text-3xl font-black tabular-nums ${phase === "live" ? "" : "text-slate-400"}`}>{phase === "live" ? clock(elapsed) : t("live.connecting")}</p>
        {phase === "live" && Number.isFinite(left) && left <= 60 && (
          <p role="alert" className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">⏱ {t("live.oneMinute", { time: clock(left) })}</p>
        )}
      </GlassCard>

      {topic && current && (
        <GlassCard className="!p-5">
          <p className="text-xs font-black uppercase text-orange-600">{topic.emoji} {localized(topic, i18n.language)}</p>
          <button type="button" onClick={() => speakKorean(current.ko, rate)} className="mt-2 text-left text-lg font-black" lang="ko">{current.ko} 🔊</button>
          <p className="text-sm text-slate-600 dark:text-slate-300">{localized(current, i18n.language)}</p>
          <button type="button" onClick={nextQuestion} className="mt-3 rounded-xl bg-orange-100 px-3 py-2 text-xs font-black text-orange-800 dark:bg-orange-500/20 dark:text-orange-100">{t("live.nextQuestion")} →</button>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            peer.current?.setMuted(!muted);
            setMuted(!muted);
          }}
          aria-pressed={muted}
          className={`rounded-2xl px-4 py-4 font-black ${muted ? "bg-slate-800 text-white" : "bg-white/80 dark:bg-white/10"}`}
        >
          {muted ? `🔇 ${t("live.unmute")}` : `🎙 ${t("live.mute")}`}
        </button>
        <button type="button" onClick={() => finish("self")} className="rounded-2xl bg-rose-600 px-4 py-4 font-black text-white">📞 {t("live.hangUp")}</button>
      </div>
      <p className="text-center text-xs text-slate-500">🔴 {t("live.recorded")}</p>
    </div>
  );
}
