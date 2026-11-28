import { useEffect } from "react";
import { useSelector } from "react-redux";
import { loadTopikVocab } from "../data/topikVocab";

export function useTopikWords(levels = ["topik1"]) {
  const vocab = useSelector((state) => state.content.vocab);
  const wanted = levels.join(",");
  useEffect(() => {
    for (const level of wanted.split(",").filter(Boolean)) loadTopikVocab(level);
  }, [wanted]);
  return vocab;
}

export function useHasTopik2Cards() {
  const cards = useSelector((state) => state.progress.cards);
  const words = useSelector((state) => state.progress.words);
  return Object.keys(cards || {}).some((id) => id.startsWith("t2-")) || Object.keys(words || {}).some((id) => id.startsWith("t2-"));
}
