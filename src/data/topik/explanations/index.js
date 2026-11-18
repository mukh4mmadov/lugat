// Pre-written explanations for each TOPIK paper question (uz/en/ru), one file
// per paper: paperNN.js exports { [questionNumber]: { uz, en, ru, words } }.
// Loaded only when a result or practice screen needs them.
const FILES = import.meta.glob("./paper*.js", { import: "default" });

const cache = new Map();

export function hasExplanations(examNumber) {
  return Boolean(FILES[`./paper${examNumber}.js`]);
}

export function loadExplanations(examNumber) {
  const loader = FILES[`./paper${examNumber}.js`];
  if (!loader) return Promise.resolve(null);
  if (!cache.has(examNumber)) cache.set(examNumber, loader().catch(() => null));
  return cache.get(examNumber);
}
