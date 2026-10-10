import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `newline` rule:  single newline.
 * - e.g. `\n`
 */
export class Newline extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.NewlineToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(Newline)
