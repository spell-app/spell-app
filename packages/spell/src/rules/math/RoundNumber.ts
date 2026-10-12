import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellExpression } from "$/spell/rules/expressions"
import { math } from "./math.parser"

/**
 * `round_number` rule:  `round {expression}`, optionally `off`/`up`/`down`, e.g. `round price up`.
 * - TODO: precision:  to the nearest tenth ?
 * - `Priority.preferred`, lowest of the `expression` alternatives here.
 */
export class RoundNumber extends SpellExpression<"expression|operator?"> {
  @proto static priority = Priority.preferred
  @proto static datatype = "number"

  /**
   * Maps `off`/`up`/`down` suffix to `round`/`roundUp`/`roundDown`:  each writer says it as its platform does
   * (epic `python-target` P24, Owen on Q29):  `Math.round(price)`, `math.floor(price + 0.5)`.
   */
  getAST(match: P.MatchFor<this>) {
    const { expression, operator } = match.groups
    let methodName = "round"
    if (operator?.value === "up") methodName = "roundUp"
    else if (operator?.value === "down") methodName = "roundDown"
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName,
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(RoundNumber, {
  syntax: "round {expression:arithmetic_expression} (operator:off|up|down)?",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
      },
      tests: [
        ["round price", "Math.round(price)"],
        ["round price off", "Math.round(price)"],
        ["round price up", "Math.ceil(price)"],
        ["round price down", "Math.floor(price)"]
      ]
    }
  ]
})
