import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { getWhereScope, getWhereMethod } from "./lists.shared"

/**
 * `list_length` rule:  return length of a list, e.g. `number of items in my-list` => `spellCore.itemCountOf(myList)`.
 * - `{arg}` (e.g. `items`) captured for readability only, unless there's a `where`.
 * - With `where`, counts the items which pass, as `list_filter` does,
 *   e.g. `the number of cards in the deck where its color is red`
 *   => `spellCore.itemCountOf(spellCore.filter(deck, ...))`
 *   - Its own syntax, as `cards in the deck where ...` can't be a `list_filter` here:
 *     we've read `cards in` already.
 * - `Priority.mostSpecific` -- preferred over lower-priority expression rules when tokens are ambiguous.
 */
export class ListLength extends SpellExpression<"arg|list|body?"> {
  @proto static priority = Priority.mostSpecific
  @proto static datatype = "number"

  /** Nested scope for a `where` body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const body = this.getBody(match)
    const items = body
      ? new P.ASTCoreMethodInvocation(match, {
          methodName: "filter",
          args: [P.matchAST(list), getWhereMethod(match, arg, body)]
        })
      : P.matchAST(list)
    return new P.ASTCoreMethodInvocation(match, { methodName: "itemCountOf", args: [items] })
  }
}
lists.addRule(ListLength, {
  syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("bar")
      },
      tests: [
        ["number of items in my-list", "spellCore.itemCountOf(myList)"],
        ["the number of foos in the foo of the bar", "spellCore.itemCountOf(bar.foo)"],
        ["the number of items in [1,2,3]", "spellCore.itemCountOf([1, 2, 3])"]
      ]
    }
  ]
})
lists.addRule(ListLength, {
  syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [
        [
          "the number of items in my-list where its id > 1",
          ["spellCore.itemCountOf(spellCore.filter(myList, (item) => {", "  return (item.id > 1)", "}))"],
          "spellCore.itemCountOf(spellCore.filter(myList, (item) => item.id > 1))"
        ]
      ]
    }
  ]
})
