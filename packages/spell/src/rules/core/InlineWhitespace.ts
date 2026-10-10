import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `inline_whitespace` rule:  inline whitespace only, e.g. spaces/tabs between tokens on same line.
 * - NOTE: normally filtered out when tokenizing, so this rule rarely matches in practice.
 */
export class InlineWhitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.InlineWhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(InlineWhitespace)
