import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `minus` rule:  `minus` / `-`, e.g. `price - tax`.
 * - NOTE: bare `-` requires surrounding spaces -- otherwise it'd clash with negative-number literals,
 *   see commented-out test below.
 */
export class Minus extends InfixOperatorSuffix {
  @proto static precedence = Precedence.sum
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOperator(): P.ASTOperator {
    return "minus"
  }
}
math.addRule(Minus, {
  syntax: "(operator:minus|-) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("tax")
      },
      tests: [
        //        ["price-tax", "(price - tax)"],     // NOTE: `-` requires spaces...
        ["price - tax", "(price - tax)"],
        ["price minus tax", "(price - tax)"]
      ]
    }
  ]
})
