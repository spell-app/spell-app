import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellExpression } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `min` rule:  `the smallest` [thing] `of`/`in` {expression}, e.g. `smallest of prices`.
 * - `Priority.specific`, same reasoning as `max` above.
 */
export class Min extends SpellExpression<"operator|argument?|expression"> {
  @proto static priority = Priority.specific
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "smallestOf",
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(Min, {
  syntax: "(operator:the? smallest) {argument:singular_identifier}? (of|in) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("prices")
      },
      tests: [
        ["smallest of prices", "spellCore.smallestOf(prices)"],
        ["smallest value in prices", "spellCore.smallestOf(prices)"]
      ]
    }
  ]
})
