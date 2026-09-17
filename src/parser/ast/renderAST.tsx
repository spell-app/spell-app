/* eslint-disable react/prop-types */
/**
 *
 * Utilites for rendering things (e.g. `ASTNode`s) as React components.
 * Contract:
 *  - each thing has a GENERIC `getComponent(key?)` method which renders an outer container.
 * Usage:
 *    `import * as draw from ".../drawComponent"`
 * TODOC!!!
 *    etc
 */
import React from "react"
import type { ASTNode } from "./AST"

///////////////////
// UTILITY FUNCTIONS
///////////////////

/**
 * Draw a React.Fragment which encompasses the arguments.
 * Simpler implementations seem to have problems in babel.
 */
export function Fragment(...children: React.ReactNode[]): React.ReactElement {
  return React.createElement(React.Fragment, null, ...children)
}

/**
 * Return a React functional component which will show as `name` in a rendering error, etc.
 * TODOC
 */
export function getNamedComponent(name: string, renderFn: () => React.ReactElement): () => React.ReactElement {
  Object.defineProperty(renderFn, "name", { value: name })
  return renderFn
}

///////////////////

/** Default render for a single ASTNode. */
export function Node(astNode: ASTNode): React.ReactElement {
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

/** Draw a single space. */
export const SPACE = <span className="whitespace space"> </span>
/** Draw an indent as a list delimiter. */
export const INDENT = <span className="whitespace indent">{"\t"}</span>
/** Draw a newline as a list delimiter. */
export const NEWLINE = <span className="whitespace newline">{"\n"}</span>
/** Draw a newline as a list delimiter. */
export const INDENTED_NEWLINE = Fragment(NEWLINE, INDENT)

/** Draw a comma as a list delimiter. */
export const COMMA = <span className="punctuation comma">,</span>
/** Draw a comma and then a newline as a list delimiter. */
export const SPACED_COMMA = Fragment(COMMA, SPACE)
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = Fragment(COMMA, INDENTED_NEWLINE)

/** Common symbols/etc */
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
export const IF = <span className="keyword if">{"if "}</span>
export const ELSE = <span className="keyword else">{"else "}</span>
export const TERNARY_QUESTION = <span className="operator question-mark">{" ? "}</span>
export const TERNARY_COLON = <span className="operator colon"> : </span>
export const TRY = <span className="keyword try">{"try "}</span>
export const CATCH = <span className="keyword catch">{"catch "}</span>
export const FINALLY = <span className="keyword finally">{"finally "}</span>

/** Draw a single item in a list by having it render its component. */
export const Item = ({ item }: { item?: ASTNode | null; index: number }): React.ReactNode =>
  item != null ? item.component : null

/** Draw a series of items with a delimiter between */
export const List = ({
  items,
  delimiter = SPACED_COMMA,
  DrawItem = Item
}: {
  items?: Array<ASTNode | null | undefined>
  delimiter?: React.ReactNode
  DrawItem?: React.ComponentType<{ item?: ASTNode | null; index: number }>
}): React.ReactElement | null => {
  if (!items || !items.length) return null
  // create `kids` array in funky way to get around key errors
  const kids: React.ReactNode[] = []
  items.forEach((item, index) => {
    kids.push(<DrawItem item={item} index={index} />)
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return React.createElement(React.Fragment, null, ...kids)
}

/** Surround `children` in parens. */
export const LEFT_PAREN = <span className="punctuation open-paren">(</span>
export const RIGHT_PAREN = <span className="punctuation close-paren">)</span>
export const EMPTY_PARENS = Fragment(LEFT_PAREN, RIGHT_PAREN)
export const InParens = ({
  children = null,
  wrap = false,
  space = false
}: {
  children?: React.ReactNode
  wrap?: boolean
  space?: boolean
}): React.ReactElement => {
  if (!children) return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_PAREN, delimiter, children, delimiter, RIGHT_PAREN)
}

/** Draw list of function `args` */
export const Arg = ({ item, index }: { item?: ASTNode | null; index: number }): React.ReactElement => (
  <span key={index} className={`arg arg-${index}`}>
    <Item item={item} index={index} />
  </span>
)

export const Args = ({
  args,
  wrap = (args?.length ?? 0) > 3
}: {
  args?: Array<ASTNode | null | undefined>
  wrap?: boolean
}): React.ReactElement => {
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

/** Surround `children` in double quotes. */
export const DOUBLE_QUOTE = <span className="punctuation double-quote">{'"'}</span>
export const InDoubleQuotes = ({ children }: { children?: React.ReactNode }): React.ReactElement =>
  Fragment(DOUBLE_QUOTE, children, DOUBLE_QUOTE)

/** Surround `children` in single quotes. */
export const SINGLE_QUOTE = <span className="punctuation single-quote">{"'"}</span>
export const InSingleQuotes = ({ children }: { children?: React.ReactNode }): React.ReactElement =>
  Fragment(SINGLE_QUOTE, children, SINGLE_QUOTE)

/** Surround `children` in back ticks. */
export const BACK_TICK = <span className="punctuation back-tick">{"`"}</span>
export const InBackTicks = ({ children }: { children?: React.ReactNode }): React.ReactElement =>
  Fragment(BACK_TICK, children, BACK_TICK)
export const InTripleBackTicks = ({ children }: { children?: React.ReactNode }): React.ReactElement =>
  Fragment(BACK_TICK, BACK_TICK, BACK_TICK, children, BACK_TICK, BACK_TICK, BACK_TICK)

/** Surround `children` in curly brackets. */
export const LEFT_CURLY = <span className="punctuation left-curly-bracket">{"{"}</span>
export const RIGHT_CURLY = <span className="punctuation right-curly-bracket">{"}"}</span>
export const InCurlies = ({
  children,
  wrap = false,
  space = false
}: {
  children?: React.ReactNode
  wrap?: boolean
  space?: boolean
}): React.ReactElement => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_CURLY, delimiter, children, delimiter, RIGHT_CURLY)
}
/** Draw a block surrounded by curlies. */
export const EMPTY_BLOCK = (
  <span className="ASTBlock empty">
    <InCurlies />
  </span>
)
export const Block = ({
  children = null,
  wrap = false,
  space = !wrap
}: {
  children?: React.ReactNode
  wrap?: boolean
  space?: boolean
}): React.ReactElement => {
  if (!children) return EMPTY_BLOCK
  return (
    <span className={`ASTBlock${wrap ? " indented" : ""}`}>
      <InCurlies wrap={wrap} space={space}>
        <span className="blockContents">{children}</span>
      </InCurlies>
    </span>
  )
}

/** Surround `children` in square brackets. */
export const LEFT_SQUARE_BRACKET = <span className="punctuation left-square-bracket">[</span>
export const RIGHT_SQUARE_BRACKET = <span className="punctuation right-square-bracket">]</span>
export const InSquareBrackets = ({
  children = null,
  wrap = false,
  space = false
}: {
  children?: React.ReactNode
  wrap?: boolean
  space?: boolean
}): React.ReactElement => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return Fragment(LEFT_SQUARE_BRACKET, delimiter, children, delimiter, RIGHT_SQUARE_BRACKET)
}

/**
 * Draw an array of `items` delimited by commas and surrounded by square brackets.
 */
const EMPTY_ARRAY = <InSquareBrackets />
export const Array = ({
  items,
  DrawItem = Item,
  wrap = false
}: {
  items?: Array<ASTNode | null | undefined>
  DrawItem?: React.ComponentType<{ item?: ASTNode | null; index: number }>
  wrap?: boolean
}): React.ReactElement => {
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
