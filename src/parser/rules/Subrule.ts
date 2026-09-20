import { P } from "~/parser"
import { Rule } from "./Rule"

/**
 * Subrule -- name of another rule to be called.
 * - `rule.rule` is name of the rule in `scope.rules`.
 * - After parsing, we'll return the actual matched rule's match (rather than a clone of this rule's match).
 */
export class Subrule extends Rule<SubruleProps> {
  /** Name of the rule to match. */
  declare rule: string

  /** Bare string shorthand sets `rule` directly, otherwise pass a full `SubruleProps` bag. */
  constructor(props: SubruleProps | string) {
    if (typeof props === "string") super({ rule: props })
    else super(props)
  }

  /** Ask the subrule to figure out if a match is possible. */
  test(scope: P.Scope, tokens: P.Token[], testLocation = this.testLocation) {
    const rule = scope.getRuleOrDie(this.rule)
    return rule.test(scope, tokens, testLocation)
  }

  /** Look up `this.rule` in `scope` and delegate parsing to it. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!tokens.length) return undefined
    const rule = scope.getRuleOrDie(this.rule)

    const match = rule.parse(scope, tokens)
    if (!match) return undefined
    if (this.argument) match.argument = this.argument
    return match
  }
  /** Always throws -- compile the resolved rule's own match instead of the `Subrule` wrapper. */
  compile(match: P.Match) {
    throw new TypeError("Subrule cannot be compiled")
  }

  /** Return rulex string for this rule, e.g. `{ruleName}`. */
  toRulexSyntax() {
    const { testLocation, argument, optional } = this.getRulexFlags()
    return `${testLocation}{${argument}${this.rule}}${optional}`
  }
}

/** Props bag accepted by `Subrule`'s constructor. */
export type SubruleProps = Prettify<
  P.RuleProps & {
    /** Name of the rule to match. */
    rule: string
  }
>
