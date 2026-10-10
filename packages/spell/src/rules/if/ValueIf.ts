import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"

/**
 * `value_if` rule:  `red if it is diamonds or hearts` -- one line of a getter's body:
 * a VALUE, then when it's the answer;
 * `value_otherwise` (`black otherwise`) is the last line (plan doc `outline-spell`, P2):
 *
 * ```spell
 * - the "color" of a suit is:
 *   red if it is diamonds or hearts
 *   black otherwise
 * ```
 * - Compiles to `if (condition) { return value }`.
 * - The value is an expression, else a bare word, e.g. `red`, as `'red'`.
 * - `Priority.overridable`:  a statement with `if` after it, e.g. `draw it if it is face up`, stays that.
 */
export class ValueIf extends SpellStatement<"value|condition"> {
  @proto static priority = Priority.overridable
  @proto static alias = "statement"

  /** SIDE EFFECT:  a bare word, e.g. `red`, becomes a known value -- see `SpellConstant.declareValue()`. */
  mutateScope(match: P.MatchFor<this>) {
    SpellConstant.declareValue(match, match.groups.value)
  }

  getAST(match: P.MatchFor<this>): P.ASTIfStatement {
    const { value, condition } = match.groups
    return new P.ASTIfStatement(match, {
      condition: condition.AST as P.ASTExpression,
      statements: new P.ASTReturnStatement(match, { value: value.AST as P.ASTExpression })
    })
  }

  /** What it returns -- see `SpellStatement.getReturnedDatatype()`. */
  getReturnValue(match: P.MatchFor<this>): { value: P.Match | undefined } {
    return { value: match.groups.value }
  }
}
_if_.addRule(ValueIf, {
  syntax: "(value:{expression}|{constant}) if {condition:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("suit")
      },
      tests: [[`red if suit is "hearts"`, 'if (suit == "hearts") return "red"']]
    }
  ]
})
