/**
 * JavaScript's punctuation and wrappers, as plain strings:
 * what `P.JSWriter` (and `P.TSWriter`) build their output from.
 * - Text only, no AST:  writing a node is `JSWriter`'s job (`list()`, `args()`, `array()` write each item).
 * - Its names are generic (`SPACE`, `COMMA`, `InParens`, `Block` ...):
 *   so the barrel exports it as a namespace, `P.jsText`, never flattened.
 * - Usage:  `P.jsText.InParens({ children })`, `P.jsText.NEWLINE`.
 */

////////////////
// ## Identifiers
////////////////

/** A string legal as a bare (unquoted) JS property name or identifier. */
const LEGAL_IDENTIFIER = /^[a-zA-Z][\w$]*$/

/** `true` if `value` can be used as a bare JS property / identifier name, without quoting. */
export function isLegalIdentifier(value: string): boolean {
  return LEGAL_IDENTIFIER.test(value)
}

/** `'name'`:  `name` as a single-quoted JS string, backslashes and quotes escaped. */
export function quoted(name: string): string {
  return `'${name.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
}

/**
 * `text` as a JS string in `quote`, escaped for it:
 * - `"`:  as `JSON.stringify()` writes it
 * - `'`:  `quoted()`
 * - `` ` ``:  backslashes, back ticks and `${` escaped
 */
export function inQuotes(text: string, quote: '"' | "'" | "`"): string {
  if (quote === '"') return JSON.stringify(text)
  if (quote === "'") return quoted(text)
  return `\`${text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\``
}

////////////////
// ## Whitespace & Delimiters
////////////////

/** A single space. */
export const SPACE = " "
/**
 * A single indent -- 2 spaces, NEVER a tab:  compiled spell should read as hand-written javascript.
 * - Combined with `NEWLINE` below to build `INDENTED_NEWLINE`.
 */
export const INDENT = "  "
/** A newline, as a list delimiter. */
export const NEWLINE = "\n"
/** A newline followed by an indent -- delimiter for wrapped / indented lists. */
export const INDENTED_NEWLINE = `${NEWLINE}${INDENT}`

/** `text` with every non-blank line indented once. */
export function indented(text: string): string {
  return text
    .split(NEWLINE)
    .map((line) => (line ? `${INDENT}${line}` : line))
    .join(NEWLINE)
}

/** A comma, as a list delimiter. */
export const COMMA = ","
/** A comma and then a space, as a list delimiter. */
export const SPACED_COMMA = `${COMMA}${SPACE}`
/** A comma and then a newline, as a list delimiter. */
export const INDENTED_COMMA = `${COMMA}${NEWLINE}`

////////////////
// ## Parens
////////////////

/** Opening paren. */
export const LEFT_PAREN = "("
/** Closing paren. */
export const RIGHT_PAREN = ")"
/** `()` -- returned by `InParens` when there's nothing to wrap. */
export const EMPTY_PARENS = `${LEFT_PAREN}${RIGHT_PAREN}`
/**
 * Surround `children` in parens.
 * - `wrap`:  newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`:  single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_PARENS` if `children` is `null` / empty, so a zero-arg call needs no special case.
 */
export const InParens = ({
  children = "",
  wrap = false,
  space = false
}: {
  children?: string
  wrap?: boolean
  space?: boolean
}): string => {
  if (children == null || children === "") return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = children.split(NEWLINE).join(INDENTED_NEWLINE)
  return `${LEFT_PAREN}${delimiter}${children}${delimiter}${RIGHT_PAREN}`
}

////////////////
// ## Quotes
////////////////

/** Double quote. */
export const DOUBLE_QUOTE = '"'
/**
 * Surround `children` in double quotes.
 * - NOTE: unlike `InParens` / `InCurlies` / `InSquareBrackets`, doesn't special-case empty `children` --
 *   always writes both quotes.
 */
export const InDoubleQuotes = ({ children = "" }: { children?: string }): string => {
  return `${DOUBLE_QUOTE}${children}${DOUBLE_QUOTE}`
}

/** Single quote. */
export const SINGLE_QUOTE = "'"
/** Surround `children` in single quotes.  See `InDoubleQuotes` NOTE re: empty `children`. */
export const InSingleQuotes = ({ children = "" }: { children?: string }): string => {
  return `${SINGLE_QUOTE}${children}${SINGLE_QUOTE}`
}

/** Back tick. */
export const BACK_TICK = "`"
/** Surround `children` in back ticks.  See `InDoubleQuotes` NOTE re: empty `children`. */
export const InBackTicks = ({ children = "" }: { children?: string }): string => {
  return `${BACK_TICK}${children}${BACK_TICK}`
}
/** Surround `children` in triple back ticks, e.g. for a fenced code block. */
export const InTripleBackTicks = ({ children = "" }: { children?: string }): string => {
  return `${BACK_TICK}${BACK_TICK}${BACK_TICK}${children}${BACK_TICK}${BACK_TICK}${BACK_TICK}`
}

////////////////
// ## Curly Brackets & Blocks
////////////////

/** Opening curly brace. */
export const LEFT_CURLY = "{"
/** Closing curly brace. */
export const RIGHT_CURLY = "}"
/** `{}` -- returned by `InCurlies` when there's nothing to wrap. */
export const EMPTY_BLOCK = `${LEFT_CURLY}${RIGHT_CURLY}`
/**
 * Surround `children` in curly brackets.
 * - `wrap`:  newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`:  single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_BLOCK` if `children` is `null` / empty.
 */
export const InCurlies = ({
  children = "",
  wrap = false,
  space = false
}: {
  children?: string
  wrap?: boolean
  space?: boolean
}): string => {
  if (children == null || children === "") return EMPTY_BLOCK
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = `${INDENT}${children.split(NEWLINE).join(INDENTED_NEWLINE)}`
  return `${LEFT_CURLY}${delimiter}${children}${delimiter}${RIGHT_CURLY}`
}

/**
 * A block surrounded by curlies -- thin wrapper over `InCurlies` for statement / object bodies.
 * - `space` defaults to `!wrap`:  a single-line block gets spaced curlies.
 *   A wrapped one doesn't need them, since the newlines already separate content from the braces.
 */
export const Block = ({
  children = "",
  wrap = false,
  space = !wrap
}: {
  children?: string
  wrap?: boolean
  space?: boolean
}): string => {
  return InCurlies({ wrap, space, children })
}

////////////////
// ## Square Brackets
////////////////

/** Opening square bracket. */
export const LEFT_SQUARE_BRACKET = "["
/** Closing square bracket. */
export const RIGHT_SQUARE_BRACKET = "]"
/** `[]` -- returned by `InSquareBrackets` when there's nothing to wrap. */
export const EMPTY_ARRAY = `${LEFT_SQUARE_BRACKET}${RIGHT_SQUARE_BRACKET}`
/**
 * Surround `children` in square brackets.
 * - `wrap`:  newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`:  single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_ARRAY` if `children` is `null` / empty.
 */
export const InSquareBrackets = ({
  children = "",
  wrap = false,
  space = false
}: {
  children?: string
  wrap?: boolean
  space?: boolean
}): string => {
  if (children == null || children === "") return EMPTY_ARRAY
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = `${INDENT}${children.split(NEWLINE).join(INDENTED_NEWLINE)}`
  return `${LEFT_SQUARE_BRACKET}${delimiter}${children}${delimiter}${RIGHT_SQUARE_BRACKET}`
}
