import { instanceCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { type MethodBody } from "./classes.shared"

/**
 * `property_value_either` rule:
 * `the color of a card is red if its suit is either diamonds or hearts (otherwise it is X)?` -- defines a
 * property getter whose value is conditional on `condition`.
 * - Its body is ONE line of a getter's body, `red if ... otherwise it is black`:  a `value_if`
 *   (epic page `outline-spell`, T6).  So the getter's code is written once, there.
 * - SIDE EFFECT: stubs `type` into scope (`P.TypeScope.getOrStub()`), and adds any bare constant value
 *   to `scope.constants` if not already known.
 * - Compiles to a getter in its class that `if`s on the condition, returning the other value
 *   (or falling through) when absent.
 */
export class PropertyValueEither extends SpellStatement<PropertyValueEitherGroups> {
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = {
    kind: "property",
    name: "type_property.property",
    of: "type_property.type"
  }

  /**
   * Quick test:  our words fit, AND an `if` comes after them.
   * - Our body is parsed apart (`{inline_value_if}`), so `Sequence.test()` sees only `{type_property} is`:
   *   without this, every line with `is` in it would be parsed in full, to find its `value_if`.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (super.test(scope, tokens, start) === false) return false
    for (let index = start + 2; index < tokens.length; index++) if (tokens[index]!.matchesLiteral("if")) return true
    return false
  }

  /** Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`;  no `value_if` after `is`, not ours. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !this.getBody(match)) return undefined
    const { type, property } = match.groups.type_property.groups
    const refused = SpellStatement.refuseUnknownType(match, type)
    return refused === match ? SpellStatement.refuseBuiltInType(match, type, property) : refused
  }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { type, property } = match.groups.type_property.groups
    // make sure type is defined
    P.TypeScope.getOrStub(scope, type.value, match).declareProperty(`${property.value}`, match, {
      asWritten: property.raw
    })
    // its values, e.g. `red` and `black`, are the property's to declare:  its declaration lists them
    const { value, otherValue } = (this.getBody(match)?.groups ?? {}) as { value?: P.Match; otherValue?: P.Match }
    for (const constant of [value, otherValue]) SpellConstant.declareValue(match, constant)
  }

  /** Nested scope for the `value_if` body:  `it` / `its` are the thing, as in any getter's. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const typeName = SP.typeName(`${match.groups.type_property.groups.type.value}`)
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: instanceCase(typeName),
      mapItTo: "this",
      itDatatype: typeName,
      declaredBy: match
    })
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    const { type, property } = match.groups.type_property.groups
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: P.matchAST<P.ASTPropertyLiteral>(property),
      get: new P.ASTMethodDefinition(match, { body: P.matchAST<MethodBody>(this.getBody(match)) })
    })
  }
}
classes.addRule(PropertyValueEither, {
  syntax: "{type_property} is {inline_value_if}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.constants?.add("diamonds", "hearts", "clubs", "spades")
      },
      tests: [
        // is one of diamonds or hearts => is_one_of_list
        [
          "the color of a card is red if its suit is either diamonds or hearts",
          [
            'Object.defineProperty(Card.prototype, "color", {',
            "  get() {",
            '    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"',
            "  },",
            "  configurable: true",
            "})"
          ],
          [
            "export interface Card { readonly color: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "color", {',
            "  get(this: Card) {",
            '    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"',
            "  },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "a cards color is black if its suit is either clubs or spades otherwise it is red",
          [
            'Object.defineProperty(Card.prototype, "color", {',
            "  get() {",
            '    if (core.includes(["clubs", "spades"], this.suit)) return "black"',
            '    return "red"',
            "  },",
            "  configurable: true",
            "})"
          ],
          [
            "export interface Card { readonly color: string }",
            'Object.defineProperty(Card.prototype, "color", {',
            "  get(this: Card) {",
            '    if (core.includes(["clubs", "spades"], this.suit)) return "black"',
            '    return "red"',
            "  },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    }
  ]
})

/**
 * Match groups for `property_value_either`'s `syntax` -- `type_property` nests its own `type`/`property`
 * groups, whichever `type_property` alternative matched (`the_property_of_a_thing`/`a_things_property`).
 */
type PropertyValueEitherGroups = P.GroupsFor<"type_property", P.Match<P.GroupsFor<"property|type">>> &
  P.GroupsFor<"body?">
