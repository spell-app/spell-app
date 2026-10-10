import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `does_not_include` rule:  `{lhs} does not include`/`contain {rhs}`, e.g. `theList does not include thing`.
 * - Always negates via `shouldNegateOutput()`, then delegates to same `spellCore.includes()` as `includes`.
 */
export class DoesNotInclude extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(): boolean {
    return true
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(DoesNotInclude, {
  syntax: "(operator:does not (include|contain)) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("theList")
        scope.variables?.add("thing")
      },
      tests: [
        ["theList does not include thing", "!spellCore.includes(theList, thing)"],
        ["theList does not contain thing", "!spellCore.includes(theList, thing)"]
      ]
    }
  ]
})
