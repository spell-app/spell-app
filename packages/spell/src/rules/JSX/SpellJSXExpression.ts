import { proto } from "$/util"
import { P } from "$/parser"
import { JSX } from "./JSX.parser"
import { SpellJSXContent } from "./SpellJSXContent"

/**
 * `jsxExpression` rule:  match a `{...}` JSX expression container (a `jsxChild`, e.g. `<div>{1 + 2}</div>`).
 * - e.g. `{1}`
 * - Trims and collapses newlines in the raw contents before parsing as an `expression`.
 * - Falls back to `parse_error` if the expression doesn't consume the entire contents.
 * - NOTE: rule name is `jsxExpression`, kept distinct from class name `SpellJSXExpression` (pre-existing convention).
 */
export class SpellJSXExpression extends SpellJSXContent {
  static ruleName = "jsxExpression"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXExpressionToken

  /** Parse `contents` as an `expression`; falls back to `parse_error` if it doesn't consume it all. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // trim and remove newlines from expression (???)
    // `JSXExpression.contents` is typed `string | Token`:  see the note in `SpellJSXAttribute.parse()`.
    const jsxToken = match.matched[0] as P.JSXExpressionToken
    const input = (jsxToken.contents as string).trim().replace(/\n/g, " ")
    // only match expression if we used all of the input
    const expression = scope.parse(input, "expression")
    if (expression && expression.inputText.length === input.length) {
      match.data.expression = expression
    } else {
      match.data.error = scope.parse(input, "parse_error")
    }
    this.placeInFile(match.data.expression ?? match.data.error, jsxToken)
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const { expression, error } = match.data
    return new P.ASTJSXExpression(match, {
      expression: expression?.AST as P.ASTExpression | undefined,
      error: error?.AST as P.ASTParseError | undefined
    })
  }
}
JSX.addRule(SpellJSXExpression)
