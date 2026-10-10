import { proto } from "$/util"
import { P } from "$/parser"
import { type FillInParts, fillInsAST, parseFillIns } from "$/spell/rules/core"
import { JSX } from "./JSX.parser"

/**
 * `jsxText` rule:  match literal text between JSX tags (`jsxChild`).  Blank text yields no AST node -- see below.
 * - e.g. `hello` (literal text between JSX tags)
 * - NOTE: rule name is `jsxText`, kept distinct from class name `SpellJSXText` (pre-existing convention).
 */
export class SpellJSXText extends P.TokenType<never, { fillIns?: FillInParts }> {
  static ruleName = "jsxText"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXTextToken

  /**
   * Match -- and parse any `[name]` fill-ins, e.g. `<span>[rank] of [suit]</span>`, as text's (`parseFillIns()`).
   * - A fill-in which doesn't parse:  no match.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    const [token] = tokens
    if (!match || !(token instanceof P.JSXTextToken)) return match
    const fillIns = parseFillIns(scope, token.value.trim())
    if (fillIns === null) return undefined
    if (fillIns) match.data.fillIns = fillIns
    return match
  }

  /** Build `P.ASTJSXText` of the trimmed text;  returns `undefined` for blank text since there's nothing to render. */
  getAST(match: P.MatchFor<this>) {
    // with fill-ins:  one `{...}` child, a template string
    if (match.data.fillIns) return new P.ASTJSXExpression(match, { expression: fillInsAST(match, match.data.fillIns) })
    const { raw, value } = match.matched[0] as P.JSXTextToken
    const text = value.trim()
    // Blank text has nothing to render -- return `undefined` for "no AST" (`Rule.getAST()`'s return
    // type already permits this; `Match.AST` treats a falsy return as "no AST").
    if (!text) return undefined
    return new P.ASTJSXText(match, { raw, value: text })
  }
}
JSX.addRule(SpellJSXText)
