/** @jsxImportSource react */
import { describe, test, expect, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

import { spellCore, Thing, List } from "$/core"
import type { ThingOrder } from "./ui.types"
import { ThingExplorerView, describeThings, watchLive } from "./ThingExplorer"

/** A card, with properties and actions compiled as spell compiles them -- see `things.test.ts`. */
class Card extends Thing {
  get rank(): string {
    return (this as any).getProp("rank")
  }
  set rank(value: string) {
    ;(this as any).setProp("rank", value)
  }
  get pile(): Pile {
    return (this as any).getProp("pile")
  }
  set pile(value: Pile) {
    ;(this as any).setProp("pile", value)
  }
  /** Computed:  read unasked. */
  get name(): string {
    return `${this.rank}-card`
  }
  /** `to turn (a card) over`:  no arguments, so it gets a ▶. */
  turn_over() {}
  /** `to move (a card) to (a pile)`:  takes one, so it doesn't. */
  move_to_$pile(pile: Pile) {
    this.pile = pile
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

/** A sub-type of it. */
class Foundation extends Pile {}

/**
 * A `<ThingExplorer>` drawn as HTML:  its view of a snapshot, as its `autoEffect()` would take one.
 * - No DOM, so effects never run -- hence the view, not `<ThingExplorer>` itself.
 */
function draw(order: ThingOrder, selected?: string, open = ["top", "all", "type:Pile"]) {
  const snapshot = describeThings(spellCore.things, { order, open, selected })
  const noop = () => {}
  return renderToStaticMarkup(
    <ThingExplorerView
      things={spellCore.things}
      snapshot={snapshot}
      order={order}
      onOrder={noop}
      onToggle={noop}
      onSelect={noop}
    />
  )
}

/** Labels of the tree's rows in `html`, in order -- group rows with their counts. */
function treeLines(html: string): string[] {
  const tree = html.slice(html.indexOf("ScopesPane"), html.indexOf("DetailsPane"))
  const rows = tree.matchAll(/class="label">(?:<i [^>]*><\/i>)?([^<]*)(?:<span class="detail">(\d+)<)?/g)
  return [...rows].map(([, label, count]) => (count ? `${label.trim()} (${count})` : label))
}

describe("<ThingExplorer>", () => {
  beforeEach(() => {
    spellCore.resetRuntime()
  })

  test("says to run the project, before it's made anything", () => {
    expect(draw("document")).toContain("Run the project to see its things.")
  })

  test("document order:  top-level things, then all of them in the order made -- type and name, no number", () => {
    const clubs = new Foundation({ name: "clubs" })
    new Card({ rank: "queen", pile: clubs })
    spellCore.things.setTopLevel({ clubs, all_piles: new List({}) })
    expect(treeLines(draw("document"))).toEqual([
      "Top level (2)",
      "Foundation clubs",
      "List all_piles",
      "All things (2)",
      "Foundation clubs",
      "Card queen-card"
    ])
  })

  test("document order:  a marker for each heading whose code made them -- NOT by type", () => {
    new Card({ rank: "queen" })
    spellCore.heading("set up all piles")
    new Pile({ name: "stock" })
    new Foundation({ name: "clubs" })
    spellCore.heading("deal")
    new Card({ rank: "king" })
    const markers = (html: string) => [...html.matchAll(/class="SectionMarker[^"]*"[^>]*>([^<]*)</g)].map((it) => it[1])
    expect(markers(draw("document"))).toEqual(["set up all piles", "deal"])
    expect(markers(draw("type", undefined, ["type:Pile"]))).toEqual([])
  })

  test("by type:  each type lists its sub-types' things too", () => {
    new Foundation({ name: "clubs" })
    new Pile({ name: "stock" })
    expect(treeLines(draw("type"))).toEqual(["Foundation (1)", "Pile (2)", "Foundation clubs", "Pile stock"])
  })

  test("icons say what's a type, a list, or any other thing", () => {
    new Card({})
    new Pile({})
    const html = draw("type", undefined, ["type:Card", "type:Pile"])
    expect(html).toMatch(/<i aria-hidden="true" class="cube icon"><\/i>Card/)
    expect(html).toMatch(/title="list"[^>]*><\/i>Pile/)
    expect(html).toMatch(/title="thing"[^>]*><\/i>Card/)
  })

  test("details:  properties -- computed ones read unasked -- with a thing as a link", () => {
    const stock = new Pile({ name: "stock" })
    new Card({ rank: "queen", pile: stock })
    const html = draw("document", "#2")
    expect(html).toContain("Card → Thing")
    expect(html).toContain("&quot;queen&quot;")
    expect(html).toContain("&quot;queen-card&quot;")
    expect(html).toMatch(/<a class="ThingValue thing">Pile stock<\/a>/)
    expect(html).toMatch(/class="tag icon"><\/i>rank/)
  })

  test("details:  actions, inherited ones too -- a ▶ for one that takes no arguments", () => {
    class Joker extends Card {}
    new Joker({})
    const html = draw("document", "#1")
    expect(html).toMatch(
      /class="cog icon"><\/i>turn over<span class="inherited">from Card<\/span>.*title="Do it:  turn_over\(\)"/
    )
    const move = html.slice(html.indexOf("move to (pile)"))
    expect(move.slice(0, move.indexOf("</tr>"))).not.toContain("play")
  })

  test("shows a list's items", () => {
    const stock = new Pile({})
    stock.items = [1, "two"]
    const html = draw("document", "#1")
    expect(html).toMatch(/Items <span class="detail">2</)
    expect(html).toContain("&quot;two&quot;")
  })

  test("`watchLive()`:  a computed property filling a list it made doesn't set it off again -- a real change does", async () => {
    /** Like Solitaire's piles:  `spellCore.map()` makes a new `Pile`, then fills it. */
    class Stack extends Pile {
      get state(): string {
        return String(spellCore.itemCountOf(spellCore.map(this, (card) => card)))
      }
    }
    const stack = new Stack({ name: "stack" })
    stack.items = [new Card({ rank: "ace" })]
    // the registry's bump for those, before we watch
    await settle()
    const snapshots: Array<ReturnType<typeof describeThings>> = []
    const stop = watchLive(
      () => describeThings(spellCore.things, { order: "document", open: ["all"], selected: "#1" }),
      (snapshot) => snapshots.push(snapshot)
    )
    const stateOf = (index: number) => snapshots[index]!.details!.properties.find((it) => it.name === "state")!.value
    try {
      await settle()
      expect(snapshots).toHaveLength(1)
      expect(stateOf(0)).toEqual({ kind: "text", text: '"1"' })
      expect(spellCore.things.all()).toHaveLength(2)
      stack.items = [...stack.items, new Card({ rank: "king" })]
      await settle()
      expect(snapshots).toHaveLength(2)
      expect(stateOf(1)).toEqual({ kind: "text", text: '"2"' })
    } finally {
      stop()
    }
  })
})

/** Let microtasks run -- `watchLive()`'s, and the registry's. */
function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve))
}
