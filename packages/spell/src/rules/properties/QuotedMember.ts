import { proto } from "$/util"
import { P } from "$/parser"
import { MEMBER_LEADING_WORDS, MEMBER_STOP_WORDS } from "./properties.shared"
import { properties } from "./properties.parser"

/**
 * `quoted_member` rule:  a member's name in quotes, where it's being declared:
 *   `its "suit" is one of ...` in an outline-style type's body
 *   -- the outline style's "quotes teach a new word" (plan doc `outline-spell`).
 * - The words inside are a `member_words` name, every one of them:  `value` and `raw` as `member_words`'s,
 *   e.g. `short_rank` / `short rank`.
 */
export class QuotedMember extends P.Rule {
  @proto static highlightAs: P.HighlightKind = "property"

  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return QuotedMember.wordsOf(tokens[start]) !== undefined
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const [token] = tokens
    const words = QuotedMember.wordsOf(token)
    if (!token || !words) return undefined
    return new P.Match({
      rule: this,
      matched: [token],
      raw: words.join(" "),
      value: words.map((word) => word.replace(/-/g, "_")).join("_"),
      tokens: [token],
      scope
    })
  }

  compile(match: P.MatchFor<this>) {
    return match.value
  }

  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }

  /** A declaration names the member without its quotes, e.g. `short rank`. */
  declaredText(match: P.Match): string {
    return `${match.raw}`
  }

  /** The words inside `token`'s quotes, if it's a text token holding only member words -- else `undefined`. */
  private static wordsOf(token: P.Token | undefined): string[] | undefined {
    if (!(token instanceof P.TextToken)) return undefined
    const words = token.innerText.trim().split(/\s+/)
    const isMemberWord = (word: string, index: number) => {
      const lower = word.toLowerCase()
      return (
        QUOTED_MEMBER_WORD.test(word) &&
        (!MEMBER_STOP_WORDS.has(lower) || (index === 0 && MEMBER_LEADING_WORDS.has(lower)))
      )
    }
    return words[0] && words.every(isMemberWord) ? words : undefined
  }
}
properties.addRule(QuotedMember, {
  tests: [
    {
      tests: [
        { title: "one word", input: '"rank"', js: "rank" },
        { title: "several words", input: '"short rank"', js: "shortRank" },
        { title: "dashed", input: '"short-rank"', js: "shortRank" },
        { title: "a leading preposition", input: '"with jokers"', js: "withJokers" },
        { title: "a structural word", input: '"rank of"', js: undefined }
      ]
    }
  ]
})

/** A word `quoted_member` takes inside its quotes. */
const QUOTED_MEMBER_WORD = /^[A-Za-z][\w-]*$/
