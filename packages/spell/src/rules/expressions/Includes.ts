import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `includes` rule:  `{lhs} includes`/`contains {rhs}`, e.g. `theList includes thing`.
 * - Compiles to `spellCore.includes(lhs, rhs)`.
 */
export class Includes extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(Includes, {
  syntax: "(operator:includes|contains) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("theList")
        scope.variables?.add("thing")
      },
      tests: [
        ["theList includes thing", "spellCore.includes(theList, thing)"],
        ["theList contains thing", "spellCore.includes(theList, thing)"]
      ]
    }
  ]
})
