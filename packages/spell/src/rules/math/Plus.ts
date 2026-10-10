import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `plus` rule:  `plus` / `+`, e.g. `price + tax` -- `Precedence.sum`:  tighter than comparisons, looser than `*` `/`.
 */
export class Plus extends InfixOperatorSuffix {
  @proto static precedence = Precedence.sum
  @proto static parenthesize = true

  /**
   * What `+` makes of its sides:
   * - `text` if either side is text:  javascript joins them
   * - `number` if both are numbers
   * - else unknown:  `x + y` might be either
   */
  getResultDatatype(
    match: P.MatchFor<this>,
    lhs: P.Datatype | undefined,
    rhs: P.Datatype | undefined
  ): P.Datatype | undefined {
    if (Plus.isTextual(lhs) || Plus.isTextual(rhs)) return "text"
    if (Plus.isNumeric(lhs) && Plus.isNumeric(rhs)) return "number"
    return undefined
  }

  getOperator(): P.ASTOperator {
    return "plus"
  }

  /** Is `datatype` text, or one character of it? */
  private static isTextual(datatype: P.Datatype | undefined): boolean {
    return datatype === "text" || datatype === "character"
  }

  /** Is `datatype` a number, or an integer? */
  private static isNumeric(datatype: P.Datatype | undefined): boolean {
    return datatype === "number" || datatype === "integer"
  }
}
math.addRule(Plus, {
  syntax: "(operator:plus|+) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("tax")
      },
      tests: [
        ["price + tax", "(price + tax)"],
        ["price+tax", "(price + tax)"],
        ["price plus tax", "(price + tax)"]
      ]
    }
  ]
})
