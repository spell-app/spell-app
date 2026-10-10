import { parseHTML } from "linkedom"
import { Errored, enableExternalSource, flush } from "solid-js"
import { render } from "@solidjs/web"
import { describe, test, expect, vi, beforeAll, beforeEach, afterEach } from "vite-plus/test"

import { bridgeSolid } from "$/util"
import { spellCore, Thing, List, prop, drawn, h } from "$/core"
import { isElementThunk, type Drawing } from "$/core/drawing"

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

  /** Its position in `Card.Ranks`:  `positionOf()` takes a read-only list. */
  get value() {
    return spellCore.positionOf(Card.Ranks, this.rank)
  }

  @drawn
  draw(): Drawing {
    drawCalls.set(this, (drawCalls.get(this) ?? 0) + 1)
    if (this.isBroken) throw new Error("this card is broken")
    return h("span", { class: "card" }, () => `${this.rank} ${this.suit}`) as Drawing
  }
}

/** Each node a `PlainCard` drew, as it was made. */
const madeNodes: Element[] = []

/**
 * A card as compiled JavaScript writes it:  a plain `draw()` returning `h()`'s thunk, which `drawThing()` puts in a
 * net, and the net makes.
 */
class PlainCard extends Card {
  override draw(): Drawing {
    drawCalls.set(this, (drawCalls.get(this) ?? 0) + 1)
    return h("i", { ref: (node: Element) => madeNodes.push(node) }, () => this.suit) as Drawing
  }
}

/** A pile as compiled JavaScript writes it:  `h()`'s thunk around its cards, `drawItems()`. */
class PlainPile extends List<Card> {
  override draw(): Drawing {
    drawCalls.set(this, (drawCalls.get(this) ?? 0) + 1)
    return h("div", { class: "pile", ref: (node: Element) => madeNodes.push(node) }, () =>
      spellCore.drawItems(this)
    ) as Drawing
  }
}

/** A card whose drawing throws while `h()` MAKES it, not in `draw()`:  a part of it that can't be drawn. */
class HalfCard extends Card {
  override draw(): Drawing {
    const broken = () => {
      throw new Error("no face")
    }
    return h("div", { class: "half" }, h(broken)) as Drawing
  }
}

/** A card whose `draw()` returns a live value, not an element:  any function but `h()`'s stays live. */
class LiveCard extends Card {
  override draw(): Drawing {
    drawCalls.set(this, (drawCalls.get(this) ?? 0) + 1)
    return (() => this.suit) as unknown as Drawing
  }
}

/** A pile drawing its cards with a plain call, as `ts/solid`'s `<For>` and `{stock.draw()}` do. */
class Pile extends List<Card> {
  @drawn
  override draw(): Drawing {
    return h("div", ...this.items.map((card) => () => card.draw())) as Drawing
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

  test("the net makes h()'s thunk ONCE:  a card added to a pile makes only that card, never the pile again", () => {
    madeNodes.length = 0
    const pile = new PlainPile()
    const [first, second] = [new PlainCard({ rank: "ace" }), new PlainCard({ rank: 2, suit: "clubs" })]
    pile.add(first, second)
    draw(() => spellCore.drawThing(pile))
    expect(element.innerHTML).toBe(`<div class="pile"><i>hearts</i><i>clubs</i></div>`)
    const [pileNode, firstNode] = madeNodes

    pile.add(new PlainCard({ rank: 3, suit: "spades" }))
    first.suit = "diamonds"
    spellCore.flush()
    expect(element.innerHTML).toBe(`<div class="pile"><i>diamonds</i><i>clubs</i><i>spades</i></div>`)
    expect(madeNodes).toHaveLength(4)
    expect(element.firstChild).toBe(pileNode)
    expect(pileNode!.firstChild).toBe(firstNode)
    expect([drawCalls.get(pile), drawCalls.get(first)]).toEqual([1, 1])
  })

  test("a throw while h()'s thunk is made lands in the net:  the stand-in, said once", () => {
    const card = new HalfCard({ rank: "king" })
    draw(() => spellCore.drawThing(card))
    expect(element.innerHTML).toBe(
      `<span class="spell-draw-error" role="alert" title="no face">⚠ HalfCard can't draw</span>`
    )
    expect(spellCore.console.error).toHaveBeenCalledTimes(1)
    expect(Errored).toHaveBeenCalledTimes(1)
  })

  test("mountApp() makes a plain draw()'s h() thunk in its one net", () => {
    const card = new PlainCard({ rank: "ace", suit: "clubs" })
    dispose = spellCore.mountApp(card, element).unmount
    spellCore.flush()
    expect(element.innerHTML).toBe(`<i>clubs</i>`)
    expect(Errored).toHaveBeenCalledTimes(1)
  })

  test("only h()'s thunks are made:  any other function a draw() returns stays a live value", () => {
    expect(isElementThunk(h("i"))).toBe(true)
    expect(isElementThunk(() => "text")).toBe(false)
    expect(isElementThunk("text")).toBe(false)

    const card = new LiveCard({ rank: "ace" })
    draw(() => spellCore.drawThing(card))
    expect(element.innerHTML).toBe(`hearts`)
    card.suit = "spades"
    spellCore.flush()
    expect(element.innerHTML).toBe(`spades`)
    expect(drawCalls.get(card)).toBe(1)
  })

  test("@prop takes a read-only `as const` list", () => {
    expect(new Card({ rank: "king" }).value).toBe(4)
  })
})
