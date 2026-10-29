import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { BADGES, levelTitle } from "../lib/gamification";
import { clearFx } from "../store";

const BADGE_ICON = Object.fromEntries(BADGES.map((badge) => [badge.id, badge.icon]));

// "+10 XP" bubbles, the level-up card and new-badge toasts. The store records
// these as `fx` events; this component shows them once and clears them.
export default function XpCelebrations() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fx = useSelector((state) => state.progress.fx);
  const [gain, setGain] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [badges, setBadges] = useState([]);
  const shown = useRef(new Set());

  useEffect(() => {
    if (!fx) return;
    if (fx.gain) setGain({ amount: fx.gain, key: fx.at });
    if (fx.levelUp) setLevelUp(fx.levelUp);
    // fx keeps its badges until cleared, so skip the ones already shown.
    const fresh = (fx.badges || []).filter((id) => !shown.current.has(id));
    fresh.forEach((id) => shown.current.add(id));
    if (fresh.length) setBadges((current) => [...current, ...fresh]);
    // Gains within a moment add up, so wait a little before clearing.
    const timer = setTimeout(() => dispatch(clearFx()), 1600);
    return () => clearTimeout(timer);
  }, [fx, dispatch]);

  useEffect(() => {
    if (!gain) return;
    const timer = setTimeout(() => setGain(null), 1400);
    return () => clearTimeout(timer);
  }, [gain]);

  useEffect(() => {
    if (!badges.length) return;
    const timer = setTimeout(() => setBadges((current) => current.slice(1)), 3500);
    return () => clearTimeout(timer);
  }, [badges]);

  const title = levelUp ? levelTitle(levelUp) : null;

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex flex-col items-end gap-2" aria-live="polite">
        <AnimatePresence>
          {gain && (
            <motion.span
              key={gain.key}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="rounded-full bg-amber-400 px-3 py-1.5 text-sm font-black text-amber-950 shadow-lg"
            >
              +{gain.amount} XP
            </motion.span>
          )}
          {badges[0] && (
            <motion.div
              key={badges[0]}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex max-w-xs items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3 shadow-xl dark:border-amber-400/20 dark:bg-slate-900"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-500/20">{BADGE_ICON[badges[0]]}</span>
              <span className="min-w-0">
                <span className="block text-[11px] font-black uppercase tracking-wide text-amber-600 dark:text-amber-300">{t("xp.newBadge")}</span>
                <span className="block truncate font-black">{t(`badge.${badges[0]}`)}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {levelUp && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
            onClick={() => setLevelUp(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-2xl dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-6xl" aria-hidden="true">🎉</p>
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">{t("xp.levelUp")}</p>
              <h2 id="level-up-title" className="mt-1 text-4xl font-black">{t("xp.level", { level: levelUp })}</h2>
              <p className="mt-2 text-lg font-bold">
                {title.icon} <span lang="ko">{title.ko}</span> · {t(`xp.title.${title.id}`)}
              </p>
              <div className="mt-6 flex gap-2">
                <Link to="/achievements" onClick={() => setLevelUp(null)} className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-black dark:border-white/15">
                  🏅 {t("xp.seeAchievements")}
                </Link>
                <button type="button" onClick={() => setLevelUp(null)} className="flex-1 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-amber-950">
                  {t("xp.continue")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
