import { proto } from "$/util"
import { P } from "$/parser"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `as_uppercase` rule:  `as upper case`/`uppercase` postfix, e.g. `"foo" as upper case`.
 * - Compiles to `spellCore.upperCase(lhs)`.
 */
export class AsUppercase extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison
  @proto static datatype = "text"

  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "upperCase",
      args: [lhs!]
    })
  }
}
expressions.addRule(AsUppercase, {
  syntax: "as (upper case|uppercase)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`"foo" as upper case`, '"foo".toLocaleUpperCase()'],
        [`1 as uppercase`, '`${1 ?? ""}`.toLocaleUpperCase()']
      ]
    }
  ]
})
