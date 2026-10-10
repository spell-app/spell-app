import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"

/**
 * `value_otherwise` rule:  `black otherwise` -- the value when no `value_if` line above was the answer:
 * `return 'black'`.
 * - e.g. `black otherwise`, the last line of a getter's body
 */
export class ValueOtherwise extends SpellStatement<"value"> {
  @proto static priority = Priority.overridable
  @proto static alias = "statement"

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
  tests: [{ compileAs: "statement", tests: [["black otherwise", 'return "black"']] }]
})
