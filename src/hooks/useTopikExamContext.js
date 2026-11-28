import { useContext } from "react";
import { TopikExamContext } from "../lib/topikExamContext";

export function useTopikExamContext() {
  return useContext(TopikExamContext);
}
