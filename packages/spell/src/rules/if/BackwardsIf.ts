import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { _if_ } from "./if.parser"

/**
 * `backwards_if` rule:  postfix ternary: `{expr} if {condition} (else|otherwise) {expr}` -- English word order
 * ("do X if Y else Z") rather than `condition ? then : else`.
 * - e.g. `1 if bar else 2`
 * - `expression_suffix`: `lhs` (the value before `if`) is supplied by `CompoundExpression`'s
 *   shunting-yard; this rule's own `syntax` only spells out `operator` (actually the *condition*
 *   expression here) and the trailing `rhs` expression.
 * - Compiles to `P.ASTTernaryExpression`.
 */
export class BackwardsIf extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.ternary

  /** What both sides are, if they agree -- else unknown. */
  getResultDatatype(
    match: P.MatchFor<this>,
    lhs: P.Datatype | undefined,
    rhs: P.Datatype | undefined
  ): P.Datatype | undefined {
    return lhs === rhs ? lhs : undefined
  }

  compileASTExpression(
    match: P.Match,
    { lhs, operator, rhs }: { lhs: P.ASTExpression; operator: P.Match; rhs: P.ASTExpression }
  ): P.ASTTernaryExpression {
    return new P.ASTTernaryExpression(match, {
      condition: operator.AST as P.ASTExpression,
      trueValue: lhs,
      falseValue: rhs
    })
  }
}
_if_.addRule(BackwardsIf, {
  syntax: "if {operator:expression} (else|otherwise) {expression}",
  tests: [
    {
      title: "correctly matches single-line backwards_if statements",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("bar")
        variables.add("foo")
      },
      tests: [
        {
          input: "print 1 if bar else 2",
          js: "spellCore.console.log((bar ? 1 : 2))",
          ts: "spellCore.console.log(bar ? 1 : 2)"
        },
        {
          input: "get the foo of the bar if bar is defined otherwise the bar of the foo",
          js: "let it = (spellCore.isDefined(bar) ? bar.foo : foo.bar)",
          ts: "const it = bar !== undefined ? bar.foo : foo.bar"
        },
        {
          input: `set color to "red" if 1 + 1 else "black"`,
          js: `export let color = ((1 + 1) ? "red" : "black")`,
          ts: 'export const color = 1 + 1 ? "red" : "black"'
        }
      ]
    }
  ]
})
