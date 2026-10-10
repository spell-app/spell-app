import { describe, test, expect } from "vite-plus/test"

import { spellCore, Thing, List, App } from "$/core"

/**
 * `spellCore.fromJSON()` (epic `output-targets`, P15, Q49):  a spell object's JSON read back as what it was.
 * - The classes below are what spell compiles from a Solitaire-like program:
 *   - `a card is a thing` + `a card has a rank as one of ...`, `a suit as text`, `a direction as one of up or down`
 *   - `a pile is a list of cards` + `a pile has a name as text` + `a card belongs to one pile`
 *   - `a stock-pile is a pile`
 *   - `a board is an app` + `a board has a score as a number` + `a board has piles as a list of piles`
 */

////////////////
// ## Classes under test
////////////////

class Card extends Thing {
  static Ranks = ["ace", 2, 3, "king"]
  static {
    this.declareProp("rank", { oneOf: Card.Ranks })
    this.declareProp("suit", { type: "text" })
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
  get direction() {
    return this.getProp("direction")
  }
  set direction(value) {
    this.setProp("direction", value)
  }
  /** `the pile of a card`, from `a card belongs to one pile`. */
  get pile(): Pile | undefined {
    return Pile.ownerOf(this)
  }
}

class Pile extends List<Card> {
  static instanceType = Card
  static exclusive = true
  get name() {
    return this.getProp("name")
  }
  set name(value) {
    this.setProp("name", value)
  }
}

class StockPile extends Pile {}

class Board extends App {
  get score() {
    return this.getProp("score")
  }
  set score(value) {
    this.setProp("score", value)
  }
  get piles(): List<Pile> {
    return this.getProp("piles", () => new List<Pile>())
  }
  set piles(value) {
    this.setProp("piles", value)
  }
}

/** A board, as a game in progress:  a stock pile of two cards face down, a discard pile of one face up. */
function dealtBoard(): Board {
  const board = new Board({ score: 5 })
  const stock = new StockPile({ name: "stock" }).append(
    new Card({ rank: "ace", suit: "clubs", direction: "down" }),
    new Card({ rank: 2, suit: "hearts", direction: "down" })
  )
  const discards = new Pile({ name: "discards" }).append(new Card({ rank: "king", suit: "spades", direction: "up" }))
  board.piles.append(stock, discards)
  return board
}

////////////////
// ## Tests
////////////////

describe("spellCore.fromJSON()", () => {
  test("a board's JSON reads back as the board:  the same classes, props, and cards in each pile", () => {
    const board = dealtBoard()
    const json = JSON.stringify(board)
    const read = spellCore.fromJSON(json) as Board
    expect(JSON.stringify(read)).toBe(json)
    expect(read).toBeInstanceOf(Board)
    expect(read).not.toBe(board)
    expect(read.score).toBe(5)
    const [stock, discards] = [...read.piles]
    expect([stock, discards].map((pile) => pile!.constructor)).toEqual([StockPile, Pile])
    expect(stock!.name).toBe("stock")
    expect(stock!.items.map((card) => [card.constructor, card.rank, card.suit, card.direction])).toEqual([
      [Card, "ace", "clubs", "down"],
      [Card, 2, "hearts", "down"]
    ])
  })

  test("each pile OWNS its cards:  they're added as a program adds them", () => {
    const read = spellCore.fromJSON(JSON.stringify(dealtBoard())) as Board
    const [stock, discards] = [...read.piles]
    expect(stock!.items.map((card) => card.pile)).toEqual([stock, stock])
    expect(discards!.firstItem!.pile).toBe(discards)
    // and moves on as any card does
    const card = stock!.lastItem!
    discards!.add(card)
    expect([stock!.length, card.pile]).toEqual([1, discards])
  })

  test('takes what `JSON.parse()` answered, too;  a value with no `"@type"` stays as it is', () => {
    const read = spellCore.fromJSON(JSON.parse(JSON.stringify({ top: new Card({ rank: 3 }), count: 1 })))
    expect(read).toEqual({ top: expect.any(Card), count: 1 })
    expect((read as { top: Card }).top.rank).toBe(3)
    expect(spellCore.fromJSON('[1, "two", null]')).toEqual([1, "two", null])
  })

  test("a plain list:  `List`, with its items", () => {
    const read = spellCore.fromJSON('{ "@type": "List", "items": [1, 2, 3] }') as List<number>
    expect(read.constructor).toBe(List)
    expect([...read]).toEqual([1, 2, 3])
  })

  test('an unknown `"@type"`:  a plain object, its `"@type"` kept, what it holds read back as usual', () => {
    const read = spellCore.fromJSON(
      '{ "@type": "Spaceship", "name": "Zork", "crew": [{ "@type": "Card", "rank": "ace" }] }'
    ) as Record<string, unknown>
    expect(Object.getPrototypeOf(read)).toBe(Object.prototype)
    expect(read).toEqual({ "@type": "Spaceship", name: "Zork", crew: [expect.any(Card)] })
  })

  test("a class is found once one of its things is made, or it's added -- e.g. a project the program imports", () => {
    class Joker extends Card {}
    const json = '{ "@type": "Joker", "rank": "ace" }'
    expect(spellCore.fromJSON(json)).toEqual({ "@type": "Joker", rank: "ace" })
    spellCore.things.addClasses({ Joker, notAClass: 3, Thing })
    expect(spellCore.fromJSON(json)).toBeInstanceOf(Joker)
  })

  test("made as `new` makes it:  `create()` runs, and the JSON's items replace what it added", () => {
    class Hand extends Pile {
      create() {
        this.add(new Card({ rank: 2 }))
      }
    }
    void new Hand()
    const read = spellCore.fromJSON('{ "@type": "Hand", "name": "mine", "items": [{ "@type": "Card", "rank": 3 }] }')
    expect((read as Hand).items.map((card) => card.rank)).toEqual([3])
  })

  test("a prop with no setter is still a prop", () => {
    const card = new Card({ rank: "ace" })
    ;(card as unknown as { setProp(name: string, value: unknown): void }).setProp("nickname", "Lucky")
    const read = spellCore.fromJSON(JSON.stringify(card)) as Card
    expect(read.keys()).toEqual(["rank", "nickname"])
    expect(read.toJSON()).toEqual({ "@type": "Card", rank: "ace", nickname: "Lucky" })
  })

  test("throws on text that isn't JSON", () => {
    expect(() => spellCore.fromJSON("{ not json")).toThrow(SyntaxError)
  })
})
