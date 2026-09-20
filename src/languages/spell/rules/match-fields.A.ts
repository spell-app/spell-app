/**
 * Module augmentation for ad-hoc `Match` fields set/read by chunk A's rule files
 * (`Block`, `BlockLine`, `Statement`, `ParseError`).
 * - These `match.foo = ...` fields are spell-language-specific bookkeeping, not part of the generic
 *   `~/parser` `Match` shape, so they're declared here via TS interface merging instead of being added
 *   to `src/parser/Match.ts` directly -- that file is imported by every language, not just spell, and
 *   MUST stay runtime-light / language-agnostic.
 * - Split by lettered "chunk" (`A`, `B`, `C`, `E`, ...) rather than one shared file because the TS
 *   conversion of this `rules/` folder (see git history: "working through type conversion") was done in
 *   phases, each phase covering a batch of rule files; giving each phase's ad hoc fields their own file
 *   avoided every phase colliding on one shared augmentation file.
 * - Each rule file that reads/writes one of these fields imports its chunk's file as a side effect
 *   (`import "./match-fields.A"`) purely for readability / explicit dependency -- `tsconfig.json`'s
 *   `include: ["src"]` means the augmentation applies project-wide regardless of whether it's imported.
 * - TODO: there's no `match-fields.D.ts` -- unclear whether a chunk was skipped, merged into another
 *   letter, or needed no ad hoc fields.
 */
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
