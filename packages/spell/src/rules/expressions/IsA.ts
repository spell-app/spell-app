import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `is_a` rule:  `{lhs} is [not] a`/`an {type}`, e.g. `thing is a Bee`.
 * - The type MUST be known (`known_type`), so a typo is a parse error, e.g. `is a crad`.  Known:
 *   - built in, e.g. `is a number`
 *   - imported
 *   - declared earlier in the project
 *   - or mentioned earlier -- a `stub`, e.g. by `a joker has a color ...` above `a joker is a card`.
 *     See `P.TypeScope.getOrStub()`.
 * - `shouldNegateOutput()` handles `is not a`.
 * - Compiles to `spellCore.isOfType(lhs, 'TypeName')`, wrapping type name via `QuotedExpression`:
 *   its RUNTIME name, which differs for a type imported renamed.  See `P.ASTTypeExpression.runtimeName`.
 */
export class IsA extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    // a type's class, by the name it has when the code runs -- see `P.ASTTypeExpression.runtimeName`
    const type =
      rhs instanceof P.ASTTypeExpression
        ? new P.ASTQuotedExpression(match, rhs.runtimeName)
        : new P.ASTQuotedExpression(match, { expression: rhs! })
    return new P.ASTCoreMethodInvocation(match, { methodName: "isOfType", args: [lhs!, type] })
  }
}
expressions.addRule(IsA, {
  syntax: "(operator:is not? (a|an)) {expression:known_type}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.types?.add("Bee")
        scope.types?.add("Animal")
      },
      tests: [
        ["thing is a Bee", "thing instanceof Bee"],
        ["thing is an Animal", "thing instanceof Animal"],
        ["thing is not a Bee", "!(thing instanceof Bee)"],
        ["thing is not an Animal", "!(thing instanceof Animal)"],
        ["thing is a number", 'typeof thing === "number"'],
        ["thing is a boolean", 'spellCore.isOfType(thing, "choice")'],
        ["thing is a list", 'spellCore.isOfType(thing, "List")'],
        // an unknown type is no type:  `is a crad` doesn't parse
        ["thing is a crad", "thing"]
      ]
    }
  ]
})
