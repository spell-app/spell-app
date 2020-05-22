//
//  # Rules for property access.
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { AST, SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"

const LOWER_INITIAL_WORD = /^[a-z][\w\-]*$/

export const properties = new SpellParser({
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
    //  - possessive tracking `it`:  `get it / put its foo in the bar`
    //  - a synonym for "this" if `it` is not defined.
    {
      name: "its_property",
      alias: ["expression", "property_accessor", "single_expression"],
      syntax: "its {property}",
      testRule: "its",
      getAST(match) {
        const property = match.groups.property.AST
        const itVar = match.scope.variables.get("it")
        const object = itVar
          ? new AST.VariableExpression(match, { raw: "it", name: itVar.output })
          : new AST.ThisLiteral(match)
        return new AST.PropertyExpression(match, { object, property })
      },
      tests: [
        {
          title: "tracks `it` when it var defined as output `it`",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add({ name: "it", output: "it" })
          },
          tests: [
            ["its foo", "it.foo"],
            ["the foo of its bar", "it.bar.foo"]
          ]
        },
        {
          title: "tracks `it` when it var defined as output `other`",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add({ name: "it", output: "other" })
          },
          tests: [
            ["its foo", "other.foo"],
            ["the foo of its bar", "other.bar.foo"]
          ]
        },
        {
          title: "maps to `this` when `it` is not defined",
          compileAs: "expression",
          tests: [
            ["its foo", "this.foo"],
            ["the foo of its bar", "this.bar.foo"]
          ]
        }
      ]
    },

    // Single object-literal property declaration
    {
      name: "object_literal_property",
      syntax: "({property} (=|is|of) {value:expression})",
      getAST(match) {
        const { property, value } = match.groups
        return new AST.ObjectLiteralProperty(match, {
          property: property.AST,
          value: value.AST
        })
      },
      tests: [
        {
          beforeEach(scope) {
            scope.variables.add("bar")
          },
          tests: [
            [``, undefined],
            [`a = 1`, `a: 1`],
            [`b = yes`, `b: true`],
            [`c = "quoted"`, `c: "quoted"`],
            [`b = the foo of the bar`, `b: bar.foo`],

            [`length is 1`, `length: 1`],
            [`rank of "queen"`, `rank: "queen"`],

            // TODO: `{property}` converts to `foo_bar` before we get here
            [`foo-bar = 1`, `foo_bar: 1`]
          ]
        }
      ]
    },

    // Object literal: creates an object with one or more property values.
    //  `foo = 1 and bar is 2`
    {
      name: "object_literal_properties",
      syntax: "[{object_literal_property}(,|and)]",
      getAST(match) {
        return new AST.ObjectLiteral(match, {
          properties: match.items.map(propMatch => propMatch.AST)
        })
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
