import { Prettify } from "~/types.js"
import { Match } from "~/parser/Match.js"
import type { Token } from "~/parser/tokenizer/Tokens.js"
import { Rule, type RuleProps, type Scope } from "./Rule.js"

export type LiteralProps = Prettify<
  RuleProps & {
    literal: string | string[]
    isEscaped?: boolean
  }
>

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
 * NOTE: Don't use this -- use `Rules.Keyword` or `Rules.Symbol` instead!
 */
export abstract class Literal extends Rule<LiteralProps> {
  /** Literal string or array of literal strings to match. */
  declare literal: string | string[]
  /** Whether the literal must be escaped when converting to rulex syntax. */
  declare isEscaped: boolean | undefined

  constructor(props: LiteralProps | string | string[]) {
    if (Array.isArray(props) || typeof props === "string") {
      super({ literal: props } as LiteralProps)
    } else super(props)
  }

  testAtStart(scope: Scope, tokens: Token[], start = 0) {
    if (start >= tokens.length) return false
    return tokens[start].matchesLiteral(this.literal)
  }

  parse(scope: Scope, tokens: Token[]) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new Match({
      rule: this,
      matched: [tokens[0]],
      value: tokens[0].value,
      tokens: [tokens[0]],
      length: 1,
      scope
    })
  }

  compile(match: Match) {
    return match.value
  }

  toRulexSyntax() {
    const isVariable = Array.isArray(this.literal)
    let literalString = this.literal
    if (isVariable) literalString = (this.literal as string[]).join("|")
    else if (this.isEscaped) literalString = `\\${this.literal}`

    const { testLocation, argument, optional } = this.getRulexFlags()
    const wrapInParens = isVariable || argument || (this.isEscaped && optional)
    if (wrapInParens) return `${testLocation}(${argument}${literalString})${optional}`
    return `${testLocation}${literalString}${optional}`
  }
}

/**
 * Rule which matches a single literal keyword string token.
 */
export class Keyword extends Literal {}

/**
 * Rule which matches a single literal symbol string token.
 */
export class Symbol extends Literal {}
