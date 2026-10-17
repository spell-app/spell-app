import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `is_in` rule:  `{lhs} is [not] in`/`one of`/`either`/`neither ... nor {list}`, e.g. `thing is in theList`,
 * `thing is neither red nor green`.
 * - `expression` group accepts either an `operand` (a list variable) or an inline
 *   `identifier_list`, e.g. `either red or green`.
 * - `shouldNegateOutput()` negates for any variant containing `not` or `neither`.
 * - Compiles to `spellCore.includes(list, lhs)` -- NOTE argument order is reversed from `lhs`/`rhs`.
 */
export class IsIn extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    const { value } = operator
    return typeof value === "string" && (value.includes("not") || value.includes("neither"))
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [rhs!, lhs!]
    })
  }
}
expressions.addRule(IsIn, {
  syntax: "(operator:is (not? in|not? one of|either|not either of?|neither)) (expression:{operand}|{identifier_list})",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("red")
        scope.constants?.add("green")
        scope.variables?.add("theList")
      },
      tests: [
        ["thing is in theList", "spellCore.includes(theList, thing)"],
        ["thing is one of theList", "spellCore.includes(theList, thing)"],
        ["thing is not in theList", "!spellCore.includes(theList, thing)"],
        ["thing is not one of theList", "!spellCore.includes(theList, thing)"],
        ["thing is either red or green", 'spellCore.includes([red, "green"], thing)'],
        ["thing is not either red or green", '!spellCore.includes([red, "green"], thing)'],
        ["thing is not either of red or green", '!spellCore.includes([red, "green"], thing)'],
        ["thing is neither red nor green", '!spellCore.includes([red, "green"], thing)']
      ]
    }
  ]
})
// `thing is green or blue`, the values known -- see `value_choices`
expressions.addRule(IsIn, {
  syntax: "(operator:is not?) (expression:{value_choices})",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.constants?.add("green")
        scope.constants?.add("blue")
      },
      tests: [
        ["thing is green or blue", 'spellCore.includes(["green", "blue"], thing)'],
        ["thing is not green or blue", '!spellCore.includes(["green", "blue"], thing)'],
        ["thing is green or thing is blue", '(thing == "green" || thing == "blue")']
      ]
    }
  ]
})
