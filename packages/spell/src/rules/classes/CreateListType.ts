import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { classes } from "./classes.parser"
import { TypeDeclaration } from "./TypeDeclaration"

/**
 * `create_list_type` rule:  `a deck is a list of cards` or `create a type called Deck as a list of cards` -- declares
 * `type` as a new class extending `List`, with its `instanceType` set to `instanceType`.
 * - `Priority.declaration`, so this wins over the plainer `create_type` rule above for the `is a list of` form.
 * - SIDE EFFECT: adds `type` to `scope.types` (superType `"list"`), unless already defined --
 *   with its `itemType`, e.g. `Card`, so `the first card of the deck` knows it's a card.
 * - Its name may be several words, with a short name:  `a draw pile aka pile is a list of cards` -- see
 *   `TypeDeclaration`.
 * - Compiles to a class declaration extending `List` with a static `instanceType`,
 *   e.g. `a deck is a list of cards` => `export class Deck extends List {` + `static instanceType = Card` + `}`.
 * - A card in at most ONE pile at a time:  `a card belongs to one pile`, below.
 */
export class CreateListType extends TypeDeclaration<
  "type|instanceType|aka?|with_nested_statements?|body?",
  { itemTypeBelow?: boolean }
> {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "instanceType" }
  /** Built-in list type it extends:  `list`, or `drawable list` -- see `CreateDrawableListType`. */
  @proto static listType: P.Datatype = "list"
  declare listType: P.Datatype

  /**
   * Notes whether what it holds is declared BELOW us, e.g. `a deck is a list of cards` above `a card is a thing`:
   * then its class is read when used -- `static get instanceType() { return Card }` -- as `Card` isn't defined yet.
   * - A value kind on us, e.g. the deck's `"suits" as one of ...`, is why:  the card says `its "suit" is a suit`,
   *   so the deck comes first (plan doc `outline-spell`, P2).
   * - Then refuses a name some other type already goes by -- see `TypeDeclaration.refuseTakenNames()`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { scopeType } = (match.groups.instanceType as P.Match<P.MatchGroups, { scopeType?: unknown }>).data
    if (scopeType instanceof P.TypeScope && scopeType.stub) match.data.itemTypeBelow = true
    return this.refuseTakenNames(match)
  }

  /** SIDE EFFECT:  declares our type -- see `TypeDeclaration.declareType()`. */
  mutateScope(match: P.MatchFor<this>) {
    this.declareType(match, this.listType, { itemType: SP.typeName(`${match.groups.instanceType.value}`) })
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, instanceType } = match.groups
    const typeAST = P.matchAST<P.ASTTypeExpression>(type)
    const value = P.matchAST<P.ASTTypeExpression>(instanceType)
    // declared below us:  read when used -- see `parse()`
    const members: P.ASTClassMember[] = match.data.itemTypeBelow
      ? [
          new P.ASTStaticMethod(match, {
            type: typeAST,
            name: "instanceType",
            getter: true,
            method: new P.ASTMethodDefinition(match, { body: value })
          })
        ]
      : [new P.ASTStaticDefinition(match, { type: typeAST, name: "instanceType", value })]
    const superType = new P.ASTTypeExpression(match, { raw: this.listType, name: P.classCase(this.listType) })
    return new P.ASTStatementGroup(match, {
      statements: [new P.ASTClassDeclaration(match, { type: typeAST, superType, members })]
    })
  }
}
classes.addRule(CreateListType, {
  syntax: "create a type (named|called) {type} as (a|an) list of {instanceType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "create a type named hand as a list of cards",
          ["export class Hand extends List {", "  static instanceType = Card", "}"],
          ["export class Hand extends List<Card> {", "  static instanceType = Card", "}"]
        ]
      ]
    }
  ]
})
// TODO: "{plural_type} are a list of ..."
classes.addRule(CreateListType, {
  syntax:
    "(a|an) {type:type_words} (aka {aka:singular_type})? is (a|an) list of {instanceType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "a deck is a list of cards",
          ["export class Deck extends List {", "  static instanceType = Card", "}"],
          ["export class Deck extends List<Card> {", "  static instanceType = Card", "}"]
        ]
      ]
    },
    {
      compileAs: "block",
      tests: [
        [
          "a deck is a list of cards with:",
          ["export class Deck extends List {", "  static instanceType = Card", "}"],
          ["export class Deck extends List<Card> {", "  static instanceType = Card", "}"]
        ]
      ]
    }
  ]
})
classes.addRule(CreateListType, {
  syntax: "(a|an) {type:quoted_type} is (a|an) list of {instanceType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          'a "deck" is a list of cards',
          ["export class Deck extends List {", "  static instanceType = Card", "}"],
          ["export class Deck extends List<Card> {", "  static instanceType = Card", "}"]
        ]
      ]
    },
    {
      compileAs: "block",
      tests: [
        [
          'a "deck" is a list of cards with:',
          ["export class Deck extends List {", "  static instanceType = Card", "}"],
          ["export class Deck extends List<Card> {", "  static instanceType = Card", "}"]
        ]
      ]
    }
  ]
})
