import { parseHTML } from "linkedom"
import { Errored, enableExternalSource, flush } from "solid-js"
import { render } from "@solidjs/web"
import { describe, test, expect, vi, beforeAll, beforeEach, afterEach } from "vite-plus/test"

import { bridgeSolid } from "$/util"
import { spellCore, Thing, List, prop, drawn } from "$/core"
import type { Drawing } from "$/core/drawing"

// counts each error net drawn:  `drawing.ts` makes one with `createComponent(Errored, ...)`
vi.mock("solid-js", async (importOriginal) => {
  const solid = await importOriginal<typeof import("solid-js")>()
  return { ...solid, Errored: vi.fn(solid.Errored) }
})

/**
 * Each drawn thing in its own error net, ONE net for both targets:
 * - compiled JavaScript:  `spellCore.drawThing(card)` puts a plain `draw()` in it
 * - compiled TypeScript and hand-written classes:  `@drawn draw()` puts itself in it, so a parent draws a child with
 *   a plain `card.draw()`, and `drawThing()` adds no second net
 * - Solid's CLIENT build (`vitest.config.ts`), drawing into a fake page (linkedom).
 */

////////////////
// ## Classes under test
////////////////

/** Card ranks, as compiled TypeScript writes a list:  `as const`, read-only. */
const RANKS = ["ace", 2, 3, "king"] as const

/** A card rank. */
type Rank = (typeof RANKS)[number]

/** How many times each thing's `draw()` ran:  OUTSIDE the thing, so it's no prop. */
const drawCalls = new Map<object, number>()

/** A hand-written card, as `ts/solid` writes one:  `@prop`s, and a `@drawn draw()`. */
class Card extends Thing {
  static Ranks = RANKS
  @prop({ oneOf: RANKS }) accessor rank!: Rank
  @prop({ type: "text", default: "hearts" }) accessor suit!: string
  @prop({ type: "choice", default: false }) accessor isBroken!: boolean

  /** Its position in `Card.Ranks`:  `itemOf()` takes a read-only list. */
  get value() {
    return spellCore.itemOf(Card.Ranks, this.rank)
  }

  @drawn
  draw(): Drawing {
    drawCalls.set(this, (drawCalls.get(this) ?? 0) + 1)
    if (this.isBroken) throw new Error("this card is broken")
    return spellCore.element({ tag: "span", props: { class: "card" }, children: [() => `${this.rank} ${this.suit}`] })
  }
}

/** A card as compiled JavaScript writes it:  a plain `draw()`, which `drawThing()` puts in a net. */
class PlainCard extends Card {
  override draw(): Drawing {
    return spellCore.element({ tag: "i", children: [() => this.suit] })
  }
}

/** A pile drawing its cards with a plain call, as `ts/solid`'s `<For>` and `{stock.draw()}` do. */
class Pile extends List<Card> {
  @drawn
  override draw(): Drawing {
    return spellCore.element({ tag: "div", children: this.items.map((card) => () => card.draw()) })
  }
}

////////////////
// ## Tests
////////////////

describe("@drawn", () => {
  let page: ReturnType<typeof parseHTML>
  let element: HTMLElement
  let dispose: (() => void) | undefined

  beforeAll(() => {
    page = parseHTML("<!doctype html><html><head></head><body></body></html>")
    for (const name of ["window", "document", "Node", "Element", "HTMLElement", "Event", "CustomEvent"]) {
      vi.stubGlobal(name, page[name as keyof typeof page])
    }
    bridgeSolid({ enableExternalSource, flush })
  })

  beforeEach(() => {
    element = page.document.createElement("div")
    page.document.body.appendChild(element)
    spellCore.appRoot = element
    drawCalls.clear()
    vi.mocked(Errored).mockClear()
    vi.spyOn(spellCore.console, "error").mockImplementation(() => undefined)
  })

  afterEach(() => {
    dispose?.()
    dispose = undefined
    element.remove()
    spellCore.appRoot = undefined
    vi.restoreAllMocks()
  })

  /** Draw `drawing()` into `element`, as `mountApp()` does. */
  function draw(drawing: () => Drawing) {
    dispose = render(drawing, element)
    spellCore.flush()
  }

  test("draws ONCE:  a live value updates in place, and the parent's plain call never re-runs it", () => {
    const card = new Card({ rank: "ace" })
    draw(() => card.draw())
    expect(element.innerHTML).toBe(`<span class="card">ace hearts</span>`)

    card.suit = "spades"
    spellCore.flush()
    expect(element.innerHTML).toBe(`<span class="card">ace spades</span>`)
    expect(drawCalls.get(card)).toBe(1)
  })

  test("a draw() that throws shows its stand-in, says so once and sends `ui-error`;  its pile keeps drawing", () => {
    const sentErrors: unknown[] = []
    element.addEventListener("ui-error", (event) => sentErrors.push((event as CustomEvent).detail.thing))
    const [good, bad] = [new Card({ rank: 2 }), new Card({ rank: 3, isBroken: true })]
    const pile = new Pile()
    pile.add(good, bad)
    draw(() => pile.draw())

    expect(element.innerHTML).toBe(
      `<div><span class="card">2 hearts</span>` +
        `<span class="spell-draw-error" role="alert" title="this card is broken">⚠ Card can't draw</span></div>`
    )
    expect(spellCore.console.error).toHaveBeenCalledTimes(1)
    expect(sentErrors).toEqual([bad])

    good.suit = "clubs"
    spellCore.flush()
    expect(element.querySelector(".card")!.textContent).toBe("2 clubs")
  })

  test("drawThing() calls a @drawn draw() straight:  ONE net per thing, not two", () => {
    const card = new Card({ rank: "king" })
    draw(() => spellCore.drawThing(card))
    expect(element.innerHTML).toBe(`<span class="card">king hearts</span>`)
    expect(Errored).toHaveBeenCalledTimes(1)
  })

  test("drawThing() puts a plain draw() in the same net, as compiled JavaScript draws", () => {
    const card = new PlainCard({ rank: "ace" })
    draw(() => spellCore.drawThing(card))
    expect(element.innerHTML).toBe(`<i>hearts</i>`)
    expect(Errored).toHaveBeenCalledTimes(1)
  })

  test("mountApp() draws a @drawn app in its one net", () => {
    const card = new Card({ rank: "ace", suit: "clubs" })
    dispose = spellCore.mountApp(card, element).unmount
    spellCore.flush()
    expect(element.innerHTML).toBe(`<span class="card">ace clubs</span>`)
    expect(Errored).toHaveBeenCalledTimes(1)
  })

  test("@prop takes a read-only `as const` list", () => {
    expect(new Card({ rank: "king" }).value).toBe(4)
  })
})
