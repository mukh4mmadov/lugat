import { useEffect, useState } from "react";
import { loadExplanations } from "../data/topik/explanations";

export function useExplanations(examNumber) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    loadExplanations(examNumber).then((loaded) => !cancelled && setData(loaded || {}));
    return () => {
      cancelled = true;
    };
  }, [examNumber]);
  return data;
}
