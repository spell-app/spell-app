import type { P } from "#parser"

/** Constructor signature shared by all `Token` subclasses -- takes a `record` and builds a `Token`. */
export type TokenConstructor = new (args: any) => P.Token

/**
 * Generic `Token` record.
 * - Some subclasses will have additional properties.
 */
export type TokenProps<ValueType = any> = {
  /** Start character position in full source stream. */
  start: number
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

/** Signature of a `Tokenizer` `match*` method -- tries to match at `start` of `text`, or returns `undefined`. */
export type TokenMatcher<T = P.Token> = (text: string, start?: number, end?: number) => T | undefined

/**
 * Policy for automatically removing whitespace from the token stream.
 * - REFACTOR: idiomatic TS enum string pattern?
 */
export const WhitespacePolicy = {
  ALL: "ALL", // Leave ALL whitespace
  NONE: "NONE", // Remove ALL whitespace
  LEADING_ONLY: "LEADING_ONLY" // Remove inline whitespace only (leaving indents and newlines)
} as const
export type WhitespacePolicy = (typeof WhitespacePolicy)[keyof typeof WhitespacePolicy]

/** Escape character used when matching quoted `TextToken`s and delimited JSX expressions. */
export const BACKSLASH = `\\` as const
/** Double-quote symbol, one of the default `Tokenizer.quoteSymbols`. */
export const DOUBLE_QUOTE = `"` as const
/** Single-quote symbol, one of the default `Tokenizer.quoteSymbols`. */
export const SINGLE_QUOTE = `'` as const

////////////////
// ## Line / char positions
////////////////

/**
 * Offset where each line of `text` starts -- `[0, <after first \n>, ...]`.
 * - Build once per text, then `positionForOffset()` is a binary search.
 */
export function getLineStarts(text: string): number[] {
  const starts = [0]
  for (let index = text.indexOf("\n"); index !== -1; index = text.indexOf("\n", index + 1)) {
    starts.push(index + 1)
  }
  return starts
}

/** 0-based `{ line, ch }` for `offset`, given `lineStarts` from `getLineStarts()`. */
export function positionForOffset(lineStarts: number[], offset: number): { line: number; ch: number } {
  let low = 0
  let high = lineStarts.length - 1
  while (low < high) {
    const middle = (low + high + 1) >> 1
    if (lineStarts[middle]! <= offset) low = middle
    else high = middle - 1
  }
  return { line: low, ch: offset - lineStarts[low]! }
}

// ## Formatting

/**
 * One line of text as `TokenFormatter.formatLines()` formats it, by offsets into the ORIGINAL text.
 * - Replace `start`..`end` with `text`;  the line's newline, if any, runs from `end` to `next`.
 * - `text` is `undefined` for a blank line to drop:  remove `start`..`next`.
 */
export type FormattedLine = {
  /** Offset of the line's first character, indent included. */
  start: number
  /** Offset just before its newline, or the end of the text. */
  end: number
  /** Offset where the next line starts, or the end of the text. */
  next: number
  /** Line as formatted, without its newline -- `undefined` to drop it. */
  text: string | undefined
}
