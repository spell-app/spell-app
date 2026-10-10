import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_remove_range_ordinal` rule:  remove range of items from list using ordinal words for both ends, e.g.
 * `remove first to third cards of the deck` => `spellCore.removeRangeBetween(deck, 1, 3)`.
 * - `{arg}` (e.g. `cards`) captured for readability only, unused in output.
 */
export class ListRemoveRangeOrdinal extends SpellStatement<"start|end|arg|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(ListRemoveRangeOrdinal, {
  syntax: "remove {start:ordinal} to {end:ordinal} {arg:plural_identifier} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [["remove first to third cards of the deck", "spellCore.removeRangeBetween(deck, 1, 3)"]]
    }
  ]
})

// TODO: `remove last card from the deck`
// TODO: `remove last two cards from the deck`
