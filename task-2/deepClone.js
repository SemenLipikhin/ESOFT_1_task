/**
 * Создаёт глубокую копию значения с сохранением циклических ссылок,
 * прототипов и дескрипторов собственных свойств.
 *
 * Функции копируются по ссылке: JavaScript не предоставляет способа
 * универсально клонировать их исполняемый код и лексическое окружение.
 * Symbol как примитив сохраняет идентичность; свойства с symbol-ключами
 * копируются вместе с остальными собственными свойствами.
 *
 * WeakMap, WeakSet и Promise намеренно не клонируются: их внутреннее
 * состояние нельзя корректно прочитать и восстановить стандартными средствами.
 *
 * @param {*} source Исходное значение.
 * @returns {*} Глубокая копия значения.
 */
function deepClone(source) {
  const visited = new WeakMap();

  function clone(value) {
    // Примитивы (в том числе Symbol) и функции.
    if (value === null || (typeof value !== "object" && typeof value !== "function")) {
      return value;
    }

    // Функции сохраняем по ссылке: клонировать closure невозможно.
    if (typeof value === "function") {
      return value;
    }

    if (visited.has(value)) {
      return visited.get(value);
    }

    // Объекты с недоступным для восстановления внутренним состоянием.
    if (
      value instanceof WeakMap ||
      value instanceof WeakSet ||
      (typeof Promise !== "undefined" && value instanceof Promise)
    ) {
      return value;
    }

    let copy;

    if (value instanceof Date) {
      copy = new Date(value.getTime());
    } else if (value instanceof RegExp) {
      copy = new RegExp(value.source, value.flags);
      copy.lastIndex = value.lastIndex;
    } else if (value instanceof Map) {
      copy = new Map();
      visited.set(value, copy);
      for (const [key, item] of value) {
        copy.set(clone(key), clone(item));
      }
    } else if (value instanceof Set) {
      copy = new Set();
      visited.set(value, copy);
      for (const item of value) {
        copy.add(clone(item));
      }
    } else if (value instanceof ArrayBuffer) {
      copy = value.slice(0);
    } else if (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer) {
      copy = value.slice(0);
    } else if (value instanceof DataView) {
      const buffer = clone(value.buffer);
      copy = new DataView(buffer, value.byteOffset, value.byteLength);
    } else if (ArrayBuffer.isView(value)) {
      const buffer = clone(value.buffer);
      copy = new value.constructor(buffer, value.byteOffset, value.length);
    } else if (value instanceof Number) {
      copy = new Number(value.valueOf());
    } else if (value instanceof String) {
      copy = new String(value.valueOf());
    } else if (value instanceof Boolean) {
      copy = new Boolean(value.valueOf());
    } else if (typeof BigInt !== "undefined" && Object.prototype.toString.call(value) === "[object BigInt]") {
      copy = Object(value.valueOf());
    } else if (typeof Symbol !== "undefined" && Object.prototype.toString.call(value) === "[object Symbol]") {
      copy = Object(value.valueOf());
    } else if (value instanceof Error) {
      copy = Object.create(Object.getPrototypeOf(value));
      copy.name = value.name;
      copy.message = value.message;
      if ("stack" in value) copy.stack = value.stack;
    } else if (Array.isArray(value)) {
      copy = [];
      Object.setPrototypeOf(copy, Object.getPrototypeOf(value));
    } else {
      copy = Object.create(Object.getPrototypeOf(value));
    }

    // Сохраняем ссылку до рекурсивного обхода: это разрывает циклы.
    visited.set(value, copy);

    // Map/Set уже заполнили содержимое; здесь копируем их дополнительные свойства.
    // Reflect.ownKeys включает и Symbol-ключи, и неперечисляемые свойства.
    for (const key of Reflect.ownKeys(value)) {
      if (
        (value instanceof Map && key === "size") ||
        (value instanceof Set && key === "size") ||
        (ArrayBuffer.isView(value) && typeof key === "string" && /^\d+$/.test(key))
      ) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor) continue;

      if ("value" in descriptor) {
        descriptor.value = clone(descriptor.value);
      }

      try {
        Object.defineProperty(copy, key, descriptor);
      } catch (error) {
        // Некоторые встроенные свойства (например, typed array indices)
        // уже созданы конструктором и не требуют повторного определения.
        if (!(ArrayBuffer.isView(value) && typeof key === "string" && /^\d+$/.test(key))) {
          throw error;
        }
      }
    }

    return copy;
  }

  return clone(source);
}

// Экспорт для Node.js и тестов; в браузере функция доступна как globalThis.deepClone.
if (typeof module !== "undefined" && module.exports) {
  module.exports = deepClone;
}
