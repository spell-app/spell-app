import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `number` rule:  `number` as a float or integer token.
 * - e.g. `1`
 * - Class named `NumberLiteral`, not `Number`, which would hide javascript's `Number`.
 * - TODO:  `integer` and `decimal`?  too techy?
 */
export class NumberLiteral extends P.TokenType {
  static ruleName = "number"
  @proto static highlightAs: P.HighlightKind = "number"
  @proto static alias = "expression"
  @proto static datatype = "number"
  @proto static tokenType = P.NumberToken

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value: assert.number(value), raw })
  }
}
core.addRule(NumberLiteral, {
  tests: [
    {
      title: "correctly matches numbers",
      tests: [
        ["1", 1],
        ["1000", 1000],
        ["-1", -1],
        ["1.1", 1.1],
        ["000.1", 0.1],
        [".1", 0.1],
        ["1.", 1],
        [".1", 0.1],
        ["-111.111", -111.111]
      ]
    },
    {
      title: "doesn't match things that aren't numbers",
      tests: [
        ["", undefined],
        ["-", undefined],
        [".", undefined]
      ]
    },
    {
      title: "requires negative sign to touch the number",
      tests: [["- 1", undefined]]
    }
  ]
})
