import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { spellCore, Thing, List } from "$/core"
import type { ThingExplorerState } from "$/app/ui/ui.types"
import { uiReady } from "./loadUI"
import { ThingExplorer } from "./ThingExplorer"

/**
 * The Solid `<ThingExplorer>` LIVE, in the browser:  Solid's client build, so a change shows after `flush()`.
 * - Things are `easy-state`:  the explorer reads them narrowly -- a changed property redraws its own cell, not
 *   the tree.
 * - Both kinds of change land in a microtask, so:  change, `await settle()`, `flush()`, assert.
 *   - a property:  read again by `tracked(..., { deferred: true })` (it runs the program's code:  never mid-write)
 *   - a thing made or dropped:  the registry bumps its `version`
 */

/** A card, with properties compiled as spell compiles them -- see `things.test.ts`. */
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
  /** Computed. */
  get name(): string {
    return `${this.rank}-card`
  }
  /** `to turn (a card) over`:  no arguments, so it gets a ▶. */
  turnOver() {
    this.rank = "turned"
  }
}

/** A typed list. */
class Pile extends List {
  get name(): string {
    return (this as any).getProp("name")
  }
  set name(value: string) {
    ;(this as any).setProp("name", value)
  }
}

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

beforeEach(() => {
  spellCore.resetRuntime()
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<ThingExplorer> (Solid, live)", () => {
  test("a property changed as the program runs shows -- in its cell and the tree's label", async () => {
    const card = new Card({ rank: "queen", suit: "hearts" })
    const host = await mount({ selected: "#1" })
    expect(valueOf(host, "rank")).toBe('"queen"')
    expect(rowLabels(host)).toEqual(["Card queen-card"])

    card.rank = "king"
    await settle()
    flush()
    expect(valueOf(host, "rank")).toBe('"king"')
    expect(valueOf(host, "name")).toBe('"king-card"')
    expect(rowLabels(host)).toEqual(["Card king-card"])
    expect(host.querySelector(".ThingDetails .title")!.textContent).toBe("Card king-card")
  })

  test("narrowly:  a changed property redraws its own cell -- not the tree, nor the other properties", async () => {
    const card = new Card({ rank: "queen", suit: "hearts" })
    const host = await mount({ selected: "#1" })
    const row = host.querySelector(".ThingTreeNode")
    const suit = cellOf(host, "suit")!.firstElementChild
    const details = host.querySelector(".ThingDetails")

    card.rank = "king"
    await settle()
    flush()
    expect(valueOf(host, "rank")).toBe('"king"')
    expect(host.querySelector(".ThingTreeNode")).toBe(row)
    expect(cellOf(host, "suit")!.firstElementChild).toBe(suit)
    expect(host.querySelector(".ThingDetails")).toBe(details)
  })

  test("a thing made later shows once the registry bumps -- the rows already there stay", async () => {
    new Card({ rank: "queen" })
    const host = await mount()
    const row = host.querySelector(".ThingTreeNode")

    new Card({ rank: "king" })
    await settle()
    flush()
    expect(rowLabels(host)).toEqual(["Card queen-card", "Card king-card"])
    expect(host.querySelector(".ThingTreeNode")).toBe(row)
  })

  test("a list's items show live", async () => {
    const stock = new Pile({ name: "stock" })
    const host = await mount({ selected: "#1" })
    expect(host.querySelector(".ThingDetails")!.textContent).toContain("Items 0")

    stock.items = [new Card({ rank: "ace" })]
    await settle()
    flush()
    expect(host.querySelector(".ThingDetails")!.textContent).toContain("Items 1")
    expect(host.querySelector(".ThingDetails a.ThingValue.thing")!.textContent).toBe("Card ace-card")
  })

  test("many changes before the microtask run the program's code once per reader", async () => {
    let reads = 0
    /** Counts each read of its computed `name`. */
    class Counted extends Card {
      get name(): string {
        reads++
        return super.name
      }
    }
    const card = new Counted({ rank: "queen" })
    const host = await mount({ selected: "#1" })
    reads = 0
    for (const rank of ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack"]) card.rank = rank
    await settle()
    flush()
    // the tree's label, the details' title, and the `name` cell:  once each
    expect(reads).toBe(3)
    expect(valueOf(host, "name")).toBe('"jack-card"')
  })

  test("a computed property filling a list it made doesn't set itself off again -- a real change does", async () => {
    let reads = 0
    /** Like Solitaire's piles:  `spellCore.map()` makes a new `Pile`, then fills it. */
    class Stack extends Pile {
      get state(): string {
        reads++
        return String(spellCore.itemCountOf(spellCore.map(this, (card) => card)))
      }
    }
    const stack = new Stack({ name: "stack" })
    stack.items = [new Card({ rank: "ace" })]
    // the registry's bump for those, before we watch
    await settle()
    const host = await mount({ selected: "#1" })
    await settle()
    flush()
    expect(valueOf(host, "state")).toBe('"1"')
    const settled = reads
    await settle()
    flush()
    expect(reads).toBe(settled)
    expect(spellCore.things.all()).toHaveLength(2)

    stack.items = [...stack.items, new Card({ rank: "king" })]
    await settle()
    flush()
    expect(valueOf(host, "state")).toBe('"2"')
    expect(reads - settled).toBeLessThanOrEqual(2)
  })

  test("clicking a row selects it, and says so through `onStateChange`", async () => {
    new Card({ rank: "queen" })
    const onStateChange = vi.fn()
    const host = await mount({}, onStateChange)
    expect(host.querySelector(".ScopeDetails.empty")).not.toBeNull()

    host.querySelector<HTMLElement>(".ThingTreeNode .body")!.click()
    flush()
    expect(onStateChange).toHaveBeenLastCalledWith({ selected: "#1", open: ["top", "all", "type:Card"] })
    expect(host.querySelector(".ThingTreeNode.selected")).not.toBeNull()
    expect(valueOf(host, "rank")).toBe('"queen"')
  })

  test("the order buttons switch to by-type", async () => {
    new Card({ rank: "queen" })
    const host = await mount({ open: ["type:Card"] })
    host.querySelectorAll<HTMLElement>("ui-icon.order")[1]!.click()
    flush()
    expect(host.querySelector("ui-icon.order.active")!.getAttribute("title")).toBe("By type, sub-types included")
    expect(groupLabels(host)).toEqual(["Card1"])
    expect(rowLabels(host)).toEqual(["Card queen-card"])
  })

  test("▶ does an action that takes no arguments -- and its change shows", async () => {
    new Card({ rank: "queen" })
    const host = await mount({ selected: "#1" })
    host.querySelector<HTMLElement>("ui-icon.perform")!.click()
    await settle()
    flush()
    expect(valueOf(host, "rank")).toBe('"turned"')
  })
})

/** Render a `<ThingExplorer>` of the page's things in a fresh `<div>`;  unmounted after the test. */
async function mount(
  state: ThingExplorerState = {},
  onStateChange?: (state: ThingExplorerState) => void
): Promise<HTMLElement> {
  await uiReady
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(
    () => <ThingExplorer things={spellCore.things} state={state} onStateChange={onStateChange} />,
    host
  )
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}

/** The `<td>` of property `name` in the details. */
function cellOf(host: HTMLElement, name: string): HTMLTableCellElement | undefined {
  const rows = [...host.querySelectorAll<HTMLTableRowElement>(".ThingDetails .ThingValues tr")]
  return rows.find((row) => row.querySelector("th")?.textContent === name)?.querySelector("td") ?? undefined
}

/** Text of property `name`'s value in the details. */
function valueOf(host: HTMLElement, name: string): string | undefined {
  return cellOf(host, name)?.textContent ?? undefined
}

/** Labels of the tree's thing rows. */
function rowLabels(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".ThingTreeNode .label")].map((label) => label.textContent ?? "")
}

/** Labels of the tree's group rows, with their counts. */
function groupLabels(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".ThingTreeGroup .label")].map((label) =>
    (label.textContent ?? "").replace(/\s/g, "")
  )
}

/** Let microtasks run -- the registry's bump, and the program's. */
function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve))
}
