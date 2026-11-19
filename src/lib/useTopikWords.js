import { useEffect } from "react";
import { useSelector } from "react-redux";
import { loadTopikVocab } from "../data/topikVocab";

// TOPIK units need the TOPIK word list, a separate download. Returns a value
// that changes once it has arrived, for use in memo dependencies.
export function useTopikWords() {
  const vocab = useSelector((state) => state.content.vocab);
  useEffect(() => {
    loadTopikVocab("topik1");
  }, []);
  return vocab;
}
