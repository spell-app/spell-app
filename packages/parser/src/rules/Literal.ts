import { P } from "$/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Abstract rule to match a single literal string token.
 * - `rule.literal` is either:
 *    - a single string to match, or
 *    - array of strings, any of which will work.
 * - `rule.isEscaped` will be `true` if the literal must be escaped when converting to rulex syntax.
 *
 * After matching, `match.value` will be the literal string matched.
 *
 * For convenience, you can pass a single string or array of strings to the constructor
 * to automatically set the `literal` property.
 *
 * NOTE: Don't use this -- use `Keyword` or `Symbol` instead!
 */
export abstract class Literal<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<P.LiteralProps, Groups, MatchData> {
  /** Literal string or array of literal strings to match. */
  declare literal: string | string[]
  /** Whether the literal must be escaped when converting to rulex syntax. */
  declare isEscaped: boolean | undefined
  /** Match any case (rulex `/i`):  `note` matches `NOTE`, `Note`. */
  declare caseInsensitive: boolean | undefined

  /** Class-level `literal`, for rules defined as classes -- declare as `@proto static`. */
  static literal?: string | string[]

  /** Bare string / array shorthand sets `literal` directly, otherwise pass a full `LiteralProps` bag. */
  constructor(props: P.LiteralProps | string | string[]) {
    if (Array.isArray(props) || typeof props === "string") {
      super({ literal: props } as P.LiteralProps)
    } else super(props)
  }

  /**
   * `true` if token at `start` equals `this.literal` (or one of them, when it's an array).
   * - `caseInsensitive` (rulex `/i`):  compares lowercased;  the match still keeps the input's own case.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (start >= tokens.length) return false
    const token = tokens[start]
    if (!this.caseInsensitive) return token.matchesLiteral(this.literal)
    if (typeof token.value !== "string") return false
    const value = token.value.toLowerCase()
    const literals = Array.isArray(this.literal) ? this.literal : [this.literal]
    return literals.some((literal) => String(literal).toLowerCase() === value)
  }

  /** Match a single token literally against `this.literal`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!this.test(scope, tokens, 0)) return undefined
    return new P.Match({
      rule: this,
      matched: [tokens[0]],
      value: tokens[0].value,
      tokens: [tokens[0]],
      scope
    })
  }

  /** Output is just the matched `match.value`. */
  compile(match: P.MatchFor<this>) {
    return match.value
  }

  /** Return rulex string for this rule, escaping / wrapping in parens as `isEscaped` and rule flags require. */
  toRulexSyntax() {
    const isVariable = Array.isArray(this.literal)
    let literalString = this.literal
    if (isVariable) literalString = (this.literal as string[]).join("|")
    else if (this.isEscaped) literalString = `\\${this.literal}`

    const { matchGroup, optional } = this.getRulexFlags()
    const caseFlag = this.caseInsensitive ? "/i" : ""
    const wrapInParens = isVariable || matchGroup || (this.isEscaped && optional)
    if (wrapInParens) return `(${matchGroup}${literalString})${caseFlag}${optional}`
    return `${literalString}${caseFlag}${optional}`
  }
}
