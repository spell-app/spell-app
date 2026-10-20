import { describe, test, expect, beforeEach } from "vite-plus/test"

import { observe } from "@spell-app/util"
import { core, Thing, List, App } from "$/core"

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
  turnOver() {
    this.rank = "turned"
  }
  /** `to move (a card) to (a pile)`. */
  moveToPile(pile: unknown) {
    return pile
  }
}

/** A sub-type of it:  `a joker is a card`. */
class Joker extends Card {
  /** Overrides `Card`'s. */
  turnOver() {}
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

describe("core.things", () => {
  beforeEach(() => {
    core.resetRuntime()
  })

  test("registers things by type, in the order they were made", () => {
    const ace = new Card({})
    const joker = new Joker({})
    const king = new Card({})
    expect(core.things.byType()).toEqual([
      { type: "Card", things: [ace, king] },
      { type: "Joker", things: [joker] }
    ])
    expect(core.things.numberOf(ace)).toBe(1)
    expect(core.things.numberOf(king)).toBe(3)
  })

  test("registers a typed list, but NOT a plain one", () => {
    const deck = new Deck({})
    const plain = new List({})
    expect(core.things.byType()).toEqual([{ type: "Deck", things: [deck] }])
    expect(core.things.numberOf(plain)).toBeUndefined()
  })

  test("skips things made while a test runs -- `to test ...`, or `start test` ... `end test`", () => {
    const before = new Card({})
    core.test("card setup", () => new Card({}))
    core.startTest("deck creation")
    new Deck({})
    core.endTest()
    const after = new Card({})
    expect(core.things.byType()).toEqual([{ type: "Card", things: [before, after] }])
    expect(core.things.numberOf(after)).toBe(2)
  })

  test("`heading()`:  each thing is under the heading running when it's made -- until the top level's done", () => {
    const before = new Card({})
    core.heading("Set up")
    const ace = new Card({})
    core.heading("Deal")
    const king = new Card({})
    core.things.setTopLevel({})
    const later = new Card({})
    expect([before, ace, king, later].map((it) => core.things.headingOf(it))).toEqual([
      undefined,
      "Set up",
      "Deal",
      undefined
    ])
    core.heading("Set up")
    core.resetRuntime()
    expect(core.things.headingOf(new Card({}))).toBeUndefined()
  })

  test("NOT a collection helper's result, e.g. the new `Deck` `core.map()` makes", () => {
    const deck = new Deck({})
    deck.items = [1, 2]
    const mapped = core.map(deck, (item) => item)
    expect(mapped).toBeInstanceOf(Deck)
    expect(core.things.all()).toEqual([deck])
  })

  test("groups by an instance's overridden `type`", () => {
    const card = new Card({})
    card.type = "Wildcard"
    expect(core.things.byType()).toEqual([{ type: "Wildcard", things: [card] }])
  })

  test("a new run forgets the last one's things", () => {
    new Card({})
    core.things.setTopLevel({ deck: new Deck({}) })
    core.resetRuntime()
    expect(core.things.byType()).toEqual([])
    expect(core.things.topLevel()).toEqual([])
    expect(core.things.numberOf(new Card({}))).toBe(1)
  })

  test("top-level things:  things and lists, plain ones too -- nothing else", () => {
    const deck = new Deck({})
    const allPiles = new List({})
    const game = new Card({})
    core.things.setTopLevel({ deck, all_piles: allPiles, score: 0, game, Card })
    expect(core.things.topLevel()).toEqual([
      { name: "deck", thing: deck },
      { name: "all_piles", thing: allPiles },
      { name: "game", thing: game }
    ])
    expect(core.things.nameOf(allPiles)).toBe("all_piles")
    expect(core.things.nameOf(new Card({}))).toBeUndefined()
  })

  test("`classNamed()`:  a class once one of its things is made (its super-classes too), or the program exports it", () => {
    expect(["Card", "Joker", "Deck"].map((name) => core.things.classNamed(name))).toEqual([
      undefined,
      undefined,
      undefined
    ])
    core.test("made in a test", () => new Joker({}))
    core.things.setTopLevel({ Deck, deck: new Deck({}), score: 0 })
    expect(["Card", "Joker", "Deck"].map((name) => core.things.classNamed(name))).toEqual([Card, Joker, Deck])
    // spell's own are always known;  a new run forgets the program's
    core.resetRuntime()
    expect(["List", "App", "Card"].map((name) => core.things.classNamed(name))).toEqual([List, App, undefined])
  })

  test("bumps `version` once, after a burst of things -- NOT as each registers", async () => {
    await settle()
    let runs = 0
    const stop = observe(() => {
      core.things.byType()
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
      expect(core.things.propertiesOf(joker)).toEqual([
        { name: "color", computed: false },
        { name: "rank", computed: false },
        { name: "suit", computed: false },
        { name: "name", computed: true }
      ])
    })

    test("`propertiesOf()`:  one never set shows too, e.g. a game's `score`", () => {
      expect(core.things.propertiesOf(new Game({}))).toEqual([{ name: "score", computed: false }])
    })

    test("`propertiesOf()`:  one it holds but never declared shows after", () => {
      const deck = new Deck({ owner: "me" })
      expect(core.things.propertiesOf(deck)).toEqual([{ name: "owner", computed: false }])
    })

    test("`typeChainOf()`:  down to the built-in type", () => {
      expect(core.things.typeChainOf(new Joker({}))).toEqual(["Joker", "Card", "Thing"])
      expect(core.things.typeChainOf(new Game({}))).toEqual(["Game", "App", "Thing"])
      expect(core.things.typeChainOf(new Deck({}))).toEqual(["Deck", "List"])
    })

    test("`labelOf()`:  type, then top-level name, else `name` -- else just type", () => {
      const deck = new Deck({})
      const queen = new Card({ rank: "queen", suit: "spades" })
      const game = new Game({})
      core.things.setTopLevel({ deck })
      expect(core.things.labelOf(deck)).toBe("Deck deck")
      expect(core.things.labelOf(queen)).toBe("Card queen-of-spades")
      expect(core.things.labelOf(game)).toBe("Game")
      expect(core.things.labelOf(new List({}))).toBe("List")
    })

    test("`bySuperType()`:  under each type a thing is, alphabetical -- NOT the built-ins", () => {
      const joker = new Joker({})
      const ace = new Card({})
      const game = new Game({})
      expect(core.things.bySuperType()).toEqual([
        { type: "Card", things: [joker, ace] },
        { type: "Game", things: [game] },
        { type: "Joker", things: [joker] }
      ])
    })

    test("`all()`:  in the order they were made", () => {
      const deck = new Deck({})
      const ace = new Card({})
      expect(core.things.all()).toEqual([deck, ace])
    })

    test("`actionsOf()`:  its own, then inherited -- an override once, as its own", () => {
      expect(core.things.actionsOf(new Joker({}))).toEqual([
        { name: "turnOver", label: "turn over", arguments: 0 },
        { name: "moveToPile", label: "move to pile", arguments: 1, inheritedFrom: "Card" }
      ])
      expect(core.things.actionsOf(new Deck({}))).toEqual([])
    })

    test("`perform()`:  does it -- an error goes to the program's console", async () => {
      const card = new Card({ rank: "ace" })
      core.things.perform(card, "turnOver")
      expect(card.rank).toBe("turned")
      const failing = new (class Broken extends Card {
        async fail() {
          throw new Error("nope")
        }
      })({})
      core.console.clear()
      core.things.perform(failing, "fail")
      await new Promise((resolve) => setTimeout(resolve))
      expect(core.console.lines.at(-1)?.level).toBe("error")
    })

    test("`read()`:  a value -- or its error -- and nothing made reading it registers", () => {
      class Pile extends List {
        /** Like Solitaire's:  `core.map()` makes a new `Pile`. */
        get state(): string {
          return String(core.map(this, (card) => card))
        }
        get broken(): string {
          throw new Error("nope")
        }
      }
      const pile = new Pile({})
      expect("value" in core.things.read(pile, "state")).toBe(true)
      expect(core.things.read(pile, "broken")).toEqual({ error: "nope" })
      expect(core.things.all()).toEqual([pile])
      expect(core.things.all()).toHaveLength(1)
      new Pile({})
      expect(core.things.all()).toHaveLength(2)
    })

    test("a thing read from another's property IS that thing:  no proxies", () => {
      const queen = new Card({})
      const holder = new Card({})
      ;(holder as any).setProp("other", queen)
      const other = observeRead(() => (holder as any).getProp("other") as Card)
      expect(other).toBe(queen)
      core.things.setTopLevel({ queen })
      expect(core.things.numberOf(other)).toBe(1)
      expect(core.things.nameOf(other)).toBe("queen")
    })

    test("`isThing()` and `itemsOf()`", () => {
      const list = new List({})
      list.items = [1, 2]
      expect(core.things.isThing(list)).toBe(true)
      expect(core.things.isThing({})).toBe(false)
      expect(core.things.itemsOf(list)).toEqual([1, 2])
      expect(core.things.itemsOf(new Card({}))).toBeUndefined()
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
