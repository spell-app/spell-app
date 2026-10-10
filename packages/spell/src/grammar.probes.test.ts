import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * LEDGER of what spell's grammar does with a fixed set of phrasings -- one inline snapshot per probe.
 * - Why:  the precedence-and-types epic changes how spell parses expressions, types, signatures and members.
 *   Each phase diffs against this file, so its review shows EXACTLY which phrasings it changed and how.
 * - Changes to these snapshots are EXPECTED in phases P3-P6:  READ each one before blessing it
 *   (`yarn vitest run src/grammar.probes.test.ts -u`), and say in the phase's notes why it moved.
 *   A change in any other phase is a regression until shown otherwise.
 * - The design, and the problems the probe titles refer to:
 *   `guides/precedence/precedence.html` ("2. The problems").
 *   - NOTE:  a title's `P1a` ... `P8e` is that page's PROBLEM number (P1 = greedy operands ...),
 *     NOT an epic phase.
 *   - Titles match the page's experiment, `guides/precedence/experiments/grammar-today.mts`.
 * - Each probe parses scratch file `/Probe.spell` in memory with `parseSpellProject()`, exactly as a project
 *   compile does, after the frozen Solitaire fixture's `Card` / `Deck` / `Pile` (`projects/test/Solitaire/`).
 *   - Those predate jokers, so no joker phrasing here.
 * - Snapshot:  the probe's compiled lines (after `SETUP`'s),
 *   then one `ERROR <line>:<ch> <message>` per parse error.
 *   - `SPELL:` declaration comments are left out:  they repeat the declaring statement.
 * - "datatypes" (from P4 of precedence-and-types):  what each expression IS, as a variable set to it holds.
 *   - One `<expression>  =>  <datatype>` line each, `?` for unknown.  See `datatypes()`.
 */
describe("grammar probes", () => {
  ////////////////
  // ## P1:  greedy operands, no backtracking
  ////////////////

  test("P1a  trailing operand takes the operator", () => {
    expect(probe("print the first card of the deck is face up")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.getItemAt(deck, 1)?.is_face_up)"`
    )
  })

  test("P1b  count vs comparison", () => {
    expect(probe("print the number of cards in the deck is 52")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.itemCountOf(deck) == 52)"`
    )
  })

  test("P1c  count vs arithmetic", () => {
    expect(probe("print the number of cards in the deck + 1")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.itemCountOf(deck) + 1)"`
    )
  })

  test("P1d  property of a position", () => {
    expect(probe("print the suit of the first card of the deck is hearts")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.getItemAt(deck, 1)?.suit == 'hearts')"`
    )
  })

  test("P1e  `of` after an argument", () => {
    expect(probe("to remove (a card) of (a pile): print 1", "remove the card of the pile")).toMatchInlineSnapshot(`
      "Card.prototype.remove_of_$pile = function (pile) {
        return spellCore.console.log(1)
      }
      card.remove_of_$pile(pile)"
    `)
  })

  test("P1f  count with `where`", () => {
    expect(probe("print the number of cards in the deck where its color is red")).toMatchInlineSnapshot(`
      "spellCore.console.log(spellCore.itemCountOf(spellCore.filter(deck, (card) => {
        return (card.color == 'red')
      })))"
    `)
  })

  test("P1g  list with `where`", () => {
    expect(probe("print the cards in the deck where its color is red")).toMatchInlineSnapshot(`
      "spellCore.console.log(spellCore.filter(deck, (card) => {
        return (card.color == 'red')
      }))"
    `)
  })

  ////////////////
  // ## P2 / P3:  precedence before length;  postfix binds tightest
  ////////////////

  test("P2a  enumeration beats a longer compound", () => {
    expect(probe("print card suits includes x")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.includes(Card.Suits, x))"`
    )
  })

  test("P2b  unset precedence on `ends with`", () => {
    expect(probe("print x ends with y and 1")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.endsWith(x, y) && 1)"`
    )
  })

  test("P2c  prefix function vs arithmetic", () => {
    expect(probe("print the absolute value of x + 1")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.absoluteValue(x + 1))"`
    )
  })

  test("P2d  `draw_thing` at precedence 100", () => {
    expect(probe("draw the cards of the deck")).toMatchInlineSnapshot(`"spellCore.drawItems(deck)"`)
  })

  test("P3   postfix applied immediately", () => {
    expect(probe("print x + y is empty")).toMatchInlineSnapshot(`"spellCore.console.log(spellCore.isEmpty(x + y))"`)
  })

  ////////////////
  // ## P4:  type-blind call rules
  ////////////////

  test("P4a  two same-shaped methods on different types", () => {
    expect(
      probe("to put (a card) on (a pile): print 1", "to put (a chip) on (a pot): print 2", "put the chip on the pot")
    ).toMatchInlineSnapshot(`
      "Card.prototype.put_on_$pile = function (pile) {
        return spellCore.console.log(1)
      }
      Chip.prototype.put_on_$pot = function (pot) {
        return spellCore.console.log(2)
      }
      chip.put_on_$pot(pot)"
    `)
  })

  test("P4b  built-in list add", () => {
    expect(probe("add the card to the deck")).toMatchInlineSnapshot(`"spellCore.append(deck, card)"`)
  })

  test("P4c  a user `add` shadows it for a deck", () => {
    expect(probe("to add (a card) to (a pile): print 1", "add the card to the deck")).toMatchInlineSnapshot(`
      "Card.prototype.add_to_$pile = function (pile) {
        return spellCore.console.log(1)
      }
      spellCore.append(deck, card)"
    `)
  })

  ////////////////
  // ## P5 / P6 / P7:  signatures, property names, `is a`
  ////////////////

  test("P5   paren-free signature", () => {
    expect(probe("to give a card to a pile: print 1")).toMatchInlineSnapshot(`
      "Card.prototype.give_to_$pile = function (pile) {
        return spellCore.console.log(1)
      }"
    `)
  })

  test("P5b  a/an before a word that is NOT a type", () => {
    expect(probe("to make a mess: print 1", "make a mess")).toMatchInlineSnapshot(`
      "export function make_a_mess() {
        return spellCore.console.log(1)
      }
      make_a_mess()"
    `)
  })

  test("P6a  multi-word getter", () => {
    expect(probe("the short rank of a card is: return 1")).toMatchInlineSnapshot(`
      "Object.defineProperty(Card.prototype, 'short_rank', {
        get() {},
        configurable: true
      })
      /* PARSE ERROR: Don't understand "return 1" */
      ERROR 8:29 Don't understand "return 1""
    `)
  })

  test("P6b  multi-word property read", () => {
    expect(probe("print the short-rank of the card", "print the short rank of the card")).toMatchInlineSnapshot(`
      "spellCore.console.log(card.short_rank)
      spellCore.console.log(card.short_rank)"
    `)
  })

  test("P7   `is a` accepts any word as a type", () => {
    expect(probe("print the card is a new card")).toMatchInlineSnapshot(`"spellCore.console.log(card == new Card())"`)
  })

  test("P7b  setting a property the type never declared", () => {
    // `Pile.spell`'s own `set the pile of the card to the pile` declared it (P6, epic phase):  reactive
    expect(probe("set the pile of the card to the pile")).toMatchInlineSnapshot(`"card.pile = pile"`)
  })

  ////////////////
  // ## P8:  Solitaire's parens -- which are load-bearing?
  ////////////////

  test("P8a  Deck.spell:40-41 as one line", () => {
    expect(probe("expect the first card of the deck is the ace of clubs to be yes")).toMatchInlineSnapshot(
      `"spellCore.expect(spellCore.getItemAt(deck, 1)?.is_the_$rank_of_$suits('ace', 'clubs'), \`the first card of the deck is the ace of clubs\`, true, \`yes\`)"`
    )
  })

  test("P8b  Solitaire:105 without its parens", () => {
    expect(probe("turn the bottom card of the deck face up")).toMatchInlineSnapshot(
      `"spellCore.getItemAt(deck, -1)?.turn_face_up()"`
    )
  })

  test("P8c  Solitaire:166 without its parens", () => {
    // a card, as in Solitaire:  `x` here is a number, and a card's phrase now refuses one (`SuffixLeft`)
    expect(probe("if the card is a king and the card is the first card of the pile return")).toMatchInlineSnapshot(
      `"if (card.is_a_$rank('king') && (card == spellCore.getItemAt(pile, 1))) { return }"`
    )
  })

  test("P8f  a card's phrase on something known NOT to be a card:  refused (outline-spell J8)", () => {
    expect(probe("if x is a king return")).toMatchInlineSnapshot(`
      "if (x) {}
      /* PARSE ERROR: Don't understand "is a king return" */
      ERROR 8:5 Don't understand "is a king return""
    `)
  })

  test("P8d  Card.spell:46 without its parens", () => {
    expect(probe("print the first character of the name of the card as uppercase")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.upperCase(spellCore.getItemAt(card.name, 1)))"`
    )
  })

  test("P8e  Card.spell:46 as a bare expression", () => {
    expect(probe("the first character of the name of the card as uppercase")).toMatchInlineSnapshot(`
      "/* PARSE ERROR: Don't understand "the first character of the name of the card as uppercase" */
      ERROR 8:0 Don't understand "the first character of the name of the card as uppercase""
    `)
  })

  ////////////////
  // ## P4 (epic phase):  types plumbed
  ////////////////

  test("T1  `is a` names a known type:  a typo is an error", () => {
    expect(probe("print the card is a crad", "print the card is a thing", "print x is a number"))
      .toMatchInlineSnapshot(`
      "spellCore.console.log(card)
      /* PARSE ERROR: Don't understand "is a crad" */
      spellCore.console.log(spellCore.isOfType(card, 'Thing'))
      spellCore.console.log(spellCore.isOfType(x, 'number'))
      ERROR 8:15 Don't understand "is a crad""
    `)
  })

  test("T2  `as choice` declares a `choice`", () => {
    expect(probe("a todo is a thing", "a todo has a done as choice", "todos have a flag as a boolean"))
      .toMatchInlineSnapshot(`
      "export class Todo extends Thing {
        static { this.declareProp('done', { type: 'choice' }) }
        get done() { return this.getProp('done') }
        set done(value) { this.setProp('done', value) }

        static { this.declareProp('flag', { type: 'choice' }) }
        get flag() { return this.getProp('flag') }
        set flag(value) { this.setProp('flag', value) }
      }"
    `)
  })

  ////////////////
  // ## P5 (epic phase):  typed calls, signatures, return types
  ////////////////

  test("T3  `is a` names a type declared further down", () => {
    expect(probe("print the card is a widget", "a widget is a thing")).toMatchInlineSnapshot(`
      "spellCore.console.log(spellCore.isOfType(card, 'Widget'))
      export class Widget extends Thing {}"
    `)
  })

  test("T4  paren-free signature, called", () => {
    expect(probe("to give a card to a pile: print 1", "give the card to the pile")).toMatchInlineSnapshot(`
      "Card.prototype.give_to_$pile = function (pile) {
        return spellCore.console.log(1)
      }
      card.give_to_$pile(pile)"
    `)
  })

  test("T5  a one-argument call inside an expression takes an operand;  as a statement, everything", () => {
    expect(
      probe(
        "to double (n as number): return n * 2",
        "if double x is 4: print 1",
        "to announce (message): print 1",
        "announce x + y"
      )
    ).toMatchInlineSnapshot(`
      "export function double_$n(n) {
        return (n * 2)
      }
      if (double_$n(x) == 4) { spellCore.console.log(1) }
      export function announce_$message(message) {
        return spellCore.console.log(1)
      }
      announce_$message(x + y)"
    `)
  })

  test("T6  `wait for`:  a statement waits for everything, an expression for an operand", () => {
    expect(probe("to check: wait for x is 1", "to check again: if wait for x is 1: print 1")).toMatchInlineSnapshot(`
      "export async function check() {
        return await (x == 1)
      }
      export async function check_again() {
        if (await x == 1) { spellCore.console.log(1) }
      }"
    `)
  })

  ////////////////
  // ## P6 (epic phase):  multi-word members
  ////////////////

  test("M1  a multi-word getter, read with `the ... of` and `its`", () => {
    expect(
      probe(
        "the short colour of a card is: its color",
        "print the short colour of the card",
        "get the card",
        "print its short colour + 1"
      )
    ).toMatchInlineSnapshot(`
      "Object.defineProperty(Card.prototype, 'short_colour', {
        get() {
          return this.color
        },
        configurable: true
      })
      spellCore.console.log(card.short_colour)
      let it = card
      spellCore.console.log(it.short_colour + 1)"
    `)
  })

  test("M2  a declared `last card` beats the ordinal;  undeclared, the ordinal reads it", () => {
    expect(
      probe(
        "the last card of a pile is: its first card",
        "print the last card of the pile",
        "print the last card of the deck"
      )
    ).toMatchInlineSnapshot(`
      "Object.defineProperty(Pile.prototype, 'last_card', {
        get() {
          return spellCore.getItemAt(this, 1)
        },
        configurable: true
      })
      spellCore.console.log(pile.last_card)
      spellCore.console.log(spellCore.getItemAt(deck, -1))"
    `)
  })

  test("M3  `a card has short rank as text`:  blacklisted words, no article", () => {
    expect(probe("a card has long rank as text")).toMatchInlineSnapshot(`
      "Card.declareProp('long_rank', { type: 'text' })
      Object.defineProperty(Card.prototype, 'long_rank', {
        get() { return this.getProp('long_rank') },
        set(value) { this.setProp('long_rank', value) },
        configurable: true
      })"
    `)
  })

  test("M4  a type's class member:  every way to reach an enumeration", () => {
    expect(probe("print card suits includes x", "print the suits of the card", "print the number of card suits"))
      .toMatchInlineSnapshot(`
      "spellCore.console.log(spellCore.includes(Card.Suits, x))
      spellCore.console.log(Card.Suits)
      spellCore.console.log(spellCore.itemCountOf(Card.Suits))"
    `)
  })

  test("M5  setting a property the type never declared declares it, at the top of the setting file", () => {
    expect(
      probeWithTop(
        "set the owner of the card to the pile",
        "print the owner of the card",
        "set the owner of the card to x"
      )
    ).toMatchInlineSnapshot(`
      "Card.declareProp('owner', { type: 'Pile' })
      Object.defineProperty(Card.prototype, 'owner', {
        get() { return this.getProp('owner') },
        set(value) { this.setProp('owner', value) },
        configurable: true
      })
      ...
      card.owner = pile
      spellCore.console.log(card.owner)
      card.owner = x"
    `)
  })

  ////////////////
  // ## P7 (epic phase):  built-in member tables
  ////////////////

  test("B1  the same words on different types:  `the length of` a text, a list", () => {
    expect(
      probe(
        'set the title to "Solitaire"',
        "print the length of the title",
        "print the length of the deck",
        "print the size of the pile",
        "get the deck",
        "print its length + 1"
      )
    ).toMatchInlineSnapshot(`
      "export let title = "Solitaire"
      spellCore.console.log(title.length)
      spellCore.console.log(spellCore.itemCountOf(deck))
      spellCore.console.log(spellCore.itemCountOf(pile))
      let it = deck
      spellCore.console.log(spellCore.itemCountOf(it) + 1)"
    `)
  })

  test("B2  a type's own member beats the built-in one;  an unknown type reads loose", () => {
    expect(probe("the size of a pile is: 52", "print the size of the pile", "print the length of y"))
      .toMatchInlineSnapshot(`
      "Object.defineProperty(Pile.prototype, 'size', {
        get() {
          return 52
        },
        configurable: true
      })
      spellCore.console.log(pile.size)
      spellCore.console.log(y.length)"
    `)
  })

  test("B3  built-in members are spell's own:  no declaring one, no setting one", () => {
    expect(probe("the length of a text is: 1", "things have a tag as text", "set the length of the deck to 3"))
      .toMatchInlineSnapshot(`
      "/* PARSE ERROR: Can't add "length" to text:  it's built in, and every project shares it */
      /* PARSE ERROR: Can't add "tag" to thing:  it's built in, and every project shares it */
      /* PARSE ERROR: Can't set the length of a list:  spell works it out */
      ERROR 8:0 Can't add "length" to text:  it's built in, and every project shares it
      ERROR 9:0 Can't add "tag" to thing:  it's built in, and every project shares it
      ERROR 10:0 Can't set the length of a list:  spell works it out"
    `)
  })

  ////////////////
  // ## P8, P10 (epic phases):  membership and guards
  //    Against `Card` / `Deck` and a `Pile.spell` of the probe's own -- see `probeMembership()`.
  ////////////////

  test("X1  `a card belongs to one pile`:  the pile type, then two patches -- the family's flag, the card's pile", () => {
    expect(probeMembership([...PILES, "a tableau is a pile"], [])).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      export class Tableau extends Pile {}
      ---"
    `)
  })

  test("X2  `the pile of the card` is the pile holding it -- a `Pile`, read-only", () => {
    expect(
      probeMembership(PILES, [
        "add the card to the pile",
        "print the pile of the card",
        "set the pile of the card to the pile"
      ])
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      ---
      spellCore.append(pile, card)
      spellCore.console.log(card.pile)
      /* PARSE ERROR: Can't set the pile of a Card:  it's the Pile holding it -- move it to a Pile instead */
      ERROR /Probe.spell 6:0 Can't set the pile of a Card:  it's the Pile holding it -- move it to a Pile instead"
    `)
  })

  test("X3  a card in the deck AND a pile:  a deck is outside the family", () => {
    expect(
      probeMembership(
        [...PILES, "a tableau is a pile"],
        ["the tableau is a new tableau", "add the card to the deck", "add the card to the tableau"]
      )
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      export class Tableau extends Pile {}
      ---
      export let tableau = new Tableau()
      spellCore.append(deck, card)
      spellCore.append(tableau, card)"
    `)
  })

  test("X4  a `pile` property set before the membership line:  the membership's member replaces it", () => {
    expect(
      probeMembership(
        ["a pile is a list of cards", "to stash a card in a pile: set the pile of the card to the pile", PILES[1]!],
        ["print the pile of the card"]
      )
    ).toMatchInlineSnapshot(`
      "Card.declareProp('pile', { type: 'Pile' })
      Object.defineProperty(Card.prototype, 'pile', {
        get() { return this.getProp('pile') },
        set(value) { this.setProp('pile', value) },
        configurable: true
      })
      export class Pile extends List {
        static instanceType = Card
      }
      Card.prototype.stash_in_$pile = function (pile) {
        this.pile = pile
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      ---
      spellCore.console.log(card.pile)"
    `)
  })

  test("X5  `a card can belong to many piles`:  what lists do anyway -- nothing compiled, no member", () => {
    expect(
      probeMembership(
        ["a pile is a list of cards", "a card can belong to many piles"],
        ["add the card to the pile", "print the pile of the card"]
      )
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }

      ---
      spellCore.append(pile, card)
      spellCore.console.log(card.pile)"
    `)
  })

  test("X6  both types MUST be declared above:  a forward mention is refused, saying what to write", () => {
    expect(probeMembership(["a card belongs to one pile", "a pile is a list of cards"], [])).toMatchInlineSnapshot(`
      "/* PARSE ERROR: Can't say "a card belongs to one pile" yet:  declare "a pile is a list of cards" above it */
      export class Pile extends List {
        static instanceType = Card
      }
      ---
      ERROR /Pile.spell 1:0 Can't say "a card belongs to one pile" yet:  declare "a pile is a list of cards" above it"
    `)
  })

  test("X7  guards:  `can take` / `can add`, `can give up` (and its other words), `can never ...`", () => {
    expect(
      probeMembership(
        [
          ...PILES,
          "a tableau is a pile",
          "a tableau can take a card if: it is empty",
          "a tableau can give up a card if: the card is its last card",
          "a foundation is a pile",
          "a foundation can add a card if:",
          "\tif the foundation is empty return yes",
          "\treturn no",
          "a foundation can never let go of a card"
        ],
        []
      )
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      export class Tableau extends Pile {
        canTake(card) {
          return spellCore.isEmpty(this)
        }

        canGiveUp(card) {
          return (card == spellCore.getItemAt(this, -1))
        }
      }
      export class Foundation extends Pile {
        canTake(card) {
          if (spellCore.isEmpty(this)) { return true }
          return false
        }

        canGiveUp(card) {
          return false
        }
      }
      ---"
    `)
  })

  test("X8  `move` asks the guards:  a statement, or a yes / no;  asking without moving", () => {
    expect(
      probeMembership(PILES, [
        "move the card to the pile",
        "set moved to move the card to the pile",
        "if move the card to the pile then print 1",
        "if move the card to the pile is no then print 2",
        "if the pile can take the card then print 3",
        "if the pile cannot give up the card then print 4",
        "if the pile can let go of the card then print 5"
      ])
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      ---
      spellCore.move(card, pile)
      export let moved = spellCore.move(card, pile)
      if (spellCore.move(card, pile)) { spellCore.console.log(1) }
      if (spellCore.move(card, pile) == false) { spellCore.console.log(2) }
      if (spellCore.canTake(pile, card)) { spellCore.console.log(3) }
      if (!spellCore.canGiveUp(pile, card)) { spellCore.console.log(4) }
      if (spellCore.canGiveUp(pile, card)) { spellCore.console.log(5) }"
    `)
  })

  test("X9  `add`, `remove` and `empty` never ask the guards:  dealing, gathering cards back", () => {
    expect(
      probeMembership(
        [...PILES, "a pile can never give up a card"],
        ["add the card to the pile", "remove the card from the pile", "empty the pile"]
      )
    ).toMatchInlineSnapshot(`
      "export class Pile extends List {
        static instanceType = Card

        canGiveUp(card) {
          return false
        }
      }
      Pile.exclusive = true
      Object.defineProperty(Card.prototype, 'pile', {
        get() {
          return Pile.ownerOf(this)
        },
        configurable: true
      })
      ---
      spellCore.append(pile, card)
      spellCore.remove(pile, card)
      spellCore.clear(pile)"
    `)
  })
})

describe("datatypes", () => {
  test("what each expression is", () => {
    expect(
      datatypes(
        "the card",
        "the deck",
        "the pot",
        "x",
        "the first card of the deck",
        "a random card of the pile",
        "the first chip of the pot",
        "the number of cards in the deck",
        "the cards in the deck where its direction is up",
        "the direction of the card",
        "the card is face up",
        "x + 1",
        `"total: " + x`,
        "(x + 1) * 2",
        "x is 1 and y is 2",
        "the name of the card as uppercase",
        "a new card",
        "a new list of cards",
        "[1, 2, 3]",
        "x if x > 1 otherwise 2",
        "the name of the card",
        "the value of the card",
        "the short rank of the card",
        "the suits of the card",
        "card suits",
        "the pile of the card"
      )
    ).toMatchInlineSnapshot(`
      "the card  =>  Card
      the deck  =>  Deck
      the pot  =>  Pot
      x  =>  number
      the first card of the deck  =>  Card
      a random card of the pile  =>  Card
      the first chip of the pot  =>  Chip
      the number of cards in the deck  =>  number
      the cards in the deck where its direction is up  =>  Deck
      the direction of the card  =>  ?
      the card is face up  =>  choice
      x + 1  =>  number
      "total: " + x  =>  text
      (x + 1) * 2  =>  number
      x is 1 and y is 2  =>  choice
      the name of the card as uppercase  =>  text
      a new card  =>  Card
      a new list of cards  =>  list of cards
      [1, 2, 3]  =>  list of numbers
      x if x > 1 otherwise 2  =>  number
      the name of the card  =>  text
      the value of the card  =>  number
      the short rank of the card  =>  text
      the suits of the card  =>  list
      card suits  =>  list
      the pile of the card  =>  Pile"
    `)
  })

  test("method calls:  what the method returns", () => {
    expect(
      datatypesAfter(
        [
          "to double (n as number): return n * 2",
          "to deal from a deck: return the first card of the deck",
          "to describe (n)",
          '\tif n is 1 return "one"',
          '\treturn "many"',
          "to muddle (n)",
          '\tif n is 1 return "one"',
          "\treturn 2",
          "to tally (n as text)",
          "\tfor each card in the deck: return 1",
          "\treturn n"
        ],
        "double x",
        "deal from the deck",
        "describe x",
        "muddle x",
        'tally "a"'
      )
    ).toMatchInlineSnapshot(`
      "double x  =>  number
      deal from the deck  =>  Card
      describe x  =>  text
      muddle x  =>  ?
      tally "a"  =>  text"
    `)
  })

  test("membership (P8, P10):  the owner member", () => {
    const { files } = parseMembership(
      [...PILES, "a tableau is a pile"],
      ["the tableau is a new tableau", "set d1 to the pile of the card", "get the card", "set d2 to its pile"]
    )
    const { scope } = files.at(-1)!
    expect(["d1", "d2"].map((name) => `${name}  =>  ${scope.variables!.get(name)?.datatype ?? "?"}`).join("\n"))
      .toMatchInlineSnapshot(`
        "d1  =>  Pile
        d2  =>  Pile"
      `)
  })

  test("built-in members (P7):  what the table says each is", () => {
    expect(
      datatypesAfter(
        ['set the title to "Solitaire"'],
        "the length of the title",
        "the length of the deck",
        "the size of the deck",
        "the characters of the title",
        "the first character of the title",
        "a random character of the title",
        "the length of the first character of the title"
      )
    ).toMatchInlineSnapshot(`
      "the length of the title  =>  number
      the length of the deck  =>  number
      the size of the deck  =>  number
      the characters of the title  =>  list of characters
      the first character of the title  =>  character
      a random character of the title  =>  character
      the length of the first character of the title  =>  number"
    `)
  })

  test("sinks:  arguments, loop items, `it`", () => {
    expect(
      sinks(
        [
          "to hold (a card) in (a pile) and (label as text)",
          "\tset arg-card to the card",
          "\tset arg-pile to the pile",
          "\tset arg-label to label"
        ],
        ["to flip (a card) over", "\tset owner to it"],
        ["for each item in the deck", "\tset loop-item to item", "\tset loop-it to it"],
        ["set winners to the cards in the deck where it is face up"],
        ["get the first card of the deck", "set got-it to it"]
      )
    ).toMatchInlineSnapshot(`
      "winners  =>  Deck
      got_it  =>  Card
      label  =>  text
      arg_card  =>  Card
      arg_pile  =>  Pile
      arg_label  =>  text
      owner  =>  Card
      item  =>  Card
      loop_item  =>  Card
      loop_it  =>  Card"
    `)
  })
})

////////////////
// ## Harness
////////////////

/** The frozen cards library:  `Card`, `Deck`, `Pile` -- not `Solitaire.spell`, which runs a game. */
const CARDS = loadFixtureProject("Solitaire").filter((file) => !file.path.endsWith("Solitaire.spell"))

/**
 * Types the probes use beside the cards library's, in a file of their own before the probe's.
 * - Why a file of their own:  a method on a type declared in the SAME file compiles INTO its `class` body,
 *   above `SETUP_END`, where `probe()` wouldn't see it, e.g. P4a's `to put (a chip) on (a pot)`.
 * - From another file it compiles to `Chip.prototype...`, as a method on `Card` does.
 */
const SETUP_TYPES = ["a chip is a thing", "a pot is a list of chips"]

/** What `SETUP`'s first line compiles to -- `probeWithTop()` returns what's above it. */
const SETUP_START_COMPILED = "export let card = new Card()"

/** Last line of `SETUP`, and what it compiles to -- `probe()` returns what follows it. */
const SETUP_END = "set y to 2"
const SETUP_END_COMPILED = "export let y = 2"

/**
 * Variables the probes refer to, parsed before each probe's lines.
 * - In the probe's own file:  a variable doesn't reach another file of the project.
 * - MUST end with `SETUP_END`.
 */
const SETUP = [
  "the card is a new card",
  "the deck is a new deck",
  "the pile is a new pile",
  "the chip is a new chip",
  "the pot is a new pot",
  "set x to 1",
  SETUP_END
]

/** A compiled line that's part of a `SPELL:` declaration comment, which `probe()` leaves out. */
const DECLARATION_LINE =
  /^\s*(\/\*! SPELL|type:|syntax:|defined:|alias:|name:|output:|rule:|of:|kind:|property:|classVariable:|params:|itemType:|returns:|\} \*\/)/

/**
 * What each of `expressions` IS:  one `<expression>  =>  <datatype>` line each, `?` for unknown.
 * - Each is set to a variable after `SETUP`, e.g. `set d1 to the first card of the deck`,
 *   and we read the datatype it got:  the expression's `match.datatype`, through the assignment's sink.
 */
function datatypes(...expressions: string[]): string {
  return datatypesAfter([], ...expressions)
}

/** `datatypes()`, after `setup` lines, e.g. the methods `expressions` call. */
function datatypesAfter(setup: string[], ...expressions: string[]): string {
  const lines = expressions.map((expression, index) => `set d${index + 1} to ${expression}`)
  const { files } = parseProbe([...setup, ...lines])
  const { scope } = files.at(-1)!
  return expressions
    .map((expression, index) => `${expression}  =>  ${scope.variables!.get(`d${index + 1}`)?.datatype ?? "?"}`)
    .join("\n")
}

/**
 * Datatype of every variable `blocks` declare INSIDE a body or at the top,
 * each block a method, loop or line after `SETUP`.
 * - One `<variable>  =>  <datatype>` line each, `?` for unknown.
 * - Variables inside a body are local to it:  found through each statement's `nestedScope`.
 */
function sinks(...blocks: string[][]): string {
  const { files } = parseProbe(blocks.flat())
  const file = files.at(-1)!
  const seen = new Set(["it", "x", "y", "card", "deck", "pile", "chip", "pot"])
  const lines: string[] = []
  visit(file.scope)
  for (const match of statementsOf(file.match)) visit(match.nestedScope)
  return lines.join("\n")

  /** Note each variable `scope` itself declared, once. */
  function visit(scope: P.Scope | undefined) {
    const variables = scope instanceof P.BlockScope ? scope.variables.get() : []
    for (const variable of variables) {
      if (seen.has(variable.name) || variable.isAlias) continue
      seen.add(variable.name)
      lines.push(`${variable.name}  =>  ${variable.datatype ?? "?"}`)
    }
  }
}

/**
 * Every match under `match` with a scope of its own (`nestedScope`), depth first.
 * - Through `matched`, and bodies (`data.body`).
 */
function statementsOf(match: P.Match | undefined, seen = new Set<P.Match>()): P.Match[] {
  if (!match || seen.has(match)) return []
  seen.add(match)
  const found: P.Match[] = []
  const { body } = match.data as { body?: unknown }
  for (const child of [...match.matched, body]) {
    if (!(child instanceof P.Match)) continue
    if (child.nestedScope !== child.scope) found.push(child)
    found.push(...statementsOf(child, seen))
  }
  return found
}

/** `lines` parsed after the cards library, `SETUP_TYPES` and `SETUP`, as `probe()` does. */
function parseProbe(lines: string[]) {
  return parseSpellProject([
    ...CARDS,
    { path: "/Types.spell", contents: SETUP_TYPES.join("\n") },
    { path: "/Probe.spell", contents: [...SETUP, ...lines].join("\n") }
  ])
}

/**
 * Parse `lines` as one spell file after `SETUP`:  what they compiled to, then their parse errors.
 * - One string, so its inline snapshot reads as the compiled code.
 * - An error's line is 1-based in the probe's file, so a probe's first line is line 8, after `SETUP`'s 7.
 * - What expressions ARE:  `datatypes()`, `sinks()`.
 */
function probe(...lines: string[]): string {
  const { files } = parseProbe(lines)
  const [types, file] = files.slice(-2)
  const compiled = file!.compiled.split("\n").filter((line) => !DECLARATION_LINE.test(line))
  const output = compiled.slice(compiled.lastIndexOf(SETUP_END_COMPILED) + 1)
  const errors = [...types!.errors, ...file!.errors].map((error) => `ERROR ${error}`)
  return [...output, ...errors].join("\n")
}

/**
 * `lines` parsed after the frozen `Card` / `Deck`, then `pileLines` as the project's `/Pile.spell`,
 * then `MEMBERSHIP_SETUP`.
 * - `pileLines` replace the fixture's `Pile.spell`, whose cards can belong to many piles.
 */
function parseMembership(pileLines: string[], lines: string[]) {
  return parseSpellProject([
    ...CARDS.filter((file) => !file.path.endsWith("Pile.spell")),
    { path: "/Pile.spell", contents: pileLines.join("\n") },
    { path: "/Probe.spell", contents: [...MEMBERSHIP_SETUP, ...lines].join("\n") }
  ])
}

/** `a pile is a list of cards` + `a card belongs to one pile`:  most membership probes' `Pile.spell`. */
const PILES = ["a pile is a list of cards", "a card belongs to one pile"]

/** Variables the membership probes refer to, as `SETUP`'s. */
const MEMBERSHIP_SETUP = ["the card is a new card", "the deck is a new deck", "the pile is a new pile"]

/**
 * What the membership probes compiled to, as one string -- see `parseMembership()`:
 * - `/Pile.spell` (`pileLines`) as compiled, then `---`
 * - what `lines` compiled to after `MEMBERSHIP_SETUP`
 * - every parse error
 */
function probeMembership(pileLines: string[], lines: string[]): string {
  const { files } = parseMembership(pileLines, lines)
  const [pile, file] = files.slice(-2)
  const declarations = (code: string) => code.split("\n").filter((line) => !DECLARATION_LINE.test(line))
  const output = declarations(file!.compiled).slice(MEMBERSHIP_SETUP.length)
  const errors = files.flatMap((it) => it.errors.map((error) => `ERROR ${it.path} ${error}`))
  return [...declarations(pile!.compiled), "---", ...output, ...errors].join("\n")
}

/**
 * `probe()`, plus what the probe file compiles to ABOVE `SETUP`'s lines, then `...`
 * - e.g. a property a `set` declared, which its file declares at its top.
 */
function probeWithTop(...lines: string[]): string {
  const { files } = parseProbe(lines)
  const compiled = files
    .at(-1)!
    .compiled.split("\n")
    .filter((line) => !DECLARATION_LINE.test(line))
  const top = compiled.slice(0, compiled.indexOf(SETUP_START_COMPILED))
  return [...top, "...", probe(...lines)].join("\n")
}
