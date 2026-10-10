import { proto } from "$/util"
import { P } from "$/parser"
import { UI } from "./UI.parser"

/**
 * `css` rule:  parse CSS from a `TextToken` WITHOUT quotes.
 * - Compiles to `spellCore.installStyles(file, css)`; newlines in `css` are escaped to `¬` so the
 *   value survives being embedded in a backtick template literal.
 * - Class named `CSSStyles`, not `CSS`, which would hide the DOM's `CSS`.
 */
export class CSSStyles extends P.TokenType<never, CSSMatchData> {
  static ruleName = "css"
  @proto static alias = "expression"
  @proto static tokenType = P.TextToken

  getAST(match: P.MatchFor<this>) {
    // HACK: `file` is meant to come from `SpellCSSFile` -- see `CSSMatchData`.
    const { value } = match
    const { file } = match.data
    // munge returns to `¬`
    const safeValue = value.replace(/\n/g, "¬")
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "installStyles",
      args: [
        file ? new P.ASTQuotedExpression(match, file) : new P.ASTNothingLiteral(match),
        new P.ASTBackTickExpression(match, safeValue)
      ]
    })
  }
}
UI.addRule(CSSStyles, {
  tests: [
    {
      title: "correctly matches css",
      tests: [
        [`""`, `spellCore.installStyles(undefined, \`""\`)`],
        [
          `".Card {\\n\\theight:30px;\\n}\\n"`,
          `spellCore.installStyles(undefined, \`".Card {\\n\\theight:30px;\\n}\\n"\`)`
        ]
      ]
    }
  ]
})

/** What `css` rule expects on its matches. */
type CSSMatchData = {
  /**
   * Name of file the CSS came from, first argument to `spellCore.installStyles()`.
   * - Meant to be set by whoever parsed the file, i.e. `SpellCSSFile.parse()`.
   * - TODO: nobody sets it, so we always output `undefined` -- see agents/SUSPECTED-BUGS.md.
   */
  file?: string
}
