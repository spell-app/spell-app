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

import { showWhitespace } from "~/util"

/** Draw a single space. */
export const SPACE = " "
/** Draw an indent as a list delimiter. */
export const INDENT = "\t"
/** Draw a newline as a list delimiter. */
export const NEWLINE = "\n"
/** Draw a newline as a list delimiter. */
export const INDENTED_NEWLINE = `${NEWLINE}${INDENT}`

/** Draw a comma as a list delimiter. */
export const COMMA = ","
/** Draw a comma and then a newline as a list delimiter. */
export const SPACED_COMMA = `${COMMA}${SPACE}`
/** Draw a comma and then a newline as a list delimiter. */
export const INDENTED_COMMA = `${COMMA}${NEWLINE}`

/** Draw a single item in a list by having it render its component. */
export const Item = ({ item, index }) => (item ? item.compile() : "")

/** Draw a series of items with a delimiter between */
export const List = ({ items, delimiter = SPACED_COMMA, DrawItem = Item }) => {
  if (!items || !items.length) return ""
  const kids = []
  items.forEach((item, index) => {
    kids.push(DrawItem({ item, index }))
    if (index !== items.length - 1) kids.push(delimiter)
  })
  return kids.join("")
}

/** Surround `children` in parens. */
export const LEFT_PAREN = "("
export const RIGHT_PAREN = ")"
export const EMPTY_PARENS = `${LEFT_PAREN}${RIGHT_PAREN}`
export const InParens = ({ children = "", wrap = false, space = false }) => {
  if (children == null || children === "") return EMPTY_PARENS
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = `${children.split("\n").join("\n\t")}`
  return `${LEFT_PAREN}${delimiter}${children}${delimiter}${RIGHT_PAREN}`
}

/** Draw list of function `args` */
export const Args = ({ args, wrap = args?.length > 3 }) => {
  if (!args || args.length === 0) return EMPTY_PARENS
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  let children = List({ items: args, delimiter })
  if (wrap && children.includes("\n")) children = `\t${children}`
  return InParens({ wrap, children })
}

/** Surround `children` in double quotes. */
export const DOUBLE_QUOTE = '"'
export const InDoubleQuotes = ({ children = "" }) => {
  return `${DOUBLE_QUOTE}${children}${DOUBLE_QUOTE}`
}

/** Surround `children` in single quotes. */
export const SINGLE_QUOTE = "'"
export const InSingleQuotes = ({ children = "" }) => {
  return `${SINGLE_QUOTE}${children}${SINGLE_QUOTE}`
}

/** Surround `children` in back ticks. */
export const BACK_TICK = "`"
export const InBackTicks = ({ children = "" }) => {
  return `${BACK_TICK}${children}${BACK_TICK}`
}

/** Surround `children` in curly brackets. */
export const LEFT_CURLY = "{"
export const RIGHT_CURLY = "}"
export const EMPTY_BLOCK = `${LEFT_CURLY}${RIGHT_CURLY}`
export const InCurlies = ({ children = "", wrap = false, space = false }) => {
  if (children == null || children === "") return EMPTY_BLOCK
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = `\t${children.split("\n").join("\n\t")}`
  return `${LEFT_CURLY}${delimiter}${children}${delimiter}${RIGHT_CURLY}`
}

/** Draw a block surrounded by curlies. */
export const Block = ({ children = "", wrap = false, space = !wrap }) => {
  return InCurlies({ wrap, space, children })
}

/** Surround `children` in square brackets. */
export const LEFT_SQUARE_BRACKET = "["
export const RIGHT_SQUARE_BRACKET = "]"
export const EMPTY_ARRAY = `${LEFT_SQUARE_BRACKET}${RIGHT_SQUARE_BRACKET}`
export const InSquareBrackets = ({ children = "", wrap = false, space = false }) => {
  if (children == null || children === "") return EMPTY_ARRAY
  const delimiter = (wrap && NEWLINE) || (space && SPACE) || ""
  if (wrap) children = `\t${children.split("\n").join("\n\t")}`
  return `${LEFT_SQUARE_BRACKET}${delimiter}${children}${delimiter}${RIGHT_SQUARE_BRACKET}`
}

/**
 * Draw an array of `items` delimited by commas and surrounded by square brackets.
 */
export const Array = ({ items, DrawItem = Item, wrap = false }) => {
  if (!items || items.length === 0) return EMPTY_ARRAY
  const delimiter = wrap ? INDENTED_COMMA : SPACED_COMMA
  return InSquareBrackets({
    wrap,
    children: List({ items, delimiter })
  })
}
