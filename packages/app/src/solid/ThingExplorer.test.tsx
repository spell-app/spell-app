import { describe, test, expect, beforeEach } from "vite-plus/test"
import { renderToString } from "@solidjs/web"

import { spellCore, Thing, List } from "$/core"
import type { ThingOrder } from "$/app/ui/ui.types"
import type { SP } from "$/spell"
import { ThingExplorer, memberWords } from "./ThingExplorer"

/**
 * The Solid `<ThingExplorer>` drawn as HTML -- the same cases as React's `$/app/ui/ThingExplorer.test.tsx`.
 * - Node, so Solid's SERVER build:  `renderToString`, no DOM.  The explorer reads things synchronously, through
 *   `tracked()`, so we draw `<ThingExplorer>` itself -- no snapshot step.
 * - Live updates need Solid's client build:  `ThingExplorer.browser.test.tsx`.
 */

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
  turnOver() {}
  /** `to move (a card) to (a pile)`:  takes one, so it doesn't. */
  moveToPile(pile: Pile) {
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

/** `<ThingExplorer>` of the page's `spellCore.things`, drawn as HTML -- with `words`, if given. */
function draw(order: ThingOrder, selected?: string, open = ["top", "all", "type:Pile"], words?: SP.SpellWordsData) {
  return renderToString(() => (
    <ThingExplorer things={spellCore.things} words={words} state={{ order, open, selected }} />
  ))
}

/** Card's and Pile's words, as their `<Project>.en.js` would hold them -- see `SP.SpellWords`. */
const WORDS: SP.SpellWordsData = {
  lang: "en",
  types: {
    Card: { rank: "rank", pile: "pile", turnOver: "turn (a card) over", moveToPile: "move (a card) to (a pile)" },
    Pile: { name: "the-name" }
  }
}

/** The `<th>` of each row of `html`'s details, as text, e.g. `turn over from Card`. */
function detailLabels(html: string): string[] {
  const details = html.slice(html.indexOf("DetailsPane"))
  return [...details.matchAll(/<th[^>]*>(.*?)<\/th>/g)].map(([, th]) => th!.replace(/<[^>]*>/g, " ").trim())
}

/** Labels of the tree's rows in `html`, in order -- group rows with their counts. */
function treeLines(html: string): string[] {
  const tree = html.slice(html.indexOf("ScopesPane"), html.indexOf("DetailsPane"))
  const rows = tree.matchAll(/class="label">(?:<ui-icon [^>]*><\/ui-icon>)?([^<]*)(?:<span class="detail">(\d+)<)?/g)
  return [...rows].map(([, label, count]) => (count ? `${label!.trim()} (${count})` : label!))
}

describe("<ThingExplorer> (Solid)", () => {
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

  test("by type:  says to run the project when no thing is of a program's type", () => {
    new Thing({})
    expect(draw("type")).toContain("Run the project to see its things.")
    expect(draw("document")).not.toContain("Run the project to see its things.")
  })

  test("icons say what's a type, a list, or any other thing", () => {
    new Card({})
    new Pile({})
    const html = draw("type", undefined, ["type:Card", "type:Pile"])
    expect(html).toMatch(/<ui-icon name="cube"><\/ui-icon>Card/)
    expect(html).toMatch(/title="list"[^>]*><\/ui-icon>Pile/)
    expect(html).toMatch(/title="thing"[^>]*><\/ui-icon>Card/)
  })

  test("the button for the order it's in is active", () => {
    new Card({})
    expect(draw("document")).toMatch(/class="order active" title="In the order they were made"/)
    expect(draw("type")).toMatch(/class="order active" title="By type, sub-types included"/)
  })

  test("selected:  its row is marked;  nothing selected says so", () => {
    new Card({ rank: "queen" })
    expect(draw("document")).toContain("Select a thing to see its properties.")
    expect(draw("document", "#1")).toMatch(/class="TreeRow ThingTreeNode selected"/)
  })

  test("details:  properties -- computed ones read unasked -- with a thing as a link", () => {
    const stock = new Pile({ name: "stock" })
    new Card({ rank: "queen", pile: stock })
    const html = draw("document", "#2")
    expect(html).toContain("Card → Thing")
    // Solid's server render leaves quotes in text as they are:  React's wrote `&quot;`
    expect(html).toContain('<span class="ThingValue text">"queen"</span>')
    expect(html).toContain('<span class="ThingValue text">"queen-card"</span>')
    expect(html).toMatch(/<a class="ThingValue thing">Pile stock<\/a>/)
    expect(html).toMatch(/<ui-icon name="tag"><\/ui-icon>rank/)
    expect(html).toMatch(/<th title="computed"><ui-icon name="tag"><\/ui-icon>name/)
  })

  test("details:  actions, inherited ones too -- a ▶ for one that takes no arguments", () => {
    class Joker extends Card {}
    new Joker({})
    const html = draw("document", "#1")
    expect(html).toMatch(
      /<ui-icon name="cog"><\/ui-icon>turn over<span class="inherited">from Card<\/span>.*title="Do it:  turnOver\(\)"/
    )
    const move = html.slice(html.indexOf("move to pile"))
    expect(move).not.toBe(html)
    expect(move.slice(0, move.indexOf("</tr>"))).not.toContain("play")
  })

  test("details:  with the program's words, each property and action in spell's words -- slots and all", () => {
    const stock = new Pile({ name: "stock" })
    new Card({ rank: "queen", pile: stock })
    expect(detailLabels(draw("document", "#2", undefined, WORDS))).toEqual([
      "rank",
      "pile",
      "name",
      "turn (a card) over",
      "move (a card) to (a pile)"
    ])
    // the ▶ still does it by its name
    expect(draw("document", "#2", undefined, WORDS)).toContain('title="Do it:  turnOver()"')
  })

  test("details:  an inherited member in its own type's words;  one they don't have by its name", () => {
    class Joker extends Card {
      /** Not in the words:  `wild card` from its name. */
      wildCard() {}
    }
    new Joker({})
    new Pile({ name: "stock" })
    expect(detailLabels(draw("document", "#1", undefined, WORDS))).toEqual([
      "rank",
      "pile",
      "name",
      "wild card",
      "turn (a card) over from Card",
      "move (a card) to (a pile) from Card"
    ])
    expect(detailLabels(draw("document", "#2", undefined, WORDS))).toEqual(["the-name"])
  })

  test("shows a list's items", () => {
    const stock = new Pile({})
    stock.items = [1, "two"]
    const html = draw("document", "#1")
    expect(html).toMatch(/Items <span class="detail">2</)
    expect(html).toContain('<span class="ThingValue text">"two"</span>')
  })

  test("a list in a property opens in place;  an error reading one shows as such", () => {
    class Hand extends Thing {
      get cards(): unknown[] {
        return [1, [2, 3]]
      }
      get broken(): string {
        throw new Error("no luck")
      }
    }
    new Hand({})
    const html = draw("document", "#1")
    expect(html).toMatch(/<details class="ThingValue list"><summary>list of 2<\/summary>/)
    expect(html).toMatch(/<span class="ThingValue error">no luck<\/span>/)
  })
})

describe("memberWords()", () => {
  test("from the first of a thing's types whose words have it", () => {
    const words: SP.SpellWordsData = { lang: "en", types: { Pile: { draw: "draw (a pile)" }, Tableau: {} } }
    expect(memberWords(words, ["Tableau", "Pile", "List"], "draw")).toBe("draw (a pile)")
    expect(memberWords(words, ["Tableau", "Pile", "List"], "deal")).toBeUndefined()
    expect(memberWords(undefined, ["Pile"], "draw")).toBeUndefined()
  })

  test("only what the words say:  NOT what every object has", () => {
    expect(memberWords({ lang: "en", types: { Card: {} } }, ["Card", "constructor"], "toString")).toBeUndefined()
  })
})
