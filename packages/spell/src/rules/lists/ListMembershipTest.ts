import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { PostfixOperatorSuffix, Precedence } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"
import { getWhereScope, getWhereMethod } from "./lists.shared"

/**
 * `list_membership_test` rule:  set membership test, e.g. `my-list has items where the item is 1`.
 * - A postfix suffix:  the list is the expression before it, e.g. `the foo of the bar has items where ...`.
 * - Trailing `where` expects an inline expression as predicate (`{inline_expression}?`) -- see `getWhereScope()`.
 *   NOTE: so it eats the rest of the line, and is always the last suffix.
 * - Compiles to `spellCore.any(list, (item) => { ... })`, negated (wrapped in `NotExpression`) unless
 *   `operator` is exactly `has`.
 */
export class ListMembershipTest extends PostfixOperatorSuffix<"operator|arg|body?"> {
  @proto static precedence = Precedence.comparison

  /**
   * Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`.
   * - NOTE: its item type is unknown:  the list is the expression BEFORE us, which a suffix can't see.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, undefined)
  }
  /** Negated unless `operator` is exactly `has`. */
  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "has"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: { lhs?: P.ASTExpression }): P.ASTCoreMethodInvocation {
    const filter = getWhereMethod(match, match.groups.arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "any",
      args: [lhs!, filter],
      datatype: "choice"
    })
  }
}
lists.addRule(ListMembershipTest, {
  syntax: "(operator:has|has no|doesnt have|does not have) {arg:plural_identifier} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("bar")
      },
      tests: [
        ["my-list has items where", "spellCore.any(my_list, (item) => {})", "spellCore.any(myList, () => {})"],
        [
          "my-list has items where the item is 1",
          ["spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"],
          "spellCore.any(myList, (item) => item == 1)"
        ],
        [
          "my-list has items where it is 1",
          ["spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"],
          "spellCore.any(myList, (item) => item == 1)"
        ],
        [
          "my-list has items where its foo is 1",
          ["spellCore.any(my_list, (item) => {", "  return (item.foo == 1)", "})"],
          "spellCore.any(myList, (item) => item.foo == 1)"
        ],
        [
          "my-list has no items where item is 1",
          ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"],
          "!spellCore.any(myList, (item) => item == 1)"
        ],
        [
          "my-list has no items where it is 1",
          ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"],
          "!spellCore.any(myList, (item) => item == 1)"
        ],
        [
          "my-list doesnt have items where item is 1",
          ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"],
          "!spellCore.any(myList, (item) => item == 1)"
        ],
        [
          "the foo of the bar does not have items where item is 1",
          ["!spellCore.any(bar.foo, (item) => {", "  return (item == 1)", "})"],
          "!spellCore.any(bar.foo, (item) => item == 1)"
        ]
      ]
    }
  ]
})
