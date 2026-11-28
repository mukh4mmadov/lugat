import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LOADERS = {
  uz: () => import("../locales/uz.js"),
  en: () => import("../locales/en.js"),
  ru: () => import("../locales/ru.js"),
};

export const LANGUAGES = Object.keys(LOADERS);

const saved = typeof localStorage !== "undefined" ? localStorage.getItem("language") : null;
const initial = LANGUAGES.includes(saved) ? saved : "uz";

i18n.use(initReactI18next).init({
  resources: {},
  partialBundledLanguages: true,
  lng: initial,
  fallbackLng: "uz",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  pluralSeparator: "_",
  contextSeparator: "_",
});

let textOverrides = {};
const builtIn = {};

function applyOverrides(code) {
  if (!builtIn[code]) return;
  i18n.addResourceBundle(code, "translation", { ...builtIn[code], ...textOverrides[code] }, true, true);
}

export function setTextOverrides(overrides) {
  textOverrides = overrides || {};
  Object.keys(builtIn).forEach(applyOverrides);
}

export async function loadLanguage(language) {
  const code = LOADERS[language] ? language : "uz";
  if (!i18n.hasResourceBundle(code, "translation")) {
    const module = await LOADERS[code]();
    builtIn[code] = module.default;
    applyOverrides(code);
  }
  return code;
}

export const i18nReady = loadLanguage(initial);

export async function changeLanguage(language) {
  const code = await loadLanguage(language);
  return i18n.changeLanguage(code);
}

export default i18n;
