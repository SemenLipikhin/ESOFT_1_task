const assert = require("node:assert/strict");
const isValidBrackets = require("./brackets");

assert.equal(isValidBrackets(""), true);
assert.equal(isValidBrackets("()"), true);
assert.equal(isValidBrackets("()[]{}"), true);
assert.equal(isValidBrackets("(]"), false);
assert.equal(isValidBrackets("([)]"), false);
assert.equal(isValidBrackets("{[]}"), true);
assert.equal(isValidBrackets("((()))"), true);
assert.equal(isValidBrackets("((("), false);
assert.equal(isValidBrackets(")))"), false);
assert.equal(isValidBrackets("{[()]}"), true);
assert.equal(isValidBrackets("{[(])}"), false);

console.log("Все тесты пройдены.");
