// Export lodash and lodash-inflection string methods.
import lowerFirst from "lodash/lowerFirst";
import inflection from "lodash-inflection";
import _snakeCase from "lodash/snakeCase";
export toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";
export { lowerFirst, upperFirst }

// Convert a string to `Type_Name_Case", including singularizing.
const TYPE_CASE = {};
export function typeCase(text) {
  const existing = TYPE_CASE[text];
  if (existing !== undefined) return existing;
  return (TYPE_CASE[text]
    = singularize(""+text)
      .split(/[-_]/)
      .map(bit => upperFirst(bit))
      .join("_")
  );
}

// Convert a string into `instance_case`
const INSTANCE_CASE = {};
export function instanceCase(text) {
  const existing = INSTANCE_CASE[text];
  if (existing !== undefined) return existing;
  return (INSTANCE_CASE[text]
    = singularize(""+text)
      .split(/[-_]/)
      .map(bit => lowerFirst(bit))
      .join("_")
  );
}

// Lodash snakeCase with memoization.
const SNAKE_CASE = {};
export function snakeCase(text) {
  const existing = SNAKE_CASE[text];
  if (existing !== undefined) return existing;
  return (SNAKE_CASE[text] = _snakeCase(text));
}


// Return the singular form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const SINGULARS = {};
export function singularize(text) {
  const existing = SINGULARS[text];
  if (existing !== undefined) return existing;
  return (SINGULARS[text] = inflection.singularize(text));
}

// Return the plural form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const PLURALS = {};
export function pluralize(text) {
  const existing = PLURALS[text];
  if (existing !== undefined) return existing;
  return (PLURALS[text] = inflection.pluralize(text));
}

// Return true if text is all whitespace, including empty string.
let ALL_WHITESPACE = /^\s*$/;
export function isWhitespace(text) {
  return ALL_WHITESPACE.test(text);
}

// Show whitespace in a string by converting newlines to `¬` and tabs to `∆`.
export function showWhitespace(string) {
  if (typeof string !== "string") return string;
  return string.replace(/\n/g, "¬").replace(/\t/g, "∆");
}

// Return a certain `number` of tab characters.
const TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
export function getTabs(number) {
  if (typeof number !== "number") return "";
  return TABS.substr(0, number);
}
