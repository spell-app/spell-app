import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `range_count_expression` rule:  alternative form of range expression.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - e.g. `top 2 items of my-list` => `spellCore.rangeStartingAt(my_list, 1, 2)`.
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
      args: [P.matchAST(list), P.matchAST(ordinal), P.matchAST(number)]
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
        ["top 2 items of my-list", "spellCore.rangeStartingAt(myList, 1, 2)"],
        [`first 2 words in "some other words"`, `spellCore.rangeStartingAt("some other words", 1, 2)`],
        ["last two cards from deck", "spellCore.rangeStartingAt(deck, -1, 2)"]
      ]
    }
  ]
})
