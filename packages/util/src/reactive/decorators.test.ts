import { describe, test, expect, vi, afterEach } from "vite-plus/test"

import { Observable, derived, flushCells, observe, prop, state, thing } from "$/util"

/**
 * The shared decorators beyond what `cells.test.ts` pins for `@prop` / `@derived` on an `Observable`:
 * `@state`, `{ equals }`, and plain (non-`Observable`) classes -- what Spell UI's components will be.
 * - `observe()` stands in for a Solid computation:  both are a `Reaction`.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

/** Same items in the same order. */
const isSameList = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((item, index) => item === b[index])

describe("@state", () => {
  /** A picker's own state, as a Spell UI component would hold it. */
  class Picker {
    @state accessor query = ""
    @state accessor isOpen = false
    @state({ equals: isSameList }) accessor picked: string[] = []
  }

  test("the initializer is the starting value;  a read right after a write sees it", () => {
    const picker = new Picker()
    expect([picker.query, picker.isOpen]).toEqual(["", false])
    picker.query = "ace"
    expect(picker.query).toBe("ace")
  })

  test("a reader re-runs once per real change", () => {
    const picker = new Picker()
    const seen: string[] = []
    const stop = observe(() => {
      seen.push(picker.query)
    })
    picker.query = "ace"
    picker.query = "ace" // `===`:  nothing
    picker.query = "king"
    stop()
    expect(seen).toEqual(["", "ace", "king"])
  })

  test("`{ equals }`:  an equal value is no write, and keeps its identity", () => {
    const picker = new Picker()
    const first = ["ace"]
    picker.picked = first
    let runs = 0
    const stop = observe(() => {
      runs++
      void picker.picked
    })
    picker.picked = ["ace"]
    expect(picker.picked).toBe(first)
    picker.picked = ["ace", "king"]
    stop()
    expect(runs).toBe(2)
  })

  test("state is never a key:  `keys()` and `toJSON()` list props only", () => {
    class Deck extends Observable {
      @prop({ type: "text" }) accessor name!: string
      @state accessor isShuffling = false
    }
    const deck = new Deck({ name: "red" })
    deck.isShuffling = true
    expect(deck.keys()).toEqual(["name"])
    expect(deck.toJSON()).toEqual({ name: "red" })
  })

  test("when a base constructor runs `create()` first (`Thing`, `List`), the state it set wins, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    /** Calls `create()` from its constructor, before any subclass field initializer runs. */
    class EagerBase {
      constructor() {
        this.create()
      }
      create() {}
    }
    class Game extends EagerBase {
      @state accessor round = 1
      create() {
        this.round = 5
      }
    }
    expect(new Game().round).toBe(5)
    expect(warn).toHaveBeenCalledWith("@state round:  create() set it first, so its initializer is ignored")
  })

  test("with `@thing`, `create()` runs after the initializer, so its write stands", () => {
    @thing
    class Game extends Observable {
      @state accessor round = 1
      create() {
        this.round = 5
      }
    }
    expect(new Game({}).round).toBe(5)
  })
})

describe("@prop on a plain class", () => {
  /** Not an `Observable`:  no `setProp()` of its own, no schema default. */
  class Settings {
    @prop({ type: "text" }) accessor theme!: string
  }

  test("writes go straight to the record, and readers follow", () => {
    const settings = new Settings()
    const seen: unknown[] = []
    const stop = observe(() => {
      seen.push(settings.theme)
    })
    settings.theme = "dark"
    stop()
    expect(seen).toEqual([undefined, "dark"])
  })
})

describe("@derived({ equals })", () => {
  class Hand {
    @state accessor cards: string[] = []
    filterRuns = 0

    @derived({ equals: isSameList })
    get faces() {
      this.filterRuns++
      return this.cards.filter((card) => card.length > 1)
    }
  }

  test("an equal result keeps the old value, and its readers don't re-run", () => {
    const hand = new Hand()
    hand.cards = ["K", "10"]
    const first = hand.faces
    let readerRuns = 0
    const stop = observe(() => {
      readerRuns++
      void hand.faces
    })
    hand.cards = ["Q", "10"] // same faces:  ["10"]
    flushCells()
    expect(hand.faces).toBe(first)
    expect(readerRuns).toBe(1)
    hand.cards = ["10", "J", "11"]
    flushCells()
    expect(hand.faces).toEqual(["10", "11"])
    expect(readerRuns).toBe(2)
    stop()
  })
})
