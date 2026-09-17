import type { MatchGroups } from "~/parser/Match"

// Re-export so the `import type` above counts as "used" for `noUnusedLocals` -- referencing
// `MatchGroups` only inside the `declare module` augmentation below doesn't count as a read.
export type { MatchGroups }

declare module "~/parser/Match" {
  interface Match<Groups extends Record<string, unknown> = MatchGroups> {
    /** Parse errors accumulated while parsing a `block`/`line`, collected up the tree. */
    errors?: Match[]
    /** Set on a `block` match produced by `SpellStatement.parseNestedBlock()` so it compiles wrapped in `{}`. */
    enclose?: boolean
    /** Set (e.g. by JSX rules) when a statement match itself represents a parse error. */
    error?: Match
  }
}
