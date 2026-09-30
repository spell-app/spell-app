/**
 * String helpers for names:  attribute <-> property case, Fomantic's number words, and "did you mean".
 * - Case conversion is hand-rolled rather than lodash's `kebabCase` / `camelCase`:  lodash splits on digits
 *   (`"h1"` => `"h-1"`), which breaks round-tripping `activeIndex` <-> `active-index` for attribute names.
 * - Case conversions are memoized:  attribute names are converted on every `attributeChangedCallback`.
 */

////////////////
// ## Case conversion
////////////////

/**
 * Convert `camelCase` to `kebab-case`, e.g. `activeIndex` => `active-index`.
 * - Only splits before an uppercase letter, so digits stay put:  `h1Size` => `h1-size`.
 * - Already-kebab text passes through unchanged.
 */
export function kebabCase(text: string) {
  return (KEBAB_CASE[text] ??= text.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`))
}
/** Memo for `kebabCase()`. */
const KEBAB_CASE: Record<string, string> = Object.create(null)

/**
 * Convert `kebab-case` to `camelCase`, e.g. `active-index` => `activeIndex`.
 * - Exact inverse of `kebabCase()` for names it produces.
 * - Already-camel text passes through unchanged.
 */
export function camelCase(text: string) {
  return (CAMEL_CASE[text] ??= text.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase()))
}
/** Memo for `camelCase()`. */
const CAMEL_CASE: Record<string, string> = Object.create(null)

////////////////
// ## Number words
////////////////

/**
 * Fomantic's word for a column count 1..16, e.g. `4` or `"4"` => `"four"` (as in `four wide column`).
 * - Returns `undefined` for anything else, including `0`, fractions and out-of-range numbers,
 *   so callers decide whether that's an error or a pass-through.
 */
export function numberToWord(value: number | string): string | undefined {
  const number = typeof value === "number" ? value : /^\d+$/.test(value.trim()) ? Number(value) : NaN
  return Number.isInteger(number) ? NUMBER_WORDS[number - 1] : undefined
}
/** `numberToWord()`'s words, index `n - 1`. */
const NUMBER_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen"
]

////////////////
// ## Did you mean
////////////////

/**
 * Levenshtein edit distance between `a` and `b`:  inserts + deletes + substitutions to turn one into the other.
 * - Two rolling rows rather than the full matrix -- the inputs are short, but this runs per candidate.
 * - Case-sensitive;  `suggest()` lower-cases first.
 */
export function levenshtein(a: string, b: string) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  let current = new Array<number>(b.length + 1)
  for (let i = 1; i <= a.length; i++) {
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
    }
    ;[previous, current] = [current, previous]
  }
  return previous[b.length]
}

/**
 * Closest of `candidates` to `word`, for dev-time "did you mean" warnings on unknown attribute values.
 * - Case-insensitive.
 * - Returns `undefined` when nothing is within `maxDistance` edits (default 2) -- a wild guess is worse
 *   than no guess.
 * - Ties go to the EARLIER candidate, so list the most common values first.
 */
export function suggest(word: string, candidates: Iterable<string>, maxDistance = 2): string | undefined {
  const lower = word.toLowerCase()
  let best: string | undefined
  let bestDistance = maxDistance + 1
  for (const candidate of candidates) {
    const distance = levenshtein(lower, candidate.toLowerCase())
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return best
}
