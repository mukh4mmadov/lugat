import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import TopikQuestion, { preloadPaperPages } from "../components/TopikQuestion";
import TopikExplanation from "../components/TopikExplanation";
import { useExplanations } from "../hooks/useExplanations";
import { questionsOfType, topikTypeKeys } from "../lib/topikTypes";
import { replayRange } from "../lib/topikAudio";
import { recordTopikPractice } from "../store";
import { useAuth } from "../context/AuthContext";
import { isPremium } from "../lib/premium";
import UpgradeCard from "../components/UpgradeCard";
import { shuffle } from "../lib/study";

// Practice one kind of TOPIK question at a time, across every paper: answer,
// see right away whether it was right, read the explanation and (for
// listening) the script, then go on.
export default function TopikPracticePage() {
  const { typeKey } = useParams();
  const type = topikTypeKeys().find((item) => item.key === typeKey);
  if (!type) return <Navigate to="/topik" replace />;
  return <PracticeRun key={typeKey} type={type} />;
}

function PracticeRun({ type }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const results = useSelector((state) => state.progress.topikPractice || {});
  const { user } = useAuth();
  const premium = isPremium(user);
  const all = useMemo(() => questionsOfType(type.key, premium), [type.key, premium]);
  const locked = premium ? 0 : questionsOfType(type.key).length - all.length;
  // Unanswered and missed questions first, then the rest, each group shuffled.
  const [order] = useState(() => {
    const fresh = shuffle(all.filter((item) => results[item.qid] === undefined));
    const missed = shuffle(all.filter((item) => results[item.qid] === 0));
    const done = shuffle(all.filter((item) => results[item.qid] === 1));
    return [...fresh, ...missed, ...done];
  });
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const item = order[cursor];
  const explanations = useExplanations(item?.exam.number);

  useEffect(() => {
    if (!item) return;
    const content = item.exam.content?.[item.question.number];
    preloadPaperPages(item.exam.pdf, [content?.shared?.page, content?.stem?.page, content?.options?.[0]?.box?.page].filter(Boolean));
  }, [item]);

  const choose = useCallback(
    (option) => {
      if (!item || picked) return;
      const correct = option === item.question.answer;
      setPicked(option);
      setScore((value) => ({ right: value.right + (correct ? 1 : 0), total: value.total + 1 }));
      dispatch(recordTopikPractice({ qid: item.qid, correct }));
    },
    [item, picked, dispatch],
  );

  const next = useCallback(() => {
    setPicked(null);
    setCursor((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea, select, button")) return;
      if (!picked && ["1", "2", "3", "4"].includes(event.key)) choose(event.key);
      else if (picked && (event.key === "Enter" || event.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, choose, next]);

  const accuracy = (() => {
    const answered = all.filter((entry) => results[entry.qid] !== undefined);
    return answered.length ? Math.round((answered.filter((entry) => results[entry.qid] === 1).length / answered.length) * 100) : null;
  })();

  const header = (
    <GlassCard className="p-4 md:p-5">
      <Link to="/topik?tab=types" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("topik.types.back")}</Link>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-black md:text-2xl" lang="ko">{type.ko}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{type.section === "listening" ? "🎧" : "📖"} {t(`topik.type.${type.id}`)} · {t("topik.types.count", { count: all.length })}</p>
        </div>
        <div className="text-right text-xs font-bold text-slate-500 dark:text-slate-400">
          <p>{t("topik.types.session", { right: score.right, total: score.total })}</p>
          {accuracy !== null && <p>{t("topik.types.overall", { percent: accuracy })}</p>}
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(Math.min(cursor, order.length) / Math.max(1, order.length)) * 100}%` }} />
      </div>
    </GlassCard>
  );

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {header}
        <GlassCard className="p-6 text-center md:p-10">
          <p className="text-5xl">🎉</p>
          <h2 className="mt-3 text-2xl font-black">{t("topik.types.doneTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("topik.types.doneText", { right: score.right, total: score.total })}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/topik?tab=types" className="rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("topik.types.other")}</Link>
            <Link to="/topik" className="rounded-2xl border border-slate-300 px-5 py-2.5 font-black dark:border-white/15">{t("topik.types.mock")}</Link>
          </div>
          {locked > 0 && <UpgradeCard feature="topikPapers" className="mx-auto mt-5 max-w-md" />}
        </GlassCard>
      </div>
    );
  }

  const { exam, question } = item;
  const correct = picked && picked === question.answer;
  const transcript = question.section === "listening" ? exam.transcript?.[question.number] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {header}
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("topik.types.source", { number: exam.number, question: question.number })}</p>
      {question.section === "listening" && <ClipPlayer key={item.qid} exam={exam} number={question.number} />}
      <div className="rounded-3xl bg-[#eef2f8] p-2 dark:bg-[#0b1220] md:p-3">
        <TopikQuestion exam={exam} question={question} selected={picked || undefined} onSelect={choose} review={picked ? true : null} showShared translate />
      </div>
      {picked && (
        <div className="space-y-3">
          <div role="status" className={`rounded-2xl p-4 text-center text-lg font-black ${correct ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
            {correct ? `✓ ${t("topik.correct")}` : `✗ ${t("topik.types.wrong", { answer: ["", "①", "②", "③", "④"][Number(question.answer)] })}`}
          </div>
          {explanations && <TopikExplanation entry={explanations[question.number]} />}
          {transcript && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">📜 {t("topik.transcript")}</p>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-7" lang="ko">{transcript}</p>
            </div>
          )}
          <button type="button" onClick={next} autoFocus className="w-full rounded-2xl bg-slate-950 px-6 py-3.5 font-black text-white dark:bg-white dark:text-slate-950">{t("topik.types.next")} →</button>
        </div>
      )}
    </div>
  );
}

// Plays the question's part of the paper's recording.
function ClipPlayer({ exam, number }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [state, setState] = useState({ playing: false, progress: 0 });
  const range = replayRange(exam, number);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  if (!range) return null;
  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.playing) {
      audio.pause();
      setState({ playing: false, progress: 0 });
      return;
    }
    audio.currentTime = range.start;
    audio.play().then(() => setState({ playing: true, progress: 0 })).catch(() => setState({ playing: false, progress: 0 }));
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#cfe0ff] bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
      <audio
        ref={audioRef}
        src={exam.audio}
        preload="metadata"
        className="hidden"
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime;
          if (time >= range.end) {
            event.currentTarget.pause();
            setState({ playing: false, progress: 0 });
          } else if (state.playing) setState({ playing: true, progress: (time - range.start) / (range.end - range.start) });
        }}
      />
      <button type="button" onClick={play} className="shrink-0 rounded-xl bg-[#1a6ef5] px-4 py-2 text-sm font-black text-white">
        {state.playing ? `⏸ ${t("topik.stopAudio")}` : `▶ ${t("topik.types.listen")}`}
      </button>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-[#1a6ef5] transition-all" style={{ width: `${Math.min(100, state.progress * 100)}%` }} />
      </div>
    </div>
  );
}
