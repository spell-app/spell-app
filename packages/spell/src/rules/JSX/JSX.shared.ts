import { P } from "$/parser"
import type { FillInParts } from "$/spell/rules/core"

/**
 * Spell's own tag words in JSX, by the web's tag each becomes -- renamed as the element's AST is built,
 * so both writers write the web's.
 * - `<children/>` => `<slot/>`:  where a drawable list's items show, in its `to draw`
 * - `<children name="header"/>` => `<slot name="header"/>`:  a second, named place,
 *   filled by a child written `in="header"` (`SPELL_ATTRIBUTE_NAMES`)
 * - The web's own `<slot/>` keeps working.
 */
export const SPELL_TAG_NAMES = new Map([["children", "slot"]])

/**
 * Spell's own attribute words in JSX, by the web's attribute each becomes -- on any tag, renamed as its AST is built.
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
