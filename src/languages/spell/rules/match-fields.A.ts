// Module augmentation for ad-hoc `Match` fields set/read by chunk A's rule files
// (Block, BlockLine, Statement, ParseError).
// See the shared conversion brief for why these live outside `src/parser/Match.ts`.
import { P } from "~/parser"

declare module "~/parser/Match" {
  // NOTE: MUST stay an `interface` -- module augmentation merges into the declared `Match`,
  // and `type` cannot merge.  Documented exception to the "always use `type`" rule.
  interface Match<Groups extends Record<string, unknown> = P.MatchGroups> {
    /** Parse errors accumulated while parsing a `block`/`line`, collected up the tree. */
    errors?: Match[]
    /** Set on a `block` match produced by `SpellStatement.parseNestedBlock()` so it compiles wrapped in `{}`. */
    enclose?: boolean
    /** Set (e.g. by JSX rules) when a statement match itself represents a parse error. */
    error?: Match
  }
}
