import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ReportWordLink from "../components/ReportWordLink";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { exampleTranslation, getLessonWords, getWordKey, lessonInfo, meaning } from "../data";
import { markKnown, markDifficult, recordStudySession, selectStudyProgress } from "../store";
import { getWordMastery } from "../lib/mastery";
import MasteryBadge from "../components/MasteryBadge";
import { speakKorean } from "../lib/speech";
import { playCorrectSound, playWrongSound } from "../lib/sounds";
import { isAnswerCorrect } from "../lib/study";
import {
  MASTERY_CORRECT,
  answerExercise,
  continueAfterFeedback,
  currentLearnKey,
  exerciseBlank,
  finishLearnCard,
  isSessionValid,
  masteredCount,
  newSession,
  wordExample,
} from "../lib/studySession";

export function StudyHomePage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden p-6 md:p-10">
        <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-emerald-300/25 blur-3xl md:block" />
        <WordBadge tone="green">{t("study.learnFirst")}</WordBadge>
        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-6xl">
          {t("study.title")}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg md:leading-8">
          {t("study.subtitle")}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-300 md:text-sm">
          <span className="rounded-full bg-slate-950/5 px-3 py-1.5 dark:bg-white/10">
            {t("nav.study")}
          </span>
          <span>→</span>
          <span className="rounded-full bg-slate-950/5 px-3 py-1.5 dark:bg-white/10">
            {t("practice.flashcards")}
          </span>
        </div>
      </GlassCard>


      <Link to="/courses" className="group block">
        <GlassCard className="relative overflow-hidden p-5 md:p-8 transition hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-violet-300/25 blur-3xl md:block" />
          <div className="relative">
            <WordBadge tone="violet">
              {t("courses.browseByCourse", {
                defaultValue: "Browse by Course",
              })}
            </WordBadge>
            <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white md:text-2xl">
              {t("courses.browseTitle", {
                defaultValue: "Explore Lessons by Book",
              })}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 md:text-base">
              {t("courses.browseSubtitle", {
                defaultValue: "Choose K-TALIM 1A or 1B to view its lessons",
              })}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2 font-black text-white transition group-hover:scale-105">
              {t("courses.openCourses", {
                defaultValue: "Open Course Library",
              })}
              <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </div>
        </GlassCard>
      </Link>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessonInfo.map((lesson, index) => {
          const percent = selectStudyProgress({ progress }, lesson.lesson);
          return (
            <motion.article
              key={lesson.lesson}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-lg font-black text-white shadow-lg">
                  {lesson.lesson}
                </div>
                <WordBadge tone={percent === 100 ? "green" : "violet"}>
                  {t("home.wordCount", { count: lesson.count })}
                </WordBadge>
              </div>
              <h3 className="mt-4 text-lg font-black">
                {t("card.lesson", { lesson: lesson.lesson })}
              </h3>
              <p className="mt-1.5 min-h-10 text-xs capitalize text-slate-600 dark:text-slate-300">
                {t(lesson.category)}
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                <span>
                  {percent}% {t("nav.study")}
                </span>
                <Link
                  className="text-sky-600 transition group-hover:translate-x-1 dark:text-sky-300"
                  to={`/study/${lesson.lesson}`}
                >
                  {t("button.continue")}
                </Link>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}

const OPTION_TONE = {
  idle: "border-slate-200 bg-white/70 hover:-translate-y-0.5 hover:border-sky-300 dark:border-white/10 dark:bg-white/10",
  correct: "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
  wrong: "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200",
  dim: "border-slate-200 bg-white/70 opacity-45 dark:border-white/10 dark:bg-white/10",
};

function sessionStorageKey(lesson) {
  return `k-talim:study-session:v2:${lesson}`;
}

function loadSession(lesson, words) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(sessionStorageKey(lesson)) || "null");
    return isSessionValid(saved, words) ? saved : null;
  } catch {
    return null;
  }
}

export function StudyModePage() {
  const { lessonId = "1" } = useParams();
  return <StudySession key={lessonId} lesson={Number(lessonId)} />;
}

function StudySession({ lesson }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const settings = useSelector((state) => state.progress.settings);
  const wordsState = useSelector((state) => state.progress.words);
  const words = useMemo(() => getLessonWords(lesson), [lesson]);
  const byKey = useMemo(() => Object.fromEntries(words.map((word) => [getWordKey(word), word])), [words]);
  const [session, setSession] = useState(() => loadSession(lesson, words) || newSession(words));

  useEffect(() => {
    try {
      window.localStorage.setItem(sessionStorageKey(lesson), JSON.stringify(session));
    } catch {
      // The session still works for this visit without storage.
    }
  }, [lesson, session]);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const answeredIdRef = useRef(null);

  // Each exercise is recorded exactly once, even on a fast double click.
  const answer = useCallback(
    (correct, given) => {
      const current = sessionRef.current;
      if (current.phase !== "exercise" || answeredIdRef.current === current.exercise.id) return;
      answeredIdRef.current = current.exercise.id;
      const { key, type: exerciseType } = current.exercise;
      dispatch(correct ? markKnown({ key, exerciseType }) : markDifficult({ key, exerciseType }));
      if (correct) playCorrectSound();
      else playWrongSound();
      setSession(answerExercise(current, correct, given));
    },
    [dispatch],
  );

  const proceed = useCallback(() => {
    setSession((current) => {
      if (current.phase === "feedback") return continueAfterFeedback(current, words);
      if (current.phase === "reinforce") return continueAfterFeedback({ ...current, result: { correct: true } }, words);
      if (current.phase === "learn") return finishLearnCard(current, words);
      return current;
    });
  }, [words]);

  const restart = () => {
    if (session.counter > 0 && !window.confirm(t("study.restartConfirm"))) return;
    setSession(newSession(words));
  };

  if (!words.length) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black">{t("study.lessonNotFound")}</h2>
        <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/study">
          {t("common.back")}
        </Link>
      </GlassCard>
    );
  }

  const mastered = masteredCount(session);
  const learnWord = session.phase === "learn" ? byKey[currentLearnKey(session)] : null;
  const exerciseWord = session.exercise ? byKey[session.exercise.key] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <StudyHeader
        lesson={lesson}
        introduced={session.introduced}
        total={words.length}
        mastered={mastered}
        onRestart={restart}
      />
      <AnimatePresence mode="wait">
        {session.phase === "learn" && learnWord && (
          <LearningCard
            key={`learn-${getWordKey(learnWord)}`}
            word={learnWord}
            position={session.learnCursor + 1}
            batchSize={session.introduced - session.batchStart}
            settings={settings}
            reduxMastery={getWordMastery(getWordKey(learnWord), wordsState)}
            onContinue={proceed}
          />
        )}
        {(session.phase === "exercise" || session.phase === "feedback") && exerciseWord && (
          <ExerciseCard
            key={session.exercise.id}
            exercise={session.exercise}
            word={exerciseWord}
            byKey={byKey}
            result={session.result}
            progress={session.mastery[session.exercise.key]?.correct || 0}
            settings={settings}
            onAnswer={answer}
            onContinue={proceed}
          />
        )}
        {session.phase === "reinforce" && exerciseWord && (
          <ReinforcementCard key={`again-${session.exercise.id}`} word={exerciseWord} settings={settings} onContinue={proceed} />
        )}
        {session.phase === "done" && (
          <StudyComplete
            key="done"
            lesson={lesson}
            session={session}
            total={words.length}
            onAgain={() => setSession(newSession(words))}
            onFlashcards={() => navigate(`/lesson/${lesson}/flashcards`)}
            onNext={lesson < lessonInfo.length ? () => navigate(`/study/${lesson + 1}`) : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StudyHeader({ lesson, introduced, total, mastered, onRestart }) {
  const { t } = useTranslation();
  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/study" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("nav.study")}</Link>
          <h1 className="mt-1 text-2xl font-black">{t("card.lesson", { lesson })}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-black tabular-nums">{mastered} / {total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("study.mastered")}</p>
          </div>
          <button type="button" onClick={onRestart} title={t("study.restart")} aria-label={t("study.restart")} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">↺</button>
        </div>
      </div>
      <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-sky-300/70 transition-all dark:bg-sky-400/30" style={{ width: `${(introduced / total) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${(mastered / total) * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{mastered} {t("study.mastered")}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />{introduced - mastered} {t("study.learning")}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />{total - introduced} {t("mastery.new").toLowerCase()}</span>
      </div>
    </GlassCard>
  );
}

function CardShell({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <GlassCard className="p-6 md:p-8">{children}</GlassCard>
    </motion.div>
  );
}

function SpeakButton({ text, settings, large = false }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => speakKorean(text, settings.speechRate)}
      aria-label={t("study.listen")}
      className={`grid place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-sky-500/25 transition hover:scale-105 ${large ? "h-24 w-24 text-4xl" : "h-11 w-11 text-lg"}`}
    >
      🔊
    </button>
  );
}

function useEnterToContinue(enabled, onContinue) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (event) => {
      // An answered (read-only) input still lets Enter move on.
      if (event.key === "Enter" && !event.target.closest?.("input:not([readonly]), textarea")) {
        event.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onContinue]);
}

function LearningCard({ word, position, batchSize, settings, reduxMastery, onContinue }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const example = wordExample(word);

  useEffect(() => {
    if (settings.autoSpeak) speakKorean(word.korean, settings.speechRate);
    // Speak once when the card appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const action = revealed ? onContinue : () => setRevealed(true);
  useEnterToContinue(true, action);

  return (
    <CardShell>
      <div className="flex items-center justify-between">
        <WordBadge tone="violet">✨ {t("study.newWordCount", { current: position, total: batchSize })}</WordBadge>
        {reduxMastery && <MasteryBadge level={reduxMastery.level} size="xs" />}
      </div>
      <div className="mt-6 flex flex-col items-center text-center">
        <p className="text-5xl font-black md:text-6xl">{word.korean}</p>
        {word.romanization && <p className="mt-2 text-lg font-semibold text-slate-500 dark:text-slate-400">[{word.romanization}]</p>}
        <div className="mt-4"><SpeakButton text={word.korean} settings={settings} /></div>
        <div className={`mt-6 w-full rounded-2xl p-5 transition ${revealed ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5"}`}>
          {revealed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{meaning(word)}</p>
              {example && (
                <div className="mt-4 border-t border-emerald-200/70 pt-4 text-left dark:border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("study.example")}</p>
                  <button type="button" onClick={() => speakKorean(example.ko, settings.speechRate)} className="mt-1 text-left text-lg font-bold">{example.ko} 🔊</button>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{exampleTranslation(example)}</p>
                </div>
              )}
              <ReportWordLink word={word} className="mt-3" />
            </motion.div>
          ) : (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("study.guessFirst")}</p>
          )}
        </div>
        <button type="button" onClick={action} className={`mt-6 w-full rounded-2xl px-6 py-4 text-lg font-black text-white transition hover:-translate-y-0.5 sm:w-auto sm:min-w-56 ${revealed ? "bg-emerald-500" : "bg-slate-950 dark:bg-white dark:text-slate-950"}`}>
          {revealed ? `${t("study.gotIt")} →` : t("study.showMeaning")}
        </button>
        <p className="mt-2 text-xs text-slate-400">{t("study.enterHint")}</p>
      </div>
    </CardShell>
  );
}

function ExerciseCard({ exercise, word, byKey, result, progress, settings, onAnswer, onContinue }) {
  const { t } = useTranslation();
  const answered = Boolean(result);
  useEnterToContinue(answered, onContinue);

  useEffect(() => {
    const listening = exercise.type === "listeningToKorean" || exercise.type === "listeningToMeaning";
    if (listening || settings.autoSpeak && exercise.type === "koreanToUzbek") speakKorean(word.korean, settings.speechRate);
    // Speak once per exercise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  return (
    <CardShell>
      <div className="flex items-center justify-between gap-3">
        <WordBadge tone="violet">{t(`exercise.${exercise.type}`)}</WordBadge>
        <div className="flex items-center gap-1" title={t("study.mastery.progress", { count: progress, threshold: MASTERY_CORRECT })}>
          {Array.from({ length: MASTERY_CORRECT }, (_, index) => (
            <span key={index} className={`h-2 w-6 rounded-full ${index < progress ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"}`} />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <ExerciseBody exercise={exercise} word={word} byKey={byKey} result={result} settings={settings} onAnswer={onAnswer} />
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-2xl p-4 text-center ${result.correct ? "bg-emerald-500/10" : "bg-rose-500/10"}`} role="status">
          <p className={`text-lg font-black ${result.correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
            {result.correct ? `✓ ${t("practice.correct")}` : `✗ ${t("topik.incorrect")}`}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{word.korean} [{word.romanization}] = {meaning(word)}</p>
          <button type="button" onClick={onContinue} autoFocus className="mt-4 rounded-2xl bg-slate-950 px-8 py-3 font-black text-white dark:bg-white dark:text-slate-950">
            {t("study.continue")} →
          </button>
        </motion.div>
      )}
    </CardShell>
  );
}

function ExerciseBody({ exercise, word, byKey, result, settings, onAnswer }) {
  const { t } = useTranslation();
  const answered = Boolean(result);
  const options = (exercise.optionKeys || []).map((key) => byKey[key]).filter(Boolean);

  const choose = (key) => {
    if (!answered) onAnswer(key === exercise.key, key);
  };

  useEffect(() => {
    if (answered || !options.length) return undefined;
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea")) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < options.length) choose(getWordKey(options[index]));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const optionList = (render) => (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const key = getWordKey(option);
        let tone = OPTION_TONE.idle;
        if (answered) tone = key === exercise.key ? OPTION_TONE.correct : key === result.given ? OPTION_TONE.wrong : OPTION_TONE.dim;
        return (
          <button key={key} type="button" disabled={answered} onClick={() => choose(key)} className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${tone}`}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950/5 text-xs font-black dark:bg-white/10">{index + 1}</span>
            {render(option)}
          </button>
        );
      })}
    </div>
  );

  const korean = (option) => (
    <span><span className="block text-2xl font-black">{option.korean}</span>{option.romanization && <span className="text-sm text-slate-500 dark:text-slate-400">{option.romanization}</span>}</span>
  );
  const meaning = (option) => <span className="text-lg font-bold">{meaning(option)}</span>;

  switch (exercise.type) {
    case "koreanToUzbek":
      return (
        <>
          <Prompt title={word.korean} sub={word.romanization} hint={t("study.chooseMeaning")} speak={<SpeakButton text={word.korean} settings={settings} />} />
          {optionList(meaning)}
        </>
      );
    case "uzbekToKorean":
      return (
        <>
          <Prompt title={meaning(word)} hint={t("study.chooseKorean")} />
          {optionList(korean)}
        </>
      );
    case "listeningToKorean":
    case "listeningToMeaning":
      return (
        <>
          <div className="flex flex-col items-center text-center">
            <SpeakButton text={word.korean} settings={settings} large />
            <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {exercise.type === "listeningToKorean" ? t("study.listenChooseWord") : t("study.listenChooseMeaning")}
            </p>
          </div>
          {optionList(exercise.type === "listeningToKorean" ? korean : meaning)}
        </>
      );
    case "sentenceContext": {
      const blank = exerciseBlank(word);
      return (
        <>
          <Prompt title={blank.ko} hint={t("study.chooseWordForBlank")} sub={exampleTranslation(blank)} />
          {optionList(korean)}
        </>
      );
    }
    case "trueFalse":
      return <TrueFalseBody exercise={exercise} shown={byKey[exercise.shownKey]} result={result} onAnswer={onAnswer} />;
    case "missingSyllable":
      return <MissingSyllableBody exercise={exercise} word={word} result={result} onAnswer={onAnswer} />;
    case "typingChallenge":
      return <TypingBody word={word} result={result} onAnswer={onAnswer} />;
    default:
      return null;
  }
}

function Prompt({ title, sub, hint, speak }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{hint}</p>
      <p className="mt-3 text-3xl font-black md:text-4xl">{title}</p>
      {sub && <p className="mt-1 text-base text-slate-500 dark:text-slate-400">{sub}</p>}
      {speak && <div className="mt-3">{speak}</div>}
    </div>
  );
}

function TrueFalseBody({ exercise, shown, result, onAnswer }) {
  const { t } = useTranslation();
  const isTrue = exercise.shownKey === exercise.key;
  const answered = Boolean(result);
  const pickAnswer = (value) => !answered && onAnswer(value === isTrue, value ? "yes" : "no");
  const tone = (value) => {
    if (!answered) return value ? "border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:border-emerald-500/20 dark:bg-emerald-500/10" : "border-rose-200 bg-rose-50 hover:border-rose-400 dark:border-rose-500/20 dark:bg-rose-500/10";
    if (value === isTrue) return OPTION_TONE.correct;
    return result.given === (value ? "yes" : "no") ? OPTION_TONE.wrong : OPTION_TONE.dim;
  };
  return (
    <>
      <Prompt hint={t("study.isTranslationCorrect")} title={`${shown.korean} = ${meaning(shown)}`} sub={shown.romanization} />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" disabled={answered} onClick={() => pickAnswer(true)} className={`rounded-2xl border-2 p-4 text-lg font-black transition ${tone(true)}`}>✓ {t("study.yesCorrect")}</button>
        <button type="button" disabled={answered} onClick={() => pickAnswer(false)} className={`rounded-2xl border-2 p-4 text-lg font-black transition ${tone(false)}`}>✗ {t("study.noIncorrect")}</button>
      </div>
    </>
  );
}

function MissingSyllableBody({ exercise, word, result, onAnswer }) {
  const { t } = useTranslation();
  const answered = Boolean(result);
  const answer = word.korean[exercise.blankIndex];
  const chars = [...word.korean];
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("study.chooseMissingSyllable")}</p>
        <p className="mt-3 text-5xl font-black tracking-wide">
          {chars.map((char, index) => (
            <span key={index} className={index === exercise.blankIndex ? "mx-1 inline-block min-w-[1.2em] rounded-lg border-b-4 border-sky-500 text-sky-600 dark:text-sky-300" : ""}>
              {index === exercise.blankIndex ? (answered ? answer : "?") : char}
            </span>
          ))}
        </p>
        <p className="mt-3 text-lg font-bold text-slate-600 dark:text-slate-300">{meaning(word)}</p>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {exercise.choices.map((choice) => {
          let tone = OPTION_TONE.idle;
          if (answered) tone = choice === answer ? OPTION_TONE.correct : choice === result.given ? OPTION_TONE.wrong : OPTION_TONE.dim;
          return (
            <button key={choice} type="button" disabled={answered} onClick={() => onAnswer(choice === answer, choice)} className={`aspect-square rounded-2xl border-2 text-3xl font-black transition ${tone}`}>
              {choice}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TypingBody({ word, result, onAnswer }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const answered = Boolean(result);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (answered || !value.trim()) return;
    const correct = isAnswerCorrect(value, word.korean) || (word.romanization && isAnswerCorrect(value, word.romanization));
    onAnswer(Boolean(correct), value);
  };

  return (
    <>
      <Prompt hint={t("study.typeKoreanOrRoman")} title={meaning(word)} />
      <div className="mt-6 flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (answered) return;
              submit();
            }
          }}
          readOnly={answered}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={t("study.koreanInputLabel")}
          placeholder={t("study.typePlaceholder")}
          className={`min-w-0 flex-1 rounded-2xl border-2 bg-white/80 px-4 py-3 text-center text-2xl font-bold outline-none transition focus:border-sky-400 dark:bg-white/10 ${answered ? (result.correct ? "border-emerald-400" : "border-rose-400") : "border-slate-200 dark:border-white/10"}`}
        />
        {!answered && (
          <button type="button" onClick={submit} disabled={!value.trim()} className="rounded-2xl bg-slate-950 px-5 font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">
            {t("study.check")}
          </button>
        )}
      </div>
      {!answered && (
        <button type="button" onClick={() => onAnswer(false, "")} className="mx-auto mt-3 block text-sm font-bold text-slate-500 underline dark:text-slate-400">
          {t("practice.dontKnow")}
        </button>
      )}
    </>
  );
}

function ReinforcementCard({ word, settings, onContinue }) {
  const { t } = useTranslation();
  const example = wordExample(word);
  useEnterToContinue(true, onContinue);
  useEffect(() => {
    speakKorean(word.korean, settings.speechRate);
    // Speak once when the card appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  return (
    <CardShell>
      <div className="text-center">
        <WordBadge tone="amber">🔁 {t("study.letsReview")}</WordBadge>
        <p className="mt-5 text-5xl font-black">{word.korean}</p>
        {word.romanization && <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">[{word.romanization}]</p>}
        <div className="mt-3 flex justify-center"><SpeakButton text={word.korean} settings={settings} /></div>
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-2xl font-black text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{meaning(word)}</p>
        {example && (
          <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-left dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("study.example")}</p>
            <p className="mt-1 text-lg font-bold">{example.ko}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{exampleTranslation(example)}</p>
          </div>
        )}
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t("study.reviewLater")}</p>
        <button type="button" onClick={onContinue} className="mt-5 rounded-2xl bg-slate-950 px-8 py-3 font-black text-white dark:bg-white dark:text-slate-950">{t("study.continue")} →</button>
      </div>
    </CardShell>
  );
}

function StudyComplete({ session, total, onAgain, onFlashcards, onNext }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const rewarded = useRef(false);
  useEffect(() => {
    if (rewarded.current) return;
    rewarded.current = true;
    dispatch(recordStudySession());
  }, [dispatch]);
  const answers = session.stats.correct + session.stats.incorrect;
  const accuracy = answers ? Math.round((session.stats.correct / answers) * 100) : 0;
  const minutes = Math.max(1, Math.round(((session.finishedAt || Date.now()) - session.startedAt) / 60000));
  return (
    <CardShell>
      <div className="text-center">
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="text-6xl">🎉</motion.p>
        <h2 className="mt-3 text-3xl font-black">{t("study.lessonCompleted")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("study.doneText", { count: total })}</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label={t("study.wordsMastered")} value={`${total}`} />
          <Stat label={t("study.accuracy")} value={`${accuracy}%`} />
          <Stat label={t("study.studyTime")} value={t("study.minutes", { count: minutes })} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onNext && <button type="button" onClick={onNext} className="rounded-2xl bg-sky-500 px-6 py-3 font-black text-white">{t("study.nextLesson")}</button>}
          <button type="button" onClick={onFlashcards} className="rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white">{t("practice.flashcards")}</button>
          <button type="button" onClick={onAgain} className="rounded-2xl border border-slate-300 px-6 py-3 font-bold dark:border-white/20">{t("home.studyAgain")}</button>
        </div>
      </div>
    </CardShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/5">
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
