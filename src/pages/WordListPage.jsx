import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { allWords, exampleTranslation, getWordKey, meaning } from "../data";
import { loadTopikVocab, topikEntries } from "../data/topikVocab";
import { getDeck } from "../lib/decks";
import { readCard } from "../lib/anki";
import { STATE, formatInterval } from "../lib/fsrs";
import { speakKorean } from "../lib/speech";

const PAGE = 60;

export default function WordListPage() {
  const { t } = useTranslation();
  const { deckId = "lessons" } = useParams();
  const deck = getDeck(deckId);
  const isTopik = deckId === "topik1" || deckId === "topik2";
  const progress = useSelector((state) => state.progress);
  const vocab = useSelector((state) => state.content.vocab);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (isTopik) loadTopikVocab(deckId);
  }, [deckId, isTopik]);

  const words = useMemo(() => {
    if (isTopik) {
      const lessonByKey = new Map(allWords.map((word) => [getWordKey(word), word]));
      return topikEntries(deckId).map((entry) => ({ ...entry, cardKey: entry.lessonKey && lessonByKey.has(entry.lessonKey) ? entry.lessonKey : getWordKey(entry) }));
    }
    return allWords.map((word) => ({ ...word, cardKey: getWordKey(word) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, vocab]);

  const topics = useMemo(() => {
    const counts = new Map();
    words.forEach((word) => {
      const key = isTopik ? word.topic : String(word.lesson);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()];
  }, [words, isTopik]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return words.filter((word) => {
      if (topic && (isTopik ? word.topic : String(word.lesson)) !== topic) return false;
      if (!needle) return true;
      return [word.korean, word.romanization, word.uzbek, word.english, word.russian].some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [words, query, topic, isTopik]);

  if (!deck) {
    return (
      <GlassCard className="text-center">
        <h1 className="text-2xl font-black">{t("anki.noDeck")}</h1>
        <Link to="/study" className="mt-4 inline-flex rounded-2xl bg-sky-500 px-5 py-2.5 font-black text-white">{t("anki.decks")}</Link>
      </GlassCard>
    );
  }

  const status = (word) => {
    const card = readCard(progress, word.cardKey);
    if (!card || card.state === STATE.new) return { label: t("anki.state.new"), tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300" };
    if (card.state !== STATE.review) return { label: t("anki.state.learning"), tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300" };
    const left = card.due - Date.now();
    return { label: left <= 0 ? t("anki.dueNow") : formatInterval(left, t), tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" };
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-6">
        <Link to="/study" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("anki.decks")}</Link>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">{t(deck.titleKey)}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(deck.textKey)}</p>
        {isTopik && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("anki.topikSource")}</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setShown(PAGE); }} placeholder={t("anki.searchWords")} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900" />
          <select value={topic} onChange={(event) => { setTopic(event.target.value); setShown(PAGE); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-slate-900">
            <option value="">{t("anki.allTopics")}</option>
            {topics.map(([key, count]) => (
              <option key={key} value={key}>{isTopik ? t(`topic.${key}`, { defaultValue: key }) : t("card.lesson", { lesson: key })} ({count})</option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{t("anki.wordsFound", { count: filtered.length })}</p>
      </GlassCard>

      <GlassCard className="divide-y divide-slate-200 p-0 dark:divide-white/10">
        {filtered.slice(0, shown).map((word) => {
          const key = getWordKey(word);
          const state = status(word);
          const expanded = open === key;
          return (
            <div key={key} className="px-4 py-3">
              <button type="button" onClick={() => setOpen(expanded ? null : key)} className="flex w-full items-center gap-3 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-black" lang="ko">{word.korean}</span>
                  <span className="block truncate text-sm text-slate-600 dark:text-slate-300">{meaning(word)}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${state.tone}`}>{state.label}</span>
              </button>
              {expanded && (
                <div className="mt-2 space-y-2 rounded-xl bg-slate-100 p-3 text-sm dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => speakKorean(word.korean, progress.settings.speechRate)} className="rounded-lg bg-sky-500/10 px-2 py-1 text-sky-600 dark:text-sky-300">🔊</button>
                    {word.romanization && <span className="font-semibold text-slate-500">[{word.romanization}]</span>}
                    {word.pos && <span className="text-xs font-bold text-slate-400">{t(`pos.${word.pos}`, { defaultValue: word.pos })}</span>}
                    {word.hanja && <span className="text-xs font-bold text-slate-400">{word.hanja}</span>}
                  </div>
                  {word.example?.ko && (
                    <div>
                      <p className="font-bold" lang="ko">{word.example.ko}</p>
                      <p className="text-slate-600 dark:text-slate-300">{exampleTranslation(word.example)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && <p className="p-6 text-center text-sm text-slate-500">{words.length ? t("anki.noMatches") : t("common.loading")}</p>}
      </GlassCard>
      {shown < filtered.length && (
        <button type="button" onClick={() => setShown((value) => value + PAGE)} className="w-full rounded-2xl border border-slate-200 py-3 font-black dark:border-white/10">{t("anki.showMore")}</button>
      )}
    </div>
  );
}
