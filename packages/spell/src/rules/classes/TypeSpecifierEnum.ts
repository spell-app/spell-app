import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `type_specifier_enum` rule:  `as either red or black` / `as one of clubs, diamonds, hearts, spades` -- specifies a
 * property's allowed values as an enumeration, for use by `define_property_has` below.
 * - Compiles (via `getAST()`) to a `P.ASTEnumeration` array literal, e.g. `['red', 'black']`.
 */
export class TypeSpecifierEnum extends P.Sequence<"enumeration"> {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTEnumeration {
    // a range spread into its numbers -- see `number_range`
    const enumeration = P.matchAST<P.ASTListExpression>(match.groups.enumeration).items ?? []
    return new P.ASTEnumeration(match, {
      enumeration,
      // Every item here comes from `identifier_list`, which only ever matches `known_variable`,
      // `constant` or `number` leaves -- all `Literal` subclasses whose `compile()` returns the
      // underlying primitive value, but the base `ASTNode.compile()` is typed as `unknown`.
      values: enumeration.map((literal) => literal.compile() as string | number)
    })
  }
}
classes.addRule(TypeSpecifierEnum, {
  syntax: "as (either|one of) {enumeration:identifier_list}",
  tests: [
    {
      tests: [
        ["as either red or black", "['red', 'black']", '["red", "black"]'],
        [
          "as one of clubs, diamonds, hearts, spades",
          "['clubs', 'diamonds', 'hearts', 'spades']",
          '["clubs", "diamonds", "hearts", "spades"]'
        ]
      ]
    }
  ]
})
