import { P } from "~/parser"

declare module "~/parser/Match" {
  interface Match<Groups extends Record<string, unknown> = P.MatchGroups> {
    /** Parse errors accumulated while parsing a `block`/`line`, collected up the tree. */
    errors?: Match[]
    /** Set on a `block` match produced by `SpellStatement.parseNestedBlock()` so it compiles wrapped in `{}`. */
    enclose?: boolean
    /** Set (e.g. by JSX rules) when a statement match itself represents a parse error. */
    error?: Match
  }
}
