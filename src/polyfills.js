if (typeof globalThis.structuredClone !== "function") {
  const clone = (value, seen) => {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    if (value instanceof Date) return new Date(value.getTime());
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    if (ArrayBuffer.isView(value)) return value.slice();
    if (value instanceof Map) {
      const copy = new Map();
      seen.set(value, copy);
      value.forEach((item, key) => copy.set(clone(key, seen), clone(item, seen)));
      return copy;
    }
    if (value instanceof Set) {
      const copy = new Set();
      seen.set(value, copy);
      value.forEach((item) => copy.add(clone(item, seen)));
      return copy;
    }
    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    for (const key of Object.keys(value)) copy[key] = clone(value[key], seen);
    return copy;
  };
  globalThis.structuredClone = (value) => clone(value, new Map());
}

const define = (target, name, fn) => {
  if (!target[name]) Object.defineProperty(target, name, { value: fn, writable: true, configurable: true });
};

function at(index) {
  const length = this.length;
  const position = Math.trunc(index) || 0;
  const real = position < 0 ? length + position : position;
  return real < 0 || real >= length ? undefined : this[real];
}
define(Array.prototype, "at", at);
define(String.prototype, "at", at);

define(Object, "hasOwn", (object, key) => Object.prototype.hasOwnProperty.call(object, key));

define(Array.prototype, "findLast", function findLast(test, self) {
  for (let i = this.length - 1; i >= 0; i -= 1) if (test.call(self, this[i], i, this)) return this[i];
  return undefined;
});

define(Promise, "withResolvers", () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
});
