import { proto } from "$/util"
import { P } from "$/parser"
import { lists } from "./lists.parser"

/**
 * `ordinal` rule:  ordinal numbers (`first`, `second`, `last`, etc.), mapped to numeric literals via `VALUE_MAP`.
 * TODO: sixty-fifth, two hundred forty ninth... with custom parser?
 */
export class Ordinal extends P.Pattern {
  @proto static matchGroup = "ordinal"
  @proto static pattern =
    /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|penultimate|final|last|top|bottom)$/
  @proto static VALUE_MAP = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    penultimate: -2,
    final: -1,
    last: -1,
    top: 1,
    bottom: -1
  }

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value, raw })
  }
}
lists.addRule(Ordinal, {
  tests: [
    {
      tests: [
        ["first", 1],
        ["second", 2],
        ["third", 3],
        ["fourth", 4],
        ["fifth", 5],
        ["sixth", 6],
        ["seventh", 7],
        ["eighth", 8],
        ["ninth", 9],
        ["tenth", 10],

        ["penultimate", -2],
        ["final", -1],
        ["last", -1],

        ["top", 1],
        ["bottom", -1]
      ]
    }
  ]
})
