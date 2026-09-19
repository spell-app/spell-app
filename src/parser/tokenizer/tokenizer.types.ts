import type { P } from "~/parser"

export type TokenConstructor = new (args: any) => P.Token

/**
 * Generic `Token` record.
 * Some subclasses will have additional properties.
 */
export type TokenProps<ValueType = any> = {
  /** Start character position in full source stream. */
  offset: number
  /** Raw input string which was matched, generally NOT including leading/trailing whitespace. */
  raw?: string
  /** Whitespace string which was matched between this token and the next in the stream. */
  whitespace?: string
  /** Line number in original source string, appended after match. */
  line?: number
  /** Start character in source `line`. */
  ch?: number
  /** Conceptual "value" of the token, according to the subclass. e.g. a number, string without quotes, etc. */
  value?: ValueType
  /** Error string encountered while parsing. */
  error?: string
}

export type TokenMatcher<T = P.Token> = (text: string, start?: number, end?: number) => T | undefined

/** Policy for automatically removing whitespace from the token stream. */
// REFACTOR: idiomatic TS enum string pattern?
export const WhitespacePolicy = {
  ALL: "ALL", // Leave ALL whitespace
  NONE: "NONE", // Remove ALL whitespace
  LEADING_ONLY: "LEADING_ONLY" // Remove inline whitespace only (leaving indents and newlines)
} as const
export type WhitespacePolicy = (typeof WhitespacePolicy)[keyof typeof WhitespacePolicy]

export const BACKSLASH = `\\` as const
export const DOUBLE_QUOTE = `"` as const
export const SINGLE_QUOTE = `'` as const
