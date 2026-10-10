import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `list_position` rule:  return position of an item in a list,
 * e.g. `position of thing in my-list` => `positionOf(myList, thing)`, imported from `@spell/core`.
 * - NOTE: position returned is **1-based**.
 * - Returns `undefined` if item is not found.
 * - `Priority.mostSpecific` -- preferred over lower-priority expression rules when tokens are ambiguous.
 * TODO: `positions`, `last position`, `after...`
 */
export class ListPosition extends SpellExpression<"thing|list"> {
  @proto static priority = Priority.mostSpecific
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "positionOf",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListPosition, {
  syntax: "the? position of {thing:expression} in {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
        scope.variables?.add("bar")
      },
      tests: [
        ["position of thing in my-list", "positionOf(myList, thing)"],
        ["the position of thing in the foo of the bar", "positionOf(bar.foo, thing)"],
        [`the position of "a" in ["a", "b", "c"]`, 'positionOf(["a", "b", "c"], "a")']
      ]
    }
  ]
})
