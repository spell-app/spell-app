import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `list_position` rule:  return position of an item in a list,
 * e.g. `position of thing in my-list` => `spellPosition(positionOf(myList, thing))`, imported from `@spell/core`.
 * - NOTE: position returned is **1-based**:  `positionOf()` gives an index, from 0, which `spellPosition()` turns back.
 * - Returns `undefined` if item is not found.
 * - `Priority.mostSpecific` -- preferred over lower-priority expression rules when tokens are ambiguous.
 * - With no list, a value of a KIND is found in the kind's own list (epic page `outline-spell`, P12):
 *   `the position of its rank` => `spellPosition(positionOf(Deck.Ranks, this.rank))`, 12 for a queen.
 *   - Only for a kind's value:  anything else needs its `in ...`.
 *   - A kind declared further down is still a stub here (issue I3):  its list is read from its record when compiling.
 * TODO: `positions`, `last position`, `after...`
 */
export class ListPosition extends SpellExpression<"thing|list?", { kindType?: P.TypeScope }> {
  @proto static priority = Priority.mostSpecific
  @proto static datatype = "number"

  /** With no list:  only a value of a kind, whose record we keep for its list -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || match.groups.list) return match
    const kindType = scope.getType(match.groups.thing.datatype)
    if (!kindType || (!kindType.valueKind && !kindType.stub)) return undefined
    match.data.kindType = kindType
    // a stub may turn out not to be a kind, once the project has parsed:  then it's no position at all
    SP.SpellWarnings.noteIf(
      match,
      `"${match.inputText.trim()}":  a ${kindType.instanceName} isn't a kind's value;  say which list, "... in ..."`,
      () => !kindType.valueKind
    )
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "positionOf",
      args: [list ? P.matchAST(list) : ListPosition.kindList(match), P.matchAST(thing)]
    })
  }

  /**
   * The list of `match`'s kind, e.g. `Deck.Ranks`, from its record -- see class docs.
   * - A stub which never became a kind:  an empty list, so no position (and a warning, from `parse()`).
   */
  private static kindList(match: P.MatchFor<ListPosition>): P.ASTExpression {
    const valueKind = match.data.kindType?.valueKind
    if (!valueKind) return new P.ASTArrayLiteral(match, { items: [] })
    return new P.ASTPropertyExpression(match, {
      object: new P.ASTTypeExpression(match, { name: valueKind.listOn }),
      property: valueKind.listName
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
        ["position of thing in my-list", "spellPosition(positionOf(myList, thing))"],
        ["the position of thing in the foo of the bar", "spellPosition(positionOf(bar.foo, thing))"],
        [`the position of "a" in ["a", "b", "c"]`, 'spellPosition(positionOf(["a", "b", "c"], "a"))']
      ]
    }
  ]
})
// ... and a kind's value, in its kind's own list (epic page `outline-spell`, P12):  `the position of its rank`
lists.addRule(ListPosition, {
  syntax: "the? position of {thing:expression}"
})
