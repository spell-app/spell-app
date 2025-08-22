/**
 * Cover lodash string utilites for manipulating case to memoize returned values.
 * We tend to e.g. `singularize(<something>)` repeatedly and this saves us some time.
 */
import lowerFirst from "lodash/lowerFirst"
import toLower from "lodash/toLower"
import upperFirst from "lodash/upperFirst"
import toSnakeCase from "lodash/snakeCase"
import _pluralize from "pluralize"

// Export some lodash string methods.
export { toLower, lowerFirst, upperFirst }

type StringMap = Record<string, string>

/** Convert `text` to `Type_Name_Case", including singularizing, with memoization. */
export function typeCase(text: string) {
  return getExistingOrTransform(text, TYPE_CASE, toTypeCase)
}
const TYPE_CASE: StringMap = {}
export const toTypeCase = (text: string) =>
  singularize(`${text}`)
    .split(/[-_]/)
    .map((bit) => upperFirst(bit))
    .join("_")

/** Convert a string into `instance_case`, with memoization. */
export const instanceCase = (text: string) => getExistingOrTransform(text, INSTANCE_CASE, toInstanceCase)
const toInstanceCase = (text: string) => singularize(`${text}`).toLowerCase()
const INSTANCE_CASE: StringMap = {}

/** Lodash snakeCase with memoization. */
export const snakeCase = (text: string) => getExistingOrTransform(text, SNAKE_CASE, toSnakeCase)
export { toSnakeCase }
const SNAKE_CASE: StringMap = {}

/**
 * Return the singular form of word.
 * See: https://github.com/plurals/pluralize for custom pluralization.
 *
 * TODO: flag for lower case??
 */
export const singularize = (text: string) => getExistingOrTransform(text, SINGULARS, toSingular)
export const toSingular = (text: string) => _pluralize.singular(`${text}`)
const SINGULARS: StringMap = {}

/**
 * Return the plural form of word, without changing case.
 * See: https://github.com/plurals/pluralize for custom pluralization.
 */
export const pluralize = (text: string) => getExistingOrTransform(text, PLURALS, toPlural)
export const toPlural = (text: string) => _pluralize(text)
const PLURALS: StringMap = {}

/** Return `true` if `text` is all whitespace, including empty string. */
const ALL_WHITESPACE = /^\s*$/
export function isWhitespace(text: string): boolean {
  return ALL_WHITESPACE.test(text)
}

// Show whitespace in a string by converting newlines to `¬` and tabs to `∆`.
export function showWhitespace(text: string) {
  if (typeof text !== "string") return text
  return text.replace(/\n/g, "¬").replace(/\t/g, "∆")
}

// Eliminate initial and trailing whitespace on lines of string and show remaining whitespace
export function normalizeInitialWhitespace(text: string) {
  if (typeof text !== "string") return text
  return text
    .split("\n")
    .map((line) => line.trim().replace(/\t/g, "∆"))
    .join("\n")
}

// Return a certain `number` of tab characters.
const TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"
export function getTabs(number: number) {
  if (typeof number !== "number") return ""
  return TABS.substring(0, number)
}

/**
 * If `text` is found in `map`, return it.
 * Otherwise run `transformer` then store + return the result.
 */
function getExistingOrTransform(text: string, map: StringMap, transform: (text: string) => string) {
  if (map[text] !== undefined) return map[text]
  return (map[text] = transform(text))
}
