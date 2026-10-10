import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { type GuardOperands } from "./lists.shared"

/**
 * `can_give_up` rule:  `{list} can give up {thing}` -- would the list give it up, moved elsewhere?  Its guard says:
 * `a stock-pile can give up a card if: ...`.  Yes, if it has none.
 * - `release` ~== `remove` ~== `give up` ~== `let go of`;  `can't`, `cannot` for the opposite.
 * - Compiles to `spellCore.canGiveUp(stock, card)`.
 */
export class CanGiveUp extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  compileASTExpression(match: P.Match, { lhs, rhs }: GuardOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "canGiveUp", args: [lhs!, rhs!] })
  }
}
lists.addRule(CanGiveUp, {
  syntax: "{operator:can} (release|remove|give up|let go of) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
        scope.variables?.add("stock")
      },
      tests: [
        ["stock can give up card", "spellCore.canGiveUp(stock, card)"],
        ["stock can let go of card", "spellCore.canGiveUp(stock, card)"],
        ["stock can't release card", "!spellCore.canGiveUp(stock, card)"]
      ]
    }
  ]
})
