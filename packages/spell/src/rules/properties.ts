/** Rules for property access -- reading a named property off an object, plus object-literal construction. */

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { NONE, proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import { SpellExpression } from "./expressions"

/**
 * Rule module for property-access rules (`property`, `the_property_of`, `property_expression`, `its_property`,
 * `its_ordinal`, `object_literal_property`, `object_literal_properties`).
 */
export const properties = new SpellParser({ module: "properties" })

/**
 * Narrow `node` (typed generically as `P.ASTNode | undefined`) to concrete AST subclass `T`.
 * - `T` is chosen by inspection: referenced sub-rule's `getAST()` is known to always produce it.
 */
// CLAUDE TODO: should this be `AST.is()` in AST.ts?
////////////////
// ## `property` rule
//    e.g. "foo"
////////////////

/** Property name: single lower-case-initial word (optionally with `-`/digits), e.g. `foo`, `foo-bar2`. */
const LOWER_INITIAL_WORD = /^[a-z][\w-]*$/

/**
 * Generic property name -- single word, initial-lower-case, not in `identifierBlacklist`.
 * - You can register multi-word property identifiers manually.
 * - `mapValue()` converts dashes to underscores, e.g. `foo-bar` compiles as `foo_bar`.
 */
// TODO: property_name
class property extends P.Pattern {
  @proto static pattern = LOWER_INITIAL_WORD
  @proto static blacklist = identifierBlacklist
  @proto static highlightAs: P.HighlightKind = "property"

  /**
   * Convert dashes to underscores.
   * - NOTE: `Rules.Pattern.mapValue` is generic (`<T = string>`) for subclasses that map to non-string
   *   values; this rule always maps to a string, hence the cast.
   */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }
  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }
}
properties.addRule(property)

////////////////
// ## `the_property_of` rule
//    e.g. "the foo of"
////////////////

/**
 * `the {property} of` -- prefix form of property access, paired with a following object expression
 * by `property_expression` below.
 * - Reuses `property`'s already-parsed `value`/`raw` group rather than re-deriving them.
 */
class the_property_of extends P.Sequence<"property"> {
  @proto static alias = "property_accessor"

  getAST(match: P.MatchFor<this>) {
    const { value, raw } = match.groups.property
    return new P.ASTPropertyLiteral(match, { value, raw })
  }
}
properties.addRule(the_property_of, {
  syntax: "the {property} of"
})

////////////////
// ## `property_expression` rule
//    e.g. "the foo of bar"
////////////////

/**
 * `{property_accessor} {expression}` -- combines a leading `the X of`/`its X` accessor with the object
 * expression that follows, e.g. `the foo of the bar` ~== `bar.foo`.
 * - TODO: multiple identifiers would be cool...
 */
class property_expression extends SpellExpression<"property_accessor|expression"> {
  /** Our syntax is all subrules, so ask `property_accessor` whether it could start here, e.g. `the foo of`. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (super.test(scope, tokens, start) === false) return false
    return scope.getRuleOrDie("property_accessor").test(scope, tokens, start)
  }
  getAST(match: P.MatchFor<this>) {
    const { property_accessor, expression } = match.groups
    return new P.ASTPropertyExpression(match, {
      object: P.asAST<P.ASTExpression>(expression.AST),
      property: P.asAST<P.ASTPropertyLiteral>(property_accessor.AST)
    })
  }
}
properties.addRule(property_expression, {
  syntax: "{property_accessor} {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
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
})

////////////////
// ## `its_property` rule
//    e.g. "its foo"
////////////////

/**
 * `its {property}` -- possessive shorthand.
 * - Tracks `it`:  `get it` / `put its foo in the bar`.
 * - Synonym for `this` if `it` is not (yet) defined in scope.
 */
class its_property extends SpellExpression<"property", ItsMatchData> {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) match.data.itVar = scope.variables?.get("it") ?? NONE
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const property = P.asAST<P.ASTPropertyLiteral>(match.groups.property.AST)
    const itVar = match.data.itVar === NONE ? undefined : match.data.itVar
    const object = itVar
      ? new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
      : new P.ASTThisLiteral(match)
    return new P.ASTPropertyExpression(match, { object, property })
  }
}
properties.addRule(its_property, {
  syntax: "its {property}",
  tests: [
    {
      title: "tracks `it` when it var defined explicitly",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
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
      beforeEach(scope: P.Scope) {
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
})

////////////////
// ## `its_ordinal` rule
//    e.g. "its third foo"
////////////////

/**
 * `its {ordinal} {arg}` -- possessive-plus-ordinal shorthand, e.g. `its third card`.
 * - Tracks `it`:  `get it` / `put its foo in the bar`.
 * - Synonym for `this` if `it` is not (yet) defined in scope.
 * - Compiles to `spellCore.getItemOf(object, ordinal)` rather than a plain property access.
 */
class its_ordinal extends SpellExpression<"ordinal|arg", ItsMatchData> {
  @proto static alias = ["expression", "property_accessor"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) match.data.itVar = scope.variables?.get("it") ?? NONE
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const { ordinal } = match.groups
    const itVar = match.data.itVar === NONE ? undefined : match.data.itVar
    const object = itVar
      ? new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
      : new P.ASTThisLiteral(match)
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [object, P.asAST<P.ASTExpression>(ordinal.AST)]
    })
  }
}
properties.addRule(its_ordinal, {
  syntax: "its {ordinal} {arg:singular_identifier}",
  tests: [
    {
      title: "tracks `it` when it var defined explicitly",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
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
      beforeEach(scope: P.Scope) {
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
})

////////////////
// ## `object_literal_property` rule
//    e.g. "a = 1"
////////////////

/** Single object-literal property declaration:  `{property} (=|is|of) {value:expression}`. */
class object_literal_property extends P.Sequence<"property|value"> {
  getAST(match: P.MatchFor<this>) {
    const { property, value } = match.groups
    return new P.ASTObjectLiteralProperty(match, {
      property: P.asAST<P.ASTPropertyLiteral>(property.AST),
      value: P.asAST<P.ASTExpression>(value.AST)
    })
  }
}
properties.addRule(object_literal_property, {
  syntax: "{property} (=|is|of) {value:expression}",
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

        // TODO: `{property}` converts to `foo_bar` before we get here
        [`foo-bar = 1`, `foo_bar: 1`]
      ]
    }
  ]
})

////////////////
// ## `object_literal_properties` rule
//    e.g. "a = 1"
////////////////

/** Object literal: creates an object with one or more property values, e.g. `foo = 1 and bar is 2`. */
class object_literal_properties extends P.Repeat {
  getAST(match: P.MatchFor<this>) {
    return new P.ASTObjectLiteral(match, {
      properties: match.items.map((propMatch) => P.asAST<P.ASTObjectLiteralProperty>(propMatch.AST))
    })
  }
}
properties.addRule(object_literal_properties, {
  syntax: "[{object_literal_property}(,|and)]",
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
        [`foo-bar = 1`, `{ foo_bar: 1 }`]
      ]
    }
  ]
})

////////////////
// ## Shared types
////////////////

/** What `its_property` / `its_ordinal` stash on their matches. */
type ItsMatchData = {
  /** `it` in scope when parsed, or `NONE` => means `this`.  Looked up THEN, not in `getAST()` -- see `SpellIdentifier`. */
  itVar?: P.ScopeVariable | typeof NONE
}
