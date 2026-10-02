/** @jsxImportSource react */
/**
 * Output backend for `ASTNode`s -- draws parens/lists/blocks/etc. as React elements, for syntax-highlighted display.
 * - Mirrors `stringifyAST.ts` export-for-export: same core names (`SPACE`, `COMMA`, `List`, `InParens`, `Block`, ...)
 *   but returning `ReactElement`/`ReactNode` instead of `string`.  See barrel `index.ts` NOTE -- they MUST
 *   stay namespaced.
 * - Usage: `import * as render from "./renderAST"`, then e.g. `render.Args({ args })`.
 */
import React from "react"
import type { ASTNode } from "./AST"

////////////////
// ## Utility Functions
////////////////

/**
 * Draw a `React.Fragment` which encompasses `children`.
 * - Simpler implementations (e.g. plain array returns) seem to have problems in babel.
 */
export function Fragment(...children: ReactNode[]): ReactElement {
  return React.createElement(React.Fragment, null, ...children)
}

/**
 * Return a React functional component which will show as `name` in a rendering error, etc.
 * - HACK: mutates the given `renderFn`'s `name` property via `defineProperty` (function `name` is normally
 *   read-only) instead of declaring a real named function, so callers can pass an inline closure and still
 *   get a useful name in React DevTools / error stacks.
 */
export function getNamedComponent(name: string, renderFn: () => ReactElement): () => ReactElement {
  Object.defineProperty(renderFn, "name", { value: name })
  return renderFn
}

////////////////
// ## Node Rendering
////////////////

/** Default render for a single ASTNode. */
export function Node(astNode: ASTNode): ReactElement {
  const { nodeType, className, match } = astNode
  const props = {
    className,
    title: className,
    "data-match": match.ruleName,
    "data-line": match.line,
    "data-char": match.char,
    "data-start": match.start,
    "data-end": match.end
  }
  const children = astNode.renderChildren()
  // Trixy setup so problems in node rendering will show up as, e.g., `AST-CoreMethodInvocation`
  const Component = getNamedComponent(`AST-${nodeType}`, function () {
    return React.createElement("span", props, children)
  })
  return React.createElement(Component)
}

////////////////
// ## Whitespace & Delimiters
////////////////

/** Draw a single space. */
export const SPACE = <span className="whitespace space"> </span>
/** Draw a single indent -- 2 spaces, as `stringify.INDENT` -- combined with `NEWLINE` below to build `INDENTED_NEWLINE`. */
export const INDENT = <span className="whitespace indent">{"  "}</span>
/** Draw a newline as a list delimiter. */
export const NEWLINE = <span className="whitespace newline">{"\n"}</span>
/** Draw a newline followed by an indent -- delimiter for wrapped/indented lists. */
export const INDENTED_NEWLINE = Fragment(NEWLINE, INDENT)

/** Draw a comma as a list delimiter. */
export const COMMA = <span className="punctuation comma">,</span>
/** Draw a comma and then a space as a list delimiter. */
export const SPACED_COMMA = Fragment(COMMA, SPACE)
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = Fragment(COMMA, INDENTED_NEWLINE)

////////////////
// ## Keyword & Operator Tokens
////////////////

/**
 * Pre-built spans for keywords/operators/punctuation used across `renderChildren()` implementations in `AST.tsx`,
 * each carrying a `className` for syntax-highlighting CSS.  No `stringifyAST.ts` equivalent -- plain-string
 * compile output embeds these literally instead (e.g. `` `await ${expr}` ``).
 */
export const PERIOD = <span className="operator period">.</span>
export const BANG = <span className="operator exclamation-point">!</span>
export const EQUALS = <span className="operator equals">{" = "}</span>
export const COLON_AND_SPACE = <span className="operator colon">: </span>
export const OPEN_COMMENT = <span className="punctuation open-comment-symbol">{"/* "}</span>
export const CLOSE_COMMENT = <span className="punctuation close-comment-symbol">{" */"}</span>
export const FAT_ARROW = <span className="operator fat-arrow">{" => "}</span>
export const FUNCTION = <span className="keyword function">{"function "}</span>
export const ASYNC = <span className="keyword async">{"async "}</span>
export const AWAIT = <span className="keyword await">{"await "}</span>
export const LET = <span className="keyword declarator let">{"let "}</span>
export const RETURN = <span className="keyword return">{"return"}</span>
export const EXPORT = <span className="keyword export">{"export "}</span>
export const NEW = <span className="keyword new">{"new "}</span>
export const CLASS = <span className="keyword class">{"class "}</span>
export const EXTENDS = <span className="keyword extends">{" extends "}</span>
export const PROTOTYPE = <span className="keyword prototype">{"prototype"}</span>
export const GET = <span className="keyword get">{"get "}</span>
export const SET = <span className="keyword set">{"set "}</span>
export const STATIC = <span className="keyword static">{"static "}</span>
export const IF = <span className="keyword if">{"if "}</span>
export const ELSE = <span className="keyword else">{"else "}</span>
export const TERNARY_QUESTION = <span className="operator question-mark">{" ? "}</span>
export const TERNARY_COLON = <span className="operator colon"> : </span>
export const TRY = <span className="keyword try">{"try "}</span>
export const CATCH = <span className="keyword catch">{"catch "}</span>
export const FINALLY = <span className="keyword finally">{"finally "}</span>

////////////////
// ## List Rendering
////////////////

/** Draw a single item in a list by having it render its component. */
export const Item = ({ item }: { item?: ASTNode | null; index: number }): ReactNode =>
  item != null ? item.component : null

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
  items?: Array<ASTNode | null | undefined>
  delimiter?: ReactNode
  DrawItem?: ReactComponentType<{ item?: ASTNode | null; index: number }>
}): ReactElement | null => {
  if (!items || !items.length) return null
  // create `kids` array in funky way to get around key errors
  const kids: ReactNode[] = []
  items.forEach((item, index) => {
    kids.push(<DrawItem item={item} index={index} />)
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return React.createElement(React.Fragment, null, ...kids)
}

////////////////
// ## Parens & Call Args
////////////////

/** Opening-paren span. */
export const LEFT_PAREN = <span className="punctuation open-paren">(</span>
/** Closing-paren span. */
export const RIGHT_PAREN = <span className="punctuation close-paren">)</span>
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
  children?: ReactNode
  wrap?: boolean
  space?: boolean
}): ReactElement => {
  if (!children) return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_PAREN, delimiter, children, delimiter, RIGHT_PAREN)
}

/** Draw one `Args` list item, wrapped in an `arg arg-{index}` span so each arg can be targeted by CSS. */
export const Arg = ({ item, index }: { item?: ASTNode | null; index: number }): ReactElement => (
  <span key={index} className={`arg arg-${index}`}>
    <Item item={item} index={index} />
  </span>
)

/**
 * Draw list of function `args`, comma-delimited and wrapped in parens.
 * - Defaults to `wrap: true` once there are more than 3 args.
 * - Unlike `stringifyAST.ts`'s `Args`, doesn't special-case empty `args` itself -- relies on
 *   `InParens` returning `EMPTY_PARENS` when `List` renders `null` for an empty/absent list.
 */
export const Args = ({
  args,
  wrap = (args?.length ?? 0) > 3
}: {
  args?: Array<ASTNode | null | undefined>
  wrap?: boolean
}): ReactElement => {
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return (
    <span className={`ASTBlock ASTArgsBlock${wrap ? " indented" : ""}`}>
      <InParens wrap={wrap}>
        <span className="blockContents">
          <List items={args} DrawItem={Arg} delimiter={delimiter} />
        </span>
      </InParens>
    </span>
  )
}

////////////////
// ## Quotes
////////////////

/** Double-quote span. */
export const DOUBLE_QUOTE = <span className="punctuation double-quote">{'"'}</span>
/** Surround `children` in double quotes. */
export const InDoubleQuotes = ({ children }: { children?: ReactNode }): ReactElement =>
  Fragment(DOUBLE_QUOTE, children, DOUBLE_QUOTE)

/** Single-quote span. */
export const SINGLE_QUOTE = <span className="punctuation single-quote">{"'"}</span>
/** Surround `children` in single quotes. */
export const InSingleQuotes = ({ children }: { children?: ReactNode }): ReactElement =>
  Fragment(SINGLE_QUOTE, children, SINGLE_QUOTE)

/** Back-tick span. */
export const BACK_TICK = <span className="punctuation back-tick">{"`"}</span>
/** Surround `children` in back ticks. */
export const InBackTicks = ({ children }: { children?: ReactNode }): ReactElement =>
  Fragment(BACK_TICK, children, BACK_TICK)
/** Surround `children` in triple back ticks, e.g. for a fenced code block. */
export const InTripleBackTicks = ({ children }: { children?: ReactNode }): ReactElement =>
  Fragment(BACK_TICK, BACK_TICK, BACK_TICK, children, BACK_TICK, BACK_TICK, BACK_TICK)

////////////////
// ## Curly Brackets & Blocks
////////////////

/** Opening-curly-brace span. */
export const LEFT_CURLY = <span className="punctuation left-curly-bracket">{"{"}</span>
/** Closing-curly-brace span. */
export const RIGHT_CURLY = <span className="punctuation right-curly-bracket">{"}"}</span>
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
  children?: ReactNode
  wrap?: boolean
  space?: boolean
}): ReactElement => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_CURLY, delimiter, children, delimiter, RIGHT_CURLY)
}
/** `{}` -- returned by `Block` when there's nothing to wrap. */
export const EMPTY_BLOCK = (
  <span className="ASTBlock empty">
    <InCurlies />
  </span>
)
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
  children?: ReactNode
  wrap?: boolean
  space?: boolean
}): ReactElement => {
  if (!children) return EMPTY_BLOCK
  return (
    <span className={`ASTBlock${wrap ? " indented" : ""}`}>
      <InCurlies wrap={wrap} space={space}>
        <span className="blockContents">{children}</span>
      </InCurlies>
    </span>
  )
}

////////////////
// ## Square Brackets & Arrays
////////////////

/** Opening-square-bracket span. */
export const LEFT_SQUARE_BRACKET = <span className="punctuation left-square-bracket">[</span>
/** Closing-square-bracket span. */
export const RIGHT_SQUARE_BRACKET = <span className="punctuation right-square-bracket">]</span>
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
  children?: ReactNode
  wrap?: boolean
  space?: boolean
}): ReactElement => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_SQUARE_BRACKET, delimiter, children, delimiter, RIGHT_SQUARE_BRACKET)
}

/** `[]` -- returned by `Array` when there's nothing to wrap. */
const EMPTY_ARRAY = <InSquareBrackets />
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
  DrawItem?: ReactComponentType<{ item?: ASTNode | null; index: number }>
  wrap?: boolean
}): ReactElement => {
  if (!items || items.length === 0) return EMPTY_ARRAY

  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return (
    <span className={`ASTBlock ASTArray${wrap ? " indented" : ""}`}>
      <InSquareBrackets wrap={wrap}>
        <span className={`blockContents${wrap ? " indented" : ""}`}>
          <List items={items} delimiter={delimiter} DrawItem={DrawItem} />
        </span>
      </InSquareBrackets>
    </span>
  )
}
