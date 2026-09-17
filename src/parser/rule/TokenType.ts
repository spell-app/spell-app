import { Match } from "~/parser/Match"
import { Rule, type RuleProps } from "./Rule"
import type { Scope } from "~/parser/scope/Scope"
import { Token } from "../tokenizer/index"
import { Prettify } from "~/types"

export type TokenConstructor = new (args: any) => Token

export type TokenTypeProps = Prettify<
  RuleProps & {
    tokenType?: TokenConstructor
  }
>

/**
 * Abstract rule for matching a single token of a particular type.
 */
export class TokenType extends Rule<TokenTypeProps> {
  // Accessor pair (rather than a plain field) so subclasses like `Word` can override the getter.
  // Backing field is `declare`d because `Object.assign(this, props)` in `Rule` runs before subclass initializers.
  declare private _tokenType: TokenConstructor | undefined

  /** Constructor for the token type we match. */
  get tokenType(): TokenConstructor {
    return this._tokenType!
  }

  set tokenType(value: TokenConstructor) {
    this._tokenType = value
  }

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
      scope
    })
  }

  compile(match: Match) {
    return match.value
  }
}
