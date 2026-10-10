import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/** `is_exactly` rule:  `{lhs} is [not] exactly {rhs}`, e.g. `thing is exactly other` -- compiles to `===`/`!==`. */
export class IsExactly extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.equality
  @proto static parenthesize = true

  getOperator(operator: P.Match): P.ASTOperator {
    return operator.value === "is not exactly" ? "not exactly equals" : "exactly equals"
  }
}
expressions.addRule(IsExactly, {
  syntax: "(operator:is not? exactly) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is exactly other", "(thing === other)"],
        ["thing is not exactly other", "(thing !== other)"]
      ]
    }
  ]
})
