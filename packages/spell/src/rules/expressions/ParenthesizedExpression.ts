import { P } from "$/parser"
import { SpellExpression } from "./SpellExpression"
import { expressions } from "./expressions.parser"

/**
 * `parenthesized_expression` rule:  `(expression)` -- parenthesized sub-expression.
 * - `getAST()` relies on `ParenthesizedExpression`'s own constructor to collapse nested parens,
 *   e.g. `((thing))` compiles down to `(thing)`.
 */
export class ParenthesizedExpression extends SpellExpression<"expression"> {
  /** Parens don't change what it is. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.expression.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTParenthesizedExpression {
    const { expression } = match.groups
    return new P.ASTParenthesizedExpression(match, {
      expression: expression.AST as P.ASTExpression
    })
  }
}
expressions.addRule(ParenthesizedExpression, {
  syntax: "\\( {expression} \\)",
  tests: [
    {
      title: "correctly matches parenthesized expressions",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["(thing)", "(thing)"],
        ["((thing))", "(thing)"],
        ["(((thing)))", "(thing)"],
        ["(1 and yes)", "(1 && true)"]
      ]
    },
    {
      title: "correctly matches multiple parenthesis",
      compileAs: "expression",
      tests: [
        ["(1) and (yes)", "((1) && (true))", "(1 && true)"],
        ["((1) and (yes))", "((1) && (true))", "(1 && true)"],
        ["((1) and ((yes)))", "((1) && (true))", "(1 && true)"]
      ]
    },
    {
      title: "doesn't match malformed parenthesized expressions",
      tests: [
        ["(foo", undefined],
        ["(foo(bar)baz", undefined]
      ]
    }
  ]
})
