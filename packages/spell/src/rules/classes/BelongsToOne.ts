import { instanceCase, pluralize, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
import { getKnownType } from "$/spell/rules/types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `belongs_to_one` rule:  `a card belongs to one pile` -- a card is in at most ONE pile at a time (plan doc D7, D8,
 * Q22):
 * - "pile" means the pile FAMILY:  `Pile` and every sub-type of it, e.g. `a tableau is a pile`.
 *   Adding a card to one takes it out of the other.
 * - A list outside the family, e.g. `a deck is a list of cards`, stays outside:
 *   a card can be in the deck AND one pile.
 * - Both types MUST be declared ABOVE, e.g. `a pile is a list of cards`:
 *   what we compile to needs both classes.  A type only mentioned so far (a stub) is refused, as is
 *   a list type of spell's own, e.g. `one list`:  it'd make every list hold a card once.
 * - SIDE EFFECT:  the item type gains a READ-ONLY member naming the list type, `the pile of a card`:
 *   the pile holding it, or nothing.  Declared by THIS line -- see `P.TypeScope.declareOwnerMember()`.
 *   - A built-in item type, e.g. `a thing belongs to one bag`, gets NO member:
 *     it would go on a type every project shares.  Its lists still hold each OBJECT once.
 * - Compiles to two patches, run where we are, after both classes:
 *   - `Pile.exclusive = true`:  the runtime `List` keeps who holds each item
 *   - the member, `Object.defineProperty(Card.prototype, 'pile', { get() { return Pile.ownerOf(this) } ... })`
 *   - NEVER hoisted into the classes:  the member must win over any accessor an earlier statement gave it,
 *     e.g. `set the pile of the card to ...` above us.
 * - `a card can belong to many piles` is the opposite:  see `can_belong_to_many`.
 */
export class BelongsToOne extends SpellStatement<"type|list"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "list", of: "type" }

  /** `it belongs to a pile` => `a card belongs to one pile` -- see `SpellStatement.getLongForm()`. */
  getLongForm(match: P.Match): string | undefined {
    return super.getLongForm(match)?.replace(/ belongs to (a|an) /i, " belongs to one ")
  }

  /** Refused unless both types are declared above, and `list` is a list type of the project's -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, list } = match.groups
    const sentence = `"${match.inputText.trim()}"`
    for (const [word, example] of [
      [type, `a ${type.raw} is a thing`],
      [list, `a ${list.raw} is a list of ${pluralize(`${type.raw}`)}`]
    ] as const) {
      const declared = BelongsToOne.typeOf(word)
      if (!declared || declared.stub) {
        return SpellStatement.refuse(match, `Can't say ${sentence} yet:  declare "${example}" above it`)
      }
    }
    const listType = BelongsToOne.typeOf(list)!
    if (SP.isBuiltInTypeScope(listType)) {
      return SpellStatement.refuse(match, `Can't say ${sentence}:  every list would hold a ${type.raw} once`)
    }
    if (!listType.isA("list")) {
      return SpellStatement.refuse(match, `Can't say ${sentence}:  a ${list.raw} isn't a list`)
    }
    return match
  }

  /** SIDE EFFECT:  the item type's member naming the list type -- not on a built-in type.  See class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const { type, list } = match.groups
    const itemType = getKnownType(type)
    if (!SP.isBuiltInTypeScope(itemType)) getKnownType(list).declareOwnerMember(itemType, match)
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, list } = match.groups
    const listAST = P.matchAST<P.ASTTypeExpression>(list)
    const exclusive = new P.ASTStaticDefinition(match, {
      type: listAST,
      name: "exclusive",
      value: new P.ASTBooleanLiteral(match, true)
    })
    const statements: P.ASTStatement[] = [new P.ASTPatchedMember(match, { member: exclusive })]
    if (!P.isBuiltInType(SP.typeName(`${type.value}`))) {
      statements.push(BelongsToOne.ownerMemberAST(match, P.matchAST<P.ASTTypeExpression>(type), listAST))
    }
    return new P.ASTStatementGroup(match, { statements })
  }

  /** What type word `word` names, as `parse()` looked it up -- `undefined` if nothing does yet. */
  private static typeOf(word: P.Match): P.TypeScope | undefined {
    const { scopeType } = word.data as { scopeType?: unknown }
    return scopeType instanceof P.TypeScope ? scopeType : undefined
  }

  /**
   * The item type's member naming the list type, patched on,
   * e.g. `Object.defineProperty(Card.prototype, 'pile', { get() { return Pile.ownerOf(this) }, ... })`.
   * - Named as `declareOwnerMember()` names it, e.g. `stock_pile` for `a stock-pile`.
   */
  static ownerMemberAST(
    match: P.MatchFor<BelongsToOne>,
    itemAST: P.ASTTypeExpression,
    listAST: P.ASTTypeExpression
  ): P.ASTPatchedMember {
    const owner = new P.ASTScopedMethodInvocation(match, {
      thing: listAST,
      methodName: "ownerOf",
      args: [new P.ASTSelfLiteral(match)]
    })
    return new P.ASTPatchedMember(match, {
      member: new P.ASTPropertyDefinition(match, {
        type: itemAST,
        property: instanceCase(listAST.runtimeName),
        get: new P.ASTMethodDefinition(match, { body: new P.ASTReturnStatement(match, { value: owner }) })
      })
    })
  }
}
classes.addRule(BelongsToOne, {
  syntax: "(a|an) {type} belongs to one {list:type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards", "a bag is a list of things"].join("\n"), "block")
      },
      tests: [
        [
          "a card belongs to one pile",
          [
            "Pile.exclusive = true",
            "Object.defineProperty(Card.prototype, 'pile', {",
            "  get() {",
            "    return Pile.ownerOf(this)",
            "  },",
            "  configurable: true",
            "})"
          ],
          [
            "Pile.exclusive = true",
            "export interface Card { readonly pile: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "pile", {',
            "  get(this: Card) {",
            "    return Pile.ownerOf(this)!",
            "  },",
            "  configurable: true",
            "})"
          ]
        ],
        {
          title: "a built-in item type:  no member, it'd go on a type every project shares",
          input: "a thing belongs to one bag",
          js: "Bag.exclusive = true"
        },
        {
          title: "both types MUST be declared above",
          input: "a card belongs to one hand",
          js: `/* PARSE ERROR: Can't say "a card belongs to one hand" yet:  declare "a hand is a list of cards" above it */`
        },
        {
          title: "the list type MUST be a list of the project's",
          input: ["a card belongs to one list", "a card belongs to one card"],
          js: [
            `/* PARSE ERROR: Can't say "a card belongs to one list":  every list would hold a card once */`,
            `/* PARSE ERROR: Can't say "a card belongs to one card":  a card isn't a list */`
          ]
        }
      ]
    }
  ]
})
// in an outline body:  `- it belongs to a deck` -- tests in `parserTests/outline.test.ts`
classes.addRule(BelongsToOne, { syntax: "{type:subject_it} belongs to (one|a|an) {list:type}" })
