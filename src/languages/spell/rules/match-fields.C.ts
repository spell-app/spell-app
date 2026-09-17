// Module augmentation for ad-hoc `Match` fields set/read by chunk C's rule files
// (JSX, math, properties, events, UI, async, draw, tests).
// See the shared conversion brief for why these live outside `src/parser/Match.ts`.
import type { MatchGroups } from "~/parser/Match"
// Re-exported solely so the import above counts as "used" -- `noUnusedLocals` doesn't see references
// to it that appear only inside the `declare module` augmentation below.
export type { MatchGroups }

declare module "~/parser/Match" {
  interface Match<Groups extends Record<string, unknown> = MatchGroups> {
    /** Sub-expression match parsed out of the input, e.g. a JSX attribute/expression value. */
    expression?: Match
    /** Sub-statement match parsed out of the input, e.g. an inline event handler. */
    statement?: Match
    /** `parse_error` match recorded when neither `expression` nor `statement` could be parsed. */
    error?: Match
    /** (`jsxElement`) Parsed `jsxAttribute` matches for the element. */
    attributes?: Array<Match | undefined>
    /** (`jsxAttribute`) Normalized attribute name. */
    attribute?: string
    /** (`jsxElement`) Parsed child matches (`jsxChild` or `parse_error`) for the element. */
    children?: Array<Match | undefined>
    /** (`css` rule) File name the CSS came from, if any -- set externally by `SpellCSSFile`. */
    file?: string
  }
}
