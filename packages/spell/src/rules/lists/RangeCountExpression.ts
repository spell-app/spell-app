import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `range_count_expression` rule:  alternative form of range expression.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - e.g. `top 2 items of my-list` => `spellCore.rangeStartingAt(myList, 1, 2)`.
 * - Counting from the end, the range ENDS at the ordinal:
 *   `last two cards of deck` starts at `-2`, the two last cards.
 *   - Before epic `python-target` P2 it started at `-1`, so it held one card.
 * TODO: restrict ordinals to `first`, `last`, `final`, `top`, etc
 */
export class RangeCountExpression extends SpellExpression<"ordinal|number|arg|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, ordinal, number } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeStartingAt",
      args: [P.matchAST(list), startOf(P.matchAST(ordinal), P.matchAST(number)), P.matchAST(number)]
    })
  }
}
lists.addRule(RangeCountExpression, {
  syntax: "{ordinal} {number} {arg:plural_identifier} (of|in|from) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["top 2 items of my-list", "spellCore.rangeStartingAt(myList, 0, 2)"],
        [`first 2 words in "some other words"`, 'spellCore.rangeStartingAt("some other words", 0, 2)'],
        ["last two cards from deck", "spellCore.rangeStartingAt(deck, -2, 2)"],
        ["penultimate two cards from deck", "spellCore.rangeStartingAt(deck, -3, 2)"]
      ]
    }
  ]
})

/**
 * Where a range of `count` items said with `ordinal` starts:
 * - counting from the front (`top 2`):  the ordinal itself
 * - counting from the end:  `count - 1` before it, so the range ends there (`last 2` => `-2`)
 * - a count spell can't know while compiling:  the ordinal as is
 */
function startOf(ordinal: P.ASTExpression, count: P.ASTExpression): P.ASTExpression {
  if (!(ordinal instanceof P.ASTOrdinalLiteral) || ordinal.value >= 0) return ordinal
  if (!(count instanceof P.ASTNumericLiteral)) return ordinal
  const value = ordinal.value - (count.value - 1)
  return new P.ASTOrdinalLiteral(ordinal.match, { value, raw: String(value) })
}
