import { describe, test, expect, afterEach } from "vite-plus/test"
import {
  createEffect,
  createMemo,
  createRenderEffect,
  createRoot,
  createSignal,
  enableExternalSource,
  flush
} from "solid-js"
import { render } from "@solidjs/web"

import { Observable, cellsContext, derived, flushCells, prop, thing } from "$/util"

import "$/app/solid/cellsBridge"

/**
 * The cells -> Solid bridge, and the Solid facts spell cells are designed around -- the experiments of
 * `guides/solid/experiments/` pinned in Solid's CLIENT build (the scripts stay, to re-measure on RC bumps):
 * - `read-after-write.mjs`, `entanglement.mjs`, `flush-cost-and-holds.mjs`:  Solid stages and holds writes
 * - `spell-cells.ts` (strategy A) and `decorators.ts` (strategy D):  cells read-after-write, the bridge, keys,
 *   the equality cutoff
 * - `cells-vs-notifiers.mjs` (X):  a cell write is immune to Solid's held writes
 * The cells core alone (no Solid) is `packages/util`'s `src/spell/cells.test.ts`.
 */

/** A card, as compiled spell declares one:  `declareProp()` + accessor pairs. */
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
  get color() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  get cachedColor(): string {
    return this.derive("cachedColor", function (): string {
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    })
  }
  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }
  set(name: string, value: unknown) {
    this.setProp(name, value)
  }
}

/** The same card, hand-written with decorators. */
@thing
class DecoratedCard extends Observable {
  @prop({ type: "text", default: "hearts" })
  accessor suit!: string

  @prop({ type: "number", default: 1 })
  accessor rank!: number

  @derived
  get cachedColor() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }

  get label() {
    return `${this.rank} of ${this.suit}`
  }

  create() {}
}

/** What each test disposes of. */
const cleanups: Array<() => void> = []
afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()))

/** Run `fn` in a root disposed after the test. */
function inRoot(fn: () => void) {
  createRoot((dispose) => {
    cleanups.push(dispose)
    fn()
  })
}

describe("Solid's facts the design rests on", () => {
  test("a signal write is STAGED:  a read right after it sees the old value until `flush()` (read-after-write T1)", () => {
    const [x, setX] = createSignal(1)
    setX(5)
    expect(x()).toBe(1)
    flush()
    expect(x()).toBe(5)
  })

  test("so is a memo of it (read-after-write T2)", () => {
    const [x, setX] = createSignal(1)
    let doubled!: () => number
    inRoot(() => {
      doubled = createMemo(() => x() * 10)
    })
    setX(2)
    expect(doubled()).toBe(10)
    flush()
    expect(doubled()).toBe(20)
  })

  test("a write in the same batch as one feeding pending async is HELD with it (entanglement C3)", async () => {
    const [a, setA] = createSignal(1)
    const [b, setB] = createSignal(1)
    const resolvers: Array<() => void> = []
    inRoot(() => {
      const pending = createMemo(() => {
        const value = a()
        return new Promise<number>((resolve) => resolvers.push(() => resolve(value)))
      })
      createRenderEffect(
        () => pending(),
        () => {}
      )
    })
    flush()
    resolvers.splice(0).forEach((resolve) => resolve())
    await new Promise((resolve) => setTimeout(resolve))
    flush()
    setA(2)
    setB(2)
    flush()
    expect(b()).toBe(1) // held, flushed or not
    resolvers.splice(0).forEach((resolve) => resolve())
    await new Promise((resolve) => setTimeout(resolve))
    flush()
    expect(b()).toBe(2)
  })

  test("...while a spell cell, written meanwhile, reads back at once (cells-vs-notifiers X)", async () => {
    const [a, setA] = createSignal(1)
    const resolvers: Array<() => void> = []
    const card = new Card({})
    inRoot(() => {
      const pending = createMemo(() => {
        const value = a()
        return new Promise<number>((resolve) => resolvers.push(() => resolve(value)))
      })
      createRenderEffect(
        () => pending(),
        () => {}
      )
    })
    flush()
    setA(2)
    card.suit = "clubs"
    flush()
    expect(card.label).toBe("1 of clubs (black)")
    resolvers.splice(0).forEach((resolve) => resolve())
  })
})

describe("the bridge", () => {
  test("is installed once per Solid, in the page's shared context", () => {
    expect(cellsContext.bridged.has(enableExternalSource)).toBe(true)
    expect(cellsContext.hostFlushes.has(flush)).toBe(true)
  })

  for (const [name, Class] of [
    ["compiled-style", Card],
    ["decorated", DecoratedCard]
  ] as const) {
    test(`${name}:  set -> read at once;  the effect re-runs after \`flushCells()\`, once`, () => {
      const card = new Class({ rank: 7 }) as Card
      const drawn: string[] = []
      inRoot(() => {
        createRenderEffect(
          () => card.label,
          (label: string) => {
            drawn.push(label)
          }
        )
      })
      flushCells()
      card.suit = "spades"
      expect(card.label.startsWith("7 of spades")).toBe(true)
      expect(drawn).toHaveLength(1) // Solid hasn't re-run it yet:  never mid-write
      flushCells()
      expect(drawn).toHaveLength(2)
      expect(drawn.at(-1)!.startsWith("7 of spades")).toBe(true)
    })
  }

  test("keys over time:  a reader re-runs only when the key SET changes", () => {
    const card = new Card({})
    const seen: string[][] = []
    inRoot(() => {
      createRenderEffect(
        () => card.keys(),
        (keys: string[]) => {
          seen.push(keys)
        }
      )
    })
    flushCells()
    card.suit = "clubs"
    card.rank = 3
    card.set("nickname", "Ace")
    flushCells()
    card.suit = "diamonds"
    flushCells()
    card.deleteProp("rank")
    flushCells()
    card.rank = 9
    flushCells()
    expect(seen).toEqual([[], ["suit", "rank", "nickname"], ["suit", "nickname"], ["suit", "nickname", "rank"]])
  })

  test("the equality cutoff:  a reader of a memoized value re-runs only when its value changes", () => {
    for (const card of [new Card({}), new DecoratedCard({}) as unknown as Card]) {
      const runs = { plain: 0, cached: 0 }
      inRoot(() => {
        createRenderEffect(
          () => (runs.plain++, card.suit === "hearts" || card.suit === "diamonds"),
          () => {}
        )
        createRenderEffect(
          () => (runs.cached++, card.cachedColor),
          () => {}
        )
      })
      flushCells()
      card.suit = "diamonds" // still red
      flushCells()
      expect([runs.plain, runs.cached]).toEqual([2, 1])
      card.suit = "clubs"
      flushCells()
      expect([runs.plain, runs.cached]).toEqual([3, 2])
    }
  })

  test("a reader of only a derived value hears of a change on a microtask -- or `flushCells()`", async () => {
    const card = new Card({})
    let runs = 0
    inRoot(() => {
      createRenderEffect(
        () => (runs++, card.cachedColor),
        () => {}
      )
    })
    flushCells()
    card.suit = "clubs"
    flush() // Solid's own flush:  the check hasn't run
    expect(runs).toBe(1)
    await Promise.resolve()
    flush()
    expect(runs).toBe(2)
  })

  test("a cell written inside a Solid computation doesn't throw (cells aren't Solid signals)", () => {
    const card = new Card({ rank: 9 })
    const other = new Card({})
    let label = ""
    inRoot(() => {
      createEffect(
        () => {
          other.suit = card.suit === "hearts" ? "spades" : "clubs"
          return card.label
        },
        (value: string) => {
          label = value
        }
      )
    })
    expect(() => flushCells()).not.toThrow()
    expect(label).toBe("9 of hearts (red)")
    expect(other.suit).toBe("spades")
  })

  test("a plain read in JSX is reactive:  the DOM follows after `flushCells()`", () => {
    const card = new Card({ rank: 2 })
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(() => <p>{card.label}</p>, host)
    cleanups.push(() => {
      dispose()
      host.remove()
    })
    flushCells()
    expect(host.textContent).toBe("2 of hearts (red)")
    card.rank = 3
    card.suit = "clubs"
    expect(host.textContent).toBe("2 of hearts (red)")
    flushCells()
    expect(host.textContent).toBe("3 of clubs (black)")
  })

  test("follows the cells of ANOTHER copy of the cells module -- e.g. a `<spell-app>`'s `spell-runtime.js`", async () => {
    // `?copy`:  a separate instance of the module, as each runtime bundle has its own `$/util`
    // @ts-expect-error -- a query on purpose:  Vite loads the file again, a second module
    const copy = (await import("../../../util/src/spell/cells.ts?copy")) as typeof import("$/util")
    const source = { subs: new Set<any>(), version: 0 }
    let runs = 0
    inRoot(() => {
      createRenderEffect(
        () => {
          runs++
          copy.linkCell(source)
        },
        () => {}
      )
    })
    flushCells()
    // what that copy's `Cell.changed()` does
    source.version++
    for (const reader of [...source.subs]) reader.mark(copy.CELL_DIRTY)
    flushCells()
    expect(copy.cellsContext).toBe(cellsContext)
    expect(runs).toBe(2)
  })
})
