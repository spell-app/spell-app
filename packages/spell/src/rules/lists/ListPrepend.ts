import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/** `list_prepend` rule:  prepend to list, e.g. `prepend thing to my-list` => `spellCore.prepend(my_list, thing)`. */
export class ListPrepend extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "prepend",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListPrepend, {
  syntax: "prepend {thing:expression} to {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["prepend thing to my-list", "spellCore.prepend(myList, thing)"]]
    }
  ]
})
