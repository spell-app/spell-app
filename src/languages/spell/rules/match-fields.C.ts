/**
 * Module augmentation for ad-hoc `Match` fields set/read by chunk C's rule files
 * (`JSX`, `math`, `properties`, `events`, `UI`, `async`, `draw`, `tests`).
 * - See `match-fields.A.ts` for why these ad hoc fields live here (via TS interface merging) rather than
 *   on `src/parser/Match.ts` directly, and why they're split across lettered "chunk" files.
 * - TODO: unlike chunk A/B/E's rule files, none of the chunk C files listed above actually
 *   `import "./match-fields.C"` as a side effect (verified by grep) even though e.g. `JSX.ts` reads/writes
 *   `match.expression`/`match.statement`/`match.attributes`/etc declared below.  This still type-checks
 *   because `tsconfig.json`'s `include: ["src"]` applies the augmentation project-wide regardless of
 *   import, but it's an inconsistency with the other chunks -- unclear if the import was dropped by
 *   accident during the conversion.
 */
import { P } from "~/parser"

declare module "~/parser/Match" {
  // NOTE: MUST stay an `interface` -- module augmentation merges into the declared `Match`,
  // and `type` cannot merge.  Documented exception to the "always use `type`" rule.
  interface Match<Groups extends Record<string, unknown> = P.MatchGroups> {
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
