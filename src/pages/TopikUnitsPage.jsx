import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { getTopikUnit, topikUnitTitle, topikUnitWords } from "../data/topikUnits";
import { StudySession } from "./StudyPage";
import { useTopikWords } from "../lib/useTopikWords";

// One TOPIK I unit studied like a lesson (its page is /units/topik1/:n).
export function TopikUnitStudyPage() {
  const { t, i18n } = useTranslation();
  const { unitId } = useParams();
  const unit = getTopikUnit(unitId);
  const vocab = useTopikWords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => topikUnitWords(unit), [unit, vocab]);

  if (unit && !words.length) return <GlassCard className="text-center">{t("common.loading")}</GlassCard>;
  return (
    <StudySession
      key={unit ? `${unit.n}-${words.length}` : "none"}
      sessionKey={unit ? `t1u${unit.n}` : "none"}
      words={words}
      title={unit ? `${t("units.unit", { n: unit.n })} · ${topikUnitTitle(unit, i18n.language)}` : ""}
      backTo={unit ? `/units/topik1/${unit.n}` : "/study?tab=units"}
      backLabel={unit ? t("units.unit", { n: unit.n }) : t("sets.allUnits")}
      flashcardsPath={unit ? `/units/topik1/${unit.n}/cards` : null}
      nextPath={unit && getTopikUnit(unit.n + 1) ? `/units/topik1/${unit.n + 1}` : null}
    />
  );
}

export default TopikUnitStudyPage;
