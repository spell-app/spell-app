import { proto } from "@spell-app/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_remove_range` rule:  remove range of items from list, e.g. `remove items 2 to 4 of my-list`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - NOTE: `start` is **1-based** in spell, and `end` is inclusive!
 *   Both compile to `slice()`'s indexes:  `core.removeRangeBetween(myList, 1, 4)`.
 */
export class ListRemoveRange extends SpellStatement<"arg|start|end|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(ListRemoveRange, {
  syntax: "remove {arg:plural_identifier} {start:expression} to {end:expression} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove items 2 to 4 of my-list", "core.removeRangeBetween(myList, 1, 4)"]]
    }
  ]
})
