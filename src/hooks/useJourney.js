import { useMemo } from "react";
import { useSelector } from "react-redux";
import { SEOUL_PLACES, VISITED_PERCENT } from "../data/seoulMap";
import { selectLessonProgress } from "../store";

// Where the learner is on the Seoul map: every place with its lesson
// progress, how many are visited, and the next one to reach.
export function useJourney() {
  const words = useSelector((state) => state.progress.words);
  return useMemo(() => {
    const places = SEOUL_PLACES.map((place) => ({ ...place, percent: selectLessonProgress({ progress: { words } }, place.lesson) }));
    return {
      places,
      visited: places.filter((place) => place.percent >= VISITED_PERCENT).length,
      current: places.find((place) => place.percent < VISITED_PERCENT) || null,
    };
  }, [words]);
}
