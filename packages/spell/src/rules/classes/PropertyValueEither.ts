import { proto } from "$/util"
import { P } from "$/parser"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `property_value_either` rule:
 * `the color of a card is red if its suit is either diamonds or hearts (otherwise it is X)?` -- defines a
 * property getter whose value is conditional on `condition`.
 * - SIDE EFFECT: stubs `type` into scope (`P.TypeScope.getOrStub()`), and adds any bare constant `value`/`otherValue`
 *   to `scope.constants` if not already known.
 * - Compiles to a getter in its class that `if`s on `condition`, returning `otherValue`
 *   (or falling through) when absent.
 */
export class PropertyValueEither extends SpellStatement<PropertyValueEitherGroups> {
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = {
    kind: "property",
    name: "type_property.property",
    of: "type_property.type"
  }

  /** Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, property } = match.groups.type_property.groups
    const refused = SpellStatement.refuseUnknownType(match, type)
    return refused === match ? SpellStatement.refuseBuiltInType(match, type, property) : refused
  }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { value, otherValue, type_property } = match.groups
    const { type, property } = type_property.groups
    // make sure type is defined
    P.TypeScope.getOrStub(scope, type.value, match).declareProperty(`${property.value}`, match, {
      asWritten: property.raw,
      isGetter: true
    })
    // Declare any unknown constant values, and record them on their matches for `SpellConstant.getAST()`.
    for (const constant of [value, otherValue]) SpellConstant.declareValue(match, constant)
  }
  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    const { value, otherValue, type_property, condition } = match.groups
    const { type, property } = type_property.groups
    const ifAST = new P.ASTIfStatement(match, {
      condition: P.matchAST(condition),
      statements: new P.ASTReturnStatement(match, { value: P.matchAST(value) })
    })
    let getterBody: P.ASTStatement
    if (!otherValue) {
      getterBody = ifAST
    } else {
      getterBody = new P.ASTStatementGroup(match, {
        statements: [ifAST, new P.ASTReturnStatement(match, { value: P.matchAST(otherValue) })]
      })
    }
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: P.matchAST<P.ASTPropertyLiteral>(property),
      get: new P.ASTMethodDefinition(match, { body: getterBody })
    })
  }
}
classes.addRule(PropertyValueEither, {
  syntax:
    "{type_property} is (value:{constant}|{expression}) if {condition:expression} (otherwise it is (otherValue:{constant}|{expression}))?",
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
            "Object.defineProperty(Card.prototype, 'color', {",
            "  get() {",
            "    if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }",
            "  },",
            "  configurable: true",
            "})"
          ],
          [
            "export interface Card { readonly color: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "color", {',
            "  get(this: Card) {",
            '    if (spellCore.includes(["diamonds", "hearts"], this.suit)) return "red"',
            "  },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "a cards color is black if its suit is either clubs or spades otherwise it is red",
          [
            "Object.defineProperty(Card.prototype, 'color', {",
            "  get() {",
            "    if (spellCore.includes(['clubs', 'spades'], this.suit)) { return 'black' }",
            "    return 'red'",
            "  },",
            "  configurable: true",
            "})"
          ],
          [
            "export interface Card { readonly color: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "color", {',
            "  get(this: Card) {",
            '    if (spellCore.includes(["clubs", "spades"], this.suit)) return "black"',
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
  P.GroupsFor<"value|condition|otherValue?">
