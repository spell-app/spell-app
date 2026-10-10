import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `divided_by` rule:  `/` / `divided by`, e.g. `price / taxRate` -- `Precedence.product`, same as `*`.
 */
export class DividedBy extends InfixOperatorSuffix {
  @proto static precedence = Precedence.product
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOperator(): P.ASTOperator {
    return "divided by"
  }
}
math.addRule(DividedBy, {
  syntax: "(operator:/|divided by) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("taxRate")
      },
      tests: [
        ["price/taxRate", "(price / taxRate)"],
        ["price / taxRate", "(price / taxRate)"],
        ["price divided by taxRate", "(price / taxRate)"]
      ]
    }
  ]
})
