import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `is_gt_lt` rule:  `is greater than`, `is less than`, optionally `... or equal to`,
 * e.g. `salary is greater than expenses`.
 * - TODO: is *not* greater than???
 * - `getOperator()` maps `greater` / `less`, plus optional `or equal to`, to `greater than` / `less than` /
 *   `at least` / `at most`.
 * - `getAST()` below looks unreachable in practice, same as `gt_lt` above -- see `TODO` there.
 */
export class IsGtLt extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison
  @proto static parenthesize = true

  getOperator({ value }: P.Match): P.ASTOperator {
    const greater = String(value).includes("greater")
    if (String(value).includes("equal")) return greater ? "at least" : "at most"
    return greater ? "greater than" : "less than"
  }
  getAST(match: P.MatchFor<this>) {
    const { operator, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value,
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(IsGtLt, {
  syntax: "(operator:is (greater|less) than (or equal to)?) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("salary")
        scope.variables?.add("expenses")
      },
      tests: [
        ["salary is greater than expenses", "(salary > expenses)"],
        ["salary is greater than or equal to expenses", "(salary >= expenses)"],
        ["salary is less than expenses", "(salary < expenses)"],
        ["salary is less than or equal to expenses", "(salary <= expenses)"]
      ]
    }
  ]
})
