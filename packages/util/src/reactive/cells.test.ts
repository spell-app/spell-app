import { describe, test, expect, vi, afterEach } from "vite-plus/test"

import { Observable, cellsContext, derived, flushCells, observe, prop, schemaOf, thing, type PropInfo } from "$/util"

/**
 * Spell cells, pinned:  the measured design of `guides/solid/experiments/spell-cells.ts` and `decorators.ts`,
 * on the REAL `Observable`.  Solid's half (the bridge, staged DOM writes) is `packages/app`'s
 * `src/solid/cellsBridge.browser.test.tsx`:  it needs Solid's client build.
 * - `observe()` stands in for a Solid computation here:  both are a `Reaction`.
 */

/** Rank and suit, as compiled spell declares them:  `static { this.declareProp(...) }` + accessor pairs. */
class Card extends Observable {
  static {
    this.declareProp("suit", { type: "text", default: "hearts" })
    this.declareProp("rank", { type: "number", default: 1 })
  }
  get suit(): string {
    return this.getProp("suit")
  }
  set suit(value: string) {
    this.setProp("suit", value)
  }
  get rank(): number {
    return this.getProp("rank")
  }
  set rank(value: number) {
    this.setProp("rank", value)
  }
  /** Plain getter:  re-computed on every read. */
  get color() {
    colorRuns.plain++
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  /** Same as `color`, memoized -- the equality-cutoff tests read this. */
  get cachedColor(): string {
    return this.derive("cachedColor", function (): string {
      colorRuns.cached++
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    })
  }
  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }
  /** For tests to set an undeclared prop. */
  set(name: string, value: unknown) {
    this.setProp(name, value)
  }
}

/** How often each color getter computed. */
const colorRuns = { plain: 0, cached: 0 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe("read-after-write", () => {
  test("a read right after a write sees it", () => {
    const card = new Card({ rank: 7 })
    card.suit = "spades"
    expect(card.label).toBe("7 of spades (black)")
  })

  test("a reader re-runs on a write, once per real change", () => {
    const card = new Card({ rank: 7 })
    const drawn: string[] = []
    const stop = observe(() => {
      drawn.push(card.label)
    })
    card.suit = "spades"
    card.suit = "spades" // `===`:  nobody's notified
    stop()
    card.suit = "clubs" // stopped
    expect(drawn).toEqual(["7 of hearts (red)", "7 of spades (black)"])
  })

  test("a reader never re-runs for a write it makes itself while running", () => {
    const card = new Card({})
    let runs = 0
    const stop = observe(() => {
      runs++
      card.rank = card.rank + 1
    })
    expect(runs).toBe(1)
    expect(card.rank).toBe(2)
    card.rank = 10
    expect(runs).toBe(2)
    stop()
  })

  test("an unset prop is tracked too:  its first write re-runs a reader", () => {
    const card = new Card({})
    const seen: unknown[] = []
    const stop = observe(() => {
      seen.push((card as unknown as Record<string, unknown>).nickname ?? card.toJSON().nickname)
    })
    card.set("nickname", "Ace")
    stop()
    // `nickname` has no accessor:  read through `toJSON()`, which tracks the key set
    expect(seen).toEqual([undefined, "Ace"])
  })
})

describe("keys in creation order", () => {
  test("overwrite keeps its place, delete removes, re-set appends;  readers re-run only when the SET changes", () => {
    const card = new Card({})
    const seen: string[][] = []
    const stop = observe(() => {
      seen.push(card.keys())
    })
    card.suit = "clubs"
    card.rank = 3
    card.set("nickname", "Ace")
    card.suit = "diamonds" // overwrite:  same order, no re-run
    card.deleteProp("rank")
    card.rank = 9
    stop()
    expect(seen).toEqual([
      [],
      ["suit"],
      ["suit", "rank"],
      ["suit", "rank", "nickname"],
      ["suit", "nickname"],
      ["suit", "nickname", "rank"]
    ])
  })

  test("integer-like keys keep their places (a `Map`, not a plain object)", () => {
    const card = new Card({})
    card.set("10", "ten")
    card.set("2", "two")
    card.set("a", "letter")
    expect(card.keys()).toEqual(["10", "2", "a"])
    // NOTE: `toJSON()` is a plain object, so it DOES hoist them:  `keys()` is the order
    expect(Object.keys(card.toJSON())).toEqual(["2", "10", "a"])
  })

  test("setting `undefined` deletes", () => {
    const card = new Card({ rank: 4 })
    card.set("rank", undefined)
    expect(card.keys()).toEqual([])
    expect(card.rank).toBe(1) // its declared default
  })

  test("a declared `default` isn't stored;  an `init` is, once per instance", () => {
    class Hand extends Observable {
      static {
        this.declareProp("cards", { init: () => [] })
      }
      get cards(): string[] {
        return this.getProp("cards")
      }
    }
    const card = new Card({})
    expect(card.suit).toBe("hearts")
    expect(card.keys()).toEqual([])
    const hand = new Hand({})
    expect(hand.cards).toBe(hand.cards)
    expect(new Hand({}).cards).not.toBe(hand.cards)
    expect(hand.keys()).toEqual(["cards"])
  })
})

describe("property types", () => {
  test("declared types win:  a mismatch is checked (`checkPropType()`), and stored anyway", () => {
    const check = vi.spyOn(Card.prototype as any, "checkPropType").mockImplementation(() => {})
    const card = new Card({})
    card.set("rank", "seven")
    expect(check).toHaveBeenCalledWith("rank", "seven", { type: "number", default: 1 })
    expect(card.rank).toBe("seven")
  })

  test("undeclared:  observed per class, WIDENED on a mismatch with a dev warning -- never thrown", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    class Scored extends Card {}
    const card = new Scored({})
    card.set("score", 10)
    card.set("score", 11)
    card.set("score", null) // nothing:  doesn't count
    card.set("score", "high")
    expect(Scored.schema.typeOf("score")).toBe("number | text")
    expect(Scored.schema.typeOf("rank")).toBe("number")
    expect(warn).toHaveBeenCalledTimes(1)
  })

  test("an object counts by class, with `instanceof`:  a subclass where its class was is no widening", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    class Held extends Card {}
    class Ace extends Card {}
    const card = new Held({})
    card.set("other", new Card({}))
    card.set("other", new Ace({}))
    expect(warn).not.toHaveBeenCalled()
    expect(Held.schema.typeOf("other")).toBe("Card")
  })

  test("a subclass's schema chains to its parent's", () => {
    class Joker extends Card {
      static {
        this.declareProp("color", { oneOf: ["red", "black"] })
      }
    }
    expect(schemaOf(Joker).info("suit")).toEqual({ type: "text", default: "hearts" })
    expect(schemaOf(Joker).info("color")?.oneOf).toEqual(["red", "black"])
    expect(schemaOf(Card).info("color")).toBeUndefined()
  })
})

describe("updates only on differences:  the equality cutoff", () => {
  test("a memoized derived value's readers re-run only when its value changes", () => {
    const card = new Card({})
    const runs = { plain: 0, cached: 0 }
    const stops = [
      observe(() => {
        runs.plain++
        void card.color
      }),
      observe(() => {
        runs.cached++
        void card.cachedColor
      })
    ]
    card.suit = "diamonds" // still red
    flushCells()
    expect([runs.plain, runs.cached]).toEqual([2, 1])
    card.suit = "clubs" // black
    flushCells()
    expect([runs.plain, runs.cached]).toEqual([3, 2])
    stops.forEach((stop) => stop())
  })

  test("a derived value is current on the next line, and computes only when what it read changed", () => {
    const card = new Card({})
    colorRuns.cached = 0
    expect(card.cachedColor).toBe("red")
    expect(card.cachedColor).toBe("red")
    card.suit = "spades"
    expect(card.cachedColor).toBe("black")
    expect(colorRuns.cached).toBe(2)
  })
})

describe("state", () => {
  test("a dotted path sets inside its object and notifies the top-level name's readers", () => {
    class Loader extends Observable {
      get loadState(): { isLoaded?: boolean; isDirty?: boolean } {
        return this.getState("loadState", () => ({}))
      }
      mark(path: string, value: unknown) {
        this.setState(path, value)
      }
      reset() {
        this.resetState()
      }
    }
    const loader = new Loader({})
    const seen: unknown[] = []
    const stop = observe(() => {
      seen.push(loader.loadState.isDirty)
    })
    loader.mark("loadState.isDirty", true)
    loader.mark("loadState.isDirty", true) // `===`:  nothing
    loader.mark("loadState.isDirty", false)
    loader.reset()
    stop()
    expect(seen).toEqual([undefined, true, false, undefined])
    expect(loader.keys()).toEqual([])
  })
})

describe("decorators:  the same runtime shape as compiled spell", () => {
  /** `Card` again, hand-written. */
  @thing
  class DecoratedCard extends Observable {
    @prop({ type: "text", default: "hearts" })
    accessor suit!: string

    @prop({ type: "number", default: 1 })
    accessor rank!: number

    @prop({ init: () => [] })
    accessor notes!: string[]

    /** A PLAIN field:  safe only because `@thing` runs `create()` after it. */
    created = ""

    create() {
      this.created = `${this.rank} of ${this.suit}`
    }

    @derived
    get cachedColor() {
      decoratedColorRuns++
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    }
  }
  let decoratedColorRuns = 0

  test("`@prop` reads, writes, defaults and per-instance `init`", () => {
    const card = new DecoratedCard({ rank: 7 })
    card.suit = "spades"
    expect([card.suit, card.rank]).toEqual(["spades", 7])
    expect(card.keys()).toEqual(["rank", "suit"])
    card.notes.push("lucky")
    expect(card.notes).toEqual(["lucky"])
    expect(new DecoratedCard({}).notes).toEqual([])
    expect(new DecoratedCard({}).suit).toBe("hearts")
  })

  test("`@thing` runs `create()` after the plain field's initializer", () => {
    expect(new DecoratedCard({ rank: 3 }).created).toBe("3 of hearts")
  })

  test("`@derived`:  the equality cutoff", () => {
    const card = new DecoratedCard({})
    let readerRuns = 0
    const stop = observe(() => {
      readerRuns++
      void card.cachedColor
    })
    card.suit = "diamonds"
    flushCells()
    expect(readerRuns).toBe(1)
    card.suit = "clubs"
    flushCells()
    expect(readerRuns).toBe(2)
    stop()
  })

  test("decorated and compiled-style classes build the same schema, keys and accessors", () => {
    const declared = (Class: Function) => Object.fromEntries(schemaOf(Class).declared) as Record<string, PropInfo>
    expect(declared(DecoratedCard).suit).toEqual(declared(Card).suit)
    expect(declared(DecoratedCard).rank).toEqual(declared(Card).rank)
    // up the chain:  `@thing` wraps the decorated class in a subclass
    const kinds = (Class: Function, name: string) => {
      let proto = Class.prototype
      while (!Object.hasOwn(proto, name)) proto = Object.getPrototypeOf(proto)
      const descriptor = Object.getOwnPropertyDescriptor(proto, name)!
      return [typeof descriptor.get, typeof descriptor.set]
    }
    expect(kinds(DecoratedCard, "suit")).toEqual(kinds(Card, "suit"))
    const compiled = new Card({ rank: 2, suit: "clubs" })
    const decorated = new DecoratedCard({ rank: 2, suit: "clubs" })
    expect(decorated.keys()).toEqual(compiled.keys())
    expect(decorated.toJSON()).toEqual(compiled.toJSON())
  })

  test("a decorated subclass inherits its parent's schema", () => {
    @thing
    class FaceCard extends DecoratedCard {
      @prop({ type: "text" })
      accessor face!: string
    }
    expect(["suit", "rank", "face"].map((name) => FaceCard.schema.typeOf(name))).toEqual(["text", "number", "text"])
    expect(new FaceCard({ face: "king" }).keys()).toEqual(["face"])
  })
})

describe("one context per page", () => {
  test("a second copy of the module shares the page's context", async () => {
    // `?copy`:  Vite loads the file again, as a separate module -- as a `spell-runtime.js` beside the app's `$/util`
    // @ts-expect-error -- a query on purpose:  Vite loads the file again, a second module
    const copy = (await import("./cells.ts?copy")) as typeof import("./cells")
    expect(copy.cellsContext).toBe(cellsContext)
  })
})
