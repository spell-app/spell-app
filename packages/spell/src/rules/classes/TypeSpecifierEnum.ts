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
      values: enumeration.map(valueOf)
    })
  }
}

/**
 * An enumeration's value as spell's scopes keep it:  `'clubs'`, `2`.
 * - Every item here comes from `identifier_list`, which only ever matches `known_variable`, `constant` or `number`
 *   leaves -- all `Literal` subclasses whose `compile()` returns the underlying primitive value, but the base
 *   `ASTNode.compile()` is typed as `unknown`.
 * - In single quotes, whatever quotes the code is written in:  the scopes, the rules they make (`placeholderData()`)
 *   and every project's declarations read it so.
 */
function valueOf(literal: P.ASTExpression): string | number {
  const value = literal.compile() as string | number
  return typeof value === "string" ? value.replace(/^"([^"'\\]*)"$/, "'$1'") : value
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
