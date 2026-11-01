import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Interface texts live in src/locales/<language>.js and only the language in
// use is downloaded; switching languages loads the next one first.
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
  // Plural keys use "_one", "_few", "_many", "_other" (Russian has all four).
  pluralSeparator: "_",
  contextSeparator: "_",
});

export async function loadLanguage(language) {
  const code = LOADERS[language] ? language : "uz";
  if (!i18n.hasResourceBundle(code, "translation")) {
    const module = await LOADERS[code]();
    i18n.addResourceBundle(code, "translation", module.default, true, true);
  }
  return code;
}

// Resolves once the starting language is ready; the app renders after it.
export const i18nReady = loadLanguage(initial);

export async function changeLanguage(language) {
  const code = await loadLanguage(language);
  return i18n.changeLanguage(code);
}

export default i18n;
