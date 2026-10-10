import { proto } from "$/util"
import { P } from "$/parser"
import { SpellExpression } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `absolute_value` rule:  `the absolute value of {expression}`.
 * - e.g. `the absolute value of the difference`
 * - Takes a sum, like `|x + 1|`, but stops before a comparison (`arithmetic_expression`):
 *   `the absolute value of x + 1 is 3` => `absoluteValue(x + 1) == 3`.
 */
export class AbsoluteValue extends SpellExpression<"operator|expression"> {
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "absoluteValue", // TODO: implement in spellCore
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(AbsoluteValue, {
  syntax: "(operator:the? absolute value of) {expression:arithmetic_expression}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("difference")
      },
      tests: [["the absolute value of the difference", "spellCore.absoluteValue(difference)"]]
    }
  ]
})
