function deepClone(value, cache = new WeakMap()) {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (cache.has(value)) {
    return cache.get(value);
  }

  if (value instanceof WeakMap || value instanceof WeakSet || value instanceof Promise) {
    return value;
  }

  let copy;

  if (value instanceof Date) {
    copy = new Date(value);
  } else if (value instanceof RegExp) {
    copy = new RegExp(value.source, value.flags);
    copy.lastIndex = value.lastIndex;
  } else if (value instanceof Map) {
    copy = new Map();
    cache.set(value, copy);

    value.forEach((item, key) => {
      copy.set(deepClone(key, cache), deepClone(item, cache));
    });
  } else if (value instanceof Set) {
    copy = new Set();
    cache.set(value, copy);

    value.forEach(item => {
      copy.add(deepClone(item, cache));
    });
  } else if (value instanceof ArrayBuffer) {
    copy = value.slice(0);
  } else if (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer) {
    copy = value.slice(0);
  } else if (value instanceof DataView) {
    copy = new DataView(
      deepClone(value.buffer, cache),
      value.byteOffset,
      value.byteLength
    );
  } else if (ArrayBuffer.isView(value)) {
    copy = new value.constructor(
      deepClone(value.buffer, cache),
      value.byteOffset,
      value.length
    );
  } else if (value instanceof Number) {
    copy = new Number(value.valueOf());
  } else if (value instanceof String) {
    copy = new String(value.valueOf());
  } else if (value instanceof Boolean) {
    copy = new Boolean(value.valueOf());
  } else if (value instanceof Error) {
    copy = Object.create(Object.getPrototypeOf(value));
    copy.name = value.name;
    copy.message = value.message;
    copy.stack = value.stack;
  } else if (Array.isArray(value)) {
    copy = [];
  } else {
    copy = Object.create(Object.getPrototypeOf(value));
  }

  Object.setPrototypeOf(copy, Object.getPrototypeOf(value));
  cache.set(value, copy);

  Reflect.ownKeys(value).forEach(key => {
    if (
      (value instanceof Map || value instanceof Set) && key === "size" ||
      ArrayBuffer.isView(value) && typeof key === "string" && /^\d+$/.test(key)
    ) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor) {
      return;
    }

    if ("value" in descriptor) {
      descriptor.value = deepClone(descriptor.value, cache);
    }

    try {
      Object.defineProperty(copy, key, descriptor);
    } catch (error) {
      if (!(ArrayBuffer.isView(value) && typeof key === "string" && /^\d+$/.test(key))) {
        throw error;
      }
    }
  });

  return copy;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = deepClone;
}
