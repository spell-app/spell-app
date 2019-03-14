// Export lodash and lodash-inflection string methods.
export lowerFirst from "lodash/lowerFirst";
import inflection from "lodash-inflection";
export snakeCase from "lodash/snakeCase";
export toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";
export { upperFirst }

// Convert a string to `Type-Name-Case", including singularizing.
export function typeCase(string) {
  return singularize(""+string)
    .split(/[-_]/)
    .map(bit => upperFirst(bit))
    .join("_");
}

// Convert a string to `Type-Name-Case", including singularizing.
export function typeNameCase(string) {
  return singularize(""+string)
    .split(/[-_]/)
    .map(bit => upperFirst(bit))
    .join("-");
}

// Return the singular form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const SINGULARS = {};
export function singularize(text) {
  const existing = SINGULARS[text];
  if (existing) return existing;
  return (SINGULARS[text] = inflection.singularize(text));
}

// Return the plural form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const PLURALS = {};
export function pluralize(text) {
  const existing = PLURALS[text];
  if (existing) return existing;
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
