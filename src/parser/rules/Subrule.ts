
import type { P } from "~/parser"
import { R } from "./index"
import { Rule } from "./Rule"

export type SubruleProps = Prettify<
  R.RuleProps & {
    rule: string
  }
>

// Subrule -- name of another rule to be called.
// `rule.rule` is the name of the rule in `scope.rules`.
//
// After parsing
//  we'll return the actual rule that was matched (rather than a clone of this rule)
export class Subrule extends Rule<SubruleProps> {
  /** Name of the rule to match. */
  declare rule: string

  constructor(props: SubruleProps | string) {
    if (typeof props === "string") super({ rule: props })
    else super(props)
  }

  // Ask the subrule to figure out if a match is possible.
  test(scope: P.Scope, tokens: P.Token[], testLocation = this.testLocation) {
    const rule = scope.getRuleOrDie(this.rule)
    return rule.test(scope, tokens, testLocation)
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!tokens.length) return undefined
    const rule = scope.getRuleOrDie(this.rule)

    const match = rule.parse(scope, tokens)
    if (!match) return undefined
    if (this.argument) match.argument = this.argument
    return match
  }
  compile(match: P.Match) {
    throw new TypeError("Subrule cannot be compiled")
    return ""
  }

  toRulexSyntax() {
    const { testLocation, argument, optional } = this.getRulexFlags()
    return `${testLocation}{${argument}${this.rule}}${optional}`
  }
}
