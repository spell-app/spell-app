import { P } from "$/parser"
import { ListItemExpression } from "./ListItemExpression"
import { lists } from "./lists.parser"

/**
 * `random_item_expression` rule:  pick a single random item from list, e.g. `a random item of my-list`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemOf(list)`.
 */
export class RandomItemExpression extends ListItemExpression<"arg|list"> {
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemOf",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(RandomItemExpression, {
  syntax: "a random {arg:singular_identifier} (of|from|in) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["a random item of my-list", "spellCore.randomItemOf(myList)"],
        [`a random word in "some words"`, `spellCore.randomItemOf("some words")`],
        ["a random card from the deck", "spellCore.randomItemOf(deck)"]
      ]
    }
  ]
})
