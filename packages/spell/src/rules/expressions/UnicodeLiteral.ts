import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellExpression } from "./SpellExpression"
import { expressions } from "./expressions.parser"

/**
 * `unicode_literal` rule:  `unicode 1F0A0` -- the character with that code point, written in hex
 * (epic page `outline-spell`, P26).
 * - e.g. `unicode 1F0A0` is `"🂠"`, `unicode 2665` is `"♥"`:  hex, as `U+2665` is.
 * - Compiles straight to the character, the same in every target.
 * - A number worked out as the program runs is `unicode_expression`'s:  `unicode the code`.
 */
export class UnicodeLiteral extends SpellExpression<"code"> {
  @proto static priority = Priority.specific
  @proto static datatype = "text"

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    return new P.ASTStringLiteral(match, { value: String.fromCodePoint(match.groups.code.value as number), quote: '"' })
  }
}
expressions.addRule(UnicodeLiteral, {
  syntax: "unicode {code:unicode_code}",
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["unicode 1F0A0", '"🂠"'],
        ["unicode 2665", '"♥"'],
        ["unicode A0", '" "'],
        ["unicode 110000", "core.unicode(110000)"]
      ]
    }
  ]
})
