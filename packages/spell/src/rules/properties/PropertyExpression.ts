import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { MemberReadExpression } from "./MemberReadExpression"
import { properties } from "./properties.parser"

/**
 * `property_expression` rule:  `the {member words} of {thing}` ~== `thing.member`
 *   -- ONE rule for both kinds of read (plan doc D5):
 * - RESOLVED:  the words name a PROPERTY the type of `thing` declares (or a super-type does),
 *   e.g. `the short rank of the card` -- several words, blacklisted ones too.
 *   - An enumerated property's values, e.g. `the suits of the card` as `cards have a suit as one of ...` declares,
 *     are its type's class variable, `Card.Suits`:  an instance has none.
 * - else LOOSE:  ONE word nothing need declare, not on the identifier blacklist,
 *   e.g. `the is-set-up of it` -- as spell read every property before types.
 *   - We still note a METHOD of that name, for our datatype.
 * - else NOT a property read:  several undeclared words,
 *   e.g. `the first card of the deck` is the ordinal rule's.
 * - `Priority.preferred`:  a declared member beats a built-in rule reading the SAME words,
 *   e.g. a deck's `last card` beats the ordinal `the last card of`.
 *   - NOT `the position of`, `the number of` (`mostSpecific`), nor `the biggest of` (2), which say more:
 *     a type declaring `position` mustn't break `the position of x in the list`.
 * - ONE rule, not a resolved and a loose one, as `known_variable` / `variable` are:
 *   two would parse every `the X of Y`'s operand twice -- 6% of a project's parse (plan doc judgement).
 * - `set` an undeclared one, on a type the project declares, and it's declared there --
 *   see `MemberReadExpression.memberRead()`.
 */
export class PropertyExpression extends MemberReadExpression<"property|expression"> {
  @proto static priority = Priority.preferred

  /**
   * Resolve our words through the type of what follows `of`, while we can look it up --
   * else take ONE word, loose.  See class docs.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { property, expression } = match.groups
    const ownerType = (match.data.ownerType = scope.getType(expression.datatype))
    if (this.resolveMember(match, ownerType, `${property.raw}`)) return match
    if (!PropertyExpression.isLooseProperty(scope, property)) return undefined
    match.data.member = ownerType?.getMember(`${property.value}`)
    if (!match.data.member) MemberReadExpression.warnIfUndeclared(match, ownerType, property)
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const { property, expression } = match.groups
    return this.getMemberAST(match, P.asAST<P.ASTExpression>(expression.AST), property)
  }

  /** Is `property`, a `member_words` match, ONE word the `property` rule takes:  lower case, not blacklisted? */
  private static isLooseProperty(scope: P.Scope, property: P.Match): boolean {
    return property.length === 1 && scope.getRuleOrDie("property").test(scope, property.tokens, 0) !== false
  }
}
properties.addRule(PropertyExpression, {
  syntax: "the {property:member_words} of {expression:operand}",
  tests: [
    {
      title: "resolved:  what the type declares",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(
          [
            "a card is a thing",
            "a card has a suit as one of clubs, diamonds",
            "the short rank of a card is: 1",
            "the long-name of a card is: 2",
            "a deck is a list of cards",
            "the last card of a deck is: its bottom card",
            "the card is a new card",
            "the deck is a new deck"
          ].join("\n"),
          "block"
        )
      },
      tests: [
        ["the short rank of the card", "card.shortRank"],
        ["the short-rank of the card", "card.shortRank"],
        ["the long name of the card", "card.longName"],
        ["the last card of the deck", "deck.lastCard"],
        ["the short rank of the last card of the deck", "deck.lastCard.shortRank"],
        ["the suit of the card", "card.suit"],
        ["the suits of the card", "Card.Suits"]
      ]
    },
    {
      title: "built in:  as the type's table entry compiles it -- see `SP.BUILT_IN_TYPE_TABLE`",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add({ name: "name", datatype: "text" })
        scope.variables?.add({ name: "deck", datatype: "list" })
        scope.variables?.add({ name: "due", datatype: "date" })
        scope.variables?.add("bar")
      },
      tests: [
        ["the length of the name", "name.length"],
        ["the length of the deck", "spellCore.itemCountOf(deck)"],
        ["the year of the due", "due.getFullYear()"],
        { title: "unknown type:  a loose read, as before", input: "the length of bar", js: "bar.length" }
      ]
    },
    {
      title: "loose:  one word, nothing need declare",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("bar")
        scope.variables?.add("baz")
      },
      tests: [
        ["the foo of bar", "bar.foo"],
        ["the foo of the bar", "bar.foo"],
        ["the foo of the bar of the baz", "baz.bar.foo"],
        ["the foo-bar of the baz", "baz.foo_bar"],
        { title: "several undeclared words:  not a property read", input: "the foo bar of the baz", js: undefined },
        { title: "a blacklisted word:  not a loose read", input: "the short of the baz", js: undefined }
      ]
    }
  ]
})
