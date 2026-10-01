/**
 * Cover lodash string utilities for manipulating case, memoizing returned values.
 * - We tend to e.g. `singularize(<something>)` repeatedly and this saves us some time.
 */
import lowerFirst from "lodash/lowerFirst"
import toLower from "lodash/toLower"
import upperFirst from "lodash/upperFirst"
import toSnakeCase from "lodash/snakeCase"
import _pluralize from "pluralize"

// Export some lodash string methods.
export { toLower, lowerFirst, upperFirst }

/** Memoization cache used by `getExistingOrTransform()` below -- maps input text to transformed text. */
type StringMap = Record<string, string>

////////////////
// ## Case conversion
////////////////

/** Convert `text` to `Type_Name_Case`, including singularizing, with memoization. */
export function typeCase(text: string) {
  return getExistingOrTransform(text, TYPE_CASE, toTypeCase)
}
const TYPE_CASE: StringMap = {}
/** Un-memoized version of `typeCase()` -- call `typeCase()` instead unless you need to bypass cache. */
export const toTypeCase = (text: string) =>
  singularize(`${text}`)
    .split(/[-_]/)
    .map((bit) => upperFirst(bit))
    .join("_")

/** Convert a string into `instance_case`, with memoization. */
export const instanceCase = (text: string) => getExistingOrTransform(text, INSTANCE_CASE, toInstanceCase)
const toInstanceCase = (text: string) => singularize(`${text}`).toLowerCase()
const INSTANCE_CASE: StringMap = {}

/** Lodash `snakeCase` with memoization. */
export const snakeCase = (text: string) => getExistingOrTransform(text, SNAKE_CASE, toSnakeCase)
export { toSnakeCase }
const SNAKE_CASE: StringMap = {}

/**
 * Singular form of word, with memoization.
 * - See https://github.com/plurals/pluralize for custom pluralization.
 * - TODO: flag for lower case?
 */
export const singularize = (text: string) => getExistingOrTransform(text, SINGULARS, toSingular)
/** Un-memoized version of `singularize()` -- call `singularize()` instead unless you need to bypass cache. */
export const toSingular = (text: string) => _pluralize.singular(`${text}`)
const SINGULARS: StringMap = {}

/**
 * Plural form of word, without changing case, with memoization.
 * - See https://github.com/plurals/pluralize for custom pluralization.
 */
export const pluralize = (text: string) => getExistingOrTransform(text, PLURALS, toPlural)
/** Un-memoized version of `pluralize()` -- call `pluralize()` instead unless you need to bypass cache. */
export const toPlural = (text: string) => _pluralize(text)
const PLURALS: StringMap = {}

/** Plurality of a word -- see `getPlurality()`. */
export type Plurality = "singular" | "plural" | "either"

/**
 * Is `text` singular, plural, or `"either"` -- uncountable words like `sheep` are their own singular AND plural.
 * - Memoized like everything else here:  parsers ask this about the same few words over and over.
 */
export function getPlurality(text: string): Plurality {
  const existing = PLURALITIES[text]
  if (existing !== undefined) return existing
  const isSingular = text === singularize(text)
  const isPlural = text === pluralize(text)
  return (PLURALITIES[text] = isSingular && isPlural ? "either" : isSingular ? "singular" : "plural")
}
const PLURALITIES: Record<string, Plurality> = {}

////////////////
// ## Whitespace
////////////////

/** `true` if `text` is all whitespace, including empty string. */
const ALL_WHITESPACE = /^\s*$/
export function isWhitespace(text: string): boolean {
  return ALL_WHITESPACE.test(text)
}

/** Show whitespace in a string by converting newlines to `¬` and tabs to `∆`, e.g. for debug display. */
export function showWhitespace(text: string) {
  if (typeof text !== "string") return text
  return text.replace(/\n/g, "¬").replace(/\t/g, "∆")
}

/** Eliminate initial and trailing whitespace on lines of string, and show remaining whitespace via `∆`. */
export function normalizeInitialWhitespace(text: string) {
  if (typeof text !== "string") return text
  return text
    .split("\n")
    .map((line) => line.trim().replace(/\t/g, "∆"))
    .join("\n")
}

/** Certain `number` of tab characters, e.g. for building indentation. */
const TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"
export function getTabs(number: number) {
  if (typeof number !== "number") return ""
  return TABS.substring(0, number)
}

////////////////
// ## Internal
////////////////

/**
 * If `text` is found in `map`, return it.
 * - Otherwise run `transform` then store + return result.
 * - SIDE EFFECT: mutates `map`, caching result for next call with same `text`.
 */
function getExistingOrTransform(text: string, map: StringMap, transform: (text: string) => string) {
  if (map[text] !== undefined) return map[text]
  return (map[text] = transform(text))
}
