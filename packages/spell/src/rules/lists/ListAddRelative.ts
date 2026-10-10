import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

// TODO: Add to middle of list, pushing existing items out of the way.
//       "add {thing:expression} to position {position:expression} of {list:expression}",

/**
 * `list_add_relative` rule:  add to list before/after some other item, e.g. `add thing to my-list before other-thing`.
 * - Compiles to `spellCore.addBefore(list, item, thing)` / `spellCore.addAfter(list, item, thing)`.
 * - `item` not in the list:  `before` adds at the START, `after` at the END (epic `output-targets`, P14) --
 *   the same rule as `List`'s own `addBefore()` / `addAfter()`.
 * TODO: `relative_position_expression` rule?
 */
export class ListAddRelative extends SpellStatement<"thing|list|operator|item"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, operator, item } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value === "after" ? "addAfter" : "addBefore",
      args: [P.matchAST(list), P.matchAST(item), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListAddRelative, {
  syntax: "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
        scope.variables?.add("other-thing")
      },
      tests: [
        ["add thing to my-list before other-thing", "spellCore.addBefore(myList, otherThing, thing)"],
        ["add thing to my-list after other-thing", "spellCore.addAfter(myList, otherThing, thing)"]
      ]
    }
  ]
})
