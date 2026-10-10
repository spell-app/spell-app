import { proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `undefined` rule:  `undefined` as an expression... ???
 * - e.g. `nothing`
 * - Class named `UndefinedLiteral`, so `static ruleName` gives the rule its name:  `undefined` is a reserved word.
 */
export class UndefinedLiteral extends P.Literal {
  static ruleName = "undefined"
  @proto static alias = "expression"
  @proto static datatype = "nothing"

  getAST(match: P.MatchFor<this>): P.ASTNothingLiteral {
    return new P.ASTNothingLiteral(match)
  }
}
core.addRule(UndefinedLiteral, {
  syntax: "(undefined|nothing)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["nothing", "undefined"],
        ["undefined", "undefined"]
      ]
    }
  ]
})
