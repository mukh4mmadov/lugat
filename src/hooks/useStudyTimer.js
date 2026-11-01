import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addStudyMinutes } from "../store";

const STUDY_PATHS = /^\/(study\/|lesson\/|review|weak-words|topik\/)/;
const IDLE_AFTER_MS = 2 * 60 * 1000;

// Counts minutes actually spent learning: on a study page, with the tab
// visible, and with some input in the last two minutes.
export function useStudyTimer(pathname) {
  const dispatch = useDispatch();
  const lastActivityRef = useRef(Date.now());
  const secondsRef = useRef(0);

  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((name) => window.addEventListener(name, markActive, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, markActive));
  }, []);

  useEffect(() => {
    if (!STUDY_PATHS.test(pathname)) return undefined;
    lastActivityRef.current = Date.now();
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivityRef.current > IDLE_AFTER_MS) return;
      secondsRef.current += 5;
      if (secondsRef.current >= 60) {
        secondsRef.current -= 60;
        dispatch(addStudyMinutes(1));
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [dispatch, pathname]);
}
