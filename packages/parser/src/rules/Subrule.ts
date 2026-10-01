import { P } from "#parser"
import { Rule } from "./Rule"

/**
 * Subrule -- name of another rule to be called.
 * - `rule.rule` is name of the rule in `scope.rules`.
 * - After parsing, we'll return the actual matched rule's match (rather than a clone of this rule's match).
 */
export class Subrule<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<SubruleProps, Groups, MatchData> {
  /** Name of the rule to match. */
  declare rule: string

  /** Bare string shorthand sets `rule` directly, otherwise pass a full `SubruleProps` bag. */
  constructor(props: SubruleProps | string) {
    if (typeof props === "string") super({ rule: props })
    else super(props)
  }

  /** Ask the rule we point at whether it could match at `start`. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return scope.getRuleOrDie(this.rule).test(scope, tokens, start)
  }

  /**
   * Look up `this.rule` in `scope` and delegate parsing to it.
   * - In expecting mode (see `P.Expectations`):
   *   - out of tokens, we're what comes next
   *   - each rule parses once per place -- see `P.Expectations.memoized()`
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!tokens.length) {
      P.Expectations.current?.expect(this)
      return undefined
    }
    const rule = scope.getRuleOrDie(this.rule)

    const expecting = P.Expectations.current
    const match = expecting
      ? expecting.memoized(this.rule, scope, tokens, () => rule.parse(scope, tokens))
      : rule.parse(scope, tokens)
    if (!match) return undefined
    if (this.matchGroup) match.matchGroup = this.matchGroup
    return match
  }

  /**
   * Resolved rule's match replaces ours:  named by our `matchGroup`, else (almost always) the rule name we point at.
   * - NOTE: approximate for the anonymous case -- a rule registered ONLY under an alias keeps its own name.
   */
  getGroupSpecContribution(): P.GroupSpecEntry[] {
    return [{ name: this.matchGroup || this.rule, optional: !!this.optional, array: false }]
  }

  /** Always throws -- compile the resolved rule's own match instead of the `Subrule` wrapper. */
  compile(match: P.MatchFor<this>) {
    throw new TypeError("Subrule cannot be compiled")
  }

  /** Return rulex string for this rule, e.g. `{ruleName}`. */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    return `{${matchGroup}${this.rule}}${optional}`
  }
}

/** Props bag accepted by `Subrule`'s constructor. */
export type SubruleProps = Prettify<
  P.RuleProps & {
    /** Name of the rule to match. */
    rule: string
  }
>
