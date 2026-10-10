import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellExpression } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `max` rule:  `the biggest`/`largest` [thing] `of`/`in` {expression}, e.g. `largest of the prices`.
 * - `Priority.specific` beats `the biggest of x` read as a property (`property_expression`).
 */
export class Max extends SpellExpression<"operator|argument?|expression"> {
  @proto static priority = Priority.specific
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "largestOf",
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(Max, {
  syntax: "(operator:the? (biggest|largest)) {argument:singular_identifier}? (of|in) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("prices")
        scope.variables?.add("price")
      },
      tests: [
        ["largest of the prices", "spellCore.largestOf(prices)"],
        ["biggest in prices", "spellCore.largestOf(prices)"],
        ["the biggest number in prices", "spellCore.largestOf(prices)"]
      ]
    }
  ]
})
