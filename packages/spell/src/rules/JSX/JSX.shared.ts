import { P } from "$/parser"
import type { FillInParts } from "$/spell/rules/core"

/**
 * Spell's own tag words in JSX, by the web's tag each becomes.
 * - Renamed as the element's AST is built, so both writers write the web's.
 * - `<children/>` => `<slot/>`:  where a drawable list's items show, in its `to draw`
 * - `<children name="header"/>` => `<slot name="header"/>`:
 *   a second, named place, filled by a child written `in="header"` (`SPELL_ATTRIBUTE_NAMES`)
 * - The web's own `<slot/>` keeps working.
 */
export const SPELL_TAG_NAMES = new Map([["children", "slot"]])

/**
 * Spell's own attribute words in JSX, by the web's attribute each becomes.
 * - On any tag, renamed as its AST is built.
 * - `<h3 in="header">` => `<h3 slot="header">`:  "put me in the frame's `header` children"
 * - The web's own `slot="header"` keeps working.
 */
export const SPELL_ATTRIBUTE_NAMES = new Map([["in", "slot"]])

/**
 * What JSX rules (`jsxElement`, `jsxAttribute`, `jsxExpression`) stash on their matches.
 * - Shared by all three because they cross-reference each other's matches (e.g. `jsxElement` holds an
 *   array of `jsxAttribute` matches) -- splitting per-rule would just mean re-importing one another's type.
 */
export type JSXMatchData = {
  /** (`jsxAttribute`/`jsxExpression`) Sub-expression match parsed out of the attribute/expression value. */
  expression?: P.Match
  /** (`jsxAttribute`) Sub-statement match parsed out of an `on*` attribute value, e.g. an inline event handler. */
  statement?: P.Match
  /**
   * `parse_error` match:  (`jsxAttribute`/`jsxExpression`) recorded when neither `expression` nor `statement` could
   * be parsed;  (`jsxElement`) for a dotted tag, `<UI.Form>`.
   */
  error?: P.Match
  /** (`jsxElement`) Parsed `jsxAttribute` matches for the element. */
  attributes?: Array<P.Match | undefined>
  /** (`jsxAttribute`) Normalized attribute name. */
  attribute?: string
  /** (`jsxElement`) Parsed child matches (`jsxChild` or `parse_error`) for the element. */
  children?: Array<P.Match | undefined>
  /** (`jsxAttribute`) A text value's `[name]` fill-ins, if it has any -- see `parseFillIns()`. */
  fillIns?: FillInParts
}

/**
 * The text inside raw-text element `element`, e.g. a `<css>` or `<markdown>` block's:
 * its common indent taken off, blank lines at either end dropped.
 * - So the block can sit indented in an outline or a drawing.
 * - Raw text:  the tokenizer reads the element's whole contents as ONE text token (`P.Tokenizer.rawTextTags`).
 */
export function rawTextOf(element: P.JSXElementToken): string {
  const text = ((element.children ?? []) as P.Token[])
    .filter((child): child is P.JSXTextToken => child instanceof P.JSXTextToken)
    .map((child) => `${child.value}`)
    .join("")
  const lines = text.split("\n")
  while (lines.length && !lines[0]!.trim()) lines.shift()
  while (lines.length && !lines.at(-1)!.trim()) lines.pop()
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => /^\s*/.exec(line)![0].length))
  return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n")
}

/** The tag of a markdown block:  drawn in a drawing (`markdown_block`), a type's description in its outline. */
export const MARKDOWN_TAG = "markdown"
