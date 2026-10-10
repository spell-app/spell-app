import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_shuffle` rule:  shuffle (randomize) list in-place,
 * e.g. `shuffle my-list` => `spellCore.randomize(my_list)`.
 */
export class ListShuffle extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomize",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(ListShuffle, {
  syntax: "(randomize|shuffle) (the? {arg:plural_identifier} (in|of))? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
      },
      tests: [
        ["shuffle cards of deck", "spellCore.randomize(deck)"],
        ["shuffle the cards of the deck", "spellCore.randomize(deck)"],
        ["randomize my-list", "spellCore.randomize(myList)"]
      ]
    }
  ]
})
