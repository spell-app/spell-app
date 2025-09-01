import { Match } from "~/parser/Match.js"
import { Rule, type RuleProps, type Scope } from "./Rule.js"
import { Token } from "../tokenizer/index.js"
import { Prettify } from "~/types.js"

export type TokenConstructor = (args: any) => Token

export type TokenTypeProps = Prettify<
  RuleProps & {
    tokenType?: TokenConstructor
  }
>

/**
 * Abstract rule for matching tokens of a particular type.
 */
export class TokenType extends Rule<TokenTypeProps> {
  /** Constructor for the token type we match. */
  declare tokenType: TokenConstructor

  testAtStart(scope: Scope, tokens: Token[], start = 0) {
    return tokens[start] instanceof this.tokenType
  }

  parse(scope: Scope, tokens: Token[]) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new Match({
      rule: this,
      matched: [tokens[0]],
      raw: tokens[0].raw,
      value: tokens[0].value,
      tokens: [tokens[0]],
      length: 1,
      scope
    })
  }

  compile(match: Match) {
    return match.value
  }
}
