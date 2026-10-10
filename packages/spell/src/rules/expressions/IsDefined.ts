import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `is_defined` rule:  `{lhs} is defined`/`undefined`/`not defined` postfix, e.g. `thing is defined`.
 * - Negates for anything other than exactly `is defined`.
 * - Compiles to `spellCore.isDefined(lhs)`, negated as needed.
 */
export class IsDefined extends PostfixOperatorSuffix {
  /** Beats `is_equal` + `undefined`, which matches `is undefined` in as many words. */
  @proto static priority = Priority.preferred
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "is defined"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [lhs!]
    })
  }
}
expressions.addRule(IsDefined, {
  syntax: "is (defined|undefined|not defined)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing is defined", "spellCore.isDefined(thing)", "thing !== undefined"],
        ["thing is undefined", "!spellCore.isDefined(thing)", "thing === undefined"],
        ["thing is not defined", "!spellCore.isDefined(thing)", "thing === undefined"]
      ]
    }
  ]
})
