import { describe, test, expect } from "vite-plus/test"

import { observe } from "$/util"
import { spellCore, Thing, List } from "$/core"

/**
 * Exclusive lists:  an item is in at most ONE list of a family at a time -- and guards on a move.
 * - See `List`'s class docs, and plan doc D7 / D8, Q22 - Q25 of precedence-and-types.
 * - The classes below are what spell compiles from:
 *   - `a pile is a list of cards` + `a card belongs to one pile`
 *   - `a tableau is a pile`
 *   - `a deck is a list of cards`
 *   - `a hand is a list of cards` + `a card belongs to one hand`
 */

////////////////
// ## Classes under test
////////////////

/** A card:  `pile` and `hand` are what its `belongs to one` lines patch on. */
class Card extends Thing {
  declare pile: List | undefined
  declare hand: List | undefined
}

/** `a pile is a list of cards` + `a card belongs to one pile`:  the family's root. */
class Pile extends List {
  static instanceType = Card
  static exclusive = true
}
Object.defineProperty(Card.prototype, "pile", {
  get() {
    return Pile.ownerOf(this)
  },
  configurable: true
})

/** `a tableau is a pile`:  same family. */
class Tableau extends Pile {}

/** `a deck is a list of cards`:  no family. */
class Deck extends List {
  static instanceType = Card
}

/** `a hand is a list of cards` + `a card belongs to one hand`:  a family of its own. */
class Hand extends List {
  static instanceType = Card
  static exclusive = true
}
Object.defineProperty(Card.prototype, "hand", {
  get() {
    return Hand.ownerOf(this)
  },
  configurable: true
})

/**
 * `a foundation is a pile` with guards, as spell compiles them into its class:
 * - `a foundation can take a card if: it is empty` -- one card at most
 * - `a foundation can never let go of a card`
 */
class Foundation extends Pile {
  canTake(_card: unknown): boolean {
    return spellCore.isEmpty(this)
  }
  canGiveUp(_card: unknown): boolean {
    return false
  }
}

/** `a stock-pile can give up a card if: the card is its last card`. */
class StockPile extends Pile {
  canGiveUp(card: unknown): boolean {
    return card === spellCore.getItemOf(this, -1)
  }
}

/** `count` new cards. */
function cards(count: number): Card[] {
  return Array.from({ length: count }, () => new Card({}))
}

/** `a ranked-card is a card` + `a ranked-card has a rank as text`:  `rank` is a reactive prop, as compiled. */
class RankedCard extends Card {
  get rank(): string {
    return this.getProp("rank")
  }
  set rank(value: string) {
    this.setProp("rank", value)
  }
}

/** `a table is a thing` + `a table has a name as text` + `a table has a deck`. */
class Table extends Thing {
  get name(): string {
    return this.getProp("name")
  }
  set name(value: string) {
    this.setProp("name", value)
  }
  get deck(): Deck {
    return this.getProp("deck")
  }
  set deck(value: Deck) {
    this.setProp("deck", value)
  }
}

/** A card ranked `rank`. */
function ranked(rank: string): RankedCard {
  return new RankedCard({ rank })
}

/** What `list` holds, as an array. */
function itemsOf(list: List): unknown[] {
  return list.getValues()
}

////////////////
// ## Tests
////////////////

describe("exclusive lists", () => {
  test("adding a card makes its pile the owner", () => {
    const [card] = cards(1)
    const pile = new Pile({})
    expect(card!.pile).toBe(undefined)
    spellCore.append(pile, card)
    expect(card!.pile).toBe(pile)
  })

  test("adding to another list of the family moves it -- a sub-type's too", () => {
    const [card, other] = cards(2)
    const pile = new Pile({})
    const tableau = new Tableau({})
    spellCore.append(pile, card, other)
    spellCore.append(tableau, card)
    expect(itemsOf(pile)).toEqual([other])
    expect(itemsOf(tableau)).toEqual([card])
    expect(card!.pile).toBe(tableau)
    expect(Tableau.ownerOf(card)).toBe(tableau)
  })

  test("a card can be in the deck AND one pile -- a deck is outside the family", () => {
    const [card] = cards(1)
    const deck = new Deck({})
    const pile = new Pile({})
    spellCore.append(deck, card)
    spellCore.append(pile, card)
    expect(itemsOf(deck)).toEqual([card])
    expect(itemsOf(pile)).toEqual([card])
    expect(Pile.ownerOf(card)).toBe(pile)
    expect(Deck.ownerOf(card)).toBe(undefined)
  })

  test("each exclusive family keeps its own owners", () => {
    const [card] = cards(1)
    const pile = new Pile({})
    const hand = new Hand({})
    spellCore.append(pile, card)
    spellCore.append(hand, card)
    expect(card!.pile).toBe(pile)
    expect(card!.hand).toBe(hand)
  })

  test("adding a card it holds moves it, never twice", () => {
    const [a, b, c] = cards(3)
    const pile = new Pile({})
    spellCore.append(pile, a, b, c)
    spellCore.append(pile, a)
    expect(itemsOf(pile)).toEqual([b, c, a])
    spellCore.prepend(pile, c)
    expect(itemsOf(pile)).toEqual([c, b, a])
    spellCore.addAtPosition(pile, 3, c)
    expect(itemsOf(pile)).toEqual([b, c, a])
    expect(a!.pile).toBe(pile)
  })

  test("removing leaves it with no owner", () => {
    const [a, b, c] = cards(3)
    const pile = new Pile({})
    spellCore.append(pile, a, b, c)
    spellCore.remove(pile, a)
    expect(a!.pile).toBe(undefined)
    spellCore.removeItemOf(pile, 1)
    expect(b!.pile).toBe(undefined)
    spellCore.clear(pile)
    expect(c!.pile).toBe(undefined)
    expect(itemsOf(pile)).toEqual([])
  })

  test("setting an item:  the new one joins, the old one leaves -- reversing keeps every owner", () => {
    const [a, b, c, d] = cards(4)
    const pile = new Pile({})
    const other = new Pile({})
    spellCore.append(pile, a, b, c)
    spellCore.append(other, d)
    spellCore.setItemOf(pile, 2, d)
    expect(itemsOf(pile)).toEqual([a, d, c])
    expect(itemsOf(other)).toEqual([])
    expect(d!.pile).toBe(pile)
    expect(b!.pile).toBe(undefined)
    spellCore.reverse(pile)
    expect(itemsOf(pile)).toEqual([c, d, a])
    expect([a, c, d].map((card) => card!.pile)).toEqual([pile, pile, pile])
  })

  test("shuffling keeps every card, and every owner", () => {
    const deal = cards(10)
    const pile = new Pile({})
    spellCore.append(pile, ...deal)
    spellCore.randomize(pile)
    expect(new Set(itemsOf(pile))).toEqual(new Set(deal))
    expect(deal.every((card) => card.pile === pile)).toBe(true)
  })

  test("setting `items` keeps the owners too", () => {
    const [a, b] = cards(2)
    const pile = new Pile({})
    const other = new Pile({})
    spellCore.append(pile, a)
    other.items = [a, b]
    expect(itemsOf(pile)).toEqual([])
    expect(a!.pile).toBe(other)
    other.items = [b]
    expect(a!.pile).toBe(undefined)
  })

  test("scratch results own nothing:  filter, map, a range, a copy, a merge", () => {
    const [a, b, c] = cards(3)
    const pile = new Pile({})
    const tableau = new Tableau({})
    spellCore.append(pile, a, b)
    spellCore.append(tableau, c)
    // as compiled spell passes it:  `a copy of list the stock as a pile`
    const asPile = Pile as unknown as new () => List
    const results = [
      spellCore.filter(pile, () => true),
      spellCore.map(pile, (card) => card),
      spellCore.rangeStartingAt(pile, 1),
      spellCore.duplicateCollection(pile),
      spellCore.duplicateCollection(pile, asPile),
      spellCore.mergeCollections([pile, tableau]),
      spellCore.mergeCollections([pile, tableau], asPile)
    ] as List[]
    for (const result of results) expect(result).toBeInstanceOf(Pile)
    expect(itemsOf(results[0]!)).toEqual([a, b])
    expect(itemsOf(results.at(-1)!)).toEqual([a, b, c])
    expect(itemsOf(pile)).toEqual([a, b])
    expect(itemsOf(tableau)).toEqual([c])
    expect([a, b, c].map((card) => card!.pile)).toEqual([pile, pile, tableau])
    // moving a card out of a scratch copy's source leaves the copy alone
    const copy = results[3]!
    spellCore.append(tableau, a)
    expect(itemsOf(copy)).toEqual([a, b])
    expect(a!.pile).toBe(tableau)
  })

  test("a number or text can't be owned:  the list just holds it", () => {
    const pile = new Pile({})
    const other = new Pile({})
    spellCore.append(pile, 1, "x")
    spellCore.append(other, 1)
    expect(itemsOf(pile)).toEqual([1, "x"])
    expect(Pile.ownerOf(1)).toBe(undefined)
  })

  test("the owner is tracked:  a reader re-runs when the card moves", () => {
    const [card] = cards(1)
    const pile = new Pile({})
    const tableau = new Tableau({})
    const seen: unknown[] = []
    const stop = observe(() => {
      seen.push(card!.pile)
    })
    spellCore.append(pile, card)
    spellCore.append(tableau, card)
    spellCore.append(tableau, card) // already there:  same owner, nobody's told
    spellCore.remove(tableau, card)
    stop()
    expect(seen).toEqual([undefined, pile, tableau, undefined])
  })
})

describe("guards:  only a move asks them", () => {
  test("a move asks the card's pile to give it up, then the new pile to take it", () => {
    const [a, b] = cards(2)
    const stock = new StockPile({})
    const foundation = new Foundation({})
    spellCore.append(stock, a, b)
    // `a` isn't the stock's last card:  the stock won't give it up
    expect(spellCore.move(a, foundation)).toBe(false)
    expect(itemsOf(stock)).toEqual([a, b])
    expect(a!.pile).toBe(stock)
    // `b` is, and the foundation is empty:  it moves, its owner changing once
    expect(spellCore.move(b, foundation)).toBe(true)
    expect(itemsOf(stock)).toEqual([a])
    expect(itemsOf(foundation)).toEqual([b])
    expect(b!.pile).toBe(foundation)
  })

  test("refused by the new pile:  nothing changes", () => {
    const [a, b] = cards(2)
    const foundation = new Foundation({})
    const pile = new Pile({})
    spellCore.append(foundation, a)
    spellCore.append(pile, b)
    expect(spellCore.move(b, foundation)).toBe(false)
    expect(itemsOf(pile)).toEqual([b])
    expect(itemsOf(foundation)).toEqual([a])
  })

  test("a list that can never let go still lets `add`, `remove` and `clear` through", () => {
    const [a, b, c] = cards(3)
    const foundation = new Foundation({})
    const pile = new Pile({})
    spellCore.append(foundation, a, b, c)
    expect(spellCore.move(a, pile)).toBe(false)
    spellCore.append(pile, a)
    spellCore.remove(foundation, b)
    expect(itemsOf(pile)).toEqual([a])
    expect(itemsOf(foundation)).toEqual([c])
    spellCore.clear(foundation)
    expect(c!.pile).toBe(undefined)
  })

  test("outside a family, only the new list is asked:  a card in no pile, or a plain list", () => {
    const [a, b] = cards(2)
    const foundation = new Foundation({})
    const deck = new Deck({})
    expect(spellCore.move(a, foundation)).toBe(true)
    // the deck is outside the pile family:  the foundation isn't asked to give it up
    expect(spellCore.move(a, deck)).toBe(true)
    expect(itemsOf(deck)).toEqual([a])
    expect(a!.pile).toBe(foundation)
    const plain: unknown[] = []
    expect(spellCore.move(b, plain)).toBe(true)
    expect(plain).toEqual([b])
  })

  test("asking without moving:  `can take`, `can give up` -- a plain list allows anything", () => {
    const [a] = cards(1)
    const foundation = new Foundation({})
    expect(spellCore.canTake(foundation, a)).toBe(true)
    expect(spellCore.canGiveUp(foundation, a)).toBe(false)
    expect(spellCore.canTake(new Pile({}), a)).toBe(true)
    expect(spellCore.canGiveUp([a], a)).toBe(true)
  })
})

describe("JSON", () => {
  test("a list is its items:  a thing holding one shows each item by its own JSON (output-targets V14)", () => {
    const deck = new Deck({})
    deck.add(ranked("A"), ranked("K"))
    const table = new Table({ name: "table", deck })
    expect(JSON.parse(JSON.stringify(table))).toEqual({ name: "table", deck: [{ rank: "A" }, { rank: "K" }] })
  })

  test("tracked:  a reader of the JSON re-runs when an item comes or goes", () => {
    const deck = new Deck({})
    deck.add(ranked("A"))
    const seen: string[] = []
    const stop = observe(() => {
      seen.push(JSON.stringify(deck))
    })
    deck.add(ranked("K"))
    deck.removeItem(1)
    stop()
    expect(seen).toEqual(['[{"rank":"A"}]', '[{"rank":"A"},{"rank":"K"}]', '[{"rank":"K"}]'])
  })
})
