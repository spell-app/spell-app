import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `type_specifier_instance` rule:  `as a new thing` -- specifies a property's default/initializer value as a
 * `new_thing` expression.
 * - Compiles (via `getAST()`) to the nested `NewInstanceExpression`, e.g. `new Thing()`.
 */
export class TypeSpecifierInstance extends P.Sequence<"new_thing"> {
  @proto static alias = "type_specifier"

  /** The type it makes, e.g. `thing` for `as a new thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.new_thing.datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    return P.matchAST<P.ASTNewInstanceExpression>(match.groups.new_thing)
  }
}
classes.addRule(TypeSpecifierInstance, {
  syntax: "as {new_thing}",
  tests: [
    {
      tests: [
        ["as a new thing", "new Thing()"],
        ["as a new thing with a=1, b = true", "new Thing({ a: 1, b: true })"]
      ]
    }
  ]
})
