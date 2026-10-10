import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `times` rule:  `*` / `times`, e.g. `price * taxRate` -- `Precedence.product`, tightest, alongside `/`.
 */
export class Times extends InfixOperatorSuffix {
  @proto static precedence = Precedence.product
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOperator(): P.ASTOperator {
    return "times"
  }
}
math.addRule(Times, {
  syntax: "(operator:*|times) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("taxRate")
      },
      tests: [
        ["price*taxRate", "(price * taxRate)"],
        ["price * taxRate", "(price * taxRate)"],
        ["price times taxRate", "(price * taxRate)"]
      ]
    }
  ]
})
