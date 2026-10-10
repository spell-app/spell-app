import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `random_items_expression` rule:  pick a unique set of random items from list, returning an array.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemsOf(list, count)`.
 * TODO: `two random items...`
 */
export class RandomItemsExpression extends SpellExpression<"number|arg|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemsOf",
      args: [P.matchAST(list), P.matchAST(number)]
    })
  }
}
lists.addRule(RandomItemsExpression, {
  syntax: "{number} random {arg:plural_identifier} (of|from|in) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["2 random items of my-list", "spellCore.randomItemsOf(myList, 2)"],
        [`2 random words in "some other words"`, `spellCore.randomItemsOf("some other words", 2)`],
        ["3 random cards from deck", "spellCore.randomItemsOf(deck, 3)"]
      ]
    }
  ]
})
