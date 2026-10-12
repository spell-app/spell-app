import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
import { TypeDeclaration } from "./TypeDeclaration"

/**
 * `create_type` rule:  `a card is a thing` -- declares `type` as a new class extending `superType`.
 * - Its name may be several words, with a short name:  `a bank account aka account is a thing` -- see `TypeDeclaration`.
 * - `Priority.declaration`, so this wins over other `{type} is {type}` -ish statement rules.
 * - SIDE EFFECT: adds `type` to `scope.types`, unless it's already defined (no redefinition/merge) --
 *   see `TypeDeclaration.declareType()`.
 * - Compiles to an exported class declaration, e.g. `a card is a thing` => `export class Card extends Thing {}`.
 *   A drawable one defines its element in it -- see `TypeDeclaration.elementMember()`.
 *   Another project reaches it by `import`ing it -- no globals.
 */
export class CreateType extends TypeDeclaration<
  "type|aka?|superType|with_nested_statements?|body?",
  { elementProject?: string }
> {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "superType" }

  /**
   * Notes a drawable type's project, for its element (`elementMember()`);
   * then refuses a name some other type already goes by -- see `TypeDeclaration.refuseTakenNames()`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { scopeType } = (match.groups.superType as P.Match<P.MatchGroups, { scopeType?: unknown }>).data
    if (scopeType instanceof P.TypeScope && DRAWABLE_TYPES.some((base) => scopeType.isA(base))) {
      match.data.elementProject = TypeDeclaration.projectNameOf(scope)
    }
    return this.refuseTakenNames(match)
  }

  /** SIDE EFFECT:  declares our type -- see `TypeDeclaration.declareType()`. */
  mutateScope(match: P.MatchFor<this>) {
    this.declareType(match, `${match.groups.superType.value}`)
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, superType } = match.groups
    const typeAST = P.matchAST<P.ASTTypeExpression>(type)
    const element = this.elementMember(match, typeAST, match.data.elementProject)
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTClassDeclaration(match, {
          type: typeAST,
          superType: P.matchAST<P.ASTTypeExpression>(superType),
          members: element ? [element] : undefined
        })
      ]
    })
  }
}
classes.addRule(CreateType, {
  syntax: "(a|an) {type:type_words} (aka {aka:singular_type})? is (a|an) {superType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is a thing", "export class Card extends Thing {}"],
        ["a deck is a list", "export class Deck extends List {}"],
        ["a bank account is a thing", "export class BankAccount extends Thing {}"],
        ["a bank account aka account is a thing", "export class BankAccount extends Thing {}"],
        [
          "a card is a drawable thing",
          [
            "export class Card extends Drawable {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}"
          ],
          [
            "export class Card extends Drawable {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}",
            "",
            "/**",
            " * `<test-class-card>`:  a card, drawn in its own element, e.g. by `draw the card`.",
            " * - The page defines its tag with this class:  `spellCore.useElement()`, below.",
            " * - Its attributes are its card's properties;  its methods call its card's.",
            " * - What every drawable thing's element does, e.g. drawing its card, is `SpellElement`'s.",
            " */",
            "export class CardElement extends SpellElement<Card> {",
            '  @E.proto static vocabulary = SpellElement.vocabularyFor("test-class-card", "card", [])',
            "}",
            "spellCore.useElement(Card, CardElement)"
          ]
        ],
        [
          "a card is a drawable",
          [
            "export class Card extends Drawable {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}"
          ],
          [
            "export class Card extends Drawable {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}",
            "",
            "/**",
            " * `<test-class-card>`:  a card, drawn in its own element, e.g. by `draw the card`.",
            " * - The page defines its tag with this class:  `spellCore.useElement()`, below.",
            " * - Its attributes are its card's properties;  its methods call its card's.",
            " * - What every drawable thing's element does, e.g. drawing its card, is `SpellElement`'s.",
            " */",
            "export class CardElement extends SpellElement<Card> {",
            '  @E.proto static vocabulary = SpellElement.vocabularyFor("test-class-card", "card", [])',
            "}",
            "spellCore.useElement(Card, CardElement)"
          ]
        ],
        [
          "a pile is a drawable list",
          [
            "export class Pile extends DrawableList {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}"
          ],
          [
            "export class Pile extends DrawableList {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}",
            "",
            "/**",
            " * `<test-class-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.",
            " * - The page defines its tag with this class:  `spellCore.useElement()`, below.",
            " * - Its attributes are its pile's properties;  its methods call its pile's.",
            " * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.",
            " */",
            "export class PileElement extends SpellElement<Pile> {",
            '  @E.proto static vocabulary = SpellElement.vocabularyFor("test-class-pile", "pile", [])',
            "}",
            "spellCore.useElement(Pile, PileElement)"
          ]
        ]
      ]
    },
    {
      compileAs: "block",
      tests: [
        ["a card is a thing where:", "export class Card extends Thing {}"],
        ["a card is a thing:", "export class Card extends Thing {}"],
        [
          ["a card is a thing with:", "\t- it has a rank as a number"],
          [
            "export class Card extends Thing {",
            '  static { this.declareProp("rank", { type: "number" }) }',
            '  get rank() { return this.getProp("rank") }',
            '  set rank(value) { this.setProp("rank", value) }',
            "}"
          ],
          ["export class Card extends Thing {", '  @prop({ type: "number" }) accessor rank!: number', "}"]
        ]
      ]
    }
  ]
})
classes.addRule(CreateType, {
  syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type} {with_nested_statements}?",
  tests: [
    { compileAs: "statement", tests: [['a "card" is a thing', "export class Card extends Thing {}"]] },
    { compileAs: "block", tests: [['a "card" is a thing where:', "export class Card extends Thing {}"]] }
  ]
})

/** The built-in types whose sub-types draw as their own elements. */
const DRAWABLE_TYPES = ["drawable", "drawable list"]
