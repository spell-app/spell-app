import { proto } from "$/util"
import { P } from "$/parser"
import { JSX } from "./JSX.parser"

/**
 * `jsxEndTag` rule:  match a JSX closing tag (`</tag>`),
 * tracked as a `jsxChild` alongside element/text/expression children.
 * - e.g. `</a>`
 * - NOTE: rule name is `jsxEndTag`, kept distinct from class name `SpellJSXEndTag` (pre-existing convention).
 */
export class SpellJSXEndTag extends P.TokenType {
  static ruleName = "jsxEndTag"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXEndTagToken

  getAST(match: P.MatchFor<this>) {
    const { tagName } = match.matched[0] as P.JSXEndTagToken
    return new P.ASTJSXEndTag(match, { tagName })
  }
}
JSX.addRule(SpellJSXEndTag)
