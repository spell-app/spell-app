import { proto } from "$/util"
import { P } from "$/parser"
import { SpellExpression } from "./SpellExpression"
import { expressions } from "./expressions.parser"

/**
 * `there_is_a` rule:  `there is [not] a`/`an {operand}` or `there is no such {operand}`, e.g. `there is a thing`.
 * - Unlike other rules here this is a plain `expression`, not an `expression_suffix` -- it has no
 *   `lhs` to attach to, it stands on its own at the front of an expression.
 * - Takes an `operand`, like a test,
 *   e.g. `there is a winner and the game is over` => `isDefined(winner) && ...`
 * - Negates when `operator` contains `no`, covering both `is not a` and `is no such`.
 * - Compiles to `spellCore.isDefined(expression)`, negated as needed.
 */
export class ThereIsA extends SpellExpression<"operator|expression"> {
  @proto static datatype = "choice"

  getAST(match: P.MatchFor<this>): P.ASTNode {
    const { operator } = match.groups
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [match.groups.expression.AST as P.ASTExpression]
    })
    if (operator && typeof operator.value === "string" && operator.value.includes("no")) {
      return new P.ASTNotExpression(match, { expression })
    }
    return expression
  }
}
expressions.addRule(ThereIsA, {
  syntax: "there (operator:is not? (a|an)|is no such) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("animal")
      },
      tests: [
        { input: "there is a thing", js: "thing !== undefined" },
        { input: "there is an animal", js: "animal !== undefined" },
        { input: "there is not a thing", js: "thing === undefined" },
        { input: "there is no such animal", js: "animal === undefined" },
        // an operand:  `and` is the expression's, not the thing's (D23)
        {
          input: "there is a thing and animal",
          js: "(thing !== undefined && animal)"
        }
      ]
    }
  ]
})
