import { describe, test, expect, beforeEach } from "vite-plus/test"

import { observe } from "$/util"
import { spellCore, Thing, List, App } from "$/core"

/**
 * A thing, as a program declares one:  `a card is a thing`, with properties compiled as spell compiles them.
 * - `any` for `this` as `getProp` / `setProp` are `protected`, as compiled JS never sees TS access modifiers.
 */
class Card extends Thing {
  get rank(): string {
    return (this as any).getProp("rank")
  }
  set rank(value: string) {
    ;(this as any).setProp("rank", value)
  }
  get suit(): string {
    return (this as any).getProp("suit")
  }
  set suit(value: string) {
    ;(this as any).setProp("suit", value)
  }
  /** Computed:  `the name of a card is: its rank + "-of-" + its suit`. */
  get name(): string {
    return `${this.rank}-of-${this.suit}`
  }
  /** `to turn (a card) over`. */
  turn_over() {
    this.rank = "turned"
  }
  /** `to move (a card) to (a pile)`. */
  move_to_$pile(pile: unknown) {
    return pile
  }
}

/** A sub-type of it:  `a joker is a card`. */
class Joker extends Card {
  /** Overrides `Card`'s. */
  turn_over() {}
  get color(): string {
    return (this as any).getProp("color")
  }
  set color(value: string) {
    ;(this as any).setProp("color", value)
  }
}

/** An app:  `a game is an app`. */
class Game extends App {
  get score(): number {
    return (this as any).getProp("score")
  }
  set score(value: number) {
    ;(this as any).setProp("score", value)
  }
}

/** A typed list:  `a deck is a list`. */
class Deck extends List {}

/** Let `ThingRegistry`'s microtask bump `version`. */
function settle() {
  return new Promise<void>((resolve) => queueMicrotask(resolve))
}

describe("spellCore.things", () => {
  beforeEach(() => {
    spellCore.resetRuntime()
  })

  test("registers things by type, in the order they were made", () => {
    const ace = new Card({})
    const joker = new Joker({})
    const king = new Card({})
    expect(spellCore.things.byType()).toEqual([
      { type: "Card", things: [ace, king] },
      { type: "Joker", things: [joker] }
    ])
    expect(spellCore.things.numberOf(ace)).toBe(1)
    expect(spellCore.things.numberOf(king)).toBe(3)
  })

  test("registers a typed list, but NOT a plain one", () => {
    const deck = new Deck({})
    const plain = new List({})
    expect(spellCore.things.byType()).toEqual([{ type: "Deck", things: [deck] }])
    expect(spellCore.things.numberOf(plain)).toBeUndefined()
  })

  test("skips things made while a test runs -- `to test ...`, or `start test` ... `end test`", () => {
    const before = new Card({})
    spellCore.test("card setup", () => new Card({}))
    spellCore.startTest("deck creation")
    new Deck({})
    spellCore.endTest()
    const after = new Card({})
    expect(spellCore.things.byType()).toEqual([{ type: "Card", things: [before, after] }])
    expect(spellCore.things.numberOf(after)).toBe(2)
  })

  test("`heading()`:  each thing is under the heading running when it's made -- until the top level's done", () => {
    const before = new Card({})
    spellCore.heading("Set up")
    const ace = new Card({})
    spellCore.heading("Deal")
    const king = new Card({})
    spellCore.things.setTopLevel({})
    const later = new Card({})
    expect([before, ace, king, later].map((it) => spellCore.things.headingOf(it))).toEqual([
      undefined,
      "Set up",
      "Deal",
      undefined
    ])
    spellCore.heading("Set up")
    spellCore.resetRuntime()
    expect(spellCore.things.headingOf(new Card({}))).toBeUndefined()
  })

  test("NOT a collection helper's result, e.g. the new `Deck` `spellCore.map()` makes", () => {
    const deck = new Deck({})
    deck.items = [1, 2]
    const mapped = spellCore.map(deck, (item) => item)
    expect(mapped).toBeInstanceOf(Deck)
    expect(spellCore.things.all()).toEqual([deck])
  })

  test("groups by an instance's overridden `type`", () => {
    const card = new Card({})
    card.type = "Wildcard"
    expect(spellCore.things.byType()).toEqual([{ type: "Wildcard", things: [card] }])
  })

  test("a new run forgets the last one's things", () => {
    new Card({})
    spellCore.things.setTopLevel({ deck: new Deck({}) })
    spellCore.resetRuntime()
    expect(spellCore.things.byType()).toEqual([])
    expect(spellCore.things.topLevel()).toEqual([])
    expect(spellCore.things.numberOf(new Card({}))).toBe(1)
  })

  test("top-level things:  things and lists, plain ones too -- nothing else", () => {
    const deck = new Deck({})
    const allPiles = new List({})
    const game = new Card({})
    spellCore.things.setTopLevel({ deck, all_piles: allPiles, score: 0, game, Card })
    expect(spellCore.things.topLevel()).toEqual([
      { name: "deck", thing: deck },
      { name: "all_piles", thing: allPiles },
      { name: "game", thing: game }
    ])
    expect(spellCore.things.nameOf(allPiles)).toBe("all_piles")
    expect(spellCore.things.nameOf(new Card({}))).toBeUndefined()
  })

  test("bumps `version` once, after a burst of things -- NOT as each registers", async () => {
    await settle()
    let runs = 0
    const stop = observe(() => {
      spellCore.things.byType()
      runs++
    })
    try {
      for (let count = 0; count < 52; count++) new Card({})
      expect(runs).toBe(1)
      await settle()
      expect(runs).toBe(2)
    } finally {
      stop()
    }
  })

  describe("inspecting things", () => {
    test("`propertiesOf()`:  its own, then inherited -- NOT the built-in types'", () => {
      const joker = new Joker({ color: "red" })
      expect(spellCore.things.propertiesOf(joker)).toEqual([
        { name: "color", computed: false },
        { name: "rank", computed: false },
        { name: "suit", computed: false },
        { name: "name", computed: true }
      ])
    })

    test("`propertiesOf()`:  one never set shows too, e.g. a game's `score`", () => {
      expect(spellCore.things.propertiesOf(new Game({}))).toEqual([{ name: "score", computed: false }])
    })

    test("`propertiesOf()`:  one it holds but never declared shows after", () => {
      const deck = new Deck({ owner: "me" })
      expect(spellCore.things.propertiesOf(deck)).toEqual([{ name: "owner", computed: false }])
    })

    test("`typeChainOf()`:  down to the built-in type", () => {
      expect(spellCore.things.typeChainOf(new Joker({}))).toEqual(["Joker", "Card", "Thing"])
      expect(spellCore.things.typeChainOf(new Game({}))).toEqual(["Game", "App", "Thing"])
      expect(spellCore.things.typeChainOf(new Deck({}))).toEqual(["Deck", "List"])
    })

    test("`labelOf()`:  type, then top-level name, else `name` -- else just type", () => {
      const deck = new Deck({})
      const queen = new Card({ rank: "queen", suit: "spades" })
      const game = new Game({})
      spellCore.things.setTopLevel({ deck })
      expect(spellCore.things.labelOf(deck)).toBe("Deck deck")
      expect(spellCore.things.labelOf(queen)).toBe("Card queen-of-spades")
      expect(spellCore.things.labelOf(game)).toBe("Game")
      expect(spellCore.things.labelOf(new List({}))).toBe("List")
    })

    test("`bySuperType()`:  under each type a thing is, alphabetical -- NOT the built-ins", () => {
      const joker = new Joker({})
      const ace = new Card({})
      const game = new Game({})
      expect(spellCore.things.bySuperType()).toEqual([
        { type: "Card", things: [joker, ace] },
        { type: "Game", things: [game] },
        { type: "Joker", things: [joker] }
      ])
    })

    test("`all()`:  in the order they were made", () => {
      const deck = new Deck({})
      const ace = new Card({})
      expect(spellCore.things.all()).toEqual([deck, ace])
    })

    test("`actionsOf()`:  its own, then inherited -- an override once, as its own", () => {
      expect(spellCore.things.actionsOf(new Joker({}))).toEqual([
        { name: "turn_over", label: "turn over", arguments: 0 },
        { name: "move_to_$pile", label: "move to (pile)", arguments: 1, inheritedFrom: "Card" }
      ])
      expect(spellCore.things.actionsOf(new Deck({}))).toEqual([])
    })

    test("`perform()`:  does it -- an error goes to the program's console", async () => {
      const card = new Card({ rank: "ace" })
      spellCore.things.perform(card, "turn_over")
      expect(card.rank).toBe("turned")
      const failing = new (class Broken extends Card {
        async fail() {
          throw new Error("nope")
        }
      })({})
      spellCore.console.clear()
      spellCore.things.perform(failing, "fail")
      await new Promise((resolve) => setTimeout(resolve))
      expect(spellCore.console.lines.at(-1)?.level).toBe("error")
    })

    test("`read()`:  a value -- or its error -- and nothing made reading it registers", () => {
      class Pile extends List {
        /** Like Solitaire's:  `spellCore.map()` makes a new `Pile`. */
        get state(): string {
          return String(spellCore.map(this, (card) => card))
        }
        get broken(): string {
          throw new Error("nope")
        }
      }
      const pile = new Pile({})
      expect("value" in spellCore.things.read(pile, "state")).toBe(true)
      expect(spellCore.things.read(pile, "broken")).toEqual({ error: "nope" })
      expect(spellCore.things.all()).toEqual([pile])
      expect(spellCore.things.all()).toHaveLength(1)
      new Pile({})
      expect(spellCore.things.all()).toHaveLength(2)
    })

    test("a thing read from another's property IS that thing:  no proxies", () => {
      const queen = new Card({})
      const holder = new Card({})
      ;(holder as any).setProp("other", queen)
      const other = observeRead(() => (holder as any).getProp("other") as Card)
      expect(other).toBe(queen)
      spellCore.things.setTopLevel({ queen })
      expect(spellCore.things.numberOf(other)).toBe(1)
      expect(spellCore.things.nameOf(other)).toBe("queen")
    })

    test("`isThing()` and `itemsOf()`", () => {
      const list = new List({})
      list.items = [1, 2]
      expect(spellCore.things.isThing(list)).toBe(true)
      expect(spellCore.things.isThing({})).toBe(false)
      expect(spellCore.things.itemsOf(list)).toEqual([1, 2])
      expect(spellCore.things.itemsOf(new Card({}))).toBeUndefined()
    })
  })
})

/** What `read()` returns when a reader reads it -- where `easy-state` used to hand out proxies. */
function observeRead<T>(read: () => T): T {
  let value!: T
  const stop = observe(() => {
    value = read()
  })
  stop()
  return value
}
