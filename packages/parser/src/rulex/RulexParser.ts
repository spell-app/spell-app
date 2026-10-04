/**
 * `Parser` subclass for `rulex` -- our regex-like syntax for defining other parsers' `rules`.
 * - Default rule is `sequence` (see `rulex.ts`), so `rulex.compile("foo? {bar}")` parses a whole rulex string.
 * - `compile()` is narrowed to always return a `Rule`, since that's the only thing rulex syntax can produce.
 * - The actual rule definitions (`symbol`, `keyword`, `subrule`, `list`, `choices`, `sequence`, ...) live in
 *   `rulex.ts`; this file only holds the parser class and its helper methods.
 */
import { P } from "$/parser"
// Import directly to avoid circular import
import { Parser } from "$/parser/Parser"
import { RulexTokenizer } from "./RulexTokenizer"

export class RulexParser extends Parser {
  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "sequence", writable: true })
  }

  /** Rulex reads syntax with its own plain tokenizer:  see `RulexTokenizer`. */
  get tokenizer(): P.Tokenizer {
    return this.derived("tokenizer", () => new RulexTokenizer({ whitespacePolicy: P.WhitespacePolicy.LEADING_ONLY }))
  }

  /**
   * Compile rulex syntax to a `Rule` -- narrows `Parser.compile()`'s `unknown` return type.
   * - Throws if ANY of the syntax is left unread, e.g. `(a|b` (unclosed choice) or a stray `)`:  a rule built
   *   from part of a syntax is a wrong rule, and used to come back without a word.
   */
  compile(input: string | P.Token | P.Token[], ruleName = this.defaultRule, scope = this.getScope()): P.Rule {
    const tokens = this.tokenize(input, ruleName) ?? []
    const match = this.parse(tokens, ruleName, scope)
    const read = match?.length ?? 0
    if (!match || read < tokens.length) {
      throw new P.ParserError({
        message: `rulex couldn't read \`${P.Tokenizer.join(tokens, read)}\` in \`${P.Tokenizer.join(tokens)}\``,
        context: this,
        activity: "compile",
        params: { input, ruleName }
      })
    }
    const rule = match.compile()
    if (!(rule instanceof P.Rule)) {
      throw new P.ParserError({
        message: "rulex.compile() did not produce a Rule",
        context: this,
        activity: "compile",
        params: { input, ruleName, result: rule }
      })
    }
    return rule
  }

  /**
   * Apply `repeatFlag` / `interval` / `matchGroup` groups from `match` onto `rule`.
   * - SIDE EFFECT: mutates `rule` directly for `matchGroup`.
   * - `repeatFlag` of `+` or `*`, or an `interval` (`{1,6}`), instead wraps `rule` in a new `P.Repeat` and returns
   *   that, since a single rule can't repeat on its own -- so the return value may not be `rule`.  A count from
   *   0 makes the repeat optional.
   * - Throws for a flag AND a count (`x?{2}`).
   * - `match` is typed loosely (just these groups, all optional) rather than any one caller's real `Groups`
   *   -- every rulex rule in `rulex.ts` that adorns itself with `matchGroup` / `repeatFlag`
   *   passes its own, differently-shaped match here, so callers need no casts.
   */
  applyFlags(rule: P.Rule, match: P.Match<P.GroupsFor<"repeatFlag?|matchGroup?|interval?">>): P.Rule {
    const repeatFlag = match.groups.repeatFlag?.compile()
    const matchGroup = match.groups.matchGroup?.compile()
    const interval = match.groups.interval?.compile() as RulexInterval | undefined
    if (repeatFlag && interval) {
      throw new P.ParserError({
        message: `rulex \`${P.Tokenizer.join(match.tokens)}\` has a flag AND a count:  use one`,
        context: this,
        activity: "compile",
        params: { repeatFlag, interval }
      })
    }

    // handle repeat, which may nest the rule in a repeat
    if (repeatFlag === "?") rule.optional = true
    else if (repeatFlag === "+") rule = new P.Repeat({ rule })
    else if (repeatFlag === "*") rule = new P.Repeat({ rule, optional: true })
    else if (interval) {
      rule = new P.Repeat({
        rule,
        minCount: interval.min,
        ...(interval.max !== undefined && { maxCount: interval.max }),
        ...(interval.min === 0 && { optional: true })
      })
    }

    if (typeof matchGroup === "string" && matchGroup) rule.matchGroup = matchGroup

    return rule
  }

  /**
   * Compile a rulex `sequence`'s parts (`items`), spaced as the syntax is written.
   * - A part with NO space before it in the syntax gets `spacing: "none"`:  it must touch the part before.
   * - `{space}` / `{spaces}` aren't rules:  each is dropped, and sets the next part's `spacing` to `one` /
   *   `some` (and owns that boundary, however the syntax spaces around it).
   * - Throws on a `{space}` / `{spaces}` that's named, flagged, first or last:  it has to sit between two parts.
   * - SIDE EFFECT:  sets `spacing` on the fresh rules it compiles.
   */
  compileSpacedParts(items: P.Match[]): P.Rule[] {
    const rules: P.Rule[] = []
    let pending: P.Spacing | undefined
    for (let i = 0, item: P.Match | undefined; (item = items[i]); i++) {
      const space = RulexParser.spaceMarker(item)
      if (space) {
        if (!rules.length || pending || !items[i + 1]) this.throwSpaceMisplaced(item)
        pending = space
        continue
      }
      const rule = RulexParser.compileMatchOrDie(item)
      if (pending) rule.spacing = pending
      else if (i > 0 && RulexParser.touching(items[i - 1]!)) rule.spacing = "none"
      pending = undefined
      rules.push(rule)
    }
    return rules
  }

  /** `{space}` => `one`, `{spaces}` => `some`, else `undefined`. */
  static spaceMarker(item: P.Match): P.Spacing | undefined {
    if (item.rule.name !== "subrule") return undefined
    const name = (item.groups.rule as P.Match | undefined)?.value
    if (name === "space") return "one"
    if (name === "spaces") return "some"
    return undefined
  }

  /** Is rulex `match` written with NO space after it, i.e. touching whatever follows? */
  static touching(match: P.Match) {
    return !match.tokens.at(-1)?.whitespace
  }

  /** Throw for a `{space}` / `{spaces}` that doesn't sit plainly between two parts. */
  throwSpaceMisplaced(item: P.Match): never {
    throw new P.ParserError({
      message: `rulex \`${P.Tokenizer.join(item.tokens)}\` must sit between two parts, unnamed and unflagged`,
      context: this,
      activity: "compile",
      params: { item }
    })
  }

  /**
   * Consolidate consecutive runs of `constructor` (`P.Keyword` / `P.Symbol`) literals in `rules` into a single
   * `GroupConstructor` (`P.Keywords` / `P.Symbols`) instance, so e.g. `a b c` compiles to one `Keywords`
   * instead of three separate `Keyword` sequence entries.
   * - Skips rules that are `isAdorned` (have a `matchGroup`) -- those must stay separate since
   *   the combined group can't carry a single rule's individual adornment.
   * - An optional literal within a run is combined too, but recorded as `{ literal, optional: true }` so the
   *   group knows that one entry is skippable.
   */
  consolidateLiterals(
    rules: P.Rule[],
    constructor: Class<P.Literal>,
    literalKey: "literal",
    GroupConstructor: Class<P.Rule> = constructor
  ): P.Rule[] {
    if (rules.length === 1) return rules

    const output: P.Rule[] = []
    for (let start = 0, rule: P.Rule | undefined; (rule = rules[start]); start++) {
      // TODO: inline `isAdorned`
      if (rule instanceof constructor && !rule.isAdorned) {
        // find the end of the run
        let end = start
        for (let next: P.Rule | undefined; (next = rules[end + 1]); end++) {
          if (!(next instanceof constructor && !next.isAdorned)) break
        }
        if (end > start) {
          // combine literals into a single map;  the run's own spacing is its first literal's
          const run = rules.slice(start, end + 1)
          const literals: Array<string | string[] | P.LiteralMatcher> = run.map((nextRule, index) => {
            const literal = (nextRule as P.Literal)[literalKey]
            const spacing = index > 0 ? nextRule.spacing : undefined
            if (!nextRule.optional && !spacing) return literal

            // make sure optionals are arrays and add the optional flag to the array
            return { literal, ...(nextRule.optional && { optional: true }), ...(spacing && { spacing }) }
          })
          rule = new GroupConstructor(literals)
          if (run[0]!.spacing) rule.spacing = run[0]!.spacing
          start = end
        }
      }
      output.push(rule)
    }
    return output
  }

  /** Compile a rulex sub-`match`, which must yield a `Rule`. */
  static compileMatchOrDie(match: P.Match | undefined): P.Rule {
    const rule = match?.compile()
    if (!(rule instanceof P.Rule)) {
      throw new P.ParserError({
        message: "Expected rulex match to compile to a Rule",
        context: "rulex",
        activity: "compileMatchOrDie",
        params: { match, result: rule }
      })
    }
    return rule
  }
}

/** A rulex count, `{n}` / `{n,m}` / `{n,}`:  `max` undefined for "n or more". */
export type RulexInterval = { min: number; max: number | undefined }
