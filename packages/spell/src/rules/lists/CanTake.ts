import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { type GuardOperands } from "./lists.shared"

/**
 * `can_take` rule:  `{list} can take {thing}` -- would the list take it, moved there?  Its guard says:
 * `a tableau can take a card if: ...`.  Yes, if it has none.
 * - `add` ~== `take`;  `can't`, `cannot` for the opposite.
 * - Compiles to `spellCore.canTake(tableau, card)`.
 */
export class CanTake extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  compileASTExpression(match: P.Match, { lhs, rhs }: GuardOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "canTake", args: [lhs!, rhs!] })
  }
}
lists.addRule(CanTake, {
  syntax: "{operator:can} (add|take) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
        scope.variables?.add("tableau")
      },
      tests: [
        ["tableau can take card", "spellCore.canTake(tableau, card)"],
        ["tableau can add card", "spellCore.canTake(tableau, card)"],
        ["tableau cannot take card", "!spellCore.canTake(tableau, card)"]
      ]
    }
  ]
})
