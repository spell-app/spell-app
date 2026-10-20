import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"
import { refuseOutsideMethod } from "./if.shared"

/**
 * `value_otherwise` rule:  `black otherwise` -- the value when no `value_if` line above was the answer:
 * `return 'black'`.
 * - e.g. `black otherwise`, the last line of a getter's body
 */
export class ValueOtherwise extends SpellStatement<"value"> {
  @proto static priority = Priority.overridable
  @proto static alias = "statement"

  /** Only in a getter's or method's body:  anywhere else it's an error saying so -- see `refuseOutsideMethod()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens)
    return match && refuseOutsideMethod(match)
  }

  /** SIDE EFFECT:  a bare word, e.g. `black`, becomes a known value -- see `SpellConstant.declareValue()`. */
  mutateScope(match: P.MatchFor<this>) {
    SpellConstant.declareValue(match, match.groups.value)
  }

  getAST(match: P.MatchFor<this>): P.ASTReturnStatement {
    return new P.ASTReturnStatement(match, { value: match.groups.value.AST as P.ASTExpression })
  }

  /** What it returns -- see `SpellStatement.getReturnedDatatype()`. */
  getReturnValue(match: P.MatchFor<this>): { value: P.Match | undefined } {
    return { value: match.groups.value }
  }
}
_if_.addRule(ValueOtherwise, {
  syntax: "(value:{expression}|{constant}) (otherwise|else)",
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          ["to pick a color:", "\tblack otherwise"],
          ["export function pickAColor() {", '  return "black"', "}"]
        ]
      ]
    }
  ]
})
