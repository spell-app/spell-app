import { proto } from "$/util"
import { P } from "$/parser"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `exists` rule:  `{lhs} exists`/`does not exist` postfix, e.g. `thing exists`.
 * - Same underlying `spellCore.isDefined()` as `is_defined`, just different surface syntax.
 */
export class Exists extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "exists"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [lhs!]
    })
  }
}
expressions.addRule(Exists, {
  syntax: "(exists|does not exist)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing exists", "spellCore.isDefined(thing)", "thing !== undefined"],
        ["thing does not exist", "!spellCore.isDefined(thing)", "thing === undefined"]
      ]
    }
  ]
})
