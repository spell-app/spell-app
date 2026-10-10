import { proto } from "$/util"
import { P } from "$/parser"
import { fillInsAST, parseFillIns } from "$/spell/rules/core"
// Import directly to avoid circular import
import { commitStatement } from "$/spell/rules/Statement"
import { JSX } from "./JSX.parser"
import { SpellJSXContent } from "./SpellJSXContent"

/**
 * `jsxAttribute` rule:  match a single JSX attribute (`name`, `name=value`, or `name={expression}`).
 * - e.g. `foo` (bare attribute), `foo=1`, or `foo={expression}`
 * - `on*` attribute names (e.g. `onClick`) parse `value` as a `statement` inside a `MethodScope` with
 *   an implicit `event` argument, producing an inline event-handler method rather than an expression.
 * - Falls back to `parse_error` if neither an `expression` nor `on*` `statement` consumes the whole value.
 * - NOTE: rule name is `jsxAttribute`, kept distinct from class name `SpellJSXAttribute` (pre-existing convention).
 */
export class SpellJSXAttribute extends SpellJSXContent {
  static ruleName = "jsxAttribute"
  @proto static tokenType = P.JSXAttributeToken

  /**
   * Parse `value` as an expression, or (for `on*` attribute names) as a `statement` with an
   * implicit `event` argument -- falls back to a `parse_error` match if neither consumes it all.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXAttribute at a time!")
    // pull attribute name up to match
    const attributeToken = match.matched[0] as P.JSXAttributeToken
    match.data.attribute = attributeToken.name
    // parse `value`:  text, a number, or a `{...}` JSX expression
    const { value } = match
    // text with `[name]` fill-ins, e.g. `source="images/[rank].png"` -- as `text`'s (`parseFillIns()`)
    if (value instanceof P.TextToken) {
      const fillIns = parseFillIns(scope, value.innerText)
      if (fillIns === null) match.data.error = scope.parse(value.value, "parse_error")
      else if (fillIns) match.data.fillIns = fillIns
      if (fillIns !== undefined) return match
    }
    if (value) {
      const inputIsExpression = value instanceof P.JSXExpressionToken
      // `JSXExpression.contents` is typed `string | Token`:
      // a bare, un-braced attribute value is tokenized by `matchJSXAttributeValueIdentifier`, which sets a `Token`.
      // This rule only ever handles the braced / string form here, as it always has.
      const input = inputIsExpression ? (value.contents as string).trim().replace(/\n/g, " ") : value
      // parse "onXXX" as an inline method with an `event` argument
      if (match.data.attribute.startsWith("on")) {
        const methodScopeProps: P.MethodScopeProps = {
          parentScope: scope,
          args: ["event"],
          mapItTo: "this",
          declaredBy: match
        }
        const methodScope = new P.MethodScope(methodScopeProps)
        const statement = methodScope.parse(input, "statement")
        if (statement && statement.inputText.length === input.length) {
          // We're keeping it, so lock it in -- its scope changes happen now, in the handler's own scope.
          commitStatement(statement)
          match.data.statement = statement
        }
      } else {
        const expression = scope.parse(input, "expression")
        if (expression && (!inputIsExpression || expression.inputText.length === input.length)) {
          match.data.expression = expression
        }
      }
      // if neither worked, parse error
      if (!match.data.expression && !match.data.statement) match.data.error = scope.parse(input, "parse_error")
      // console.warn({ match, name: match.data.attribute, inputIsExpression, value, input })
      if (inputIsExpression) this.placeInFile(match.data.statement ?? match.data.expression ?? match.data.error, value)
    }
    return match
  }

  /**
   * Build `P.ASTJSXAttribute`.
   * - `statement` value becomes an inline `P.ASTMethodDefinition` (with an `event` arg for `on*` names).
   * - Missing `value` (bare attribute, e.g. `<input disabled/>`) becomes `true`.
   */
  getAST(match: P.MatchFor<this>) {
    const { attribute, expression, statement, error, fillIns } = match.data
    const { value } = match
    let valueAST: P.ASTExpression | undefined
    if (fillIns) valueAST = fillInsAST(match, fillIns)
    else if (expression) valueAST = P.asAST<P.ASTExpression>(expression.AST)
    else if (statement) {
      valueAST = new P.ASTMethodDefinition(match, {
        inline: true,
        // `attribute` is always set by `parse()` before this match can exist.
        // `!` because `JSXMatchData` shares the field with `jsxElement` / `jsxExpression` matches,
        // which never set it, so it stays optional.
        args: attribute!.toLowerCase().startsWith("on")
          ? [new P.ASTVariableExpression(match, { name: "event" })]
          : undefined,
        body: P.asAST<P.ASTStatementBlock | P.ASTStatement | P.ASTExpression>(statement.AST)
      })
    } else if (value === undefined) {
      valueAST = new P.ASTBooleanLiteral(match, { value: true })
    } else if (value instanceof P.TextToken) {
      valueAST = new P.ASTStringLiteral(match, { value: value.innerText, quote: '"', raw: value.value })
    } else if (!error) {
      console.warn("jsxAttribute.getAST: don't know how to render value", value, " for match ", match)
      valueAST = new P.ASTNothingLiteral(match)
    }
    return new P.ASTJSXAttribute(match, {
      name: attribute!,
      value: valueAST,
      error: error?.AST as P.ASTParseError | undefined
    })
  }
}
JSX.addRule(SpellJSXAttribute)
