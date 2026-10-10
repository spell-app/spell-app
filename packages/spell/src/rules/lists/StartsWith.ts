import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `starts_with` rule:  does list start with some value,
 * e.g. `my-list starts with thing` => `spellCore.startsWith(my_list, thing)`.
 * - `Precedence.comparison`, like the other comparisons.
 */
export class StartsWith extends InfixOperatorSuffix<"operator|expression"> {
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
      methodName: "startsWith",
      args: [lhs!, rhs!]
    })
  }
}
lists.addRule(StartsWith, {
  syntax: "(operator:starts with|does not start with|doesnt start with|doesn't start with) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        ["my-list starts with thing", "spellCore.startsWith(myList, thing)"],
        ["[1,2,3] starts with 1", "spellCore.startsWith([1, 2, 3], 1)"],
        ["[1,2,3] does not start with 10", "!spellCore.startsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesn't start with 10", "!spellCore.startsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesnt start with 10", "!spellCore.startsWith([1, 2, 3], 10)"]
      ]
    }
  ]
})
