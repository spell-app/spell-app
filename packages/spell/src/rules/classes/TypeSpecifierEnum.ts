import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `type_specifier_enum` rule:  specifies a property's allowed values as an enumeration,
 * for use by `define_property_has`.
 * - e.g. `as either red or black`, `as one of clubs, diamonds, hearts, spades`
 * - Compiles (via `getAST()`) to a `P.ASTEnumeration` array literal, e.g. `["red", "black"]`.
 */
export class TypeSpecifierEnum extends P.Sequence<"enumeration"> {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTEnumeration {
    // a range spread into its numbers -- see `number_range`
    const enumeration = P.matchAST<P.ASTListExpression>(match.groups.enumeration).items ?? []
    return new P.ASTEnumeration(match, {
      enumeration,
      values: enumeration.map(valueOf)
    })
  }
}

/**
 * An enumeration's value as spell's scopes keep it:  spell's own, `clubs`, `2`.
 * - No quotes, so each writer quotes it its own way (epic `python-target` P3, output-targets' T4).
 *   It was `'clubs'`, javascript's.
 * - Every item here comes from `identifier_list`, which only ever matches `known_variable`, `constant` or `number`
 *   leaves:  all `Literal` subclasses whose `compile()` returns the underlying primitive value.
 *   But the base `ASTNode.compile()` is typed as `unknown`.
 */
function valueOf(literal: P.ASTExpression): string | number {
  return P.spellValueOf(literal.compile() as string | number)
}
classes.addRule(TypeSpecifierEnum, {
  syntax: "as (either|one of) {enumeration:identifier_list}",
  tests: [
    {
      tests: [
        ["as either red or black", '["red", "black"]'],
        ["as one of clubs, diamonds, hearts, spades", '["clubs", "diamonds", "hearts", "spades"]']
      ]
    }
  ]
})
