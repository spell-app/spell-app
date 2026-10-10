import { proto } from "$/util"
import { P } from "$/parser"
import { ListItemExpression } from "./ListItemExpression"
import { lists } from "./lists.parser"

/**
 * `ordinal_position_expression` rule:  ordinal-word index expression:
 * e.g. `the first item of my-list`, `the tenth card of deck`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Shares same `getItemAt` compile target as `position_expression`, with `{ordinal}` resolved to a number.
 */
export class OrdinalPositionExpression extends ListItemExpression<"ordinal|arg|expression"> {
  @proto static listGroup = "expression"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { ordinal, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemAt",
      args: [P.matchAST(expression), P.matchAST(ordinal)]
    })
  }
}
lists.addRule(OrdinalPositionExpression, {
  syntax: "the {ordinal} {arg:singular_identifier} (in|of) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
        scope.variables?.add("words")
      },
      tests: [
        ["the first item of my-list", "spellCore.getItemAt(myList, 1)"],
        ["the tenth card of deck", "spellCore.getItemAt(deck, 10)"],
        ["the penultimate word in words", "spellCore.getItemAt(words, -2)"]
      ]
    }
  ]
})
