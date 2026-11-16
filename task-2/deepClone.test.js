const assert = require("node:assert/strict");
const deepClone = require("./deepClone");

const original = {
  user: { name: "Semen", tags: ["js", "ts"] },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const copied = deepClone(original);

assert.notEqual(copied, original);
assert.notEqual(copied.user, original.user);
assert.notEqual(copied.user.tags, original.user.tags);

copied.user.tags.push("react");
assert.equal(original.user.tags.length, 2);

const shared = { value: 10 };
const cyclic = { first: shared, second: shared };
cyclic.self = cyclic;

const cyclicCopy = deepClone(cyclic);

assert.equal(cyclicCopy.self, cyclicCopy);
assert.equal(cyclicCopy.first, cyclicCopy.second);
assert.notEqual(cyclicCopy.first, shared);

const symbolKey = Symbol("private");
const complex = {
  map: new Map([[{ id: 1 }, { nested: true }]]),
  set: new Set([{ score: 5 }]),
  date: new Date(123456),
  regexp: /hello/gi,
  [symbolKey]: { secret: true },
};

complex.regexp.lastIndex = 2;

const complexCopy = deepClone(complex);

assert.notEqual(complexCopy.map, complex.map);
assert.notEqual([...complexCopy.map.keys()][0], [...complex.map.keys()][0]);
assert.notEqual([...complexCopy.set][0], [...complex.set][0]);
assert.equal(complexCopy.date.getTime(), complex.date.getTime());
assert.equal(complexCopy.regexp.lastIndex, 2);
assert.notEqual(complexCopy[symbolKey], complex[symbolKey]);

class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hi, ${this.name}`;
  }
}

const personCopy = deepClone(new Person("Alex"));

assert.equal(Object.getPrototypeOf(personCopy), Person.prototype);
assert.equal(personCopy.greet(), "Hi, Alex");

const fn = () => 42;
const withFunction = deepClone({ fn });

assert.equal(withFunction.fn, fn);

const typed = new Uint16Array([10, 20, 30]);
const typedCopy = deepClone(typed);

assert.notEqual(typedCopy.buffer, typed.buffer);
typedCopy[0] = 99;
assert.equal(typed[0], 10);

class CustomDate extends Date {}

const customDate = new CustomDate("2026-01-01T00:00:00.000Z");
const customDateCopy = deepClone(customDate);

assert.equal(Object.getPrototypeOf(customDateCopy), CustomDate.prototype);
assert.equal(customDateCopy.getTime(), customDate.getTime());

class CustomMap extends Map {}

const customMap = new CustomMap([["key", { value: 1 }]]);
const customMapCopy = deepClone(customMap);

assert.equal(Object.getPrototypeOf(customMapCopy), CustomMap.prototype);
assert.notEqual(customMapCopy.get("key"), customMap.get("key"));

const symbolValue = Symbol("value");
const functionValue = () => "ok";
const specialValuesCopy = deepClone({ symbolValue, functionValue });

assert.equal(specialValuesCopy.symbolValue, symbolValue);
assert.equal(specialValuesCopy.functionValue, functionValue);

console.log("Все тесты пройдены.");
