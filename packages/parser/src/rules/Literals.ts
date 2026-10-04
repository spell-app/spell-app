import { P } from "$/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Abstract rule for to match one or more sequential literal tokens.
 * NOTE: Don't use this -- use `Keywords` or `Symbols` instead!
 *
 * - `rule.literals` is the array of Literals to match.
 * - After matching, `match.value` will be the literal string matched.
 */
export abstract class Literals<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<P.LiteralsProps, Groups, MatchData> {
  /** Literals to match in order -- normalized from constructor input into `{ literal, optional? }` matchers. */
  declare literals: P.LiteralMatcher[]
  /**
   * String to join matched literals with in `toRulexSyntax()` -- a space, unless a subclass says otherwise,
   * e.g. `Symbols` uses `""`.
   * - NEVER left unset:  `[...].join(undefined)` joins with `","`, e.g. `(Card|card),(Suits|suits)`.
   */
  declare literalSeparator: string

  /** Class-level `literals`, for rules defined as classes -- declare as `@proto static`. */
  static literals?: Array<string | string[] | P.LiteralMatcher>

  static {
    /** Join literals with a single space in-between, by default -- e.g. for `EnumerationRule`. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: " ",
      writable: true
    })
  }

  /** Bare string / array shorthand sets `literals` directly, otherwise pass a full `LiteralsProps` bag. */
  constructor(input: P.LiteralsProps | string | Array<string | string[] | P.LiteralMatcher>) {
    const props = (typeof input === "string" || Array.isArray(input) ? { literals: input } : input) as P.LiteralsProps
    if (typeof props.literals === "string") props.literals = [props.literals]
    // NOTE: no `literals` when they're coming from `syntax` -- `Rule` constructor decomposes it.
    if (props.literals) props.literals = props.literals.map(makeMatcher)
    super(props)
    // Class-level (`@proto static`) literals haven't been through `makeMatcher` -- give instance its own normalized list.
    if (!Object.hasOwn(this, "literals") && Array.isArray(this.literals)) this.literals = this.literals.map(makeMatcher)
    // CLAUDE TODO: make this an assert?
    if (!Array.isArray(this.literals)) {
      console.info(props)
      // oxlint-disable-next-line typescript/no-misused-spread
      console.info({ ...this })
      console.trace()
    }

    function makeMatcher(matcher: string | string[] | P.LiteralMatcher): P.LiteralMatcher {
      if (typeof matcher === "string" || Array.isArray(matcher)) return { literal: matcher }
      return matcher
    }
  }

  /** `true` if `matchAtStart()` consumed at least one token at `start`. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return this.matchAtStart(tokens, start) > 0
  }

  /**
   * Return the number of tokens matched at `start` or `0` if no match.
   * - NOTE: this must match ALL non-optional literals in order.
   */
  matchAtStart(tokens: P.Token[], start = 0) {
    for (let i = 0, matcher; (matcher = this.literals[i]); i++) {
      // a later literal's `spacing` is about the token we matched just before it
      const spacedRight = start === 0 || P.spacingAllows(tokens[start - 1], matcher.spacing)
      const matched = spacedRight && tokens[start]?.matchesLiteral(matcher.literal)
      if (matched) start++
      else if (!matcher.optional) return 0
    }
    return start
  }

  /** Match all our `literals` in sequence, starting at the beginning of `tokens`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const tokensMatched = this.matchAtStart(tokens, 0)
    if (!tokensMatched) return undefined
    const matched = tokens.slice(0, tokensMatched)
    return new P.Match({
      rule: this,
      matched,
      value: matched.join("").trim(),
      tokens: [...matched],
      scope
    })
  }

  /** Output is just the matched `match.value`. */
  compile(match: P.MatchFor<this>) {
    return match.value
  }

  /** Return rulex string for this rule, joining literals with `literalSeparator` and applying rule flags. */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()

    const literalStrings = this.literals
      .map(({ literal, optional }) => {
        // rulex's own specials (`\[`, `\*` ...) escaped, so the syntax reads back the same
        literal = typeof literal === "string" ? P.escapeRulex(literal) : literal.map(P.escapeRulex)
        // Parens around alternatives, else `(else|otherwise) if` would read as `else|otherwise if`.
        if (typeof literal !== "string" && literal.length > 1) return `(${literal.join("|")})${optional ? "?" : ""}`
        const matchString = typeof literal === "string" ? literal : literal.join("|")
        if (optional) return `(${matchString})?`
        return matchString
      })
      .join(this.literalSeparator)

    const wrapInParens = matchGroup || (optional && this.literals.length > 1)
    if (wrapInParens) return `(${matchGroup}${literalStrings})${optional}`
    return `${literalStrings}${optional}`
  }
}
