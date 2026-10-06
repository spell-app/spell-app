/** Rules for members -- naming one, reading one off an object or `it` -- plus object-literal construction. */

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import { NONE, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { identifierBlacklist } from "./identifier-blacklist"
import { Priority, declaredPrefix } from "./rules.types"
import { SpellExpression } from "./expressions"

/**
 * Rule module for member rules:
 * - words naming a member:  `property`, `member_words`
 * - reading one:  `the X of Y`, `its X`, `its third X`
 * - object literals:  `object_literal_property`, `object_literal_properties`
 * - A read RESOLVES its words through the type of what it reads from (`property_expression`, `its_known_property`):
 *   several words, blacklisted ones too, e.g. `the short rank of the card`.
 * - Or it's LOOSE:  ONE word nothing declared, as every read was before types
 *   (`property_expression` too, `its_property`).  Plan doc D5.
 * - A type's class members, e.g. `card suits`, are `class_member` in `classes.ts`.
 */
export const properties = new SpellParser({ module: "properties" })

////////////////
// ## `property` rule
//    e.g. "foo"
////////////////

/** Property name:  single lower-case-initial word, dashes and numbers OK, e.g. `foo`, `foo-bar2`. */
const LOWER_INITIAL_WORD = /^[a-z][\w-]*$/

/**
 * ONE word naming a property:  initial-lower-case, not in `identifierBlacklist`.
 * - What a LOOSE read takes, e.g. `the is-set-up of the deck` -- see `property_expression`.
 * - Declarations and resolved reads take `member_words`.
 * - `mapValue()` converts dashes to underscores, e.g. `foo-bar` compiles as `foo_bar`.
 */
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
// ## `member_words` rule
//    e.g. "short rank"
////////////////

/**
 * Words which end a run of `member_words`:  spell's structural words, never part of a member's name.
 * - e.g. `of` ends `the short rank of`, `as` ends `a card has short rank as text`,
 *   `is` a test, `and` a list, `where` / `whose` / `with` / `for` / `from` / `in` / `to` a clause.
 * - Anything not a word ends a run too, e.g. `+`, `:`, `,` or a number.
 */
const MEMBER_STOP_WORDS = new Set([
  "of",
  "the",
  "a",
  "an",
  "is",
  "isnt",
  "are",
  "was",
  "has",
  "have",
  "in",
  "to",
  "and",
  "or",
  "if",
  "where",
  "as",
  "with",
  "whose",
  "for",
  "from",
  "then",
  "else",
  "otherwise",
  "not",
  "into",
  "on",
  "by",
  "at"
])

/**
 * Stop words which may still START a member's name,
 * e.g. `with jokers` in `a deck has with jokers as yes or no`, `in play`, `on top`.
 * - They END a run anywhere else:  `the jokers with ...` is `jokers`.
 * - Safe:  a name starts only where a rule's syntax expects one, e.g. after `has` or `the`.
 */
const MEMBER_LEADING_WORDS = new Set(["with", "for", "from", "in", "on", "by", "at", "into"])

/**
 * 1..N words naming a member, e.g. `short rank`, `short-rank`, `rank`.
 * - Every word up to the first STRUCTURAL one (`MEMBER_STOP_WORDS`),
 *   e.g. `of` in `the short rank of a card is:`.  No other bound.
 * - NOT the identifier blacklist:  `short` and `long` are fine.  Safe, as:
 *   - a READ takes these words only if the type it reads from declares them (`property_expression`)
 *   - a declaration's words sit between fixed ones, e.g. `the ... of a card is`
 * - `value` is its name as it compiles:  its words joined by `_`, dashes too,
 *   e.g. `short_rank` for `short rank` or `short-rank` -- so either spelling finds the same member.
 * - `raw` is its words as written, e.g. `short rank`.
 * - Greedy:  a rule wanting FEWER, e.g. the longest run a type declares (`its short rank + 1`),
 *   re-parses with fewer tokens -- see `declaredPrefix()`.
 */
class member_words extends P.Pattern {
  /** Any case, unlike `property`:  a class variable is Type_Case, e.g. `Card Suits`. */
  @proto static pattern = P.ALPHANUMERIC_WORD_WITH_DASHES
  @proto static highlightAs: P.HighlightKind = "property"

  /** Does a member's word start at `start`:  a word, not a structural one -- or one which may lead a name? */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return start < tokens.length && member_words.isMemberWord(tokens[start]!, this.pattern, true)
  }

  /** Every member word from the first token on -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    let count = 0
    while (count < tokens.length && member_words.isMemberWord(tokens[count]!, this.pattern, count === 0)) count++
    if (!count) return undefined
    const words = tokens.slice(0, count)
    return new P.Match({
      rule: this,
      matched: words,
      raw: words.map((token) => token.value).join(" "),
      value: words.map((token) => `${token.value}`.replace(/-/g, "_")).join("_"),
      tokens: words,
      scope
    })
  }

  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }

  /**
   * Is `token` one of a member's words:  matches `pattern`, and isn't structural?  See `MEMBER_STOP_WORDS`.
   * - `first`:  the name's first word, which may also be one of `MEMBER_LEADING_WORDS`,
   *   e.g. `with` in `with jokers`.
   */
  private static isMemberWord(token: P.Token, pattern: RegExp, first = false): boolean {
    if (!(token instanceof P.WordToken) || !token.matchesPattern(pattern)) return false
    const word = `${token.value}`.toLowerCase()
    return !MEMBER_STOP_WORDS.has(word) || (first && MEMBER_LEADING_WORDS.has(word))
  }
}
properties.addRule(member_words, {
  tests: [
    {
      tests: [
        { title: "one word", input: "rank", output: "rank" },
        { title: "several words", input: "short rank", output: "short_rank" },
        { title: "a blacklisted word", input: "short", output: "short" },
        { title: "dashed", input: "short-rank", output: "short_rank" },
        { title: "a structural word", input: "of", output: undefined },
        { title: "a leading preposition", input: "with jokers", output: "with_jokers" },
        { title: "a preposition after the first word ends it", input: "jokers with", output: "jokers" }
      ]
    }
  ]
})

////////////////
// ## `quoted_member` rule
//    e.g. `"short rank"` in `- its "short rank" is text`
////////////////

/**
 * A member's name in quotes, where it's being declared:  `its "suit" is one of ...` in an outline-style type's
 * body -- the outline style's "quotes teach a new word" (plan doc `outline-spell`).
 * - The words inside are a `member_words` name, every one of them:  `value` and `raw` as `member_words`'s,
 *   e.g. `short_rank` / `short rank`.
 */
class quoted_member extends P.Rule {
  @proto static highlightAs: P.HighlightKind = "property"

  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return quoted_member.wordsOf(tokens[start]) !== undefined
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const [token] = tokens
    const words = quoted_member.wordsOf(token)
    if (!token || !words) return undefined
    return new P.Match({
      rule: this,
      matched: [token],
      raw: words.join(" "),
      value: words.map((word) => word.replace(/-/g, "_")).join("_"),
      tokens: [token],
      scope
    })
  }

  compile(match: P.MatchFor<this>) {
    return match.value
  }

  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }

  /** A declaration names the member without its quotes, e.g. `short rank`. */
  declaredText(match: P.Match): string {
    return `${match.raw}`
  }

  /** The words inside `token`'s quotes, if it's a text token holding only member words -- else `undefined`. */
  private static wordsOf(token: P.Token | undefined): string[] | undefined {
    if (!(token instanceof P.TextToken)) return undefined
    const words = token.innerText.trim().split(/\s+/)
    const isMemberWord = (word: string, index: number) => {
      const lower = word.toLowerCase()
      return (
        QUOTED_MEMBER_WORD.test(word) &&
        (!MEMBER_STOP_WORDS.has(lower) || (index === 0 && MEMBER_LEADING_WORDS.has(lower)))
      )
    }
    return words[0] && words.every(isMemberWord) ? words : undefined
  }
}
properties.addRule(quoted_member, {
  tests: [
    {
      tests: [
        { title: "one word", input: '"rank"', output: "rank" },
        { title: "several words", input: '"short rank"', output: "short_rank" },
        { title: "dashed", input: '"short-rank"', output: "short_rank" },
        { title: "a leading preposition", input: '"with jokers"', output: "with_jokers" },
        { title: "a structural word", input: '"rank of"', output: undefined }
      ]
    }
  ]
})

/** A word `quoted_member` takes inside its quotes. */
const QUOTED_MEMBER_WORD = /^[A-Za-z][\w-]*$/

////////////////
// ## `MemberReadExpression` base class
//    e.g. base for the rules which read a member (`property_expression`, `its_known_property`, `its_property`)
////////////////

/**
 * Base for rules which READ a member off an object or `it`, e.g. `the short rank of the card`, `its suit`.
 * - What they found, noted while parsing, is in `data` (`MemberData`):  `getDatatype()` and `getMemberAST()` read it.
 * - `MemberReadExpression.memberRead()` says what any of them reads, e.g. for `set the X of Y to ...`.
 */
export class MemberReadExpression<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellExpression<Groups, MatchData & MemberData> {
  /** What the member we read holds:  a property's datatype, an enumeration's values (`list`), a method's return. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { member } = match.data as MemberData
    if (member instanceof P.ScopeMethod) return member.returns
    return member?.enumeration ? "list" : member?.datatype
  }

  /**
   * `object.property` for a resolved read -- or:
   * - for an enumerated property's values, its type's class variable,
   *   e.g. `Card.Suits` for `the suits of the card`
   * - for a built-in type's member, what its `readAs` template says,
   *   e.g. `spellCore.itemCountOf(deck)` for `the length of the deck` -- see `builtInMemberAST()`
   */
  getMemberAST(match: P.MatchFor<this>, object: P.ASTExpression, property: P.Match): P.ASTExpression {
    const { member, enumerationOf } = match.data as MemberData
    if (enumerationOf && member) {
      const type = new P.ASTTypeExpression(match, { name: enumerationOf })
      return new P.ASTPropertyExpression(match, { object: type, property: member.name })
    }
    if (member instanceof P.ScopeVariable && member.readAs) {
      return MemberReadExpression.builtInMemberAST(match, object, member.readAs)
    }
    return new P.ASTPropertyExpression(match, { object, property: P.asAST<P.ASTPropertyLiteral>(property.AST) })
  }

  /**
   * SIDE EFFECT:  notes property `words` of `type` as `match.data.member`
   * -- and, for an enumeration, the type holding its values (`enumerationOf`).
   * - `false` if there's no such property.
   */
  resolveMember(match: P.MatchFor<this>, type: P.TypeScope | undefined, words: string): boolean {
    const member = MemberReadExpression.propertyOf(type, words)
    if (!member) return false
    const data = match.data as MemberData
    data.member = member
    if (member.enumeration && member.scope instanceof P.TypeScope) data.enumerationOf = member.scope.name
    return true
  }

  /**
   * The property `words` names on `type` (or a super-type) -- `undefined` if it's not one, or `type` is unknown.
   * - Properties only:  `the X of Y` doesn't call a method.
   * - A lookup:  call it WHILE PARSING.
   */
  static propertyOf(type: P.TypeScope | undefined, words: string): P.ScopeVariable | undefined {
    const member = type?.getMember(words)
    return member instanceof P.ScopeVariable ? member : undefined
  }

  /**
   * What `match` reads, if it's a member read -- `the X of Y`, `its X`, loose or resolved -- else `undefined`.
   * - `type`:  the type it reads from, if known -- for a resolved read, the one declaring what it found
   * - `property`:  its `property` match, the member's words
   * - `member`:  what it found, if anything
   * - Why:  `set the X of Y to ...` declares `X` if `Y`'s type doesn't -- see `assignment_statement`.
   * - Reads only `match.data`, as noted while parsing.
   */
  static memberRead(match: P.Match): MemberRead | undefined {
    if (!(match.rule instanceof MemberReadExpression)) return undefined
    const { ownerType, member } = match.data as MemberData
    const property = match.groups.property as P.Match
    const declaredOn = member?.scope instanceof P.TypeScope ? member.scope : undefined
    return { type: declaredOn ?? ownerType, property, member }
  }

  /**
   * A built-in type's member read off `object`, as its `readAs` template says -- see `SP.BuiltInMember.readAs`.
   * - `{it}.length` => `object.length`
   * - `{it}.getFullYear()` => `object.getFullYear()`
   * - `spellCore.itemCountOf({it})` => `spellCore.itemCountOf(object)`
   * - The table's templates are checked as it loads (`SP.loadBuiltInTypes()`), so one always reads.
   */
  private static builtInMemberAST(match: P.AnyMatch, object: P.ASTExpression, readAs: string): P.ASTExpression {
    const { form, name } = SP.parseReadAsTemplate(readAs)!
    if (form === "property") return new P.ASTPropertyExpression(match, { object, property: name })
    if (form === "method") return new P.ASTScopedMethodInvocation(match, { thing: object, methodName: name })
    return new P.ASTCoreMethodInvocation(match, { methodName: name, args: [object] })
  }
}

/** What a `MemberReadExpression` stashes on its match. */
type MemberData = {
  /** Member it reads, found while parsing -- see `P.TypeScope.getMember()`.  `undefined` if none known. */
  member?: P.ScopeVariable | P.ScopeMethod
  /** LOOSE reads:  the type it reads from, if known -- see `memberRead()`. */
  ownerType?: P.TypeScope
  /** An enumerated property's values:  the type whose class variable holds them, e.g. `Card`. */
  enumerationOf?: string
}

/** What `MemberReadExpression.memberRead()` says a member read reads. */
export type MemberRead = {
  /** Type it reads from, if known. */
  type?: P.TypeScope
  /** Its `property` match:  the member's words. */
  property: P.Match
  /** What it found, if anything. */
  member?: P.ScopeVariable | P.ScopeMethod
}

////////////////
// ## `property_expression` rule
//    e.g. "the short rank of the card", if cards declare `short rank`;  "the foo of bar", whatever `bar` is
////////////////

/**
 * `the {member words} of {thing}` ~== `thing.member` -- ONE rule for both kinds of read (plan doc D5):
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
class property_expression extends MemberReadExpression<"property|expression"> {
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
    if (!property_expression.isLooseProperty(scope, property)) return undefined
    match.data.member = ownerType?.getMember(`${property.value}`)
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
properties.addRule(property_expression, {
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
        ["the short rank of the card", "card.short_rank"],
        ["the short-rank of the card", "card.short_rank"],
        ["the long name of the card", "card.long_name"],
        ["the last card of the deck", "deck.last_card"],
        ["the short rank of the last card of the deck", "deck.last_card.short_rank"],
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
        { title: "unknown type:  a loose read, as before", input: "the length of bar", output: "bar.length" }
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
        { title: "several undeclared words:  not a property read", input: "the foo bar of the baz", output: undefined },
        { title: "a blacklisted word:  not a loose read", input: "the short of the baz", output: undefined }
      ]
    }
  ]
})

////////////////
// ## `its_known_property` rule
//    e.g. "its short rank", where `it` is a card, and cards declare `short rank`
////////////////

/**
 * `its {member words}`, where the words name a PROPERTY `it`'s type declares:  the LONGEST run of them that does,
 * e.g. `short rank` in `its short rank + its short suit`.
 * - As `property_expression` does for `the X of Y`.
 * - Rejects the match unless `it`'s type is known and declares some -- then `its_property` may take one word.
 * - `Priority.preferred`, as `property_expression`:  a declared `last card` beats `its_ordinal`.
 * - A rule of its own, unlike `property_expression`:  the loose read takes ONE of several words,
 *   so at `Priority.preferred` it would beat `its last card`, the ordinal.
 * - Tracks `it`, as `its_property` does.
 */
class its_known_property extends MemberReadExpression<"property", ItsMatchData> {
  @proto static priority = Priority.preferred

  /** Note `it`, and resolve the longest run of our words its type declares -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const itVar = scope.variables?.get("it")
    const ownerType = scope.getType(itVar?.datatype)
    const { property } = match.groups
    const count = declaredPrefix(property, (words) => !!MemberReadExpression.propertyOf(ownerType, words))
    if (!count) return undefined
    // fewer words than we took:  parse just those -- `its` and them
    if (count < property.length) return this.parse(scope, tokens.slice(0, 1 + count))
    match.data.itVar = itVar ?? NONE
    this.resolveMember(match, ownerType, `${property.raw}`)
    return match
  }
  getAST(match: P.MatchFor<this>) {
    return this.getMemberAST(match, itsObject(match), match.groups.property)
  }
}
properties.addRule(its_known_property, {
  syntax: "its {property:member_words}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.compile(["a card is a thing", "the short rank of a card is: 1"].join("\n"), "block")
      },
      tests: [
        [
          ["get a new card", "print its short rank"],
          ["let it = new Card()", "spellCore.console.log(it.short_rank)"]
        ],
        [
          ["get a new card", "print its short rank + 1"],
          ["let it = new Card()", "spellCore.console.log(it.short_rank + 1)"]
        ]
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
 * - A LOOSE read:  ONE word nothing need declare, as `property_expression`.
 * - Tracks `it`:  `get it` / `put its foo in the bar`.
 * - Synonym for `this` if `it` is not (yet) defined in scope.
 */
class its_property extends MemberReadExpression<"property", ItsMatchData> {
  /** Note `it`, its type, and the member of it we read, while we can look them up. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const itVar = (match.data.itVar = scope.variables?.get("it") ?? NONE)
    if (itVar !== NONE) {
      const ownerType = (match.data.ownerType = scope.getType(itVar.datatype))
      match.data.member = ownerType?.getMember(`${match.groups.property.value}`)
    }
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const property = P.asAST<P.ASTPropertyLiteral>(match.groups.property.AST)
    return new P.ASTPropertyExpression(match, { object: itsObject(match), property })
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
class its_ordinal extends SpellExpression<"ordinal|arg", ItsMatchData & { itemType?: P.Datatype }> {
  /** Note `it`, and what it holds, while we can look them up. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const itVar = (match.data.itVar = scope.variables?.get("it") ?? NONE)
    if (itVar !== NONE) match.data.itemType = scope.getItemType(itVar.datatype)
    return match
  }
  /** An item of `it`, e.g. `Card` for `its first card` in a method of decks. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
  getAST(match: P.MatchFor<this>) {
    const { ordinal } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [itsObject(match), P.asAST<P.ASTExpression>(ordinal.AST)]
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

/**
 * Single object-literal property declaration:  `{property} (=|is|of) {value:expression}`.
 * - Its name is `member_words`, e.g. `short rank is 1`,
 *   or a `property` for a structural word, e.g. `a = 1`.
 */
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
  syntax: "(property:{member_words}|{property}) (=|is|of) {value:expression}",
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
        [`short rank is 1`, `short_rank: 1`],

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
  syntax: "[{object_literal_property} (,|and)]",
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

/** What `its_*` rules stash on their matches. */
type ItsMatchData = {
  /** `it` in scope when parsed, or `NONE` => means `this`.  Looked up THEN, not in `getAST()` -- see `SpellIdentifier`. */
  itVar?: P.ScopeVariable | typeof NONE
}

/** `it` as an object to read from:  the `it` we noted while parsing, else `this` -- see `ItsMatchData`. */
function itsObject(match: P.Match<P.AnyGroups, ItsMatchData>): P.ASTExpression {
  const itVar = match.data.itVar === NONE ? undefined : match.data.itVar
  if (!itVar) return new P.ASTThisLiteral(match)
  return new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
}
