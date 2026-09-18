import { Match } from "~/parser/Match"
import type { P } from "~/parser"
import { R } from "./index"
import { Rule } from "./Rule"

export type LiteralMatcher = { literal: string | string[]; optional?: boolean }

export type LiteralsProps = Prettify<
  R.RuleProps & {
    literals: Array<string | string[] | LiteralMatcher>
  }
>

function makeMatcher(matcher: string | string[] | LiteralMatcher): LiteralMatcher {
  if (typeof matcher === "string" || Array.isArray(matcher)) return { literal: matcher }
  return matcher
}

/**
 * Abstract rule for to match one or more sequential literal tokens.
 * - `rule.literals` is the array of Literals to match.
 *
 * After matching, `match.value` will be the literal string matched.
 *
 * NOTE: Don't use this -- use `R.Keywords` or `R.Symbols` instead!
 */
export abstract class Literals extends Rule<LiteralsProps> {
  declare literals: LiteralMatcher[]
  declare literalSeparator: string

  constructor(input: LiteralsProps | string | Array<string | string[] | LiteralMatcher>) {
    const props = (typeof input === "string" || Array.isArray(input) ? { literals: input } : input) as LiteralsProps
    if (typeof props.literals === "string") props.literals = [props.literals]
    props.literals = props.literals.map(makeMatcher)
    super(props)
    // CLAUDE TODO: make this an assert?
    if (!Array.isArray(this.literals)) {
      console.info(props)
      // oxlint-disable-next-line typescript/no-misused-spread
      console.info({ ...this })
      console.trace()
    }
  }

  testAtStart(scope: P.Scope, tokens: P.Token[], start = 0) {
    return this.matchAtStart(tokens, start) > 0
  }

  /**
   * Return the number of tokens matched at `start` or `0` if no match.
   * - NOTE: this must match ALL non-optional literals in order.
   */
  matchAtStart(tokens: P.Token[], start = 0) {
    for (let i = 0, matcher; (matcher = this.literals[i]); i++) {
      const matched = tokens[start]?.matchesLiteral(matcher.literal)
      if (matched) start++
      else if (!matcher.optional) return 0
    }
    return start
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const tokensMatched = this.matchAtStart(tokens, 0)
    if (!tokensMatched) return undefined
    const matched = tokens.slice(0, tokensMatched)
    return new Match({
      rule: this,
      matched,
      value: matched.join("").trim(),
      tokens: [...matched],
      scope
    })
  }

  compile(match: Match) {
    return match.value
  }

  toRulexSyntax() {
    const { testLocation, argument, optional } = this.getRulexFlags()

    const literalStrings = this.literals
      .map(({ literal, optional }) => {
        const matchString = typeof literal === "string" ? literal : literal.join("|")
        if (optional) return `(${matchString})?`
        return matchString
      })
      .join(this.literalSeparator)

    const wrapInParens = argument || ((testLocation || optional) && this.literals.length > 1)
    if (wrapInParens) return `${testLocation}(${argument}${literalStrings})${optional}`
    return `${testLocation}${literalStrings}${optional}`
  }
}

// One or more literal symbols: `<`, `%` etc.
// Symbols join WITHOUT spaces.
export class Symbols extends Literals {
  static {
    /** Join symbols with no space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: "",
      writable: true
    })
  }
}

// One or more literal keywords.
// Keywords join WITH spaces.
export class Keywords extends Literals {
  static {
    /** Join symbols with a single space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: " ",
      writable: true
    })
  }
}
