import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `or` rule:  `{lhs} or {rhs}`, e.g. `thing or other`
 *   -- `Precedence.or`:  lowest of the boolean / comparison suffixes.
 */
export class Or extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.or
  @proto static parenthesize = true

  getOperator(): P.ASTOperator {
    return "or"
  }
}
expressions.addRule(Or, {
  syntax: "(operator:or) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [["thing or other", "(thing || other)"]]
    }
  ]
})
