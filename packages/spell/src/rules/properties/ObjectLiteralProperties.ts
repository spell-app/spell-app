import { P } from "$/parser"
import { properties } from "./properties.parser"

/**
 * `object_literal_properties` rule:  object literal -- creates an object with one or more property values,
 *   e.g. `foo = 1 and bar is 2`.
 */
export class ObjectLiteralProperties extends P.Repeat {
  getAST(match: P.MatchFor<this>) {
    return new P.ASTObjectLiteral(match, {
      properties: match.items.map((propMatch) => P.asAST<P.ASTObjectLiteralProperty>(propMatch.AST))
    })
  }
}
properties.addRule(ObjectLiteralProperties, {
  syntax: "[{object_literal_property} (,|and)]",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        scope.variables?.add("bar")
      },
      tests: [
        [``, undefined],
        [`a = 1`, `{ a: 1 }`],
        [`a = 1,`, `{ a: 1 }`],
        [`a = 1, b = yes, c = "quoted"`, [`{`, `  a: 1,`, `  b: true,`, `  c: "quoted"`, `}`]],
        [`a = 1, b = the foo of the bar`, `{ a: 1, b: bar.foo }`],

        [`length is 1, rank of "queen"`, `{ length: 1, rank: "queen" }`],

        // TODO: `{property}` converts to `foo_bar` before we get here
        [`foo-bar = 1`, "{ fooBar: 1 }"]
      ]
    }
  ]
})
