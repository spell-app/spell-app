import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_remove_ordinal` rule:  remove one item from list by ordinal position, e.g. `remove last card of deck` =>
 * `spellCore.removeItemAt(deck, -1)`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 */
export class ListRemoveOrdinal extends SpellStatement<"position|arg|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemAt",
      args: [P.matchAST(list), P.matchAST(position)]
    })
  }
}
lists.addRule(ListRemoveOrdinal, {
  syntax: "remove the? {position:ordinal} {arg:singular_identifier} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [
        ["remove last card of deck", "spellCore.removeItemAt(deck, -1)"],
        ["remove the first card of the deck", "spellCore.removeItemAt(deck, 1)"]
      ]
    }
  ]
})
