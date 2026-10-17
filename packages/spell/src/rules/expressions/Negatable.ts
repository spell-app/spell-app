import { P } from "$/parser"
import { expressions } from "./expressions.parser"

/**
 * `is` / `can` / `will` / `has` rules:  a word and its negated forms, e.g. `(is|(negated:is not|isn't|isnt))`
 *   -- registered under the word, e.g. `is`.
 * - Negated forms are the ones in a `negated` group -- see `isNegated()`.  So order doesn't matter, and there
 *   may be several positive forms, e.g. `(has|have|(negated:does not have))`.
 * - Registered once per word, `Negatable.specialize({ ruleName: "is" })`, so a translation adds its own,
 *   e.g. `(es|(negated:no es))` as `es`.
 * - `quoted_type_expression` makes a signature's negatable word `{operator:<word>}` -- see `processSignature()`.
 */
export class Negatable extends P.Choice {
  /**
   * SIDE EFFECT: marks the winning match `data.negated` if it came from our `negated` group.
   * - `Choice` hands back the winning alternative's own match.  Its `name` says which group:  a one-form group
   *   compiles to a rule named `negated`, a several-form one stamps `negated` on its winner's match.
   * - Read it NOW:  a `{operator:is}` around us renames the match `operator` as we return.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match) (match.data as NegatableMatchData).negated = match.name === "negated"
    return match
  }

  /**
   * `true` if `match` came from a `Negatable` and matched a negated form, e.g. `isn't`.
   * - `match` may be missing, e.g. the `operator` of a syntax which has none:  never negated.
   */
  static isNegated(match: P.Match | undefined): boolean {
    return (match?.data as NegatableMatchData | undefined)?.negated === true
  }
}

// Use `{is}` in a syntax for every form of `is`, including `isn't`;  plain `is` for just the word.
expressions.addRule(Negatable.specialize({ ruleName: "is" }), { syntax: "(is|(negated:is not|isn't|isnt))" })
expressions.addRule(Negatable.specialize({ ruleName: "can" }), {
  syntax: "(can|(negated:can not|cannot|can't|cant))"
})
expressions.addRule(Negatable.specialize({ ruleName: "will" }), { syntax: "(will|(negated:will not|won't|wont))" })
expressions.addRule(Negatable.specialize({ ruleName: "has" }), {
  syntax: "(has|(negated:does not have|doesn't have|doesnt have))"
})

/** What `Negatable` stashes on the winning alternative's match. */
type NegatableMatchData = {
  /** `true` if a negated form matched, e.g. `isn't`;  `false` for the positive one. */
  negated?: boolean
}
