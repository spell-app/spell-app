import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `range_between_expression` rule:  range expression:
 * e.g. `item 1 to 2 of my-list` => `spellCore.rangeBetween(myList, 1, 2)`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Returns a new list.
 * - NOTE: `start` is **1-based**.
 * - NOTE: `end` is inclusive!
 */
export class RangeBetweenExpression extends SpellExpression<"arg|start|end|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, start, end } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(RangeBetweenExpression, {
  syntax: "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["item 1 to 2 of my-list", "spellCore.rangeBetween(myList, 1, 2)"],
        [`word 2 to 3 in "some other words"`, `spellCore.rangeBetween("some other words", 2, 3)`],
        ["card 1 to 3 from deck", "spellCore.rangeBetween(deck, 1, 3)"]
      ]
    }
  ]
})
