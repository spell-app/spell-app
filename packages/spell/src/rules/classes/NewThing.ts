import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `new_thing` rule:  `a new object` -- constructs `type` (optionally `with`/`where`/`whose` `props`).
 * - NOTE: we assume that all types take an object of properties????
 * - Compiles to `new Type(...)`, e.g. `a new Thing with a = 1, b = yes` => `new Thing({ a: 1, b: true })`.
 */
export class NewThing extends SpellStatement<"type|props?"> {
  @proto static alias = "expression"

  /** The type it makes, e.g. `Card`, `thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    const { type, props } = match.groups
    return new P.ASTNewInstanceExpression(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      props: P.matchAST<P.ASTObjectLiteral>(props)
    })
  }
}
classes.addRule(NewThing, {
  syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
  tests: [
    {
      title: "creates normal types",
      compileAs: "expression",
      tests: [
        [`a new thing`, `new Thing()`],
        [`a new Thing with a = 1, b = yes`, `new Thing({ a: 1, b: true })`]
      ]
    },
    {
      title: "creates base types",
      compileAs: "expression",
      tests: [
        ["a new Object", "new Object()"],
        ["a new object with a = 1, b = yes", "new Object({ a: 1, b: true })"]
      ]
    }
  ]
})
