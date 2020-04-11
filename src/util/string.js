/* eslint-disable no-use-before-define */
// Export lodash and lodash-inflection string methods.
import lowerFirst from "lodash/lowerFirst"
import inflection from "lodash-inflection"
import toLower from "lodash/toLower"
import _snakeCase from "lodash/snakeCase"
import upperFirst from "lodash/upperFirst"

export { toLower, lowerFirst, upperFirst }

// Convert a string to `Type_Name_Case", including singularizing.
const TYPE_CASE = {}
export function typeCase(text) {
  const existing = TYPE_CASE[text]
  if (existing !== undefined) {
    return existing
  }

  TYPE_CASE[text] = singularize(`${text}`)
    .split(/[-_]/)
    .map(bit => upperFirst(bit))
    .join("_")
  return TYPE_CASE[text]
}

// Convert a string into `instance_case`
const INSTANCE_CASE = {}
export function instanceCase(text) {
  const existing = INSTANCE_CASE[text]
  if (existing !== undefined) {
    return existing
  }
  INSTANCE_CASE[text] = singularize(`${text}`)
    .split(/[-_]/)
    .map(bit => lowerFirst(bit))
    .join("_")
  return INSTANCE_CASE[text]
}

// Lodash snakeCase with memoization.
const SNAKE_CASE = {}
export function snakeCase(text) {
  const existing = SNAKE_CASE[text]
  if (existing !== undefined) {
    return existing
  }
  SNAKE_CASE[text] = _snakeCase(text)
  return SNAKE_CASE[text]
}

// Return the singular form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const SINGULARS = {}
export function singularize(text) {
  const existing = SINGULARS[text]
  if (existing !== undefined) {
    return existing
  }
  SINGULARS[text] = inflection.singularize(text)
  return SINGULARS[text]
}

// Return the plural form of `word`.
// Uses lodash-inflection, which should be pretty good.
// If you need to add a new rule, see: https://github.com/danhper/lodash-inflection
const PLURALS = {}
export function pluralize(text) {
  const existing = PLURALS[text]
  if (existing !== undefined) {
    return existing
  }
  PLURALS[text] = inflection.pluralize(text)
  return PLURALS[text]
}

// Return true if text is all whitespace, including empty string.
const ALL_WHITESPACE = /^\s*$/
export function isWhitespace(text) {
  return ALL_WHITESPACE.test(text)
}

// Show whitespace in a string by converting newlines to `¬` and tabs to `∆`.
export function showWhitespace(string) {
  if (typeof string !== "string") return string
  return string.replace(/\n/g, "¬").replace(/\t/g, "∆")
}

// Return a certain `number` of tab characters.
const TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"
export function getTabs(number) {
  if (typeof number !== "number") return ""
  return TABS.substr(0, number)
}
