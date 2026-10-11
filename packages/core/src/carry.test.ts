import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { spellCore, Thing, List, App } from "$/core"

/**
 * `spellCore.carryOver()` (epic `drawable-thing` P16):  a recompiled program takes over the last run's things.
 * - Each test runs a "program" twice, as a runner does on a recompile:
 *   the first version's things, then a reset, then the second version's classes and top-level things.
 * - The classes are what spell compiles from a Solitaire-like program;  `cardGame()` makes one version of them.
 */

////////////////
// ## Classes under test
////////////////

/** What one version of the program declares on a card, beyond its `rank` and `suit`. */
type CardVersion = {
  /** How `rank` is declared:  one of its ranks (the first version's), or another way. */
  rank?: { oneOf: unknown[] } | { type: string }
  /** Declares `nickname` as text? */
  nickname?: boolean
  /** Declares `color`, with this default? */
  color?: string
}

/** One version of a card game's classes:  `Card`, `Pile` (a card in one at a time), `Board` (the app). */
function cardGame({ rank = { oneOf: ["ace", 2, 3, "king"] }, nickname, color }: CardVersion = {}) {
  class Card extends Thing {
    static {
      this.declareProp("rank", rank)
      this.declareProp("suit", { type: "text" })
      if (nickname) this.declareProp("nickname", { type: "text" })
      if (color) this.declareProp("color", { type: "text", default: color })
    }
    get rank() {
      return this.getProp("rank")
    }
    set rank(value) {
      this.setProp("rank", value)
    }
    get suit() {
      return this.getProp("suit")
    }
    set suit(value) {
      this.setProp("suit", value)
    }
    get nickname() {
      return this.getProp("nickname")
    }
    set nickname(value) {
      this.setProp("nickname", value)
    }
    get color() {
      return this.getProp("color")
    }
    set color(value) {
      this.setProp("color", value)
    }
  }
  class Pile extends List<Card> {
    static instanceType = Card
    static exclusive = true
    static {
      this.declareProp("name", { type: "text" })
    }
    get name() {
      return this.getProp("name")
    }
    set name(value) {
      this.setProp("name", value)
    }
  }
  class Board extends App {
    get score() {
      return this.getProp("score")
    }
    set score(value) {
      this.setProp("score", value)
    }
  }
  return { Card, Pile, Board }
}

/** The classes of a version of the game. */
type CardGame = ReturnType<typeof cardGame>

/**
 * A game in progress, of `game`'s classes:  a board scored 5, a deck (a plain list) holding every card,
 * a stock pile with the ace and the 2, a discard pile with the king.
 * - The deck and the piles hold the SAME cards.
 */
function dealt({ Card, Pile, Board }: CardGame) {
  const cards = [
    new Card({ rank: "ace", suit: "clubs", nickname: "Al" }),
    new Card({ rank: 2, suit: "hearts" }),
    new Card({ rank: "king", suit: "spades" })
  ]
  const deck = new List({ items: cards })
  const stock = new Pile({ name: "stock" }).append(cards[0]!, cards[1]!)
  const discards = new Pile({ name: "discards" }).append(cards[2]!)
  return { board: new Board({ score: 5 }), deck, stock, discards }
}

/**
 * Run the game twice, as a recompile does:  `first`'s version dealt and played,
 * then `second`'s classes, whose start makes a fresh deal;  then carry over.
 * - Answers the second run's top-level things, after the carry-over, and the names kept.
 */
function recompile(first: CardVersion, second: CardVersion) {
  spellCore.resetRuntime()
  const before = dealt(cardGame(first))
  before.board.score = 15
  const previous = Object.entries(before).map(([name, thing]) => ({ name, thing }))
  spellCore.resetRuntime()
  const game = cardGame(second)
  const after = { ...dealt(game), ...game }
  spellCore.things.setTopLevel(after)
  const exports = { ...after }
  const kept = spellCore.carryOver(previous, after)
  return { before, after, exports, kept }
}

/** A pile's cards, as `rank suit`. */
const cardsOf = (pile: List) =>
  pile.items.map((card) => `${(card as Thing & { rank: unknown }).rank} ${(card as Thing & { suit: unknown }).suit}`)

/** The lines saying a thing starts afresh, of all `warned` was called with. */
const afresh = (warned: { mock: { calls: unknown[][] } }) =>
  warned.mock.calls.map(([line]) => String(line)).filter((line) => line.includes("starts afresh"))

afterEach(() => {
  vi.restoreAllMocks()
  spellCore.console.clear()
})

////////////////
// ## Tests
////////////////

describe("spellCore.carryOver():  a recompile keeps the program's things", () => {
  test("each top-level thing takes the last run's state, in place:  the game in progress, as the new classes", () => {
    const { before, after, exports, kept } = recompile({ nickname: true }, { nickname: true })
    expect(kept).toEqual(["board", "deck", "stock", "discards"])
    // the program's own variables still point at its own things
    expect(after.stock).toBe(exports.stock)
    expect(after.board.score).toBe(15)
    expect(cardsOf(after.stock)).toEqual(["ace clubs", 2 + " hearts"])
    expect(cardsOf(after.discards)).toEqual(["king spades"])
    // as the NEW class:  an old card is a new card
    const ace = after.stock.items[0]!
    expect(ace).toBeInstanceOf(after.Card)
    expect(ace).not.toBe(before.stock.items[0])
    expect(ace.nickname).toBe("Al")
    expect(after.Pile.ownerOf(ace)).toBe(after.stock)
  })

  test("a card held by two lists stays ONE card;  the cards the new run dealt are forgotten", () => {
    const { after } = recompile({}, {})
    const inPiles = [...after.stock.items, ...after.discards.items]
    expect(after.deck.items).toEqual(inPiles)
    after.deck.items.forEach((card, index) => expect(card).toBe(inPiles[index]))
    const cards = spellCore.things.all().filter((thing) => thing.type === "Card")
    expect(cards).toHaveLength(3)
    expect(cards.every((card) => inPiles.includes(card as never))).toBe(true)
  })

  test("a property added:  the new thing's own starting value;  one removed:  dropped", () => {
    const { after } = recompile({ nickname: true }, { color: "red" })
    const ace = after.stock.items[0]!
    expect(ace.color).toBe("red")
    expect(ace.keys()).not.toContain("nickname")
    expect(ace.nickname).toBeUndefined()
  })

  test("a property whose type changed:  each thing holding one starts afresh, and the console says so", () => {
    const warned = vi.spyOn(spellCore.console, "warn")
    const { after, kept } = recompile({}, { rank: { type: "number" } })
    expect(kept).toEqual(["board"])
    expect(after.board.score).toBe(15)
    // the new run's own deal, as it made it
    expect(after.stock.items).toHaveLength(2)
    expect(after.stock.items[0]).toBeInstanceOf(after.Card)
    // its own deal's ranks warn too:  they're text, where a number is declared
    expect(afresh(warned)).toEqual([
      "deck starts afresh:  Card's rank changed its type",
      "stock starts afresh:  Card's rank changed its type",
      "discards starts afresh:  Card's rank changed its type"
    ])
  })

  test("a type renamed or gone:  each thing holding one starts afresh, and the console says so", () => {
    const warned = vi.spyOn(spellCore.console, "warn")
    spellCore.resetRuntime()
    const before = dealt(cardGame())
    const previous = Object.entries(before).map(([name, thing]) => ({ name, thing }))
    spellCore.resetRuntime()
    // the new program calls its cards `PlayingCard`, and its board a `Table`
    const { Pile } = cardGame()
    class PlayingCard extends Thing {}
    class Table extends App {}
    const after = { board: new Table(), stock: new Pile({ name: "stock" }), PlayingCard, Pile, Table }
    spellCore.things.setTopLevel(after)
    expect(spellCore.carryOver(previous, after)).toEqual([])
    expect(afresh(warned)).toEqual([
      "board starts afresh:  its type was Board, now Table",
      "stock starts afresh:  type Card is gone"
    ])
  })

  test("while a recompiled program loads, a pause never ends:  its start stops there", async () => {
    let paused = false
    spellCore.isCarryingOver = true
    void spellCore.pauseFor(1, "msec").then(() => (paused = true))
    spellCore.isCarryingOver = false
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(paused).toBe(false)
    await spellCore.pauseFor(1, "msec")
  })
})
