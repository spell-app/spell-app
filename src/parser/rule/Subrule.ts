import { Prettify } from "~/types.js"
import { Rule, type RuleProps, type Scope } from "./Rule.js"
import { Token } from "~/parser/tokenizer/Tokens"
import { Match } from "~/parser/Match"

export type SubruleProps = Prettify<
  RuleProps & {
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

  constructor(props: SubruleProps) {
    if (typeof props === "string") super({ rule: props })
    else super(props)
  }

  // Ask the subrule to figure out if a match is possible.
  test(scope: Scope, tokens: Token[], testLocation = this.testLocation) {
    const rule = scope.parser.getRuleOrDie(this.rule)
    return rule.test(scope, tokens, testLocation)
  }

  parse(scope: Scope, tokens: Token[]) {
    if (!tokens.length) return undefined
    const rule = scope.parser.getRuleOrDie(this.rule)

    const match = rule.parse(scope, tokens)
    if (!match) return undefined
    if (this.argument) match.argument = this.argument
    return match
  }
  compile(match: Match) {
    throw new TypeError("Subrule cannot be compiled")
    return ""
  }

  toSyntax() {
    const { testLocation, argument, optional } = this.getSyntaxFlags()
    return `${testLocation}{${argument}${this.rule}}${optional}`
  }
}
