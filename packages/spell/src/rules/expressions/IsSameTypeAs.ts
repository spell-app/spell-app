import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `is_same_type_as` rule:  `{lhs} is [not] the same type as {rhs}`, e.g. `thing is the same type as other`.
 * - `shouldNegateOutput()` handles `is not the same type as`.
 * - Compiles to `spellCore.matchesType(lhs, rhs)`.
 */
export class IsSameTypeAs extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "matchesType",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(IsSameTypeAs, {
  syntax: "(operator:is not? the same type as) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is the same type as other", "spellCore.matchesType(thing, other)"],
        ["thing is not the same type as other", "!spellCore.matchesType(thing, other)"]
      ]
    }
  ]
})
