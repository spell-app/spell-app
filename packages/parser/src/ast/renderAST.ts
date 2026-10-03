/**
 * Output backend for `ASTNode`s -- draws parens/lists/blocks/etc. as `P.Markup`, for syntax-highlighted display.
 * - Mirrors `stringifyAST.ts` export-for-export: same core names (`SPACE`, `COMMA`, `List`, `InParens`, `Block`, ...)
 *   but returning `Markup` instead of `string`.  See barrel `index.ts` NOTE -- they MUST stay namespaced.
 * - Usage: `import * as render from "./renderAST"`, then e.g. `render.Args({ args })`.
 * - `Markup` is plain data, so drawing an AST needs no DOM and no UI framework:  the parser runs under node, where
 *   nothing draws.  `toDOM()` turns it into DOM nodes in a browser (the app's `<ASTViewer>`), `toText()` into text.
 */
import type { P } from "$/parser"

/** The built-in `Array.isArray()`:  `Array` in this file is OUR `Array()` drawing, below. */
const isArray = globalThis.Array.isArray

////////////////
// ## Utility Functions
////////////////

/** Element `<tag>` with `attrs` around `children` -- the hyperscript every drawing here is built from. */
export function h(tag: string, attrs: P.MarkupElement["attrs"], ...children: P.Markup[]): P.MarkupElement {
  return { tag, attrs, children }
}

/** `<span class="{className}">` around `children`:  nearly everything an AST draws. */
export function span(className: string, ...children: P.Markup[]): P.MarkupElement {
  return h("span", { class: className }, ...children)
}

/** All of `children`, as one fragment. */
export function Fragment(...children: P.Markup[]): P.Markup[] {
  return children
}

////////////////
// ## Node Rendering
////////////////

/**
 * Default render for a single ASTNode:  a `<span>` with its `className` and where its `match` is in the source
 * (`data-match`, `data-line` ...), around `astNode.renderChildren()`.
 * - The app's `<ASTViewer>` finds the code under the cursor by those `data-` attributes.
 */
export function Node(astNode: P.ASTNode): P.MarkupElement {
  const { className, match } = astNode
  const attrs = {
    class: className,
    title: className,
    "data-match": match.ruleName,
    "data-line": match.line,
    "data-char": match.char,
    "data-start": match.start,
    "data-end": match.end
  }
  return h("span", attrs, astNode.renderChildren())
}

////////////////
// ## Drawing Markup
////////////////

/**
 * Draw `markup` as DOM:  an element for a `MarkupElement`, else a `DocumentFragment` of its nodes.
 * - Browser only:  uses `document`.
 * - FRESH nodes each call -- a shared constant (`SPACE` ...) draws anew wherever it appears -- so draw again to show
 *   the same markup in a second place.
 */
export function toDOM(markup: P.MarkupElement): HTMLElement
export function toDOM(markup: P.Markup): HTMLElement | DocumentFragment
export function toDOM(markup: P.Markup): HTMLElement | DocumentFragment {
  if (isElement(markup)) return drawElement(markup)
  const fragment = document.createDocumentFragment()
  append(fragment, markup)
  return fragment
}

/** Text `markup` draws, e.g. to compare with the `compile()`d Javascript.  Works anywhere:  no DOM. */
export function toText(markup: P.Markup): string {
  if (markup == null || typeof markup === "boolean") return ""
  if (isArray(markup)) return markup.map(toText).join("")
  if (isElement(markup)) return markup.children.map(toText).join("")
  return String(markup)
}

/** `true` if `markup` is a `MarkupElement`, not text or a fragment. */
function isElement(markup: P.Markup): markup is P.MarkupElement {
  return typeof markup === "object" && markup !== null && !isArray(markup) && "tag" in markup
}

/** Draw `element` and its children, setting its `attrs` in order. */
function drawElement(element: P.MarkupElement): HTMLElement {
  const node = document.createElement(element.tag)
  for (const [name, value] of Object.entries(element.attrs)) {
    if (value !== undefined) node.setAttribute(name, String(value))
  }
  for (const child of element.children) append(node, child)
  return node
}

/**
 * Append what `markup` draws to `parent`.
 * - Skips `null`, `undefined` and booleans, flattens arrays;  anything else not an element is text, via `String()`
 *   -- e.g. an `ASTLiteral`'s `RegExp` value.
 */
function append(parent: HTMLElement | DocumentFragment, markup: P.Markup): void {
  if (markup == null || typeof markup === "boolean") return
  if (isArray(markup)) {
    for (const child of markup) append(parent, child)
  } else if (isElement(markup)) {
    parent.append(drawElement(markup))
  } else {
    parent.append(String(markup))
  }
}

////////////////
// ## Whitespace & Delimiters
////////////////

/** Draw a single space. */
export const SPACE = span("whitespace space", " ")
/** Draw a single indent -- 2 spaces, as `stringify.INDENT` -- combined with `NEWLINE` below to build `INDENTED_NEWLINE`. */
export const INDENT = span("whitespace indent", "  ")
/** Draw a newline as a list delimiter. */
export const NEWLINE = span("whitespace newline", "\n")
/** Draw a newline followed by an indent -- delimiter for wrapped/indented lists. */
export const INDENTED_NEWLINE = Fragment(NEWLINE, INDENT)

/** Draw a comma as a list delimiter. */
export const COMMA = span("punctuation comma", ",")
/** Draw a comma and then a space as a list delimiter. */
export const SPACED_COMMA = Fragment(COMMA, SPACE)
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = Fragment(COMMA, INDENTED_NEWLINE)

////////////////
// ## Keyword & Operator Tokens
////////////////

/**
 * Pre-built spans for keywords/operators/punctuation used across `renderChildren()` implementations in `AST.ts`,
 * each carrying a `class` for syntax-highlighting CSS.  No `stringifyAST.ts` equivalent -- plain-string
 * compile output embeds these literally instead (e.g. `` `await ${expr}` ``).
 */
export const PERIOD = span("operator period", ".")
export const BANG = span("operator exclamation-point", "!")
export const EQUALS = span("operator equals", " = ")
export const COLON_AND_SPACE = span("operator colon", ": ")
export const OPEN_COMMENT = span("punctuation open-comment-symbol", "/* ")
export const CLOSE_COMMENT = span("punctuation close-comment-symbol", " */")
export const FAT_ARROW = span("operator fat-arrow", " => ")
export const FUNCTION = span("keyword function", "function ")
export const ASYNC = span("keyword async", "async ")
export const AWAIT = span("keyword await", "await ")
export const LET = span("keyword declarator let", "let ")
export const RETURN = span("keyword return", "return")
export const EXPORT = span("keyword export", "export ")
export const NEW = span("keyword new", "new ")
export const CLASS = span("keyword class", "class ")
export const EXTENDS = span("keyword extends", " extends ")
export const PROTOTYPE = span("keyword prototype", "prototype")
export const GET = span("keyword get", "get ")
export const SET = span("keyword set", "set ")
export const STATIC = span("keyword static", "static ")
export const IF = span("keyword if", "if ")
export const ELSE = span("keyword else", "else ")
export const TERNARY_QUESTION = span("operator question-mark", " ? ")
export const TERNARY_COLON = span("operator colon", " : ")
export const TRY = span("keyword try", "try ")
export const CATCH = span("keyword catch", "catch ")
export const FINALLY = span("keyword finally", "finally ")

////////////////
// ## List Rendering
////////////////

/** Draw a single item in a list by having it render its markup. */
export const Item = ({ item }: ListItemProps): P.Markup => (item != null ? item.markup : null)

/**
 * Draw a series of `items` joined by `delimiter` (default `SPACED_COMMA`).
 * - Returns `null` when `items` is empty/absent.
 * - `DrawItem` overridable per-item renderer, defaulting to `Item`.
 */
export const List = ({
  items,
  delimiter = SPACED_COMMA,
  DrawItem = Item
}: {
  items?: Array<P.ASTNode | null | undefined>
  delimiter?: P.Markup
  DrawItem?: (props: ListItemProps) => P.Markup
}): P.Markup[] | null => {
  if (!items || !items.length) return null
  const kids: P.Markup[] = []
  items.forEach((item, index) => {
    kids.push(DrawItem({ item, index }))
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return kids
}

/** Props of a `List`'s `DrawItem`:  one of its `items`, and where it is. */
export type ListItemProps = { item?: P.ASTNode | null; index: number }

////////////////
// ## Parens & Call Args
////////////////

/** Opening-paren span. */
export const LEFT_PAREN = span("punctuation open-paren", "(")
/** Closing-paren span. */
export const RIGHT_PAREN = span("punctuation close-paren", ")")
/** `()` -- returned by `InParens` when there's nothing to wrap. */
export const EMPTY_PARENS = Fragment(LEFT_PAREN, RIGHT_PAREN)
/**
 * Surround `children` in parens.
 * - `wrap`: newline delimiter either side of `children` (indentation itself comes from CSS, unlike
 *   `stringifyAST.ts`'s `InParens` which has to indent the string by hand).
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - Returns `EMPTY_PARENS` if `children` is falsy.
 */
export const InParens = ({
  children = null,
  wrap = false,
  space = false
}: {
  children?: P.Markup
  wrap?: boolean
  space?: boolean
}): P.Markup => {
  if (!children) return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_PAREN, delimiter, children, delimiter, RIGHT_PAREN)
}

/** Draw one `Args` list item, wrapped in an `arg arg-{index}` span so each arg can be targeted by CSS. */
export const Arg = ({ item, index }: ListItemProps): P.MarkupElement => span(`arg arg-${index}`, Item({ item, index }))

/**
 * Draw list of function `args`, comma-delimited and wrapped in parens.
 * - Defaults to `wrap: true` once there are more than 3 args.
 * - Unlike `stringifyAST.ts`'s `Args`, doesn't special-case empty `args`:  draws `(`, an empty `blockContents` span,
 *   then `)` -- the same text, `()`.
 */
export const Args = ({
  args,
  wrap = (args?.length ?? 0) > 3
}: {
  args?: Array<P.ASTNode | null | undefined>
  wrap?: boolean
}): P.MarkupElement => {
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return span(
    `ASTBlock ASTArgsBlock${wrap ? " indented" : ""}`,
    InParens({ wrap, children: span("blockContents", List({ items: args, DrawItem: Arg, delimiter })) })
  )
}

////////////////
// ## Quotes
////////////////

/** Double-quote span. */
export const DOUBLE_QUOTE = span("punctuation double-quote", '"')
/** Surround `children` in double quotes. */
export const InDoubleQuotes = ({ children }: { children?: P.Markup }): P.Markup =>
  Fragment(DOUBLE_QUOTE, children, DOUBLE_QUOTE)

/** Single-quote span. */
export const SINGLE_QUOTE = span("punctuation single-quote", "'")
/** Surround `children` in single quotes. */
export const InSingleQuotes = ({ children }: { children?: P.Markup }): P.Markup =>
  Fragment(SINGLE_QUOTE, children, SINGLE_QUOTE)

/** Back-tick span. */
export const BACK_TICK = span("punctuation back-tick", "`")
/** Surround `children` in back ticks. */
export const InBackTicks = ({ children }: { children?: P.Markup }): P.Markup => Fragment(BACK_TICK, children, BACK_TICK)
/** Surround `children` in triple back ticks, e.g. for a fenced code block. */
export const InTripleBackTicks = ({ children }: { children?: P.Markup }): P.Markup =>
  Fragment(BACK_TICK, BACK_TICK, BACK_TICK, children, BACK_TICK, BACK_TICK, BACK_TICK)

////////////////
// ## Curly Brackets & Blocks
////////////////

/** Opening-curly-brace span. */
export const LEFT_CURLY = span("punctuation left-curly-bracket", "{")
/** Closing-curly-brace span. */
export const RIGHT_CURLY = span("punctuation right-curly-bracket", "}")
/**
 * Surround `children` in curly brackets.
 * - `wrap`: newline delimiter either side of `children`.
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - NOTE: unlike `stringifyAST.ts`'s `InCurlies`, does NOT special-case empty/falsy `children` --
 *   that's handled one level up, by `Block` returning `EMPTY_BLOCK`.
 */
export const InCurlies = ({
  children,
  wrap = false,
  space = false
}: {
  children?: P.Markup
  wrap?: boolean
  space?: boolean
}): P.Markup => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_CURLY, delimiter, children, delimiter, RIGHT_CURLY)
}
/** `{}` -- returned by `Block` when there's nothing to wrap. */
export const EMPTY_BLOCK = span("ASTBlock empty", InCurlies({}))
/**
 * Draw a block surrounded by curlies -- thin wrapper over `InCurlies` used for statement/object bodies.
 * - `space` defaults to `!wrap`: a single-line block gets spaced curlies, a wrapped one doesn't need it
 *   since the newlines already separate content from the braces.
 * - Returns `EMPTY_BLOCK` if `children` is falsy (this is where the empty check `InCurlies` itself lacks lives).
 */
export const Block = ({
  children = null,
  wrap = false,
  space = !wrap
}: {
  children?: P.Markup
  wrap?: boolean
  space?: boolean
}): P.MarkupElement => {
  if (!children) return EMPTY_BLOCK
  return span(
    `ASTBlock${wrap ? " indented" : ""}`,
    InCurlies({ wrap, space, children: span("blockContents", children) })
  )
}

////////////////
// ## Square Brackets & Arrays
////////////////

/** Opening-square-bracket span. */
export const LEFT_SQUARE_BRACKET = span("punctuation left-square-bracket", "[")
/** Closing-square-bracket span. */
export const RIGHT_SQUARE_BRACKET = span("punctuation right-square-bracket", "]")
/**
 * Surround `children` in square brackets.
 * - `wrap`: newline delimiter either side of `children`.
 * - `space`: single-space delimiter instead -- ignored if `wrap`.
 * - NOTE: unlike `stringifyAST.ts`'s `InSquareBrackets`, does NOT special-case empty/falsy `children` --
 *   that's handled one level up, by `Array` returning `EMPTY_ARRAY`.
 */
export const InSquareBrackets = ({
  children = null,
  wrap = false,
  space = false
}: {
  children?: P.Markup
  wrap?: boolean
  space?: boolean
}): P.Markup => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_SQUARE_BRACKET, delimiter, children, delimiter, RIGHT_SQUARE_BRACKET)
}

/** `[]` -- returned by `Array` when there's nothing to wrap. */
const EMPTY_ARRAY = InSquareBrackets({})
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
  items?: Array<P.ASTNode | null | undefined>
  DrawItem?: (props: ListItemProps) => P.Markup
  wrap?: boolean
}): P.Markup => {
  if (!items || items.length === 0) return EMPTY_ARRAY

  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return span(
    `ASTBlock ASTArray${wrap ? " indented" : ""}`,
    InSquareBrackets({
      wrap,
      children: span(`blockContents${wrap ? " indented" : ""}`, List({ items, delimiter, DrawItem }))
    })
  )
}
