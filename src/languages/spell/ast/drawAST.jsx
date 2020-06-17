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

/** Draw a single space. */
export const SPACE = <span className="whitespace space"> </span>
/** Draw an indent as a list delimiter. */
export const INDENT = <span className="whitespace indent">{"\t"}</span>
/** Draw a newline as a list delimiter. */
export const NEWLINE = <span className="whitespace newline">{"\n"}</span>
/** Draw a newline as a list delimiter. */
export const INDENTED_NEWLINE = (
  <>
    {NEWLINE}
    {INDENT}
  </>
)
/** Draw a comma as a list delimiter. */
export const COMMA = <span className="punctuation comma">,</span>
/** Draw a comma and then a newline as a list delimiter. */
export const SPACED_COMMA = (
  <>
    {COMMA}
    {SPACE}
  </>
)
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = (
  <>
    {COMMA}
    {INDENTED_NEWLINE}
  </>
)

/** Draw a single item in a list by having it render its component. */
export const Item = ({ item, index }) => (item != null ? item.component : null)

/** Draw a series of items with a delimiter between */
export const List = ({ items, delimiter = SPACED_COMMA, DrawItem = Item }) => {
  if (!items || !items.length) return null
  // create `kids` array in funky way to get around key errors
  const kids = []
  items.forEach((item, index) => {
    kids.push(<DrawItem item={item} index={index} />)
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return React.createElement(React.Fragment, null, ...kids)
}

/** Surround `children` in parens. */
export const LEFT_PAREN = <span className="punctuation open-paren">(</span>
export const RIGHT_PAREN = <span className="punctuation close-paren">)</span>
const EMPTY_PARENS = (
  <>
    {LEFT_PAREN}
    {RIGHT_PAREN}
  </>
)
export const InParens = ({ children = null, wrap = false, space = false }) => {
  if (!children) return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return (
    <>
      {LEFT_PAREN}
      {delimiter}
      {children}
      {delimiter}
      {RIGHT_PAREN}
    </>
  )
}

/** Draw list of function `args` */
export const Arg = ({ item, index }) => (
  <span key={index} className={`arg arg-${index}`}>
    <Item item={item} index={index} />
  </span>
)

export const Args = ({ args, wrap = args?.length > 3 }) => {
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
export const DOUBLE_QUOTE = <span className="punctuation left-double-quote">{'"'}</span>
export const InDoubleQuotes = ({ children }) => {
  return (
    <>
      {DOUBLE_QUOTE}
      {children}
      {DOUBLE_QUOTE}
    </>
  )
}

/** Surround `children` in single quotes. */
export const SINGLE_QUOTE = <span className="punctuation left-single-quote">{"'"}</span>
export const InSingleQuotes = ({ children }) => {
  return (
    <>
      {SINGLE_QUOTE}
      {children}
      {SINGLE_QUOTE}
    </>
  )
}

/** Surround `children` in curly brackets. */
export const LEFT_CURLY = <span className="punctuation left-curly-bracket">{"{"}</span>
export const RIGHT_CURLY = <span className="punctuation right-curly-bracket">{"}"}</span>
export const InCurlies = ({ children, wrap = false, space = false }) => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return (
    <>
      {LEFT_CURLY}
      {delimiter}
      {children}
      {delimiter}
      {RIGHT_CURLY}
    </>
  )
}

/** Draw a block surrounded by curlies. */
const EMPTY_BLOCK = (
  <span className="ASTBlock empty">
    <InCurlies />
  </span>
)
export const Block = ({ children = null, wrap = false, space = !wrap }) => {
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
export const InSquareBrackets = ({ children = null, wrap = false, space = false }) => {
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || null
  return (
    <>
      {LEFT_SQUARE_BRACKET}
      {delimiter}
      {children}
      {delimiter}
      {RIGHT_SQUARE_BRACKET}
    </>
  )
}

/**
 * Draw an array of `items` delimited by commas and surrounded by square brackets.
 */
const EMPTY_ARRAY = <InSquareBrackets />
export const Array = ({ items, DrawItem = Item, wrap = false }) => {
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
