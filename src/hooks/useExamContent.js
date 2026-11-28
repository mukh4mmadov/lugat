import { useEffect, useState } from "react";
import { getTopikExam, isExamLoaded, loadExamContent } from "../data/topik/exams";
import "../lib/topikPremium";

export function useExamContent(examId) {
  const exam = examId ? getTopikExam(examId) : null;
  const [loadedId, setLoadedId] = useState(() => (isExamLoaded(exam) ? examId : null));
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!exam || isExamLoaded(exam)) return undefined;
    let cancelled = false;
    loadExamContent(exam).then(
      () => !cancelled && setLoadedId(exam.id),
      (failure) => !cancelled && setError(failure),
    );
    return () => {
      cancelled = true;
    };
  }, [exam]);
  if (error) throw error;
  return !exam || isExamLoaded(exam) || loadedId === examId;
}
