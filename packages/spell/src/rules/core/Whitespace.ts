import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `whitespace` rule:  any whitespace token -- space, tab, newline, etc., wrapped as-is into a `StringLiteral`.
 * - e.g. ` `, any whitespace token
 */
export class Whitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.WhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(Whitespace)
