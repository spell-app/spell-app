import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_remove` rule:  remove all instances of something from a list.
 * - Compiles to `spellCore.remove(list, thing)`, e.g. `remove thing from my-list` =>
 *   `spellCore.remove(my_list, thing)`.
 */
export class ListRemove extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "remove",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListRemove, {
  syntax: "remove {thing:expression} from {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("my-list")
      },
      tests: [["remove thing from my-list", "spellCore.remove(myList, thing)"]]
    }
  ]
})
