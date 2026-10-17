import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `ends_with` rule:  does list end with some value,
 * e.g. `my-list ends with thing` => `spellCore.endsWith(myList, thing)`.
 */
export class EndsWith extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  /** Negate result for the `does not` / `doesnt` / `doesn't` spellings of `operator`. */
  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value.includes("not") || operator.value.includes("doesn")
  }
  compileASTExpression(
    match: P.Match,
    { lhs, rhs }: { lhs?: P.ASTExpression; rhs?: P.ASTExpression }
  ): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "endsWith",
      args: [lhs!, rhs!]
    })
  }
}
lists.addRule(EndsWith, {
  syntax: "(operator:ends with|does not end with|doesnt end with|doesn't end with) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        ["my-list ends with thing", "spellCore.endsWith(myList, thing)"],
        ["[1,2,3] ends with 1", "spellCore.endsWith([1, 2, 3], 1)"],
        ["[1,2,3] does not end with 10", "!spellCore.endsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesnt end with 10", "!spellCore.endsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesn't end with 10", "!spellCore.endsWith([1, 2, 3], 10)"]
      ]
    }
  ]
})
