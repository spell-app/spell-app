import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `type_specifier_instance` rule:  `as a new thing` / `as a new list of tasks` -- specifies a property's
 * default/initializer value as a `new_thing` or `new_list` expression.
 * - A list says what it holds there, e.g. `a todos-app has a property tasks as a new list of tasks`:
 *   no list type needed (epic `output-targets`, I7).
 * - Compiles (via `getAST()`) to the nested `NewInstanceExpression`, e.g. `new Thing()`, `new List(...)`.
 */
export class TypeSpecifierInstance extends P.Sequence<"new_list?|new_thing?"> {
  @proto static alias = "type_specifier"

  /** The type it makes, e.g. `thing` for `as a new thing`, `list of tasks` for `as a new list of tasks`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return this.made(match).datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    return P.matchAST<P.ASTNewInstanceExpression>(this.made(match))
  }

  /** The `new_thing` or `new_list` match:  whichever the syntax took. */
  private made(match: P.MatchFor<this>): P.Match {
    return (match.groups.new_list ?? match.groups.new_thing)!
  }
}
classes.addRule(TypeSpecifierInstance, {
  syntax: "as ({new_list}|{new_thing})",
  tests: [
    {
      tests: [
        ["as a new thing", "new Thing()"],
        ["as a new thing with a=1, b = true", "new Thing({ a: 1, b: true })"],
        [
          "as a new list of numbers",
          'new List({ instanceType: "number" })',
          'new List<number>({ instanceType: "number" })'
        ]
      ]
    }
  ]
})
