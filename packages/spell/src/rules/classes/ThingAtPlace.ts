import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellExpression } from "$/spell/rules/expressions"
import { classes } from "./classes.parser"

/**
 * `thing_at_place` rule:  one thing, by its type and its place (epic `drawable-thing` P19, Owen's J23).
 * - `the first tableau` is the first tableau the program made.
 * - e.g. `the first tableau`, `the second tableau`, `the last tableau`, `the name of the third foundation`
 * - Its place:  the order the program made the things of that type, counting from 1.
 *   - `last` counts from the end.
 *   - Only that type's own things count, not a sub-type's (T10).
 * - Compiles to core's `spellCore.thingAtPlace(Tableau, 1)`:  the reference `Tableau#1`.
 *   Nothing (`undefined`) when the program hasn't made that many.
 * - NOT `the first card of the deck`:  that's an item of a list, `ordinal_position_expression`.
 */
export class ThingAtPlace extends SpellExpression<"ordinal|type"> {
  /** The type we find a thing of, e.g. `Tableau`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { ordinal, type } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "thingAtPlace",
      args: [P.matchAST<P.ASTTypeExpression>(type), P.matchAST(ordinal)]
    })
  }
}
classes.addRule(ThingAtPlace, {
  syntax: "the {ordinal} {type:known_type}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(["a pile is a list of things", "a tableau is a pile"].join("\n"), "block")
      },
      tests: [
        ["the first tableau", "spellCore.thingAtPlace(Tableau, 1)"],
        ["the second tableau", "spellCore.thingAtPlace(Tableau, 2)"],
        ["the last tableau", "spellCore.thingAtPlace(Tableau, -1)"]
      ]
    }
  ]
})
