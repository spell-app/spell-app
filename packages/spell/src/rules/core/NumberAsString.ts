import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `number_as_string` rule:  `number` spelled out as a string, `zero` to `ten`
 * -- `VALUE_MAP` does the word-to-number lookup.
 * - e.g. `zero` => `0`
 */
export class NumberAsString extends P.Pattern {
  @proto static alias = ["expression", "number"]
  @proto static datatype = "number"
  @proto static pattern = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/
  @proto static VALUE_MAP = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
  }

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value: assert.number(value), raw })
  }
}
core.addRule(NumberAsString, {
  tests: [
    {
      title: "correctly matches number strings",
      tests: [
        ["zero", 0],
        ["one", 1],
        ["two", 2],
        ["three", 3],
        ["four", 4],
        ["five", 5],
        ["six", 6],
        ["seven", 7],
        ["eight", 8],
        ["nine", 9],
        ["ten", 10]
      ]
    }
  ]
})
