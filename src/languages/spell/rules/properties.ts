//
//  # Rules for property access.
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { AST, SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"
import { Rules } from "~/parser"
import type { Match } from "~/parser"
import type { RulexGroups } from "~/parser/rulex.types"
import type { ASTNode, Expression, PropertyLiteral, ObjectLiteralProperty } from "~/parser/ast/AST"
import { SpellExpression } from "./expressions"

const LOWER_INITIAL_WORD = /^[a-z][\w\-]*$/

// `Match.AST` is typed generically as `ASTNode | undefined`; narrow to the concrete AST subclass
// that the referenced sub-rule's `getAST()` is known (by inspection) to always produce.
function ast<T extends ASTNode>(node: ASTNode | undefined): T {
  return node as T
}

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
      constructor: class property extends Rules.Pattern {
        // convert dashes to underscores
        // NOTE: `Rules.Pattern.mapValue` is generic (`<T = string>`) for subclasses that map to non-string
        // values; this rule always maps to a string, hence the cast.
        mapValue<T = string>(value: string): T {
          return `${value}`.replace(/-/g, "_") as T
        }
        getAST(match: Match) {
          return new AST.PropertyLiteral(match)
        }
      }
    },

    {
      name: "the_property_of",
      alias: "property_accessor",
      syntax: "the {property} of",
      testRule: "the",
      constructor: class the_property_of extends Rules.Sequence {
        getAST(match: Match<RulexGroups<"property">>) {
          const { value, raw } = match.groups.property!
          return new AST.PropertyLiteral(match, { value, raw })
        }
      }
    },

    {
      // TODO: multiple identifiers would be cool...
      name: "property_expression",
      alias: "expression",
      syntax: "{property_accessor} {expression:simple_expression}",
      testRule: "{property_accessor}", // ???
      constructor: class property_expression extends SpellExpression {
        getAST(match: Match<RulexGroups<"property_accessor:expression">>) {
          const { property_accessor, expression } = match.groups
          return new AST.PropertyExpression(match, {
            object: ast<Expression>(expression!.AST),
            property: ast<PropertyLiteral>(property_accessor!.AST)
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("bar")
            scope.variables?.add("baz")
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
      alias: "expression",
      syntax: "its {property}",
      testRule: "its",
      constructor: class its_property extends SpellExpression {
        getAST(match: Match<RulexGroups<"property">>) {
          const property = ast<PropertyLiteral>(match.groups.property!.AST)
          const itVar = match.scope.variables?.get("it")
          const object = itVar
            ? new AST.VariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
            : new AST.ThisLiteral(match)
          return new AST.PropertyExpression(match, { object, property })
        }
      },
      tests: [
        {
          title: "tracks `it` when it var defined explicitly",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add({ name: "it", output: "it" })
          },
          tests: [
            ["its foo", "it.foo"],
            ["the foo of its bar", "it.bar.foo"]
          ]
        },
        {
          title: "tracks `it` when it var defined via get",
          compileAs: "block",
          tests: [
            [
              ["get a new thing", "print its foo"],
              ["let it = new Thing()", "spellCore.console.log(it.foo)"]
            ]
          ]
        },
        {
          title: "tracks `it` when it var defined as output `other`",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add({ name: "it", output: "other" })
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

    // "its first thing" as:
    //  - possessive tracking `it`:  `get it / put its foo in the bar`
    //  - a synonym for "this" if `it` is not defined.
    {
      name: "its_ordinal",
      alias: ["expression", "property_accessor"],
      syntax: "its {ordinal} {arg:singular_variable}",
      testRule: "its",
      constructor: class its_ordinal extends SpellExpression {
        getAST(match: Match<RulexGroups<"ordinal">>) {
          const { ordinal } = match.groups
          const itVar = match.scope.variables?.get("it")
          const object = itVar
            ? new AST.VariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
            : new AST.ThisLiteral(match)
          return new AST.CoreMethodInvocation(match, {
            methodName: "getItemOf",
            args: [object, ast<Expression>(ordinal!.AST)]
          })
        }
      },
      tests: [
        {
          title: "tracks `it` when it var defined explicitly",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add({ name: "it", output: "it" })
          },
          tests: [
            ["its third foo", "spellCore.getItemOf(it, 3)"],
            ["its last card", "spellCore.getItemOf(it, -1)"]
          ]
        },
        {
          title: "tracks `it` when it var defined via get",
          compileAs: "block",
          tests: [
            [
              ["get a new thing", "print its last item"],
              ["let it = new Thing()", "spellCore.console.log(spellCore.getItemOf(it, -1))"]
            ]
          ]
        },
        {
          title: "tracks `it` when it var defined as output `other`",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add({ name: "it", output: "other" })
          },
          tests: [["its third thing", "spellCore.getItemOf(other, 3)"]]
        },
        {
          title: "maps to `this` when `it` is not defined",
          compileAs: "expression",
          tests: [["its third thing", "spellCore.getItemOf(this, 3)"]]
        }
      ]
    },

    // Single object-literal property declaration
    {
      name: "object_literal_property",
      syntax: "{property} (=|is|of) {value:expression}",
      constructor: class object_literal_property extends Rules.Sequence {
        getAST(match: Match<RulexGroups<"property:value">>) {
          const { property, value } = match.groups
          return new AST.ObjectLiteralProperty(match, {
            property: ast<PropertyLiteral>(property!.AST),
            value: ast<Expression>(value!.AST)
          })
        }
      },
      tests: [
        {
          beforeEach(scope) {
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
      constructor: class object_literal_properties extends Rules.Repeat {
        getAST(match: Match) {
          return new AST.ObjectLiteral(match, {
            properties: match.items.map((propMatch) => ast<ObjectLiteralProperty>(propMatch.AST))
          })
        }
      },
      tests: [
        {
          beforeEach(scope) {
            scope.variables?.add("bar")
          },
          tests: [
            [``, undefined],
            [`a = 1`, `{ a: 1 }`],
            [`a = 1,`, `{ a: 1 }`],
            [`a = 1, b = yes, c = "quoted"`, [`{`, `\ta: 1,`, `\tb: true,`, `\tc: "quoted"`, `}`]],
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
