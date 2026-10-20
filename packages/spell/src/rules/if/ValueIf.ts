import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"
import { refuseOutsideMethod } from "./if.shared"

/**
 * `value_if` rule:  `red if it is diamonds or hearts` -- one line of a getter's body:
 * a VALUE, then when it's the answer;
 * `value_otherwise` (`black otherwise`) is the last line (epic page `outline-spell`, P2):
 *
 * ```spell
 * - the "color" of a suit is:
 *   red if it is diamonds or hearts
 *   black otherwise
 * ```
 * - Compiles to `if (condition) { return value }`.
 * - The value is an expression, else a bare word, e.g. `red`, as `'red'`.
 * - It may say the other value too:  `red if ... otherwise it is black`, then `return 'black'`.
 *   `property_value_either`'s body is one of these:  `the color of a card is red if ... otherwise it is black`.
 * - `Priority.overridable`:  a statement with `if` after it, e.g. `draw it if it is face up`, stays that.
 */
export class ValueIf extends SpellStatement<"value|condition|otherValue?"> {
  @proto static priority = Priority.overridable
  @proto static alias = "statement"

  /** Only in a getter's or method's body:  anywhere else it's an error saying so -- see `refuseOutsideMethod()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens)
    return match && refuseOutsideMethod(match)
  }

  /** SIDE EFFECT:  a bare word, e.g. `red`, becomes a known value -- see `SpellConstant.declareValue()`. */
  mutateScope(match: P.MatchFor<this>) {
    for (const value of [match.groups.value, match.groups.otherValue]) SpellConstant.declareValue(match, value)
  }

  getAST(match: P.MatchFor<this>): P.ASTIfStatement | P.ASTStatementGroup {
    const { value, condition, otherValue } = match.groups
    const ifAST = new P.ASTIfStatement(match, {
      condition: condition.AST as P.ASTExpression,
      statements: new P.ASTReturnStatement(match, { value: value.AST as P.ASTExpression })
    })
    if (!otherValue) return ifAST
    const otherwise = new P.ASTReturnStatement(match, { value: otherValue.AST as P.ASTExpression })
    return new P.ASTStatementGroup(match, { statements: [ifAST, otherwise] })
  }

  /** What it returns -- see `SpellStatement.getReturnedDatatype()`. */
  getReturnValue(match: P.MatchFor<this>): { value: P.Match | undefined } {
    return { value: match.groups.value }
  }
}
_if_.addRule(ValueIf, {
  syntax:
    "(value:{expression}|{constant}) if {condition:expression} (otherwise it is (otherValue:{constant}|{expression}))?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("suit")
      },
      tests: [
        [
          ["to pick a color:", `\tred if suit is "hearts"`],
          ["export function pickAColor() {", '  if (suit == "hearts") return "red"', "}"]
        ]
      ]
    },
    {
      title: "Outside a getter or method:  an error saying where it belongs (epic page `outline-spell`, I9)",
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("suit")
      },
      tests: [
        [
          `red if suit is "hearts"`,
          '/* PARSE ERROR: A line of a getter\'s body:  put it under one, e.g. "the color of a card is:" */'
        ]
      ]
    }
  ]
})
