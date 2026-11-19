// "View as this learner" for admins: the site shows exactly what the learner
// sees (their progress, messages, TOPIK results, league) through a short
// read-only pass from the admin API, while nothing is saved anywhere.
//
// - The pass lives in this tab only (sessionStorage) and expires in 30 minutes.
// - Every database write is stopped in src/lib/supabase.js, the progress is
//   never saved, and the tab's local storage is swapped for a throwaway copy,
//   so neither the learner's account nor the admin's device data changes.
// - Imported first in main.jsx, before anything reads local storage.

const KEY = "k-talim:view-as";

function read() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
    if (!saved?.token || !saved?.user?.id) return null;
    if (Date.now() >= saved.expiresAt) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export const viewAs = typeof window === "undefined" ? null : read();
export const isViewingAs = Boolean(viewAs);

export function startViewAs(pass) {
  window.sessionStorage.setItem(KEY, JSON.stringify(pass));
  window.location.assign("/");
}

export function stopViewAs() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  const back = viewAs?.returnTo || "/admin/users";
  window.location.assign(back);
}

// Local storage in this tab becomes a copy in memory: the page can read the
// interface language and the like, and whatever it writes is gone when the
// view ends. The admin's own saved progress and login are left untouched.
const KEEP = /^(language|i18nextLng|k-talim:voice-map|k-talim:text-overrides)/;

function memoryStorage(source) {
  const data = new Map();
  try {
    for (let index = 0; index < source.length; index += 1) {
      const key = source.key(index);
      if (key && KEEP.test(key)) data.set(key, source.getItem(key));
    }
  } catch {
    // Start empty.
  }
  return {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
    setItem: (key, value) => void data.set(String(key), String(value)),
    removeItem: (key) => void data.delete(String(key)),
    clear: () => data.clear(),
  };
}

if (isViewingAs) {
  try {
    Object.defineProperty(window, "localStorage", { configurable: true, value: memoryStorage(window.localStorage) });
  } catch {
    // Very old browsers: the view still never saves progress to the server.
  }
}
