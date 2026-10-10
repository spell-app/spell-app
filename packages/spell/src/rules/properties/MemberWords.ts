import { proto } from "$/util"
import { P } from "$/parser"
import { MEMBER_LEADING_WORDS, MEMBER_STOP_WORDS } from "./properties.shared"
import { properties } from "./properties.parser"

/**
 * `member_words` rule:  1..N words naming a member, e.g. `short rank`, `short-rank`, `rank`.
 * - Every word up to the first STRUCTURAL one (`MEMBER_STOP_WORDS`),
 *   e.g. `of` in `the short rank of a card is:`.  No other bound.
 * - NOT the identifier blacklist:  `short` and `long` are fine.  Safe, as:
 *   - a READ takes these words only if the type it reads from declares them (`property_expression`)
 *   - a declaration's words sit between fixed ones, e.g. `the ... of a card is`
 * - `value` is its name as it compiles:  its words joined by `_`, dashes too,
 *   e.g. `short_rank` for `short rank` or `short-rank` -- so either spelling finds the same member.
 * - `raw` is its words as written, e.g. `short rank`.
 * - Greedy:  a rule wanting FEWER, e.g. the longest run a type declares (`its short rank + 1`),
 *   re-parses with fewer tokens -- see `declaredPrefix()`.
 */
export class MemberWords extends P.Pattern {
  /** Any case, unlike `property`:  a class variable is Type_Case, e.g. `Card Suits`. */
  @proto static pattern = P.ALPHANUMERIC_WORD_WITH_DASHES
  @proto static highlightAs: P.HighlightKind = "property"

  /** Does a member's word start at `start`:  a word, not a structural one -- or one which may lead a name? */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return start < tokens.length && MemberWords.isMemberWord(tokens[start]!, this.pattern, true)
  }

  /** Every member word from the first token on -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    let count = 0
    while (count < tokens.length && MemberWords.isMemberWord(tokens[count]!, this.pattern, count === 0)) count++
    if (!count) return undefined
    const words = tokens.slice(0, count)
    return new P.Match({
      rule: this,
      matched: words,
      raw: words.map((token) => token.value).join(" "),
      value: words.map((token) => `${token.value}`.replace(/-/g, "_")).join("_"),
      tokens: words,
      scope
    })
  }

  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }

  /**
   * Is `token` one of a member's words:  matches `pattern`, and isn't structural?  See `MEMBER_STOP_WORDS`.
   * - `first`:  the name's first word, which may also be one of `MEMBER_LEADING_WORDS`,
   *   e.g. `with` in `with jokers`.
   */
  private static isMemberWord(token: P.Token, pattern: RegExp, first = false): boolean {
    if (!(token instanceof P.WordToken) || !token.matchesPattern(pattern)) return false
    const word = `${token.value}`.toLowerCase()
    return !MEMBER_STOP_WORDS.has(word) || (first && MEMBER_LEADING_WORDS.has(word))
  }
}
properties.addRule(MemberWords, {
  tests: [
    {
      tests: [
        { title: "one word", input: "rank", js: "rank" },
        { title: "several words", input: "short rank", js: "short_rank" },
        { title: "a blacklisted word", input: "short", js: "short" },
        { title: "dashed", input: "short-rank", js: "short_rank" },
        { title: "a structural word", input: "of", js: undefined },
        { title: "a leading preposition", input: "with jokers", js: "with_jokers" },
        { title: "a preposition after the first word ends it", input: "jokers with", js: "jokers" }
      ]
    }
  ]
})
