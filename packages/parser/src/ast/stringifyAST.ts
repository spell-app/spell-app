/**
 * Output backend for `ASTNode`s -- draws parens/lists/blocks/etc. as plain `string`s, for compiled JS output.
 * - Mirrors `renderAST.ts` export-for-export: same core names (`SPACE`, `COMMA`, `List`, `InParens`, `Block`, ...)
 *   but returning `string` instead of `Markup`.  See barrel `index.ts` NOTE -- they MUST stay namespaced.
 * - Usage: `import * as stringify from "./stringifyAST"`, then e.g. `stringify.Args({ args })`.
 */
import type { ASTNode } from "./AST"

////////////////
// ## Whitespace & Delimiters
////////////////

// TODO: move to `parser.types.ts` ?
/** Draw a single space. */
export const SPACE = " "
/**
 * Draw a single indent -- 2 spaces, NEVER a tab:  compiled spell should read as hand-written javascript.
 * - Combined with `NEWLINE` below to build `INDENTED_NEWLINE`.
 */
export const INDENT = "  "
/** Draw a newline as a list delimiter. */
export const NEWLINE = "\n"
/** Draw a newline followed by an indent -- delimiter for wrapped/indented lists. */
export const INDENTED_NEWLINE = `${NEWLINE}${INDENT}`

/** Draw a comma as a list delimiter. */
export const COMMA = ","
/** Draw a comma and then a space as a list delimiter. */
export const SPACED_COMMA = `${COMMA}${SPACE}`
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = `${COMMA}${NEWLINE}`

////////////////
// ## List Rendering
////////////////

/** Draw a single item in a list by having it render its component. */
export const Item = ({ item }: { item?: ASTNode | null; index: number }): string => (item ? String(item.compile()) : "")

/**
 * Draw a series of `items` joined by `delimiter` (default `SPACED_COMMA`).
 * - Returns `""` when `items` is empty/absent.
 * - `DrawItem` overridable per-item renderer, defaulting to `Item`.
 */
export const List = ({
  items,
  delimiter = SPACED_COMMA,
  DrawItem = Item
}: {
  items?: Array<ASTNode | null | undefined>
  delimiter?: string
  DrawItem?: (props: { item?: ASTNode | null; index: number }) => string
}): string => {
  if (!items || !items.length) return ""
  const kids: string[] = []
  items.forEach((item, index) => {
    kids.push(DrawItem({ item, index }))
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return kids.join("")
}

////////////////
// ## Parens & Call Args
////////////////

/** Opening paren token. */
export const LEFT_PAREN = "("
/** Closing paren token. */
export const RIGHT_PAREN = ")"
/** `()` -- returned by `InParens` when there's nothing to wrap. */
export const EMPTY_PARENS = `${LEFT_PAREN}${RIGHT_PAREN}`
/**
 * Surround `children` in parens.
 * - `wrap`: newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_PARENS` if `children` is `null`/empty string, so callers of e.g. `Args`
 *   don't need to special-case a zero-arg call.
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

/**
 * Draw list of function `args`, comma-delimited and wrapped in parens.
 * - Defaults to `wrap: true` once there are more than 3 args.
 * - When wrapped and the joined args themselves span multiple lines, indents the whole
 *   list by one more `INDENT` (nested wrapped content, e.g. a wrapped object literal arg).
 */
export const Args = ({
  args,
  wrap = (args?.length ?? 0) > 3
}: {
  args?: Array<ASTNode | null | undefined>
  wrap?: boolean
}): string => {
  if (!args || args.length === 0) return EMPTY_PARENS
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  let children = List({ items: args, delimiter })
  if (wrap && children.includes(NEWLINE)) children = `${INDENT}${children}`
  return InParens({ wrap, children })
}

////////////////
// ## Quotes
////////////////

/** Double-quote token. */
export const DOUBLE_QUOTE = '"'
/**
 * Surround `children` in double quotes.
 * - NOTE: unlike `InParens`/`InCurlies`/`InSquareBrackets`, doesn't special-case empty `children` --
 *   always emits both quotes.
 */
export const InDoubleQuotes = ({ children = "" }: { children?: string }): string => {
  return `${DOUBLE_QUOTE}${children}${DOUBLE_QUOTE}`
}

/** Single-quote token. */
export const SINGLE_QUOTE = "'"
/** Surround `children` in single quotes.  See `InDoubleQuotes` NOTE re: empty `children`. */
export const InSingleQuotes = ({ children = "" }: { children?: string }): string => {
  return `${SINGLE_QUOTE}${children}${SINGLE_QUOTE}`
}

/** Back-tick token. */
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

/** Opening curly-brace token. */
export const LEFT_CURLY = "{"
/** Closing curly-brace token. */
export const RIGHT_CURLY = "}"
/** `{}` -- returned by `InCurlies` when there's nothing to wrap. */
export const EMPTY_BLOCK = `${LEFT_CURLY}${RIGHT_CURLY}`
/**
 * Surround `children` in curly brackets.
 * - `wrap`: newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_BLOCK` if `children` is `null`/empty string.
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
 * Draw a block surrounded by curlies -- thin wrapper over `InCurlies` used for statement/object bodies.
 * - `space` defaults to `!wrap`: a single-line block gets spaced curlies, a wrapped one doesn't need it
 *   since the newlines already separate content from the braces.
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
// ## Square Brackets & Arrays
////////////////

/** Opening square-bracket token. */
export const LEFT_SQUARE_BRACKET = "["
/** Closing square-bracket token. */
export const RIGHT_SQUARE_BRACKET = "]"
/** `[]` -- returned by `InSquareBrackets` when there's nothing to wrap. */
export const EMPTY_ARRAY = `${LEFT_SQUARE_BRACKET}${RIGHT_SQUARE_BRACKET}`
/**
 * Surround `children` in square brackets.
 * - `wrap`: newline-delimited, and indents every line of `children` by one `INDENT`.
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_ARRAY` if `children` is `null`/empty string.
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

/**
 * Draw an array of `items` delimited by commas and surrounded by square brackets.
 * - `wrap` picks comma+newline vs. comma+space between items -- no auto-wrap-at-N-items
 *   threshold like `Args` has.
 * - `DrawItem` overridable per-item renderer, defaulting to `Item`.
 */
export const Array = ({
  items,
  DrawItem = Item,
  wrap = false
}: {
  items?: Array<ASTNode | null | undefined>
  DrawItem?: (props: { item?: ASTNode | null; index: number }) => string
  wrap?: boolean
}): string => {
  if (!items || items.length === 0) return EMPTY_ARRAY
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return InSquareBrackets({
    wrap,
    children: List({ items, delimiter })
  })
}
