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
    if (!match) {
      throw new P.ParserError({
        message: "Can't parse input",
        context: this,
        activity: "compile",
        params: { input, ruleName, scope }
      })
    }
    if (match.length < tokens.length) {
      throw new P.ParserError({
        message: `rulex couldn't read \`${P.Tokenizer.join(tokens, match.length)}\` in \`${P.Tokenizer.join(tokens)}\``,
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
   * Apply `repeatFlag` / `matchGroup` groups from `match` onto `rule`.
   * - SIDE EFFECT: mutates `rule` directly for `matchGroup`.
   * - `repeatFlag` of `+` or `*` instead wraps `rule` in a new `P.Repeat` and returns that, since a single
   *   rule can't represent "one or more" / "zero or more" on its own -- so the return value may not be `rule`.
   * - `match` is typed loosely (just these 2 groups, both optional) rather than any one caller's real `Groups`
   *   -- every rulex rule in `rulex.ts` that adorns itself with `matchGroup` / `repeatFlag`
   *   passes its own, differently-shaped match here, so callers need no casts.
   */
  applyFlags(rule: P.Rule, match: P.Match<P.GroupsFor<"repeatFlag?|matchGroup?">>): P.Rule {
    const repeatFlag = match.groups.repeatFlag?.compile()
    const matchGroup = match.groups.matchGroup?.compile()

    // handle repeat, which may nest the rule in a repeat
    if (repeatFlag === "?") rule.optional = true
    else if (repeatFlag === "+") rule = new P.Repeat({ rule })
    else if (repeatFlag === "*") rule = new P.Repeat({ rule, optional: true })

    if (typeof matchGroup === "string" && matchGroup) rule.matchGroup = matchGroup

    return rule
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
          // combine literals into a single map
          const literals: Array<string | string[] | P.LiteralMatcher> = rules.slice(start, end + 1).map((nextRule) => {
            const literal = (nextRule as P.Literal)[literalKey]
            if (!nextRule.optional) return literal

            // make sure optionals are arrays and add the optional flag to the array
            return { literal, optional: true }
          })
          rule = new GroupConstructor(literals)
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
