import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { getWhereScope, getWhereMethod } from "./lists.shared"

/**
 * `list_filter` rule:  list filter, e.g. `words in "a word list" where word starts with "a"`.
 * - Trailing `where` expects an inline expression as filter body (`{inline_expression}?`),
 *   parsed in a nested `MethodScope` where singularized `{arg}` (e.g. `word`
 *   for `words`) and `it` both map to current item.
 * - `Priority.specific` -- preferred over lower-priority expression rules when tokens are ambiguous.
 * - Compiles to `spellCore.filter(list, (item) => { ... })`.
 */
export class ListFilter extends SpellExpression<"arg|list|body?"> {
  @proto static priority = Priority.specific

  /** Nested scope for filter body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }
  /** The items which pass:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const filter = getWhereMethod(match, arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "filter",
      args: [P.matchAST(list), filter]
    })
  }
}
lists.addRule(ListFilter, {
  syntax: "the? {arg:plural_identifier} (in|of) {list:expression} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [
        [
          `words in "a word list" where`,
          `spellCore.filter("a word list", (word) => {})`,
          'spellCore.filter("a word list", () => {})'
        ],
        [
          `words in "a word list" where word starts with "a"`,
          [`spellCore.filter("a word list", (word) => {`, `  return spellCore.startsWith(word, "a")`, `})`],
          'spellCore.filter("a word list", (word: string) => spellCore.startsWith(word, "a"))'
        ],
        [
          "the items in my-list where the id of the item > 1",
          ["spellCore.filter(myList, (item) => {", "  return (item.id > 1)", "})"],
          "spellCore.filter(myList, (item) => item.id > 1)"
        ],
        [
          "the items in my-list where the id of it > 1",
          ["spellCore.filter(myList, (item) => {", "  return (item.id > 1)", "})"],
          "spellCore.filter(myList, (item) => item.id > 1)"
        ],
        [
          "the items in my-list where its id > 1",
          ["spellCore.filter(myList, (item) => {", "  return (item.id > 1)", "})"],
          "spellCore.filter(myList, (item) => item.id > 1)"
        ]
      ]
    }
  ]
})
