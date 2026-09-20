import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Abstract rule for matching a single token of a particular type.
 */
export class TokenType extends Rule<TokenTypeProps> {
  /**
   * Accessor pair (rather than a plain field) so subclasses like `Word` can override the getter.
   * - Backing field is `declare`d because `Object.assign(this, props)` in `Rule` runs before subclass initializers.
   */
  declare private _tokenType: P.TokenConstructor | undefined

  /** Constructor for the token type we match. */
  get tokenType(): P.TokenConstructor {
    return this._tokenType!
  }

  set tokenType(value: P.TokenConstructor) {
    this._tokenType = value
  }

  /** `true` if token at `start` is an instance of `this.tokenType`. */
  testAtStart(scope: P.Scope, tokens: P.Token[], start = 0) {
    return tokens[start] instanceof this.tokenType
  }

  /** Match a single token whose type is `this.tokenType`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new P.Match({
      rule: this,
      matched: [tokens[0]],
      raw: tokens[0].raw,
      value: tokens[0].value,
      tokens: [tokens[0]],
      scope
    })
  }

  /** Output is just the matched `match.value`. */
  compile(match: P.Match) {
    return match.value
  }
}

/** Props bag accepted by `TokenType`'s constructor. */
export type TokenTypeProps = Prettify<
  P.RuleProps & {
    /** Constructor for the token type we match. */
    tokenType?: P.TokenConstructor
  }
>
