import { describe, test, expect } from "vitest"

import { loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * LEDGER of what spell's grammar does with a fixed set of phrasings -- one inline snapshot per probe.
 * - Why:  the precedence-and-types epic changes how spell parses expressions, types, signatures and members.
 *   Each phase diffs against this file, so its review shows EXACTLY which phrasings it changed and how.
 * - Changes to these snapshots are EXPECTED in phases P3-P6:  READ each one before blessing it
 *   (`yarn vitest run src/grammar.probes.test.ts -u`), and say in the phase's notes why it moved.
 *   A change in any other phase is a regression until shown otherwise.
 * - The design, and the problems the probe titles refer to:  `packages/docs/precedence/precedence.html`
 *   ("2. The problems").
 *   - NOTE:  a title's `P1a` ... `P8e` is that page's PROBLEM number (P1 = greedy operands ...),
 *     NOT an epic phase.  Titles match the page's experiment, `packages/docs/precedence/experiments/grammar-today.mts`.
 * - Each probe parses scratch file `/Probe.spell` in memory with `parseSpellProject()`, exactly as a project
 *   compile does, after the frozen Solitaire fixture's `Card` / `Deck` / `Pile` (`projects/test/Solitaire/`),
 *   which predate jokers -- so no joker phrasing here.
 * - Snapshot:  the probe's compiled lines (after `SETUP`'s), then one `ERROR <line>:<ch> <message>` per parse error.
 *   `SPELL:` declaration comments are left out:  they repeat the declaring statement.
 */
describe("grammar probes", () => {
  ////////////////
  // ## P1:  greedy operands, no backtracking
  ////////////////

  test("P1a  trailing operand takes the operator", () => {
    expect(probe("print the first card of the deck is face up")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.getItemOf(deck, 1).is_face_up)"`
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
      `"spellCore.console.log(spellCore.getItemOf(deck, 1).suit == 'hearts')"`
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
      chip.put_on_$pile(pot)"
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
      card.add_to_$pile(deck)"
    `)
  })

  ////////////////
  // ## P5 / P6 / P7:  signatures, property names, `is a`
  ////////////////

  test("P5   paren-free signature", () => {
    expect(probe("to give a card to a pile: print 1")).toMatchInlineSnapshot(`
      "export function give_a_card_to_a_pile() {
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
      "/* PARSE ERROR: Don't understand "the short rank of a card is: return 1" */
      ERROR 8:0 Don't understand "the short rank of a card is: return 1""
    `)
  })

  test("P6b  multi-word property read", () => {
    expect(probe("print the short-rank of the card", "print the short rank of the card")).toMatchInlineSnapshot(`
      "spellCore.console.log(card.short_rank)
      /* PARSE ERROR: Don't understand "print the short rank of the card" */
      ERROR 9:0 Don't understand "print the short rank of the card""
    `)
  })

  test("P7   `is a` accepts any word as a type", () => {
    expect(probe("print the card is a new card")).toMatchInlineSnapshot(`"spellCore.console.log(card == new Card())"`)
  })

  test("P7b  setting a property the type never declared", () => {
    expect(probe("set the pile of the card to the pile")).toMatchInlineSnapshot(`"card.pile = pile"`)
  })

  ////////////////
  // ## P8:  Solitaire's parens -- which are load-bearing?
  ////////////////

  test("P8a  Deck.spell:40-41 as one line", () => {
    expect(probe("expect the first card of the deck is the ace of clubs to be yes")).toMatchInlineSnapshot(
      `"spellCore.expect(spellCore.getItemOf(deck, 1).is_the_$rank_of_$suits('ace', 'clubs'), \`the first card of the deck is the ace of clubs\`, true, \`yes\`)"`
    )
  })

  test("P8b  Solitaire:105 without its parens", () => {
    expect(probe("turn the bottom card of the deck face up")).toMatchInlineSnapshot(
      `"spellCore.getItemOf(deck, -1).turn_face_up()"`
    )
  })

  test("P8c  Solitaire:166 without its parens", () => {
    expect(probe("if x is a king and x is the first card of the pile return")).toMatchInlineSnapshot(
      `"if (x.is_a_$rank('king') && (x == spellCore.getItemOf(pile, 1))) { return }"`
    )
  })

  test("P8d  Card.spell:46 without its parens", () => {
    expect(probe("print the first character of the name of the card as uppercase")).toMatchInlineSnapshot(
      `"spellCore.console.log(spellCore.upperCase(spellCore.getItemOf(card.name, 1)))"`
    )
  })

  test("P8e  Card.spell:46 as a bare expression", () => {
    expect(probe("the first character of the name of the card as uppercase")).toMatchInlineSnapshot(`
      "/* PARSE ERROR: Don't understand "the first character of the name of the card as uppercase" */
      ERROR 8:0 Don't understand "the first character of the name of the card as uppercase""
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
 *   above `SETUP_END`, where `probe()` wouldn't see it (e.g. P4a's `to put (a chip) on (a pot)`).
 *   From another file it compiles to `Chip.prototype...`, as a method on `Card` does.
 */
const SETUP_TYPES = ["a chip is a thing", "a pot is a list of chips"]

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
const DECLARATION_LINE = /^\s*(\/\*! SPELL|type:|syntax:|defined:|alias:|name:|output:|rule:|of:|kind:|\} \*\/)/

/**
 * Parse `lines` as one spell file after `SETUP`:  what they compiled to, then their parse errors.
 * - One string, so its inline snapshot reads as the compiled code.
 * - An error's line is 1-based in the probe's file, so a probe's first line is line 8, after `SETUP`'s 7.
 * - TODO(P4):  add a `datatype` column -- the datatype of each statement's expression -- once matches carry one.
 */
function probe(...lines: string[]): string {
  const { files } = parseSpellProject([
    ...CARDS,
    { path: "/Types.spell", contents: SETUP_TYPES.join("\n") },
    { path: "/Probe.spell", contents: [...SETUP, ...lines].join("\n") }
  ])
  const [types, file] = files.slice(-2)
  const compiled = file!.compiled.split("\n").filter((line) => !DECLARATION_LINE.test(line))
  const output = compiled.slice(compiled.lastIndexOf(SETUP_END_COMPILED) + 1)
  const errors = [...types!.errors, ...file!.errors].map((error) => `ERROR ${error}`)
  return [...output, ...errors].join("\n")
}
