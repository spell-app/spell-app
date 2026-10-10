import { proto } from "$/util"
import { P } from "$/parser"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `is_empty` rule:  `{lhs} is [not] empty` postfix, e.g. `thing is empty`.
 * - Compiles to `spellCore.isEmpty(lhs)`, negated for `is not empty`.
 */
export class IsEmpty extends PostfixOperatorSuffix<"operator"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isEmpty",
      args: [lhs!]
    })
  }
}
expressions.addRule(IsEmpty, {
  syntax: "(operator:is not? empty)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing is empty", "spellCore.isEmpty(thing)"],
        ["thing is not empty", "!spellCore.isEmpty(thing)"]
      ]
    }
  ]
})
