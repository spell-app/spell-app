// Ad-hoc `Match` fields set/read by chunk E (`rules/lists.ts`, `rules/classes.ts`).
// See the shared conversion brief for why these live here instead of on `src/parser/Match.ts`.
import { P } from "~/parser"
import type { AST } from "~/parser"

declare module "~/parser/Match" {
  // NOTE: MUST stay an `interface` -- module augmentation merges into the declared `Match`,
  // and `type` cannot merge.  Documented exception to the "always use `type`" rule.
  interface Match<Groups extends Record<string, unknown> = import("~/parser/Match").MatchGroups> {
    /**
     * Scope constant pointed to by a match whose rule is (a subclass of) `SpellConstant`.
     * Set by `rules/constants.ts`; read in `rules/classes.ts` (`property_value_either`).
     */
    constant?: P.ScopeConstant

    /**
     * Resolved `TypeScope` for a match whose rule is (a subclass of) the `known_type` rule.
     * Set by `rules/types.ts`; read in `rules/classes.ts` (`property_value_getter`).
     * (Also referenced this way, independently, by `src/parser/ast/AST.tsx`'s `TypeExpression.scope`.)
     */
    type?: P.TypeScope

    /**
     * Comment recording a rule that was dynamically added to scope while parsing this match, so it can be
     * echoed back out as an annotation in the compiled output.
     * Set/read in `rules/classes.ts` (`define_property_has`, `quoted_property_formula`).
     */
    ruleComment?: AST.ParserAnnotation
  }
}
