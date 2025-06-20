/**
 * Utility type that takes an object type and makes the hover overlay more readable.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Blacklist of common english words which may not be used as single-word identifiers.
 */
export type IdentifierBlacklist = Record<string, 1>

/** Policy for automatically removing whitespace from the token stream. */
// REFACTOR: idiomatic TS enum string pattern?
export const WhitespacePolicy = {
  ALL: "ALL", // Leave ALL whitespace
  NONE: "NONE", // Remove ALL whitespace
  LEADING_ONLY: "LEADING_ONLY", // Remove inline whitespace only (leaving indents and newlines)
} as const
export type WhitespacePolicy = (typeof WhitespacePolicy)[keyof typeof WhitespacePolicy]

export const BACKSLASH = `\\` as const
export const DOUBLE_QUOTE = `"` as const
export const SINGLE_QUOTE = `'` as const
