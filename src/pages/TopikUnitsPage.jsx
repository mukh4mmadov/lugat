import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { topikUnitTitle } from "../data/topikUnits";
import { StudySession } from "./StudyPage";
import { useTopikWords } from "../lib/useTopikWords";
import { unitSet } from "../lib/wordSets";

export function TopikUnitStudyPage() {
  const { t, i18n } = useTranslation();
  const { level, unitId } = useParams();
  const set = unitSet(unitId, level);
  const vocab = useTopikWords([level]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => (set ? set.words() : []), [set?.key, vocab]);
  const next = set ? unitSet(set.n + 1, level) : null;

  if (set && !words.length) return <GlassCard className="text-center">{t("common.loading")}</GlassCard>;
  return (
    <StudySession
      key={set ? `${set.key}-${words.length}` : "none"}
      sessionKey={set ? set.key : "none"}
      words={words}
      title={set ? `${t("units.unit", { n: set.n })} · ${topikUnitTitle(set.unit, i18n.language)}` : ""}
      backTo={set ? set.home : "/study"}
      backLabel={set ? t("units.unit", { n: set.n }) : t("sets.allUnits")}
      flashcardsPath={set ? set.cards : null}
      nextPath={next ? next.home : null}
    />
  );
}

export default TopikUnitStudyPage;
