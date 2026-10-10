import { proto } from "$/util"
import { P } from "$/parser"
import { ListItemExpression } from "./ListItemExpression"
import { lists } from "./lists.parser"

/**
 * `position_expression` rule:  numeric-position index expression, e.g. `card 1 of the pile`, `card #2 of the pile`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 * - NOTE: negative positions come from end of list, e.g. `card -1 of the pile`.
 * - NOTE: positions are **1-based** while Javascript is **0-based**, e.g. `item 1 of the array` => `array[0]`.
 * - Compiles to `spellCore.getItemAt(list, position)`.
 */
export class PositionExpression extends ListItemExpression<"arg|position|expression"> {
  @proto static listGroup = "expression"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemAt",
      args: [P.matchAST(expression), P.matchAST(position)]
    })
  }
}
lists.addRule(PositionExpression, {
  syntax: "{arg:singular_identifier} {position:expression} of {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
        scope.variables?.add("n")
      },
      tests: [
        ["item 1 of my-list", "spellCore.getItemAt(my_list, 1)", "spellCore.getItemAt(myList, 1)"],
        ["card 10 of deck", "spellCore.getItemAt(deck, 10)"],
        ["card n of the cards of the deck", "spellCore.getItemAt(deck.cards, n)"]
      ]
    }
  ]
})
