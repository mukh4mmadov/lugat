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
  }
  const back = viewAs?.returnTo || "/admin/users";
  window.location.assign(back);
}

const KEEP = /^(language|i18nextLng|k-talim:voice-map|k-talim:text-overrides)/;

function memoryStorage(source) {
  const data = new Map();
  try {
    for (let index = 0; index < source.length; index += 1) {
      const key = source.key(index);
      if (key && KEEP.test(key)) data.set(key, source.getItem(key));
    }
  } catch {
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
  }
}
