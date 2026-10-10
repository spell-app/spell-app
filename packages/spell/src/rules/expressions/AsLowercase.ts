import { proto } from "$/util"
import { P } from "$/parser"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { Precedence, type OperatorOperands } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `as_lowercase` rule:  `as lower case`/`lowercase` postfix, e.g. `"foo" as lower case`.
 * - Compiles to `spellCore.lowerCase(lhs)`.
 */
export class AsLowercase extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison
  @proto static datatype = "text"

  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "lowerCase",
      args: [lhs!]
    })
  }
}
expressions.addRule(AsLowercase, {
  syntax: "as (lower case|lowercase)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`"foo" as lower case`, '"foo".toLocaleLowerCase()'],
        [`1 as lowercase`, `spellCore.lowerCase(1)`]
      ]
    }
  ]
})
