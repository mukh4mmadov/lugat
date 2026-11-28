import { useMemo, useState } from "react";
import { TopikExamContext } from "../lib/topikExamContext";

export function TopikExamProvider({ children }) {
  const [context, setContext] = useState(null);
  const value = useMemo(() => ({ context, setContext }), [context]);
  return (
    <TopikExamContext.Provider value={value}>
      {children}
    </TopikExamContext.Provider>
  );
}
