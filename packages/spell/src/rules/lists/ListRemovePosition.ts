import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_remove_position` rule:  remove one item from list by numeric position.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.removeItemAt(list, number)`, e.g. `remove item 4 of my-list` =>
 *   `spellCore.removeItemAt(myList, 4)`.
 */
export class ListRemovePosition extends SpellStatement<"arg|number|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemAt",
      args: [P.matchAST(list), P.matchAST(number)]
    })
  }
}
lists.addRule(ListRemovePosition, {
  syntax: "remove {arg:singular_identifier} {number:expression} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove item 4 of my-list", "spellCore.removeItemAt(myList, 4)"]]
    }
  ]
})
