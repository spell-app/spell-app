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

/** `a named-deck is a deck` + `a named-deck has a name as text`:  a list with a prop of its own. */
class NamedDeck extends Deck {
  get name(): string {
    return this.getProp("name")
  }
  set name(value: string) {
    this.setProp("name", value)
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

describe("JSON (output-targets Q49)", () => {
  test('a list is its `"@type"`, its own props, then its items:  each item by its own JSON', () => {
    const deck = new NamedDeck({ name: "spare" })
    deck.add(ranked("A"), ranked("K"))
    const table = new Table({ name: "table", deck })
    expect(JSON.stringify(table)).toBe(
      '{"@type":"Table","name":"table","deck":{"@type":"NamedDeck","name":"spare","items":[' +
        '{"@type":"RankedCard","rank":"A"},{"@type":"RankedCard","rank":"K"}]}}'
    )
  })

  test('a plain list, and a scratch one:  `"@type"` and its items', () => {
    expect(JSON.parse(JSON.stringify(new List().append(1, 2)))).toEqual({ "@type": "List", items: [1, 2] })
    const pile = new Pile({}).append(ranked("A"), ranked("K"))
    expect(JSON.parse(JSON.stringify(pile.filter((card) => (card as RankedCard).rank === "K")))).toEqual({
      "@type": "Pile",
      items: [{ "@type": "RankedCard", rank: "K" }]
    })
  })

  test('neither `"@type"` nor `"items"` is a prop:  `keys()` lists only its own', () => {
    const deck = new NamedDeck({ name: "spare" }).append(ranked("A"))
    JSON.stringify(deck)
    expect(deck.keys()).toEqual(["name"])
  })

  test("tracked:  a reader of the JSON re-runs when an item comes or goes, or a prop changes", () => {
    const deck = new NamedDeck({ name: "spare" })
    deck.add(ranked("A"))
    const seen: string[] = []
    const stop = observe(() => {
      seen.push(JSON.stringify(deck.toJSON().items))
    })
    deck.add(ranked("K"))
    deck.removeItem(1)
    stop()
    expect(seen).toEqual([
      '[{"@type":"RankedCard","rank":"A"}]',
      '[{"@type":"RankedCard","rank":"A"},{"@type":"RankedCard","rank":"K"}]',
      '[{"@type":"RankedCard","rank":"K"}]'
    ])
    const names: string[] = []
    const stopNames = observe(() => {
      names.push(String(deck.toJSON().name))
    })
    deck.name = "kept"
    stopNames()
    expect(names).toEqual(["spare", "kept"])
  })
})

////////////////
// ## List methods (epic `output-targets`, Q33, Q35, Q36)
////////////////

/** A plain list of `items`, typed:  `List<number>`. */
function numbers(...items: number[]): List<number> {
  return new List<number>().append(...items)
}

/**
 * Each method beside its `spellCore` twin, run on two lists alike:  `[name, method, twin]`.
 * - Compared by `outcome()`.
 */
const TWINS: Array<[string, (list: List<number>) => unknown, (list: List<number>) => unknown]> = [
  ["firstItem", (list) => list.firstItem, (list) => spellCore.getItemOf(list, 1)],
  ["lastItem", (list) => list.lastItem, (list) => spellCore.getItemOf(list, -1)],
  ["isEmpty", (list) => list.isEmpty, (list) => spellCore.isEmpty(list)],
  ["max", (list) => list.max, (list) => spellCore.largestOf(list)],
  ["min", (list) => list.min, (list) => spellCore.smallestOf(list)],
  ["values", (list) => list.values, (list) => spellCore.valuesOf(list)],
  [
    "includes",
    (list) => [list.includes(2, 3), list.includes(2, 9)],
    (list) => [spellCore.includes(list, 2, 3), spellCore.includes(list, 2, 9)]
  ],
  ["includesAny", (list) => list.includesAny(9, 3), (list) => spellCore.includesAny(list, 9, 3)],
  ["all", (list) => list.all((it) => it > 0), (list) => spellCore.all(list, (it) => it > 0)],
  ["any", (list) => list.any((it) => it > 3), (list) => spellCore.any(list, (it) => it > 3)],
  [
    "map",
    (list) => list.map((it, position) => it * position),
    (list) => spellCore.map(list, (it, position) => it * Number(position))
  ],
  ["filter", (list) => list.filter((it) => it % 2 === 1), (list) => spellCore.filter(list, (it) => it % 2 === 1)],
  ["append", (list) => list.append(7, 8), (list) => spellCore.append(list, 7, 8)],
  ["prepend", (list) => list.prepend(7, 8), (list) => spellCore.prepend(list, 7, 8)],
  ["addAt", (list) => list.addAt(2, 7), (list) => spellCore.addAtPosition(list, 2, 7)],
  ["addBefore", (list) => list.addBefore(3, 7), (list) => spellCore.addBefore(list, 3, 7)],
  ["addAfter", (list) => list.addAfter(3, 7), (list) => spellCore.addAfter(list, 3, 7)],
  ["remove", (list) => list.remove(2, 4), (list) => spellCore.remove(list, 2, 4)],
  ["removeWhere", (list) => list.removeWhere((it) => it > 2), (list) => spellCore.removeWhere(list, (it) => it > 2)],
  ["removeBetween", (list) => list.removeBetween(2, 3), (list) => spellCore.removeRangeBetween(list, 2, 3)],
  ["setItems", (list) => list.setItems(2, 7, 8), (list) => spellCore.setItemsOf(list, 2, 7, 8)],
  ["reverse", (list) => list.reverse(), (list) => spellCore.reverse(list)],
  ["startingFrom", (list) => list.startingFrom(-2), (list) => spellCore.rangeStartingAt(list, -2)],
  [
    "startingWith",
    (list) => list.startingWith(3),
    (list) => spellCore.rangeStartingAt(list, spellCore.itemOf(list, 3))
  ],
  ["between", (list) => list.between(2, 3), (list) => spellCore.rangeBetween(list, 2, 3)],
  [
    "startsWith",
    (list) => [list.startsWith(1), list.startsWith(2)],
    (list) => [spellCore.startsWith(list, 1), spellCore.startsWith(list, 2)]
  ],
  [
    "endsWith",
    (list) => [list.endsWith(4), list.endsWith(3)],
    (list) => [spellCore.endsWith(list, 4), spellCore.endsWith(list, 3)]
  ],
  ["clone", (list) => list.clone(), (list) => spellCore.duplicateCollection(list)],
  [
    "appendAll",
    (list) => list.appendAll([7], numbers(8)),
    (list) => spellCore.mergeCollectionsInto(list, [7], numbers(8))
  ]
]

/**
 * What to compare of `result`, from a method on `list`:  a list result as its class and items, then `list`'s items.
 * - A change returns its list and its twin nothing, or the list:  both are `"changed"`, and the items after say how.
 */
function outcome(result: unknown, list: List): unknown {
  const answer = result === list || result === undefined ? "changed" : result
  return {
    answer: answer instanceof List ? { class: answer.constructor, items: answer.getValues() } : answer,
    after: list.getValues()
  }
}

describe("List methods", () => {
  test.each(TWINS)("`%s` does what its `spellCore` twin does", (_name, method, twin) => {
    const mine = numbers(1, 2, 3, 4)
    const theirs = numbers(1, 2, 3, 4)
    expect(outcome(method(mine), mine)).toEqual(outcome(twin(theirs), theirs))
  })

  test("on an empty list:  `undefined` items, empty, and empty results of its class", () => {
    const empty = new Deck({})
    expect([empty.firstItem, empty.lastItem, empty.max, empty.min, empty.randomItem()]).toEqual(
      Array(5).fill(undefined)
    )
    expect(empty.isEmpty).toBe(true)
    expect(empty.all()).toBe(false)
    for (const result of [empty.between(1, 2), empty.startingFrom(1), empty.filter(), empty.randomItems(2)]) {
      expect(result).toBeInstanceOf(Deck)
      expect(result.getValues()).toEqual([])
    }
  })

  test("callbacks get `(value, position, list)`, position counting from 1", () => {
    const deck = new Deck({}).append("a", "b", "c")
    const seen: unknown[] = []
    deck.forEach((value, position, list) => seen.push([value, position, list === deck]))
    expect(seen).toEqual([
      ["a", 1, true],
      ["b", 2, true],
      ["c", 3, true]
    ])
  })

  test("a change returns the list, so calls chain", () => {
    expect(numbers(1, 2, 3).append(4).reverse().remove(1).prepend(0).getValues()).toEqual([0, 4, 3, 2])
  })

  test("add before / after an item that isn't there:  at the START / the END", () => {
    expect(numbers(1, 2).addBefore(9, 7).getValues()).toEqual([7, 1, 2])
    expect(numbers(1, 2).addAfter(9, 7).getValues()).toEqual([1, 2, 7])
    expect(numbers(1, 2).addBefore(2, 7).addAfter(1, 8).getValues()).toEqual([1, 8, 7, 2])
  })

  test("starting with an item that isn't there:  ALL of them, as compiled spell does", () => {
    expect(numbers(1, 2, 3).startingWith(9).getValues()).toEqual([1, 2, 3])
    expect(numbers(1, 2, 3).startingWith(2).getValues()).toEqual([2, 3])
  })

  test("random ones:  items it holds, each once, in a scratch list of its class", () => {
    const deck = new Deck({}).append(...cards(5))
    expect(deck.includes(deck.randomItem())).toBe(true)
    const picked = deck.randomItems(3)
    expect(picked).toBeInstanceOf(Deck)
    expect(new Set(picked.getValues()).size).toBe(3)
    expect(picked.all((card) => deck.includes(card))).toBe(true)
    const before = new Set(deck.getValues())
    expect(new Set(deck.randomize().getValues())).toEqual(before)
  })

  test("copies:  `clone()` keeps the class, `cloneAs()` takes one, `merged()` makes one of a list of lists", () => {
    const tableau = new Tableau({}).append(...cards(2))
    expect(tableau.clone()).toBeInstanceOf(Tableau)
    expect(tableau.clone().getValues()).toEqual(tableau.getValues())
    expect(tableau.cloneAs(Deck)).toBeInstanceOf(Deck)
    const lists = new List<List>().append(numbers(1, 2), numbers(3))
    expect(lists.merged()!.getValues()).toEqual([1, 2, 3])
    expect(lists.merged(Deck)).toBeInstanceOf(Deck)
    expect(new List<List>().merged()).toBe(undefined)
  })

  test("SCRATCH:  filtering, mapping, copying or taking a range of a pile never takes a card out of it", () => {
    const [a, b, c] = cards(3)
    const pile = new Pile({}).append(a, b)
    const tableau = new Tableau({}).append(c)
    const allPiles = new List<Pile>().append(pile, tableau)
    const results = [
      pile.filter(() => true),
      pile.map((card) => card),
      pile.between(1, 2),
      pile.startingFrom(1),
      pile.startingWith(b),
      pile.randomItems(),
      pile.clone(),
      pile.cloneAs(Tableau),
      allPiles.merged(),
      allPiles.merged(Pile)
    ]
    for (const result of results) expect(result).toBeInstanceOf(Pile)
    expect(itemsOf(pile)).toEqual([a, b])
    expect(itemsOf(tableau)).toEqual([c])
    expect([a, b, c].map((card) => card!.pile)).toEqual([pile, pile, tableau])
    // a list of piles isn't exclusive:  filtering it keeps the piles themselves
    expect(allPiles.filter((it) => it === tableau).getValues()).toEqual([tableau])
  })

  test("changes through the methods keep the owners:  add before moves a card, remove between frees it", () => {
    const [a, b, c] = cards(3)
    const pile = new Pile({}).append(a, b)
    const tableau = new Tableau({}).append(c)
    tableau.addBefore(c, b)
    expect(itemsOf(pile)).toEqual([a])
    expect(itemsOf(tableau)).toEqual([b, c])
    expect(b!.pile).toBe(tableau)
    tableau.removeBetween(1, 2)
    expect([b!.pile, c!.pile]).toEqual([undefined, undefined])
  })

  test("iterable:  `for ... of` and spread, over the items as they were when it started", () => {
    const deal = cards(3)
    const pile = new Pile({}).append(...deal)
    const seen: unknown[] = []
    for (const card of pile) {
      seen.push(card)
      pile.remove(card)
    }
    expect(seen).toEqual(deal)
    expect(itemsOf(pile)).toEqual([])
    expect([...numbers(1, 2)]).toEqual([1, 2])
  })

  test("typed by its items:  a `List<number>`'s first item is a `number | undefined`", () => {
    const list = numbers(3, 1, 2)
    const first: number | undefined = list.firstItem
    const doubled: List<number> = list.map((it) => it * 2)
    const odd: List<number> = list.filter((it) => it % 2 === 1)
    expect([first, doubled.getValues(), odd.getValues()]).toEqual([3, [6, 2, 4], [3, 1]])
  })

  test("`isOfType()`:  its class, each it extends, and `list` -- as `spellCore.isOfType()`", () => {
    const tableau = new Tableau({})
    expect(["tableau", "pile", "list", "Pile"].map((type) => tableau.isOfType(type))).toEqual([true, true, true, true])
    expect(tableau.isOfType("foundation")).toBe(false)
    expect(tableau.isOfType("pile")).toBe(spellCore.isOfType(tableau, "pile"))
  })
})
