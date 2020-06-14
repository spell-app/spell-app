/**
 *
 * Utilites for rendering things (e.g. `ASTNode`s) as React components.
 * Contract:
 *  - each thing has a GENERIC `getComponent(key?)` method which renders an outer container.
 * Usage:
 *    `import * as draw from ".../drawComponent"`
 *    `draw.Item(thing)`
 *    `draw.List(thing.items, draw.Newline)`
 *    etc
 */
import React from "react"

/** Draw a comma as a list delimiter. */
export const Comma = index => <span className="punctuation comma">, </span>
/** Draw a comma and then a newline as a list delimiter. */
export const IndentedComma = index => (
  <>
    {Comma()}
    {IndentedNewline()}
  </>
)
/** Draw a newline as a list delimiter. */
export const Newline = index => <span className="whitespace newline">{"\n"}</span>
/** Draw an indent as a list delimiter. */
export const Indent = index => <span className="whitespace indent" />
/** Draw a newline as a list delimiter. */
export const IndentedNewline = index => (
  <>
    {Newline()}
    {Indent()}
  </>
)

/** Draw a single item in a list by having it render its component. */
export const Item = (item, index) => item.getComponent(index)

/** Draw a series of items with a delimiter between */
export const List = (items, drawSeparator = Comma, drawItem = Item) => {
  if (!items) return null
  // create `kids` array in funky way to get around key errors
  const kids = []
  items.forEach((item, index) => {
    kids.push(drawItem(item, index))
    if (index !== items.length - 1) kids.push(drawSeparator())
  })
  return <>{kids}</>
}

/** Surround `content` in parens. */
export const LeftParen = (whiteSpace = "") => <span className="punctuation open-paren">{`(${whiteSpace}`}</span>
export const RightParen = (whiteSpace = "") => <span className="punctuation close-paren">{`${whiteSpace})`}</span>
export const InParens = (content, whiteSpace = "") => {
  return (
    <>
      {LeftParen(whiteSpace)}
      {content}
      {RightParen(whiteSpace)}
    </>
  )
}

/** Draw list of function `args` */
export const Arg = (arg, index) => (
  <span key={index} className={`arg arg-${index}`}>
    {arg.getComponent()}
  </span>
)
export const Args = args => {
  // TODO: indent if more than 3 args?
  return (
    <span className="arg-list">
      {LeftParen()}
      <span className="args">{List(args, Comma, Arg)}</span>
      {RightParen()}
    </span>
  )
}

/** Surround `content` in single quotes. */
export const SingleQuote = () => <span className="punctuation left-single-quote">{"'"}</span>
export const InSingleQuotes = content => {
  return (
    <>
      {SingleQuote()}
      {content}
      {SingleQuote()}
    </>
  )
}

/** Surround `content` in curly brackets. */
export const LeftCurly = (whiteSpace = "") => <span className="punctuation left-curly-bracket">{`{${whiteSpace}`}</span>
export const RightCurly = (whiteSpace = "") => (
  <span className="punctuation right-curly-bracket">{`${whiteSpace}}`}</span>
)
export const InCurlies = (content = null) => {
  const whiteSpace = content && content.length ? " " : ""
  return (
    <>
      {LeftCurly(whiteSpace)}
      {content}
      {RightCurly(whiteSpace)}
    </>
  )
}

/**
 * Draw a block surrounded by curlies.
 * If `indented === true`, the block contents will indent every newline.
 */
export const Block = (content = null, indented = false) => {
  if (!content || content.length === 0) return InCurlies()

  const whiteSpace = indented ? "" : " "
  return (
    <span className={`ASTBlock${indented ? " indented" : ""}`}>
      {LeftCurly(whiteSpace)}
      {indented && Newline()}
      <span className={`blockContents${indented ? " indented" : ""}`}>{content}</span>
      {indented && Newline()}
      {RightCurly(whiteSpace)}
    </span>
  )
}

/** Surround `content` in square brackets. */
export const LeftSquare = (whiteSpace = "") => (
  <span className="punctuation left-square-bracket">{`[${whiteSpace}`}</span>
)
export const RightSquare = (whiteSpace = "") => (
  <span className="punctuation right-square-bracket">{`${whiteSpace}]`}</span>
)
export const InSquares = (content = null, whiteSpace = "") => {
  return (
    <>
      {LeftSquare(whiteSpace)}
      {content}
      {RightSquare(whiteSpace)}
    </>
  )
}

/**
 * Draw an array of `items` delimited by commas and surrounded by square brackets.
 */
export const Array = (items, indented = false, drawItem = Item) => {
  if (!items || items.length === 0) return InSquares()

  const delimiter = indented ? IndentedComma : Comma
  const content = List(items, delimiter, drawItem)
  const whiteSpace = indented ? "" : " "
  return (
    <span className={`ASTBlock${indented ? " indented" : ""}`}>
      {LeftSquare(whiteSpace)}
      {indented && Newline()}
      <span className={`blockContents${indented ? " indented" : ""}`}>{content}</span>
      {indented && Newline()}
      {RightSquare(whiteSpace)}
    </span>
  )
}
