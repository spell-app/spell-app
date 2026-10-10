import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { classes } from "./classes.parser"

/**
 * `type_specifier_datatype` rule:  `as a number` / `as an automobile` -- specifies a property's datatype as a primitive
 * or known type.
 * - Compiles (via `getAST()`) directly to the `datatype`'s `TypeExpression`, e.g. `number` or `Automobile`.
 */
export class TypeSpecifierDatatype extends P.Sequence<"datatype"> {
  @proto static alias = "type_specifier"

  /** The type it names, in spell's words, e.g. `number`, `Automobile`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.datatype.value}`)
  }

  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    return P.matchAST<P.ASTTypeExpression>(match.groups.datatype)
  }
}
classes.addRule(TypeSpecifierDatatype, {
  syntax: "as (a|an)? {datatype:singular_type}",
  tests: [
    {
      tests: [
        ["as a number", "number"],
        ["as an automobile", "Automobile"]
      ]
    }
  ]
})
