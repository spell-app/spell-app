/** Rules for property access -- reading a named property off an object, plus object-literal construction. */

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import { SpellExpression } from "./expressions"

/** Property name: single lower-case-initial word (optionally with `-`/digits), e.g. `foo`, `foo-bar2`. */
const LOWER_INITIAL_WORD = /^[a-z][\w-]*$/

/**
 * Narrow `node` (typed generically as `P.ASTNode | undefined`) to concrete AST subclass `T`.
 * - `T` is chosen by inspection: referenced sub-rule's `getAST()` is known to always produce it.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

export const properties = new SpellParser({
  module: "properties",
  rules: [
    /**
     * Generic property name -- single word, initial-lower-case, not in `identifierBlacklist`.
     * - You can register multi-word property identifiers manually.
     * - `mapValue()` converts dashes to underscores, e.g. `foo-bar` compiles as `foo_bar`.
     */
    {
      // TODO: property_name
      name: "property",
      pattern: LOWER_INITIAL_WORD,
      blacklist: identifierBlacklist,
      constructor: class property extends P.Pattern {
        /**
         * Convert dashes to underscores.
         * - NOTE: `Rules.Pattern.mapValue` is generic (`<T = string>`) for subclasses that map to non-string
         *   values; this rule always maps to a string, hence the cast.
         */
        mapValue<T = string>(value: string): T {
          return `${value}`.replace(/-/g, "_") as T
        }
        getAST(match: P.Match) {
          return new P.ASTPropertyLiteral(match)
        }
      }
    },

    /**
     * `the {property} of` -- prefix form of property access, paired with a following object expression
     * by `property_expression` below.
     * - Reuses `property`'s already-parsed `value`/`raw` group rather than re-deriving them.
     */
    {
      name: "the_property_of",
      alias: "property_accessor",
      syntax: "the {property} of",
      testRule: "the",
      constructor: class the_property_of extends P.Sequence {
        getAST(match: P.Match<P.RulexGroups<"property">>) {
          const { value, raw } = match.groups.property!
          return new P.ASTPropertyLiteral(match, { value, raw })
        }
      }
    },

    /**
     * `{property_accessor} {expression}` -- combines a leading `the X of`/`its X` accessor with the object
     * expression that follows, e.g. `the foo of the bar` ~== `bar.foo`.
     * - TODO: multiple identifiers would be cool...
     */
    {
      name: "property_expression",
      alias: "expression",
      syntax: "{property_accessor} {expression:simple_expression}",
      testRule: "{property_accessor}", // ???
      constructor: class property_expression extends SpellExpression {
        getAST(match: P.Match<P.RulexGroups<"property_accessor:expression">>) {
          const { property_accessor, expression } = match.groups
          return new P.ASTPropertyExpression(match, {
            object: ast<P.ASTExpression>(expression!.AST),
            property: ast<P.ASTPropertyLiteral>(property_accessor!.AST)
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

    /**
     * `its {property}` -- possessive shorthand.
     * - Tracks `it`:  `get it` / `put its foo in the bar`.
     * - Synonym for `this` if `it` is not (yet) defined in scope.
     */
    {
      name: "its_property",
      alias: "expression",
      syntax: "its {property}",
      testRule: "its",
      constructor: class its_property extends SpellExpression {
        getAST(match: P.Match<P.RulexGroups<"property">>) {
          const property = ast<P.ASTPropertyLiteral>(match.groups.property!.AST)
          const itVar = match.scope.variables?.get("it")
          const object = itVar
            ? new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
            : new P.ASTThisLiteral(match)
          return new P.ASTPropertyExpression(match, { object, property })
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

    /**
     * `its {ordinal} {arg}` -- possessive-plus-ordinal shorthand, e.g. `its third card`.
     * - Tracks `it`:  `get it` / `put its foo in the bar`.
     * - Synonym for `this` if `it` is not (yet) defined in scope.
     * - Compiles to `spellCore.getItemOf(object, ordinal)` rather than a plain property access.
     */
    {
      name: "its_ordinal",
      alias: ["expression", "property_accessor"],
      syntax: "its {ordinal} {arg:singular_variable}",
      testRule: "its",
      constructor: class its_ordinal extends SpellExpression {
        getAST(match: P.Match<P.RulexGroups<"ordinal">>) {
          const { ordinal } = match.groups
          const itVar = match.scope.variables?.get("it")
          const object = itVar
            ? new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
            : new P.ASTThisLiteral(match)
          return new P.ASTCoreMethodInvocation(match, {
            methodName: "getItemOf",
            args: [object, ast<P.ASTExpression>(ordinal!.AST)]
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

    /** Single object-literal property declaration:  `{property} (=|is|of) {value}`. */
    {
      name: "object_literal_property",
      syntax: "{property} (=|is|of) {value:expression}",
      constructor: class object_literal_property extends P.Sequence {
        getAST(match: P.Match<P.RulexGroups<"property:value">>) {
          const { property, value } = match.groups
          return new P.ASTObjectLiteralProperty(match, {
            property: ast<P.ASTPropertyLiteral>(property!.AST),
            value: ast<P.ASTExpression>(value!.AST)
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

    /** Object literal: creates an object with one or more property values, e.g. `foo = 1 and bar is 2`. */
    {
      name: "object_literal_properties",
      syntax: "[{object_literal_property}(,|and)]",
      constructor: class object_literal_properties extends P.Repeat {
        getAST(match: P.Match) {
          return new P.ASTObjectLiteral(match, {
            properties: match.items.map((propMatch) => ast<P.ASTObjectLiteralProperty>(propMatch.AST))
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
