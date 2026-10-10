import { proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `comment` rule:  line comment token -- wraps a `CommentToken` into a `LineComment` AST node, e.g. `// foo`.
 * - Class named `CommentLine`, not `Comment`, which would hide the DOM's `Comment`.
 */
export class CommentLine extends P.TokenType {
  static ruleName = "comment"
  @proto static tokenType = P.CommentToken
  @proto static highlightAs: P.HighlightKind = "comment"

  getAST(match: P.MatchFor<this>): P.ASTLineComment {
    const [token] = match.matched
    // `tokenType: CommentToken` guarantees the single matched token is a `CommentToken`.
    if (!(token instanceof P.CommentToken)) throw new TypeError("Expected a CommentToken")
    const { commentSymbol, initialWhitespace, value } = token
    return new P.ASTLineComment(match, { commentSymbol, initialWhitespace, value })
  }
}
core.addRule(CommentLine, {
  tests: [
    {
      compileAs: "comment",
      tests: [
        ["//", "//"],
        ["// foo", "// foo"],
        ["-- foo", "//-- foo"],
        ["## foo", "//## foo"],
        ["//    foo bar baz", "//    foo bar baz"]
      ]
    }
  ]
})
