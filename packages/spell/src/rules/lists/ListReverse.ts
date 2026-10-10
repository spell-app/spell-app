import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/** `list_reverse` rule:  reverse list in-place, e.g. `reverse my-list` => `spellCore.reverse(my_list)`. */
export class ListReverse extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "reverse",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(ListReverse, {
  syntax: "reverse (the? {arg:plural_identifier} (in|of))? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
      },
      tests: [
        ["reverse the cards of the deck", "spellCore.reverse(deck)"],
        ["reverse my-list", "spellCore.reverse(myList)"]
      ]
    }
  ]
})
