import { NONE } from "$/util"
import { P } from "$/parser"
import { types } from "./types.parser"
import { SpellType } from "./SpellType"

/**
 * `quoted_type` rule:  a type's name in quotes, where it's being declared:  `a "card" is a thing where:`
 * -- the outline style's "quotes teach a new word" (plan doc `outline-spell`).
 * - e.g. `"card"` in `a "card" is a thing where:`
 * - One word (dashes OK) inside straight quotes, not blacklisted;  a `SpellType` match like `card` would be.
 * - `raw` is the name without its quotes, e.g. `card`.
 */
export class QuotedType extends SpellType {
  /** A text token whose inside is one type word. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return QuotedType.nameOf(tokens[start], this.blacklist) !== undefined
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const [token] = tokens
    const raw = QuotedType.nameOf(token, this.blacklist)
    if (!token || raw === undefined) return undefined
    const match: P.MatchFor<this> = new P.Match({
      rule: this,
      matched: [token],
      raw,
      value: this.mapValue(raw),
      tokens: [token],
      scope
    })
    match.data.scopeType = scope.types?.get(match.value) ?? NONE
    return match
  }

  /** A declaration names the type without its quotes, e.g. `card`. */
  declaredText(match: P.Match): string {
    return `${match.raw}`
  }

  /** The one word inside `token`'s quotes, if it's a text token holding just that -- else `undefined`. */
  private static nameOf(token: P.Token | undefined, blacklist: P.IdentifierBlacklist | undefined): string | undefined {
    if (!(token instanceof P.TextToken)) return undefined
    const name = token.innerText
    if (!QUOTED_TYPE_NAME.test(name) || blacklist?.[name.toLowerCase()]) return undefined
    return name
  }
}
types.addRule(QuotedType, {
  tests: [
    {
      tests: [
        { title: "a quoted word", input: '"card"', js: "Card" },
        { title: "dashed", input: '"bank-account"', js: "Bank_Account" },
        { title: "two words", input: '"playing card"', js: undefined },
        { title: "blacklisted word", input: '"if"', js: undefined }
      ]
    }
  ]
})

/** What `quoted_type` takes inside its quotes:  one word, dashes OK. */
const QUOTED_TYPE_NAME = /^[A-Za-z][\w-]*$/
