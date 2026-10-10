import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_empty` rule:  empty a list in-place, e.g. `empty my-list` => `spellCore.clear(my_list)`.
 * TODO: make `empty` and/or `clear` a generic statement???
 */
export class ListEmpty extends SpellStatement<"list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "clear",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(ListEmpty, {
  syntax: "(empty|clear) {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["empty my-list", "spellCore.clear(myList)"],
        ["clear the cards of the deck", "spellCore.clear(deck.cards)"]
      ]
    }
  ]
})
