import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { allWords, getWordKey, meaning } from "../data";
import { STORIES, getStory, isPremiumStory, lineText, storiesForLesson, wordCandidates } from "../data/stories";
import { useAuth } from "../hooks/useAuth";
import { isPremium } from "../lib/premium";
import { speakKorean, stopSpeaking } from "../lib/speech";
import { completeStory, toggleFavorite } from "../store";
import { ModeHeader } from "./FlashcardsPage";

const titleText = (story, language) => story.title[language] || story.title.uz;

function StoryCard({ story }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const read = useSelector((state) => Boolean(state.progress.stories?.[story.id]?.read));
  const locked = isPremiumStory(story) && !isPremium(user);
  return (
    <Link
      to={`/stories/${story.id}`}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${read ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10" : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"}`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-2xl dark:bg-orange-500/20">{story.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-black" lang="ko">{story.title.ko}</span>
        <span className="block truncate text-xs text-slate-500">{titleText(story, i18n.language)}</span>
      </span>
      <span className="shrink-0 text-sm font-black">{read ? "✓" : locked ? "⭐" : ""}</span>
      {locked && <span className="sr-only">{t("stories.premium")}</span>}
    </Link>
  );
}

// /stories — all stories by lesson.
export function StoriesLibraryPage() {
  const { t } = useTranslation();
  const stories = useSelector((state) => state.progress.stories || {});
  const read = STORIES.filter((story) => stories[story.id]?.read).length;
  const lessonNumbers = [...new Set(STORIES.map((story) => story.lesson))];
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-black md:text-3xl">📖 {t("stories.title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("stories.subtitle", { read, total: STORIES.length })}</p>
      </header>
      <GlassCard className="!p-5">
        <div className="space-y-4">
          {lessonNumbers.map((lesson) => (
            <section key={lesson}>
              <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">{t("card.lesson", { lesson })}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {storiesForLesson(lesson).map((story) => <StoryCard key={story.id} story={story} />)}
              </div>
            </section>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// /lesson/:lessonId/stories — the lesson's stories under the lesson tabs.
export function LessonStoriesPage() {
  const { t } = useTranslation();
  const { lessonId } = useParams();
  const stories = storiesForLesson(lessonId);
  return (
    <div className="space-y-6">
      <ModeHeader lesson={Number(lessonId)} />
      <GlassCard className="!p-5">
        <h2 className="text-xl font-black">📖 {t("stories.lessonTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("stories.lessonText")}</p>
        {stories.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{stories.map((story) => <StoryCard key={story.id} story={story} />)}</div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold dark:bg-white/10">🚧 {t("stories.comingSoon")}</p>
        )}
        <Link to="/stories" className="mt-4 inline-block text-sm font-bold text-sky-600 dark:text-sky-300">{t("stories.all")} →</Link>
      </GlassCard>
    </div>
  );
}

function WordPopover({ token, onClose }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const favorites = useSelector((state) => state.progress.favorites);
  const word = wordCandidates(token).map((candidate) => allWords.find((item) => item.korean === candidate)).find(Boolean);
  const key = word && getWordKey(word);
  return (
    <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900 md:bottom-8" role="dialog" aria-label={token}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-black" lang="ko">{word?.korean || token.replace(/[.,!?“”"]/g, "")}</p>
          {word ? (
            <>
              <p className="text-sm text-slate-500">{word.romanization}</p>
              <p className="mt-1 font-bold">{meaning(word, i18n.language)}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{t("stories.notInDictionary")}</p>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label={t("common.close")} className="text-xl text-slate-400">×</button>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => speakKorean(word?.korean || token, rate)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black dark:bg-white/10">🔊 {t("stories.listen")}</button>
        {key && (
          <button type="button" onClick={() => dispatch(toggleFavorite(key))} className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-black dark:bg-amber-500/10">
            {favorites[key] ? "⭐" : "☆"} {t("stories.save")}
          </button>
        )}
      </div>
    </div>
  );
}

function Questions({ story, onDone }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const score = story.questions.filter(([, , right], index) => answers[index] === right).length;
  return (
    <GlassCard className="!p-5">
      <h2 className="text-lg font-black">❓ {t("stories.questions")}</h2>
      <ol className="mt-3 space-y-4">
        {story.questions.map(([question, options, right], index) => (
          <li key={question}>
            <p className="font-bold" lang="ko">{index + 1}. {question}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((option, optionIndex) => {
                const chosen = answers[index] === optionIndex;
                const tone = checked ? (optionIndex === right ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : chosen ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "opacity-60") : chosen ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10" : "";
                return (
                  <button key={option} type="button" disabled={checked} onClick={() => setAnswers({ ...answers, [index]: optionIndex })} className={`rounded-xl border-2 border-slate-200 px-3 py-2 font-bold dark:border-white/10 ${tone}`} lang="ko">
                    {option}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {!checked ? (
        <button
          type="button"
          disabled={Object.keys(answers).length < story.questions.length}
          onClick={() => {
            setChecked(true);
            onDone(Math.round((score / story.questions.length) * 100));
          }}
          className="mt-5 w-full rounded-2xl bg-sky-600 px-5 py-3 font-black text-white disabled:opacity-40"
        >
          {t("stories.check")}
        </button>
      ) : (
        <p className="mt-5 text-center text-lg font-black">{score === story.questions.length ? "🎉 " : ""}{t("stories.score", { score, total: story.questions.length })}</p>
      )}
    </GlassCard>
  );
}

// /stories/:storyId — read, listen, tap words, answer questions.
export function StoryReaderPage() {
  const { storyId } = useParams();
  return <StoryReader key={storyId} storyId={storyId} />;
}

function StoryReader({ storyId }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const story = getStory(storyId);
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const [showTranslation, setShowTranslation] = useState(false);
  const [opened, setOpened] = useState({});
  const [playing, setPlaying] = useState(-1);
  const [token, setToken] = useState(null);
  const [done, setDone] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => () => {
    cancelled.current = true;
    stopSpeaking();
  }, []);

  if (!story) return <Navigate to="/stories" replace />;
  const language = i18n.language;
  const locked = isPremiumStory(story) && !isPremium(user);
  const siblings = storiesForLesson(story.lesson);
  const position = STORIES.indexOf(story);
  const next = STORIES[position + 1];

  async function playAll() {
    cancelled.current = false;
    for (let index = 0; index < story.lines.length; index += 1) {
      if (cancelled.current) break;
      setPlaying(index);
      await speakKorean(story.lines[index][0], rate);
    }
    setPlaying(-1);
  }

  function stop() {
    cancelled.current = true;
    stopSpeaking();
    setPlaying(-1);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2 px-1 text-sm font-bold">
        <Link to="/stories" className="text-sky-600 dark:text-sky-300">📖 {t("stories.title")}</Link>
        <span className="text-slate-400">/</span>
        <Link to={`/lesson/${story.lesson}/stories`} className="text-sky-600 dark:text-sky-300">{t("card.lesson", { lesson: story.lesson })}</Link>
      </div>

      <GlassCard>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-orange-100 text-4xl dark:bg-orange-500/20">{story.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black" lang="ko">{story.title.ko}</h1>
            <p className="text-slate-600 dark:text-slate-300">{titleText(story, language)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {story.words.map((ko) => {
            const word = allWords.find((item) => item.korean === ko);
            return (
              <span key={ko} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
                <span lang="ko">{ko}</span>{word && <span className="opacity-80"> · {meaning(word, language)}</span>}
              </span>
            );
          })}
        </div>
      </GlassCard>

      {locked ? (
        <GlassCard className="text-center">
          <p className="text-4xl">⭐</p>
          <h2 className="mt-2 text-xl font-black">{t("stories.lockedTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("stories.lockedText")}</p>
          <p className="mt-4 select-none text-lg font-bold blur-[3px]" lang="ko" aria-hidden="true">{story.lines[0][0]} {story.lines[1][0]}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/premium" className="rounded-2xl bg-violet-600 px-5 py-3 font-black text-white">⭐ {t("stories.getPremium")}</Link>
            {siblings[0] && siblings[0].id !== story.id && <Link to={`/stories/${siblings[0].id}`} className="rounded-2xl border border-slate-300 px-5 py-3 font-black dark:border-white/15">{t("stories.readFree")}</Link>}
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="sticky top-20 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
            {playing >= 0 ? (
              <button type="button" onClick={stop} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-black text-white">■ {t("stories.stop")}</button>
            ) : (
              <button type="button" onClick={playAll} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white">▶ {t("stories.playAll")}</button>
            )}
            <label className="ml-auto flex items-center gap-2 px-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={showTranslation} onChange={(event) => setShowTranslation(event.target.checked)} className="accent-orange-500" />
              {t("stories.translation")}
            </label>
          </div>

          <GlassCard className="!p-5">
            <p className="mb-3 text-xs font-bold text-slate-500">💡 {t("stories.tapHint")}</p>
            <ol className="space-y-3">
              {story.lines.map((line, index) => (
                <li key={index} className={`rounded-2xl px-3 py-2 transition ${playing === index ? "bg-orange-100 dark:bg-orange-500/20" : ""}`}>
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-xl leading-9" lang="ko">
                      {line[0].split(" ").map((part, partIndex) => (
                        <button key={partIndex} type="button" onClick={() => setToken(part)} className="mr-1.5 rounded-md px-0.5 hover:bg-sky-100 dark:hover:bg-sky-500/20">
                          {part}
                        </button>
                      ))}
                    </p>
                    <button type="button" onClick={() => speakKorean(line[0], rate)} aria-label={t("stories.listen")} className="mt-1 text-lg">🔊</button>
                  </div>
                  {showTranslation || opened[index] ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{lineText(line, language)}</p>
                  ) : (
                    <button type="button" onClick={() => setOpened({ ...opened, [index]: true })} className="text-xs font-bold text-slate-400 underline">{t("stories.showLine")}</button>
                  )}
                </li>
              ))}
            </ol>
          </GlassCard>

          <Questions
            story={story}
            onDone={(score) => {
              setDone(true);
              dispatch(completeStory({ id: story.id, score }));
            }}
          />
          {done && next && (
            <Link to={`/stories/${next.id}`} className="block rounded-2xl bg-sky-600 px-5 py-3 text-center font-black text-white">
              {t("stories.next")}: {next.emoji} <span lang="ko">{next.title.ko}</span> →
            </Link>
          )}
        </>
      )}
      {token && <WordPopover token={token} onClose={() => setToken(null)} />}
    </div>
  );
}
