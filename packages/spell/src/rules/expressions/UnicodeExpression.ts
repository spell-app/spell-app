import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { SpellExpression } from "./SpellExpression"
import { expressions } from "./expressions.parser"

/**
 * `unicode_expression` rule:  `unicode code` -- the character with a code point worked out as the program runs
 * (epic page `outline-spell`, P26).
 * - e.g. `unicode the code`, `unicode (base + 1)`:  the number, not hex.
 * - Compiles to `core.unicode(code)`:  `""` for what's no code point.
 * - One written out, `unicode 1F0A0`, is `unicode_literal`'s.
 */
export class UnicodeExpression extends SpellExpression<"code"> {
  @proto static datatype = "text"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "unicode", args: [P.matchAST(match.groups.code)] })
  }
}
expressions.addRule(UnicodeExpression, {
  syntax: "unicode {code:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("code")
      },
      tests: [
        ["unicode code", "core.unicode(code)"],
        ["unicode (code + 1)", "core.unicode(code + 1)"]
      ]
    }
  ]
})
