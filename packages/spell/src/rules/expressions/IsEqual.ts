import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/** `is_equal` rule:  `{lhs} is [not] {rhs}`, e.g. `thing is other` -- compiles to `==`/`!=`. */
export class IsEqual extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.equality
  @proto static parenthesize = true

  getOperator(operator: P.Match): P.ASTOperator {
    return operator.value === "is not" ? "not equals" : "equals"
  }
}
expressions.addRule(IsEqual, {
  syntax: "(operator:is not?) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is other", "(thing == other)"],
        ["thing is not other", "(thing != other)"]
      ]
    }
  ]
})
