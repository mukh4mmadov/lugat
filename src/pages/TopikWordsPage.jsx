import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { allWords, exampleTranslation, getWordKey, meaning } from "../data";
import { PAPER_35_CONTENT } from "../data/topik/paper35Content";
import { PAPER_35_TRANSCRIPT } from "../data/topik/paper35Transcript";
import { PAPER_35_KEY_WORDS } from "../data/topik/paper35Vocab";
import { speakKorean } from "../lib/speech";
import { toggleFavorite } from "../store";

const PAPERS = { "35th": { content: PAPER_35_CONTENT, transcript: PAPER_35_TRANSCRIPT, keyWords: PAPER_35_KEY_WORDS, number: 35 } };
// Endings after a one-syllable verb stem (맑 + 습니다), so short stems don't
// match inside unrelated words.
const ENDINGS = "(?:습니다|ㅂ니다|아요|어요|았|었|고|게|지|는|은|을|으)";

function paperText(paper) {
  const parts = [...Object.values(paper.transcript)];
  Object.values(paper.content).forEach((question) => {
    parts.push(question.prompt, question.sharedText, question.stemText, ...(question.options || []).map((option) => option.text));
  });
  return parts.filter(Boolean).join("\n").replace(/<보\s?기>/g, "");
}

// Lesson words found in the paper, most frequent first.
function lessonWordsInPaper(text) {
  const seen = new Set();
  return allWords
    .filter((word) => !seen.has(word.korean) && seen.add(word.korean))
    .map((word) => {
      const count = word.korean
        .split("/")
        .map((form) => form.trim())
        .reduce((sum, form) => {
          const verb = /다$/.test(form);
          const stem = verb ? form.slice(0, -1) : form;
          if ([...stem].length < 2) {
            if (!verb || !stem) return sum;
            // Must start a word: 여자는 is "woman", not 자다 + 는.
            return sum + (text.match(new RegExp(`(?<![가-힣])${stem}${ENDINGS}`, "g")) || []).length;
          }
          return sum + (text.split(stem).length - 1);
        }, 0);
      return { word, count };
    })
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}

export default function TopikWordsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { examId } = useParams();
  const favorites = useSelector((state) => state.progress.favorites);
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const paper = PAPERS[examId];
  const lessonWords = useMemo(() => (paper ? lessonWordsInPaper(paperText(paper)) : []), [paper]);
  if (!paper) return <Navigate to="/topik" replace />;

  const language = String(i18n.language || "uz").slice(0, 2);
  const missingFavorites = lessonWords.filter(({ word }) => !favorites[getWordKey(word)]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/topik" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("topik.backToTests")}</Link>
        <h1 className="mt-2 text-2xl font-black md:text-3xl">📚 {t("topikWords.title", { number: paper.number })}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("topikWords.subtitle")}</p>
      </div>

      <GlassCard className="!p-5 md:!p-6">
        <h2 className="text-xl font-black">{t("topikWords.keyTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("topikWords.keyHint")}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {paper.keyWords.map((word) => (
            <li key={word.korean} className="flex items-center gap-3 rounded-2xl bg-slate-950/5 px-3 py-2.5 dark:bg-white/5">
              <button type="button" onClick={() => speakKorean(word.korean, rate)} aria-label={`${t("practice.replayAudio")} ${word.korean}`} className="shrink-0 text-lg">
                🔊
              </button>
              <span className="min-w-0 flex-1">
                <span className="text-lg font-black">{word.korean}</span>
                <span className="ml-2 text-xs font-semibold text-slate-400">{word.romanization}</span>
                <span className="block truncate text-sm text-slate-600 dark:text-slate-300">{word[language] || word.uz}</span>
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="!p-5 md:!p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">{t("topikWords.lessonTitle", { count: lessonWords.length })}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("topikWords.lessonHint")}</p>
          </div>
          {missingFavorites.length > 0 ? (
            <button
              type="button"
              onClick={() => missingFavorites.forEach(({ word }) => dispatch(toggleFavorite(getWordKey(word))))}
              className="rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-black text-amber-950"
            >
              ⭐ {t("topikWords.addAll", { count: missingFavorites.length })}
            </button>
          ) : (
            <Link to="/favorites" className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">
              {t("topikWords.practise")} →
            </Link>
          )}
        </div>
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
          {lessonWords.map(({ word, count }) => {
            const key = getWordKey(word);
            return (
              <li key={key} className="flex items-center gap-3 py-2.5">
                <button type="button" onClick={() => speakKorean(word.korean, rate)} aria-label={`${t("practice.replayAudio")} ${word.korean}`} className="shrink-0 text-lg">
                  🔊
                </button>
                <span className="min-w-0 flex-1">
                  <span className="font-black">{word.korean}</span>
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">{meaning(word)}</span>
                  {word.example && <span className="block truncate text-xs text-slate-400" title={exampleTranslation(word.example)}>{word.example.ko}</span>}
                </span>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">×{count}</span>
                <Link to={`/study/${word.lesson}`} className="hidden shrink-0 text-xs font-bold text-sky-600 dark:text-sky-300 sm:inline">
                  {t("card.lesson", { lesson: word.lesson })}
                </Link>
                <button
                  type="button"
                  aria-pressed={Boolean(favorites[key])}
                  aria-label={t("topikWords.favorite")}
                  onClick={() => dispatch(toggleFavorite(key))}
                  className={`shrink-0 text-xl ${favorites[key] ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                >
                  ★
                </button>
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </div>
  );
}
