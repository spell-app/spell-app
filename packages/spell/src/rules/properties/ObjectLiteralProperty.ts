import { P } from "$/parser"
import { properties } from "./properties.parser"

/**
 * `object_literal_property` rule:  single object-literal property declaration:
 *   `{property} (=|is|of) {value:expression}`.
 * - Its name is `member_words`, e.g. `short rank is 1`,
 *   or a `property` for a structural word, e.g. `a = 1`.
 */
export class ObjectLiteralProperty extends P.Sequence<"property|value"> {
  getAST(match: P.MatchFor<this>) {
    const { property, value } = match.groups
    return new P.ASTObjectLiteralProperty(match, {
      property: P.asAST<P.ASTPropertyLiteral>(property.AST),
      value: P.asAST<P.ASTExpression>(value.AST)
    })
  }
}
properties.addRule(ObjectLiteralProperty, {
  syntax: "(property:{member_words}|{property}) (=|is|of) {value:expression}",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        scope.variables?.add("bar")
      },
      tests: [
        [``, undefined],
        [`a = 1`, `a: 1`],
        [`b = yes`, `b: true`],
        [`c = "quoted"`, `c: "quoted"`],
        [`b = the foo of the bar`, `b: bar.foo`],

        [`length is 1`, `length: 1`],
        [`rank of "queen"`, `rank: "queen"`],
        [`short rank is 1`, "shortRank: 1"],

        // TODO: `{property}` converts to `foo_bar` before we get here
        [`foo-bar = 1`, "fooBar: 1"]
      ]
    }
  ]
})
