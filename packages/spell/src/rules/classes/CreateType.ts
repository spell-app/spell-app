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
 *   Another project reaches it by `import`ing it -- no globals.
 */
export class CreateType extends TypeDeclaration<"type|aka?|superType|with_nested_statements?|body?"> {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "superType" }

  /** Refuses a name some other type already goes by -- see `TypeDeclaration.refuseTakenNames()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens)
    return match && this.refuseTakenNames(match)
  }

  /** SIDE EFFECT:  declares our type -- see `TypeDeclaration.declareType()`. */
  mutateScope(match: P.MatchFor<this>) {
    this.declareType(match, `${match.groups.superType.value}`)
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, superType } = match.groups
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTClassDeclaration(match, {
          type: P.matchAST<P.ASTTypeExpression>(type),
          superType: P.matchAST<P.ASTTypeExpression>(superType)
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
        ["a bank account is a thing", "export class Bank_Account extends Thing {}"],
        ["a bank account aka account is a thing", "export class Bank_Account extends Thing {}"],
        ["a card is a drawable thing", "export class Card extends Drawable {}"],
        ["a card is a drawable", "export class Card extends Drawable {}"],
        ["a pile is a drawable list", "export class Pile extends DrawableList {}"]
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
            "  static { this.declareProp('rank', { type: 'number' }) }",
            "  get rank() { return this.getProp('rank') }",
            "  set rank(value) { this.setProp('rank', value) }",
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
