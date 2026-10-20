import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { getWhereMethod, getWhereScope } from "./lists.shared"

/**
 * `ordinal_where_expression` rule:  the first (second, last ...) item of a list that passes a test
 * (epic page `outline-spell`, P26).
 * - e.g. `the first pile in the piles where it can take the card`
 * - The same as `the first pile in (piles in the piles where it can take the card)`:
 *   `{arg}` and `it` are each item in the `where`, as `list_filter`'s are.
 * - Compiles to `core.getItemAt(core.filter(list, (pile) => ...), 0)`:  nothing if none passes.
 */
export class OrdinalWhereExpression extends SpellExpression<"ordinal|arg|list|body?"> {
  @proto static priority = Priority.specific

  /** Nested scope for the `where` -- each item, as `{arg}` and `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }

  /** One of the list's items. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.scope.getItemType(match.groups.list.datatype)
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { ordinal, arg, list } = match.groups
    const passing = new P.ASTCoreMethodInvocation(match, {
      methodName: "filter",
      args: [P.matchAST(list), getWhereMethod(match, arg, this.getBody(match))]
    })
    return new P.ASTCoreMethodInvocation(match, { methodName: "getItemAt", args: [passing, P.matchAST(ordinal)] })
  }
}
lists.addRule(OrdinalWhereExpression, {
  syntax: "the {ordinal} {arg:singular_identifier} (in|of) {list:expression} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [
        ["the first item in my-list where its id > 1", "core.getItemAt(core.filter(myList, (item) => item.id > 1), 0)"]
      ]
    }
  ]
})
