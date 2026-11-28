import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DEFAULT_ANKI_SETTINGS, formatSteps, parseSteps } from "../../lib/fsrs";
import { clearSuspended, selectAnkiOptions, setAnkiSettings, setAutoSpeak, setSpeechRate } from "../../store";

const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

function Row({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-sky-500" />
      <span>
        <span className="block text-sm font-black">{label}</span>
        {hint && <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

export default function AnkiSettingsPanel({ onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const options = useSelector(selectAnkiOptions);
  const autoSpeak = useSelector((state) => state.progress.settings.autoSpeak);
  const speechRate = useSelector((state) => state.progress.settings.speechRate);
  const suspendedCount = useSelector((state) => Object.keys(state.progress.suspended || {}).length);
  const [learning, setLearning] = useState(formatSteps(options.learningSteps));
  const [relearning, setRelearning] = useState(formatSteps(options.relearningSteps));
  const learningValid = parseSteps(learning) !== null;
  const relearningValid = parseSteps(relearning) !== null;
  const save = (patch) => dispatch(setAnkiSettings(patch));
  const number = (key, min, max) => (event) => {
    const value = Math.round(Number(event.target.value));
    if (Number.isFinite(value)) save({ [key]: Math.min(max, Math.max(min, value)) });
  };

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const dark = document.documentElement.classList.contains("k-dark");
  return createPortal(
    <div className={dark ? "dark" : ""}>
      <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4" onClick={onClose} role="presentation">
        <div role="dialog" aria-modal="true" aria-label={t("anki.settings.title")} onClick={(event) => event.stopPropagation()} className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white sm:rounded-3xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h2 className="text-lg font-black">⚙ {t("anki.settings.title")}</h2>
            <button type="button" onClick={onClose} aria-label={t("common.close")} className="rounded-lg px-2 py-1 text-xl text-slate-400">✕</button>
          </div>
          <div className="space-y-4 overflow-y-auto px-5 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("anki.settings.intro")}</p>

            <Section title={t("anki.settings.limits")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label={t("anki.settings.reviewsPerDay")} hint={t("anki.settings.reviewsPerDayHint")}>
                  <input type="number" min="0" max="9999" value={options.reviewsPerDay} onChange={number("reviewsPerDay", 0, 9999)} className={field} />
                </Row>
              </div>
            </Section>

            <Section title={t("anki.settings.newCards")}>
              <Row label={t("anki.settings.learningSteps")} hint={t("anki.settings.stepsHint")}>
                <input value={learning} onChange={(event) => setLearning(event.target.value)} onBlur={() => learningValid && save({ learningSteps: parseSteps(learning) })} className={`${field} ${learningValid ? "" : "border-rose-400"}`} />
              </Row>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label={t("anki.settings.newOrder")}>
                  <select value={options.newOrder} onChange={(event) => save({ newOrder: event.target.value })} className={field}>
                    <option value="sequential">{t("anki.settings.order.sequential")}</option>
                    <option value="random">{t("anki.settings.order.random")}</option>
                  </select>
                </Row>
                <Row label={t("anki.settings.mixLabel")}>
                  <select value={options.mix} onChange={(event) => save({ mix: event.target.value })} className={field}>
                    <option value="mixed">{t("anki.settings.mix.mixed")}</option>
                    <option value="reviewsFirst">{t("anki.settings.mix.reviewsFirst")}</option>
                    <option value="newFirst">{t("anki.settings.mix.newFirst")}</option>
                  </select>
                </Row>
              </div>
            </Section>

            <Section title={t("anki.settings.lapses")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label={t("anki.settings.relearningSteps")} hint={t("anki.settings.stepsHint")}>
                  <input value={relearning} onChange={(event) => setRelearning(event.target.value)} onBlur={() => relearningValid && save({ relearningSteps: parseSteps(relearning) })} className={`${field} ${relearningValid ? "" : "border-rose-400"}`} />
                </Row>
                <Row label={t("anki.settings.leech")} hint={t("anki.settings.leechHint")}>
                  <input type="number" min="1" max="99" value={options.leechThreshold} onChange={number("leechThreshold", 1, 99)} className={field} />
                </Row>
              </div>
            </Section>

            <Section title={t("anki.settings.fsrs")}>
              <Row label={`${t("anki.settings.retention")}: ${Math.round(options.desiredRetention * 100)}%`} hint={t("anki.settings.retentionHint")}>
                <input type="range" min="0.7" max="0.97" step="0.01" value={options.desiredRetention} onChange={(event) => save({ desiredRetention: Number(event.target.value) })} className="w-full accent-sky-500" />
              </Row>
              <Row label={t("anki.settings.maxInterval")} hint={t("anki.settings.maxIntervalHint")}>
                <input type="number" min="1" max="36500" value={options.maximumInterval} onChange={number("maximumInterval", 1, 36500)} className={field} />
              </Row>
            </Section>

            <Section title={t("anki.settings.cards")}>
              <Toggle checked={options.recognition} label={t("anki.settings.recognition")} hint={t("anki.settings.recognitionHint")} onChange={(checked) => save({ recognition: checked, recall: checked ? options.recall : true })} />
              <Toggle checked={options.recall} label={t("anki.settings.recall")} hint={t("anki.settings.recallHint")} onChange={(checked) => save({ recall: checked, recognition: checked ? options.recognition : true })} />
              <Toggle checked={options.burySiblings} label={t("anki.settings.bury")} hint={t("anki.settings.buryHint")} onChange={(checked) => save({ burySiblings: checked })} />
            </Section>

            <Section title={t("anki.settings.display")}>
              <Toggle checked={autoSpeak !== false} label={t("anki.settings.autoAudio")} onChange={(checked) => dispatch(setAutoSpeak(checked))} />
              <Row label={`${t("anki.settings.speechRate")}: ${Number(speechRate || 0.82).toFixed(2)}×`}>
                <input type="range" min="0.5" max="1.3" step="0.05" value={speechRate || 0.82} onChange={(event) => dispatch(setSpeechRate(Number(event.target.value)))} className="w-full accent-sky-500" />
              </Row>
              <Toggle checked={options.showRomanization} label={t("anki.settings.romanization")} onChange={(checked) => save({ showRomanization: checked })} />
              <Toggle checked={options.showExample} label={t("anki.settings.example")} onChange={(checked) => save({ showExample: checked })} />
              <Row label={t("anki.settings.dayStarts")} hint={t("anki.settings.dayStartsHint")}>
                <select value={options.dayStartsAt} onChange={(event) => save({ dayStartsAt: Number(event.target.value) })} className={field}>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </Row>
            </Section>

            {suspendedCount > 0 && (


              <button type="button" onClick={() => dispatch(clearSuspended())} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">


                ⏸ {t("anki.restoreSuspended", { count: suspendedCount })}


              </button>


            )}

            <button
              type="button"
              onClick={() => {
                if (!window.confirm(t("anki.settings.resetConfirm"))) return;
                const { decks, ...rest } = DEFAULT_ANKI_SETTINGS;
                dispatch(setAnkiSettings({ ...rest, decks: { ...decks, ...options.decks } }));
                setLearning(formatSteps(rest.learningSteps));
                setRelearning(formatSteps(rest.relearningSteps));
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              {t("anki.settings.reset")}
            </button>
          </div>
          <div className="border-t border-slate-200 px-5 py-3 dark:border-white/10">
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white dark:bg-white dark:text-slate-950">{t("anki.settings.done")}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
