import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `list_count` rule:  length of something KNOWN to be a list, without naming its items,
 * e.g. `the number of card suits` => `spellCore.itemCountOf(Card.Suits)`.
 * - Rejects the match unless its datatype says it's a list, or a list type, e.g. `Deck`:
 *   else `the number of x` stays a property read, `x.number`.
 * - `Priority.mostSpecific`, as `list_length`, which wins when it names the items:  it's longer.
 */
export class ListCount extends SpellExpression<"list"> {
  @proto static priority = Priority.mostSpecific
  @proto static datatype = "number"

  /** Only a list -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !scope.getType(match.groups.list.datatype)?.isA("list")) return undefined
    return match
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "itemCountOf", args: [P.matchAST(match.groups.list)] })
  }
}
lists.addRule(ListCount, {
  syntax: "the? number of {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(["a card is a thing", "a card has a suit as one of clubs, diamonds", "set x to 1"].join("\n"))
      },
      tests: [
        ["the number of card suits", "spellCore.itemCountOf(Card.Suits)"],
        ["the number of [1, 2]", "spellCore.itemCountOf([1, 2])"],
        { title: "not a list:  a property read", input: "the number of x", js: "x.number" }
      ]
    }
  ]
})
