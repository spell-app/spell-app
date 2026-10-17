import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"
import { getWhereScope, getWhereMethod } from "./lists.shared"

/**
 * `list_remove_where` rule:  remove all items from list where condition is true:
 * e.g. `remove items from my-list where item is not "ace"`.
 * - Trailing `where` expects an inline expression as predicate (`{inline_expression}?`) -- see `getWhereScope()`.
 * - Compiles to `spellCore.removeWhere(list, (item) => { ... })`.
 */
export class ListRemoveWhere extends SpellStatement<"arg|list|body?"> {
  @proto static alias = "statement"

  /** Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const filter = getWhereMethod(match, arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeWhere",
      args: [P.matchAST(list), filter]
    })
  }
}
lists.addRule(ListRemoveWhere, {
  syntax: "remove {arg:plural_identifier} (in|of|from) {list:expression} where {inline_expression}?",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
        scope.constants?.add("clubs")
      },
      tests: [
        ["remove items from my-list where", "spellCore.removeWhere(myList, () => {})"],
        [`remove items from my-list where item is not "ace"`, 'spellCore.removeWhere(myList, (item) => item != "ace")'],
        [
          "remove cards in deck where the suit of the card is clubs",
          'spellCore.removeWhere(deck, (card) => card.suit == "clubs")'
        ],
        [
          "remove cards in deck where the suit of it is clubs",
          'spellCore.removeWhere(deck, (card) => card.suit == "clubs")'
        ],
        ["remove cards in deck where its suit is clubs", 'spellCore.removeWhere(deck, (card) => card.suit == "clubs")']
      ]
    }
  ]
})
