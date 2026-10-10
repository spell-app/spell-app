import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
import { TypeDeclaration } from "./TypeDeclaration"

/**
 * `create_type` rule:  `a card is a thing` -- declares `type` as a new class extending `superType`.
 * - `Priority.declaration`, so this wins over other `{type} is {type}` -ish statement rules.
 * - SIDE EFFECT: adds `type` to `scope.types`, unless it's already defined (no redefinition/merge).
 * - Compiles to an exported class declaration, e.g. `a card is a thing` => `export class Card extends Thing {}`.
 *   Another project reaches it by `import`ing it -- no globals.
 */
export class CreateType extends TypeDeclaration<"type|superType|with_nested_statements?|body?"> {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "superType" }

  mutateScope(match: P.MatchFor<this>) {
    const { type, superType } = match.groups
    // Forget it if type is already defined, unless it was only stubbed by an earlier mention.
    // TODO: complain if existing type is set up differently!
    // An IMPORTED one is declared again anyway, so `SP.SpellDeclarations.checkImportClashes()` can report it.
    const existing = match.scope.types?.get(type.value)
    if (existing && !(existing.parentScope instanceof P.ImportScope)) {
      // a stub, or left by an earlier parse of this statement -- see `P.TypeScope.sameStatement()`
      if (existing.stub || P.TypeScope.sameStatement(existing.declaredBy, match)) {
        existing.claim(match, superType.value)
      }
      return
    }
    match.scope.types?.add({ name: type.value, superType: superType.value, declaredBy: match })
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
  syntax: "(a|an) {type} is (a|an) {superType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is a thing", "export class Card extends Thing {}"],
        ["a deck is a list", "export class Deck extends List {}"]
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
