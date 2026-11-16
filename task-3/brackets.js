function isValidBrackets(str) {
  const stack = [];

  const pairs = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const char of str) {
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
    } else if (char in pairs) {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    } else {
      return false;
    }
  }

  return stack.length === 0;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = isValidBrackets;
}
