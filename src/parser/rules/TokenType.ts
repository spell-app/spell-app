import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Abstract rule for matching a single token of a particular type.
 * - (optional) `blacklist` lists token values we will NOT accept, e.g. rulex's unescaped `symbol`
 *   refusing `|` and `)` so `choices` can see them.
 */
export class TokenType<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<TokenTypeProps, Groups, MatchData> {
  /** Class-level `tokenType`, for rules defined as classes -- declare as `@proto static`. */
  static tokenType?: P.TokenConstructor

  /** Token values we will NOT accept, e.g. `["|", ")"]`. */
  declare blacklist: string[] | undefined

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

  /** `true` if token at `start` is an instance of `this.tokenType` and not in `this.blacklist`. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    const token = tokens[start]
    if (!(token instanceof this.tokenType)) return false
    return !this.blacklist?.includes(token.value as string)
  }

  /** Match a single token whose type is `this.tokenType`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!this.test(scope, tokens, 0)) return undefined
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
  compile(match: P.MatchFor<this>) {
    return match.value
  }
}

/** Props bag accepted by `TokenType`'s constructor. */
export type TokenTypeProps = Prettify<
  P.RuleProps & {
    /** Constructor for the token type we match. */
    tokenType?: P.TokenConstructor
    /** Token values we will NOT accept, e.g. `["|", ")"]`. */
    blacklist?: string[]
  }
>
