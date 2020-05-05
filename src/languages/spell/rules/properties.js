//
//  # Rules for property access.
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { AST, SpellParser } from ".."
import identifierBlacklist from "./identifier-blacklist"

const LOWER_INITIAL_WORD = /^[a-z][\w\-]*$/

export default new SpellParser({
  module: "properties",
  rules: [
    // Generic property name -- single word, initial-lower case, not in identifier blacklist.
    // You can register multi-word property identifiers manually.
    {
      // TODO: property_name
      name: "property",
      pattern: LOWER_INITIAL_WORD,
      blacklist: identifierBlacklist,
      // convert dashes to underscores
      mapValue(value) {
        return `${value}`.replace(/-/g, "_")
      },
      getAST(match) {
        return new AST.PropertyLiteral(match)
      }
    },

    {
      name: "the_property_of",
      alias: "property_accessor",
      syntax: "the {property} of",
      testRule: "the",
      getAST(match) {
        const { value, raw } = match.groups.property
        return new AST.PropertyLiteral(match, { value, raw })
      }
    },

    {
      // TODO: multiple identifiers would be cool...
      name: "property_expression",
      alias: ["expression", "single_expression"],
      syntax: "{property_accessor} {expression:single_expression}",
      testRule: "{property_accessor}", // ???
      getAST(match) {
        const { property_accessor, expression } = match.groups
        return new AST.PropertyExpression(match, {
          object: expression.AST,
          property: property_accessor.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("bar")
            scope.variables.add("baz")
          },
          tests: [
            ["the foo of bar", "bar.foo"],
            ["the foo of the bar", "bar.foo"],
            ["the foo of the bar of the baz", "baz.bar.foo"],
            ["the foo-bar of the baz", "baz.foo_bar"]
          ]
        }
      ]
    },

    // "its" as:
    //  - a local variable, if one is defined (e.g. in an instance method), or
    //  - a synonym for "this"
    {
      name: "its_property",
      alias: ["expression", "property_accessor", "single_expression"],
      syntax: "its {property}",
      testRule: "its",
      getAST(match) {
        const property = match.groups.property.AST
        const itsVar = match.scope.variables("its")
        const object = itsVar
          ? new AST.VariableExpression(match, { raw: "its", name: itsVar.output, variable: itsVar })
          : new AST.ThisLiteral(match)
        return new AST.PropertyExpression(match, { object, property })
      },
      tests: [
        // TESTME: `its` inside an instance method
        {
          compileAs: "expression",
          tests: [
            ["its foo", "this.foo"],
            ["the foo of its bar", "this.bar.foo"]
          ]
        }
      ]
    },

    // Properties clause: creates an object with one or more property values.
    //  `foo = 1, bar = 2`
    // TODO: don't quote if we don't have to? (ASCII and blacklist only)
    // TODO: multiple lines if > 2 props?
    {
      name: "object_literal_properties",
      syntax: "[({property} (=|is|of|is? set to) {value:expression})(,|and)]",
      getAST(match) {
        const properties = match.items.map(propMatch => {
          const { property, value } = propMatch.groups
          return new AST.ObjectLiteralProperty(propMatch, { property: property.AST, value: value.AST })
        })
        return new AST.ObjectLiteral(match, { properties })
      },
      tests: [
        {
          beforeEach(scope) {
            scope.variables.add("bar")
          },
          tests: [
            [``, undefined],
            [`a = 1`, `{ a: 1 }`],
            [`a = 1,`, `{ a: 1 }`],
            [`a = 1, b = yes, c = "quoted"`, `{ a: 1, b: true, c: "quoted" }`],
            [`a = 1, b = the foo of the bar`, `{ a: 1, b: bar.foo }`],

            [`length is 1, rank of "queen"`, `{ length: 1, rank: "queen" }`],

            // TODO: `{property}` converts to `foo_bar` before we get here
            [`foo-bar = 1`, `{ foo_bar: 1 }`]
          ]
        }
      ]
    }
  ]
})
