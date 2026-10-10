import { P } from "$/parser"
import type { FillInParts } from "$/spell/rules/core"

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
  /** (`jsxAttribute`/`jsxExpression`) `parse_error` match recorded when neither `expression` nor `statement` could be parsed. */
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
