import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { allWords, getWordKey } from "../../data";
import { localized } from "../../data/speakingTopics";
import { formatMinutes, speakingRequest } from "../../lib/speakingApi";
import { speakKorean, stopSpeaking } from "../../lib/speech";
import { microphoneSupported, startRecording } from "../../lib/wavRecorder";
import { recordSpeaking, toggleFavorite } from "../../store";

const MAX_SECONDS = 30;
const LANGUAGES = ["uz", "en", "ru"];

let nextId = 1;
const newId = () => `m${nextId++}`;

function PartnerBubble({ message, rate, showTranslation }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <li className="flex justify-start">
      <div className="max-w-[88%] rounded-3xl rounded-bl-md border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-400/20 dark:bg-orange-500/10">
        <div className="flex items-start gap-2">
          <p className="text-lg font-bold leading-8 text-slate-900 dark:text-white" lang="ko">{message.text}</p>
          <button type="button" onClick={() => speakKorean(message.text, rate)} aria-label={t("speaking.replay")} className="mt-1 shrink-0 text-lg">🔊</button>
        </div>
        {message.translation && (showTranslation || open ? (
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.translation}</p>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="mt-1 text-xs font-bold text-orange-700 underline dark:text-orange-300">{t("speaking.showTranslation")}</button>
        ))}
      </div>
    </li>
  );
}

function LearnerBubble({ message, premium }) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-col items-end gap-2">
      <div className="max-w-[88%] rounded-3xl rounded-br-md bg-sky-600 px-4 py-3 text-white">
        {message.pending ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
            🎙 {t("speaking.listening")}
            {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: `${delay}ms` }} />)}
          </span>
        ) : (
          <p className="text-lg font-semibold leading-8" lang="ko">{message.text || <span className="text-sm italic opacity-80">{t("speaking.notHeard")}</span>}</p>
        )}
      </div>
      {message.corrections?.length > 0 && (
        <div className="max-w-[88%] space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-400/20 dark:bg-rose-500/10">
          <p className="text-[11px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-200">✏️ {t("speaking.corrections")}</p>
          {message.corrections.map((item, index) => (
            <div key={index}>
              <p lang="ko">
                <span className="text-rose-600 line-through dark:text-rose-300">{item.wrong}</span>
                {" → "}
                <span className="font-bold text-emerald-700 dark:text-emerald-300">{item.right}</span>
              </p>
              {item.note && <p className="text-slate-600 dark:text-slate-300">{item.note}</p>}
            </div>
          ))}
        </div>
      )}
      {message.pronunciation ? (
        <p className="max-w-[88%] rounded-2xl bg-violet-50 px-3 py-2 text-sm text-violet-900 dark:bg-violet-500/10 dark:text-violet-100">🗣 {message.pronunciation}</p>
      ) : (
        !message.pending && !premium && message.text && (
          <Link to="/premium" className="text-[11px] font-bold text-violet-600 underline dark:text-violet-300">⭐ {t("speaking.pronunciationPremium")}</Link>
        )
      )}
    </li>
  );
}

function Summary({ session, onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.progress.favorites);
  const corrections = session.summary?.corrections || [];
  const words = (session.summary?.newWords || []).filter((word, index, list) => list.findIndex((other) => other.ko === word.ko) === index);
  return (
    <div className="mx-auto max-w-xl space-y-5 py-4">
      <div className="text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-2 text-2xl font-black">{t("speaking.wellDone")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t("speaking.summaryLine", { minutes: Math.max(1, Math.round((session.seconds || 0) / 60)), turns: session.turns || 0 })}
        </p>
      </div>
      {corrections.length > 0 && (
        <section className="rounded-3xl border border-rose-200 bg-white/80 p-4 dark:border-rose-400/20 dark:bg-white/5">
          <h3 className="font-black">✏️ {t("speaking.yourMistakes")}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {corrections.map((item, index) => (
              <li key={index}>
                <span lang="ko" className="text-rose-600 line-through dark:text-rose-300">{item.wrong}</span> → <span lang="ko" className="font-bold text-emerald-700 dark:text-emerald-300">{item.right}</span>
                {item.note && <p className="text-slate-600 dark:text-slate-300">{item.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {words.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
          <h3 className="font-black">📚 {t("speaking.newWords")}</h3>
          <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-white/10">
            {words.map((word) => {
              const known = allWords.find((item) => item.korean === word.ko);
              const key = known && getWordKey(known);
              return (
                <li key={word.ko} className="flex items-center gap-3 py-2">
                  <span lang="ko" className="text-base font-bold">{word.ko}</span>
                  <span className="min-w-0 flex-1 text-slate-600 dark:text-slate-300">{word.meaning}</span>
                  {key && (
                    <button type="button" onClick={() => dispatch(toggleFavorite(key))} aria-pressed={Boolean(favorites[key])} className="text-lg" aria-label={t("speaking.saveWord")}>
                      {favorites[key] ? "⭐" : "☆"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <button type="button" onClick={onClose} className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 font-black text-white">
        {t("speaking.done")}
      </button>
    </div>
  );
}

// A voice conversation with Hana, the AI partner, about one topic.
export default function AiConversation({ topic, level, premium, onClose }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const language = LANGUAGES.includes(i18n.language) ? i18n.language : "uz";
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("starting");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [loudness, setLoudness] = useState(0);
  const [usage, setUsage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showTranslation, setShowTranslation] = useState(level === "beginner");
  const [showTopic, setShowTopic] = useState(false);
  const recorder = useRef(null);
  const timer = useRef(null);
  const listEnd = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    speakingRequest("POST", { action: "start", topicId: topic.id, level, language })
      .then((data) => {
        setSessionId(data.sessionId);
        setMessages([{ id: newId(), role: "partner", text: data.opener.ko, translation: data.opener.translation }]);
        setPhase("idle");
        speakKorean(data.opener.ko, rate);
      })
      .catch((startError) => {
        setPhase(startError.status === 429 ? "limit" : "error");
        setError(startError.status === 429 ? "" : t("speaking.startFailed"));
      });
  }, [topic.id, level, language, rate, t]);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, phase]);

  useEffect(
    () => () => {
      clearInterval(timer.current);
      recorder.current?.cancel();
      stopSpeaking();
    },
    [],
  );

  const finishRecording = useCallback(async () => {
    clearInterval(timer.current);
    const active = recorder.current;
    recorder.current = null;
    if (!active) return;
    const recording = await active.stop();
    setLoudness(0);
    if (!recording || recording.seconds < 0.6) {
      setPhase("idle");
      setError(t("speaking.tooShort"));
      return;
    }
    const pendingId = newId();
    const history = messages.map((message) => ({ role: message.role, text: message.text }));
    setMessages((current) => [...current, { id: pendingId, role: "learner", pending: true }]);
    setPhase("thinking");
    try {
      const data = await speakingRequest("POST", { action: "turn", sessionId, audio: recording.base64, history, language });
      setUsage({ used: data.usedSeconds, limit: data.limitSeconds });
      setMessages((current) => [
        ...current.map((message) =>
          message.id === pendingId
            ? { id: pendingId, role: "learner", text: data.transcript, corrections: data.corrections, pronunciation: data.pronunciation }
            : message,
        ),
        { id: newId(), role: "partner", text: data.reply, translation: data.replyTranslation },
      ]);
      setPhase(data.usedSeconds >= data.limitSeconds ? "limit" : "idle");
      speakKorean(data.reply, rate);
    } catch (turnError) {
      setMessages((current) => current.filter((message) => message.id !== pendingId));
      if (turnError.status === 429) {
        setPhase("limit");
      } else {
        setPhase("idle");
        setError(t("speaking.turnFailed"));
      }
    }
  }, [messages, sessionId, language, rate, t]);

  async function startRecordingTurn() {
    setError("");
    stopSpeaking();
    try {
      recorder.current = await startRecording({ onLevel: setLoudness });
    } catch {
      setError(t("speaking.micDenied"));
      return;
    }
    setElapsed(0);
    setPhase("recording");
    const began = Date.now();
    timer.current = setInterval(() => {
      const seconds = (Date.now() - began) / 1000;
      setElapsed(seconds);
      if (seconds >= MAX_SECONDS) finishRecording();
    }, 200);
  }

  async function endConversation() {
    clearInterval(timer.current);
    recorder.current?.cancel();
    recorder.current = null;
    stopSpeaking();
    if (!sessionId) {
      onClose();
      return;
    }
    setPhase("ending");
    try {
      const data = await speakingRequest("POST", { action: "end", sessionId });
      if (!data.session?.turns) {
        onClose();
        return;
      }
      dispatch(recordSpeaking({ seconds: data.session.seconds }));
      setSummary(data.session);
      setPhase("ended");
    } catch {
      onClose();
    }
  }

  if (phase === "ended" && summary) return <Summary session={summary} onClose={onClose} />;

  const remaining = usage ? Math.max(0, usage.limit - usage.used) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3" style={{ minHeight: "calc(100dvh - 12rem)" }}>
      <header className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-2xl dark:bg-orange-500/20">🤖</span>
        <div className="min-w-0 flex-1">
          <p className="font-black">{t("speaking.partnerName")}</p>
          <button type="button" onClick={() => setShowTopic((value) => !value)} className="truncate text-left text-xs font-bold text-slate-500 dark:text-slate-400">
            {topic.emoji} {localized(topic, language)} {showTopic ? "▴" : "▾"}
          </button>
        </div>
        {remaining !== null && !premium && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black dark:bg-white/10">⏱ {t("speaking.minutesLeft", { count: formatMinutes(remaining) })}</span>
        )}
        <button type="button" onClick={endConversation} disabled={phase === "ending"} className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white disabled:opacity-60">
          {t("speaking.end")}
        </button>
      </header>

      {showTopic && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50/70 p-4 text-sm dark:border-orange-400/20 dark:bg-orange-500/10">
          <p className="text-[11px] font-black uppercase tracking-wide text-orange-700 dark:text-orange-200">💡 {t("speaking.questionsHint")}</p>
          <ul className="mt-2 space-y-1.5">
            {topic.questions.map((question) => (
              <li key={question.ko}>
                <span lang="ko" className="font-bold">{question.ko}</span>
                <span className="text-slate-600 dark:text-slate-300"> — {localized(question, language)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex items-center gap-2 self-end text-xs font-bold text-slate-500 dark:text-slate-400">
        <input type="checkbox" checked={showTranslation} onChange={(event) => setShowTranslation(event.target.checked)} className="accent-orange-500" />
        {t("speaking.alwaysTranslate")}
      </label>

      <ol className="flex-1 space-y-4" aria-live="polite">
        {phase === "starting" && <li className="h-20 animate-pulse rounded-3xl bg-orange-50 dark:bg-white/5" />}
        {messages.map((message) =>
          message.role === "partner" ? (
            <PartnerBubble key={message.id} message={message} rate={rate} showTranslation={showTranslation} />
          ) : (
            <LearnerBubble key={message.id} message={message} premium={premium} />
          ),
        )}
        {phase === "thinking" && (
          <li className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-300">
            {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: `${delay}ms` }} />)}
            {t("speaking.thinking")}
          </li>
        )}
        <li ref={listEnd} aria-hidden="true" />
      </ol>

      {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}

      <div className="sticky bottom-20 z-10 rounded-3xl border border-slate-200 bg-white/95 p-4 text-center shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95 md:bottom-4">
        {phase === "limit" ? (
          <div className="space-y-3">
            <p className="font-black">⏱ {t("speaking.limitReached")}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{premium ? t("speaking.limitPremium") : t("speaking.limitFree")}</p>
            {!premium && <Link to="/premium" className="inline-block rounded-2xl bg-violet-600 px-5 py-3 font-black text-white">⭐ {t("speaking.getPremium")}</Link>}
            <button type="button" onClick={endConversation} className="block w-full text-sm font-bold underline">{t("speaking.finish")}</button>
          </div>
        ) : phase === "error" ? (
          <div className="space-y-3">
            <p className="font-bold text-rose-600">{error || t("speaking.startFailed")}</p>
            <button type="button" onClick={onClose} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white dark:bg-white dark:text-slate-950">{t("common.close")}</button>
          </div>
        ) : !microphoneSupported() ? (
          <p className="text-sm font-bold text-rose-600">{t("speaking.noMic")}</p>
        ) : phase === "recording" ? (
          <button type="button" onClick={finishRecording} className="mx-auto flex flex-col items-center gap-2">
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-rose-500 text-white shadow-lg">
              <span className="absolute inset-0 rounded-full bg-rose-400" style={{ transform: `scale(${1 + loudness * 0.5})`, opacity: 0.45, transition: "transform 0.1s" }} />
              <span className="relative h-6 w-6 rounded-md bg-white" />
            </span>
            <span className="text-sm font-black">{t("speaking.tapToSend")} · {Math.floor(elapsed)}/{MAX_SECONDS}s</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecordingTurn}
            disabled={phase !== "idle"}
            className="mx-auto flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-300/60 transition hover:bg-orange-600 dark:shadow-black/40">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </span>
            <span className="text-sm font-black">{phase === "idle" ? t("speaking.tapToSpeak") : t("common.loading")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
