import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `and` rule:  `{lhs} and {rhs}`, e.g. `thing and other`
 *   -- `Precedence.and`:  below `is` / `includes` etc, above `or`.
 */
export class And extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.and
  @proto static parenthesize = true

  getOperator(): P.ASTOperator {
    return "and"
  }
}
expressions.addRule(And, {
  syntax: "(operator:and) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
        scope.variables?.add("yet-another")
      },
      tests: [
        ["thing and other", "(thing && other)"],
        ["thing and other and yet-another", "((thing && other) && yetAnother)", "(thing && other && yetAnother)"],
        ["thing is 1 and other is 2", "((thing == 1) && (other == 2))", "(thing == 1 && other == 2)"]
      ]
    }
  ]
})
