import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "spell/test-helpers/ElementFixture"
import type { FromRunnerMessage, SpellCompiled, ToRunnerMessage } from "spell-app/app/runner/runner.types"
import { uiReady } from "spell-app/app/solid/loadUI"
import { SpellAppRunner, type SpellAppControls, type SpellAppSource } from "spell-app/app/runner/SpellAppRunner"
import { RunnerSplit } from "spell-app/app/runner/RunnerSplit"
import { VSCodeRunner } from "spell-app/app/runner/VSCodeRunner"
import type { DOMSpellViewerElement } from "spell-app/app/components/spell-viewer"

/**
 * The Solid runners, in the browser:
 * `<SpellAppRunner>` running compiled spell into its app root, live, and the `<spell-viewer>` element around it.
 * - The runtime:  `spellRuntime.ts` as vite serves it, imported by its URL.
 *   - It's ALSO the program's `@spell/core`, so the program and the runner share its `core`,
 *     as with a real `spell-runtime.js` copy.
 *   - `loadRuntime()`'s `blob:` copy can't load in dev:
 *     vite's imports are root-relative, which a `blob:` URL can't resolve.
 * - The program draws with Solid, into the runner's app root:  `h()` from `@spell/core`.
 *   As compiled spell writes it, a value that can change is a function (`() => this.count`).
 * - `adoptShadowStyles()` is stubbed:  the test server doesn't serve `static/` (Semantic UI, Lato).
 */
vi.mock("spell-app/app/runner/loadRuntime", async (importOriginal) => {
  const original = await importOriginal<typeof import("spell-app/app/runner/loadRuntime")>()
  return { ...original, loadRuntime: testRuntime }
})
vi.mock("spell-app/app/runner/shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("spell-app/app/runner/shadowStyles")>()
  return { ...original, adoptShadowStyles: async () => {} }
})

/** A program with an app:  a counter, drawn as a button that counts its clicks.  It logs as it starts. */
const COUNTER = `
import { core, Thing, App, h } from "@spell/core"
export class Counter extends App {
  get count() { return this.getProp('count') }
  set count(value) { this.setProp('count', value) }
  draw() {
    return h("button", { class: "count", onClick: (event) => { this.count = this.count + 1 } }, "Count: ", () => this.count)
  }
}
export let counter = new Counter()
counter.count = 1
core.console.log("started")
counter.start()
`

/**
 * The counter, as spell compiles a program with a test (epic `drawable-thing` P17):
 * - its start, skipped when an edit keeps its things:  calling its test, and starting its app
 * - a print at its top level, which isn't part of its start
 */
const TESTED_COUNTER = `
import { core, Thing, App, h } from "@spell/core"
export class Counter extends App {
  get count() { return this.getProp('count') }
  set count(value) { this.setProp('count', value) }
  draw() {
    return h("button", { class: "count", onClick: (event) => { this.count = this.count + 1 } }, "Count: ", () => this.count)
  }
}
export let counter = new Counter()
counter.count = 1
export function testTheCounter() {
  return core.test("test the counter", function testTheCounter() { core.console.log("testing the counter") })
}
if (!core.isCarryingOver) testTheCounter()
core.console.log("printed at the top")
if (!core.isCarryingOver) counter.start()
`

/** A program with no app:  it only prints. */
const PRINTER = `
import { core } from "@spell/core"
core.console.log("hello from a program")
`

/** A program that starts its app LATER, from a timer -- after the run has finished. */
const LATE = `
import { core, App, h } from "@spell/core"
export class Late extends App {
  draw() { return h("p", { class: "late" }, "late!") }
}
export let late = new Late()
setTimeout(() => late.start(), 50)
`

/**
 * A card table, as spell compiles it:  a viewable list whose frame has a named place, filled by a child that says
 * it goes there.
 * - From its spell:  `to draw a pile:` returns `<div className="pile"><div className="header"><children
 *   name="header"/></div><children/></div>`;  the table draws a pile, and one written by hand,
 *   `<test-project-pile><h3 in="header">Discards</h3></test-project-pile>`.
 */
const CARD_TABLE = `
import { core, Thing, List, App, View, ViewableList, h } from "@spell/core"
export class Card extends View {
  static elementTag = core.defineElement(this, "test-project")
  static { this.declareProp("rank", { type: "text" }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }
  draw() {
    return h("div", { class: "card" }, () => this.rank)
  }
}
export class Pile extends ViewableList {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }
  draw() {
    return h("div", { class: "pile" }, h("div", { class: "header" }, h("slot", { name: "header" })), h("slot"))
  }
}
export class Table extends App {
  draw() {
    return h("div", { class: "table" },
      () => core.drawThing(pile),
      h("test-project-pile", h("h3", { slot: "header" }, "Discards"))
    )
  }
}
export const table = new Table()
export const pile = new Pile({ name: "Pile 1" })
pile.append(new Card({ rank: "A" }))
pile.append(new Card({ rank: "K" }))
if (!core.isCarryingOver) table.start()
`

/**
 * A card game, as compiled spell draws it:
 * - a card's `draw()` chooses its face by an `if` (read OUTSIDE its live values)
 * - its rank is a live value
 * - the pile draws its cards with `drawItems()`
 * - one card can't draw
 * - Drawn with Solid's own `h()`, from `@spell/core`, in the page's spellings (`class`, `colspan`),
 *   as the javascript writer writes them (epic `output-targets` P20).
 *   `draw()` returns `h()`'s thunk:  the error boundary makes it.
 */
const CARDS = `
import { core, Thing, List, App, h } from "@spell/core"
export class Card extends Thing {
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }
  get isFaceDown() { return this.getProp('isFaceDown') }
  set isFaceDown(value) { this.setProp('isFaceDown', value) }
  draw() {
    if (this.isFaceDown) return h("div", { class: "card back" })
    return h("div", { class: () => "card " + this.rank }, () => this.rank)
  }
}
export class Joker extends Card {
  draw() { throw new Error("no face") }
}
export class Pile extends List {}
export class Game extends App {
  draw() {
    return h("table",
      h("tr",
        h("td", { colspan: "2", class: "pile" }, () => core.drawThing(this.pile))
      )
    )
  }
}
export let ace = new Card({ rank: "A" })
export let king = new Card({ rank: "K", isFaceDown: true })
export let joker = new Joker({ rank: "J" })
export let game = new Game()
game.pile = new Pile()
game.pile.add(ace, king, joker)
game.start()
globalThis.cardGame = { ace, king, game, Card }
`

/**
 * A tile that's a view, with an element class of its own handed to the page,
 * as compiled TypeScript does (epic `drawable-thing` P10).
 * - `TileElement`, from `@spell/elements`, with a method of its own
 * - Plain javascript, so no decorators:  its vocabulary and sheet are the page's, as for a bare element.
 */
const HANDED = `
import { core, App, View, h } from "@spell/core"
import { SpellElement } from "@spell/elements"
export class Tile extends View {
  static elementTag = core.defineElement(this, "Handed")
  get label() { return this.getProp('label') }
  set label(value) { this.setProp('label', value) }
  tap() { return "tapped " + this.label }
  poke() { return "poked " + this.label }
  draw() { return h("span", { class: "tile" }, () => this.label) }
}
export class TileElement extends SpellElement {
  tap() { return "tapped by its element:  " + this.currentThing?.label }
}
core.useElement(Tile, TileElement)
export class Board extends App {
  draw() { return h("div", { class: "board" }, () => core.drawThing(tile)) }
}
export let tile = new Tile({ label: "A" })
export let board = new Board()
board.start()
`

/** What `CARDS` leaves on `globalThis`, for a test to play with. */
type CardGame = {
  ace: { rank: string; isFaceDown: boolean }
  king: { rank: string; isFaceDown: boolean }
  game: { pile: { add(...cards: unknown[]): void; removeItem(oneIndex: number): void } }
  Card: new (props: Record<string, unknown>) => { rank: string }
}

/** Undo for each test:  unmount, remove. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<SpellAppRunner>", () => {
  test("runs a program into its app root, with a toolbar naming it", async () => {
    const host = await mount(source(COUNTER))
    const button = await waitFor(() => host.querySelector<HTMLButtonElement>(".SpellAppApp .App button.count"))
    expect(button.textContent).toBe("Count: 1")
    expect(host.querySelector(".SpellAppApp")!.classList.contains("hidden")).toBe(false)
    expect(host.querySelector(".SpellAppToolbar ui-item[type=header]")!.textContent).toBe("Counter")
  })

  test("the Thing Explorer follows the program's things, live", async () => {
    const host = await mount(source(COUNTER), { debug: "things" })
    const button = await waitFor(() => host.querySelector<HTMLButtonElement>("button.count"))
    // its one top-level thing, selected
    ;(await waitFor(() => host.querySelector<HTMLElement>(".ThingTreeNode .body"))).click()
    flush()
    expect(await waitFor(() => valueOf(host, "count"))).toBe("1")

    button.click()
    await waitFor(() => valueOf(host, "count") === "2")
    expect(button.textContent).toBe("Count: 2")
  })

  test("the Thing Explorer shows a thing's members in spell's words, from the program's words file", async () => {
    const words = `export const words = { lang: "en", types: { Counter: { count: "the count" } } }`
    const wordsUrl = `data:text/javascript,${encodeURIComponent(words)}`
    const host = await mount({ ...source(COUNTER), wordsUrl }, { debug: "things" })
    ;(await waitFor(() => host.querySelector<HTMLElement>(".ThingTreeNode .body"))).click()
    flush()
    expect(await waitFor(() => valueOf(host, "the count"))).toBe("1")
  })

  test("the debug pane:  toggled by Debug, its tabs switch, the console shows what was printed", async () => {
    const host = await mount(source(COUNTER))
    await waitFor(() => host.querySelector("button.count"))
    expect(host.querySelector(".RunnerSplitBottom")).toBeNull()

    host.querySelector<HTMLElement>(".SpellAppToolbar ui-item.debug")!.click()
    flush()
    const tabs = await waitFor(() =>
      host.querySelectorAll<HTMLElement>(".RunnerSplitBottom .RunnerPaneToolbar ui-item")
    )
    // no scope pack:  no Type Explorer
    expect([...tabs].map((tab) => tab.dataset.tab)).toEqual(["things", "console"])
    expect(host.querySelector(".RunnerSplitBottom .ThingExplorer")).not.toBeNull()

    tabs[1]!.click()
    flush()
    expect(await waitFor(() => host.querySelector(".RunnerSplitBottom .RunnerConsole")?.textContent)).toContain(
      "started"
    )
    expect(tabs[1]!.hasAttribute("selected")).toBe(true)
  })

  test("a program with no app:  its console on top, the app root hidden but kept", async () => {
    const host = await mount(source(PRINTER))
    const output = await waitFor(() => host.querySelector(".RunnerSplitTop > .RunnerPane .RunnerConsole"))
    await waitFor(() => output.textContent?.includes("hello from a program"))
    expect(host.querySelector(".SpellAppApp")!.classList.contains("hidden")).toBe(true)
    expect(host.querySelector(".SpellAppApp > .App")).not.toBeNull()
  })

  test("an app started after the run finished shows once it draws", async () => {
    const host = await mount(source(LATE))
    await waitFor(() => host.querySelector(".SpellAppApp.hidden"))
    await waitFor(() => host.querySelector(".SpellAppApp .late"))
    await waitFor(() => !host.querySelector(".SpellAppApp")!.classList.contains("hidden"))
  })

  test("a program that throws:  its error in the toolbar", async () => {
    const host = await mount(source(`throw new Error("oops")`))
    const error = await waitFor(() => host.querySelector(".SpellAppToolbar ui-item.error"))
    expect(error.textContent).toBe("oops")
  })

  test("a recompile keeps the program's things:  a counter keeps its count;  restart starts afresh (P16)", async () => {
    let controls: SpellAppControls | undefined
    const { host, setSource } = await mountSettable(source(COUNTER), (it) => (controls = it))
    ;(await waitFor(() => host.querySelector<HTMLButtonElement>("button.count"))).click()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 2")

    // edited:  a new label, and its start still sets the count to 1
    setSource(source(COUNTER.replace('"Count: "', '"Clicks: "')))
    await waitFor(() => host.querySelector("button.count")?.textContent === "Clicks: 2")

    controls!.restart()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Clicks: 1")
  })

  test("restart runs it afresh;  a new source runs that", async () => {
    let controls: SpellAppControls | undefined
    const [first] = [source(COUNTER)]
    const { host, setSource } = await mountSettable(first, (it) => (controls = it))
    const button = await waitFor(() => host.querySelector<HTMLButtonElement>("button.count"))
    button.click()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 2")

    controls!.restart()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 1")

    setSource(source(PRINTER, "Printer"))
    await waitFor(() =>
      host.querySelector(".RunnerSplitTop > .RunnerPane .RunnerConsole")?.textContent?.includes("hello")
    )
    expect(host.querySelector(".SpellAppToolbar ui-item[type=header]")!.textContent).toBe("Printer")
  })
})

describe("compiled spell draws with Solid", () => {
  /** The cards on the page, in order, by class name. */
  const cardsIn = (host: HTMLElement) => [...host.querySelectorAll<HTMLElement>(".pile .card, .pile .spell-draw-error")]

  test("a live value updates its own node;  an `if` in `draw()` re-draws that card alone", async () => {
    const host = await mount(source(CARDS, "Game"))
    await waitFor(() => cardsIn(host).length === 3)
    const { ace, king } = (globalThis as unknown as { cardGame: CardGame }).cardGame
    const [aceNode, kingNode] = cardsIn(host)
    expect(aceNode!.className).toBe("card A")
    expect(kingNode!.className).toBe("card back")

    ace.rank = "2"
    await waitFor(() => aceNode!.textContent === "2")
    expect(cardsIn(host)[0]).toBe(aceNode)
    expect(aceNode!.className).toBe("card 2")

    king.isFaceDown = false
    await waitFor(() => cardsIn(host)[1]!.textContent === "K")
    expect(cardsIn(host)[0]).toBe(aceNode)
    expect(cardsIn(host)[1]).not.toBe(kingNode)
  })

  test("a list keeps each item's node:  one added or removed changes only its own", async () => {
    const host = await mount(source(CARDS, "Game"))
    await waitFor(() => cardsIn(host).length === 3)
    const { game, Card } = (globalThis as unknown as { cardGame: CardGame }).cardGame
    const [aceNode, , jokerNode] = cardsIn(host)

    game.pile.add(new Card({ rank: "Q" }))
    await waitFor(() => cardsIn(host).length === 4)
    expect(cardsIn(host)[0]).toBe(aceNode)
    expect(cardsIn(host)[3]!.textContent).toBe("Q")

    game.pile.removeItem(1) // the ace
    await waitFor(() => cardsIn(host).length === 3)
    expect(cardsIn(host)[1]).toBe(jokerNode)
  })

  test("an empty list draws its placeholder;  a card in, it goes, and the card keeps its node", async () => {
    const program = CARDS.replace(
      "export class Pile extends List {}",
      'export class Pile extends List {\n  drawItsPlaceholder() { return h("div", { class: "card placeholder" }) }\n}'
    ).replace("game.pile.add(ace, king, joker)", "")
    const host = await mount(source(program, "Game"))
    await waitFor(() => cardsIn(host).length === 1)
    expect(cardsIn(host)[0]!.classList.contains("placeholder")).toBe(true)
    const { game, Card } = (globalThis as unknown as { cardGame: CardGame }).cardGame
    game.pile.add(new Card({ rank: "Q" }))
    await waitFor(() => cardsIn(host).length === 1 && !cardsIn(host)[0]!.classList.contains("placeholder"))
    const queenNode = cardsIn(host)[0]
    game.pile.add(new Card({ rank: "K" }))
    await waitFor(() => cardsIn(host).length === 2)
    expect(cardsIn(host)[0]).toBe(queenNode)
  })

  test("a thing that can't draw shows a stand-in, says so once, and sends `ui-error`;  the rest draws", async () => {
    const errors: unknown[] = []
    const onError = (event: Event) => errors.push((event as CustomEvent<{ error: unknown }>).detail.error)
    document.addEventListener("ui-error", onError)
    cleanups.push(() => document.removeEventListener("ui-error", onError))
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    cleanups.push(() => quiet.mockRestore())

    const host = await mount(source(CARDS, "Game"))
    await waitFor(() => cardsIn(host).length === 3)
    const standIn = cardsIn(host)[2]!
    expect(standIn.classList.contains("spell-draw-error")).toBe(true)
    expect(standIn.textContent).toBe("⚠ Joker can't draw")
    expect(standIn.title).toBe("no face")
    expect((errors[0] as Error).message).toBe("no face")
    expect(cardsIn(host)[0]!.textContent).toBe("A")
  })

  test("`notify` shows a toast, on the page's Spell UI", async () => {
    await mount(source(`import { core } from "@spell/core"\ncore.notify("hello from spell")`, "Notifier"))
    const toast = await waitFor(() =>
      [...document.querySelectorAll("ui-toast")].find((it) => it.getAttribute("message") === "hello from spell")
    )
    cleanups.push(() => toast.remove())
  })

  test("the `Todos - Form Based` example:  a form bound to the app, a row per task, Add Task adds one", async () => {
    const host = await mount(source(await fixtureCompiled("todos-form-based"), "Todos"))
    const titles = () =>
      [...host.querySelectorAll<HTMLElement & { value: string }>("ui-repeat ui-input[name=title]")].map(
        (input) => input.value
      )
    await waitFor(() => titles().length === 3)
    expect(titles()).toEqual(["Create todos app", "Teach it to draw", "Test app"])
    const done = [...host.querySelectorAll<HTMLElement & { selected: boolean }>("ui-repeat ui-checkbox")]
    expect(done.map((checkbox) => checkbox.selected)).toEqual([true, false, false])
    expect(host.querySelector(".spell-draw-error")).toBeNull()

    const newTask = host.querySelector<HTMLElement & { value: string }>("ui-input[name=newTaskName]")!
    const add = [...host.querySelectorAll<HTMLElement & { disabled: boolean }>("ui-button")].find(
      (button) => button.textContent === "Add Task"
    )!
    expect(add.disabled).toBe(true)
    newTask.value = "Ship it"
    newTask.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
    await waitFor(() => !add.disabled)
    add.click()
    await waitFor(() => titles()[3] === "Ship it")
  })

  test("the `Solitaire` example:  each pile and card its own element, laid out by its styles.css;  a click still plays", async () => {
    const host = await mount(await solitaireSource())
    type Element = HTMLElement & { ready: Promise<void> }
    const cards = () => [...host.querySelectorAll<Element>("test-project-card")]
    await waitFor(() => cards().length === 52)
    await ElementFixture.settle(host)
    expect(host.querySelector(".spell-draw-error")).toBeNull()
    // each pile holds its cards' elements, shown through its frame's place for them, a <slot> on the page
    const tableaus = () => [...host.querySelectorAll<Element>("test-project-tableau")]
    // dealt with a pause between cards:  wait for the last
    await waitFor(() => tableaus()[6]?.children.length === 7, 10_000)
    await ElementFixture.settle(host)
    expect(tableaus().map((tableau) => tableau.children.length)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(tableaus()[0]!.shadowRoot!.querySelector("slot")).not.toBeNull()
    // styles.css lays them out (outline-spell P27):  a tableau is vertical, each card a step below the one before,
    // and every card as wide as its pile, inside its cell's gutters
    const column = tableaus()[6]!
    // once the deal's cards have glided into place
    await Promise.all([...column.children].flatMap((card) => card.getAnimations().map((glide) => glide.finished)))
    const tops = [...column.children].map((card) => card.getBoundingClientRect().top)
    for (const [index, top] of tops.entries()) if (index) expect(top).toBeGreaterThan(tops[index - 1]!)
    const widthOf = (element: globalThis.Element) => Math.round(element.getBoundingClientRect().width)
    const { paddingLeft, paddingRight } = getComputedStyle(column)
    const inside = column.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)
    expect(widthOf(column.lastElementChild!)).toBe(Math.round(inside))
    // ... numbered by their pile, for that:  --index from 0, the pile's --count
    expect((column.lastElementChild as HTMLElement).style.getPropertyValue("--index")).toBe("6")
    expect(column.style.getPropertyValue("--count")).toBe("7")
    // a stacked pile's cards sit on each other
    const stock = host.querySelector<Element>("test-project-stock-pile")!
    expect(stock.getAttribute("layout")).toBe("stacked")
    expect(getComputedStyle(stock.lastElementChild!).position).toBe("absolute")

    // each card shows its thing's rank, suit and direction as attributes, for the inspector (P13)
    for (const card of cards()) {
      expect(card.getAttribute("direction")).toMatch(/^(up|down)$/)
      expect(card.getAttribute("suit")).toMatch(/^(clubs|diamonds|hearts|spades)$/)
    }
    expect(tableaus().map((tableau) => tableau.getAttribute("name"))).toEqual([
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7"
    ])
    // ... and the pile holding it, as that pile's reference (P18):  each tableau's cards say so
    expect(tableaus().map((tableau) => [...tableau.children].map((card) => card.getAttribute("pile")))).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((count, index) => Array<string>(count).fill(`Tableau#T${index + 1}`))
    )
    expect(stock.lastElementChild!.getAttribute("pile")).toBe("StockPile#stock")
    // ... and each element is named after its thing, by its id (J43):  the inspector says which card it is
    expect(tableaus().map((tableau) => tableau.id)).toEqual(tableaus().map((tableau) => tableau.getAttribute("name")))
    expect(stock.id).toBe("stock")
    for (const card of cards()) expect(card.id).toBe(`${card.getAttribute("rank")}-of-${card.getAttribute("suit")}`)

    // the deal ends by playing the stock's top card onto the discards
    const discards = () => host.querySelector("test-project-discard-pile")!.children.length
    await waitFor(() => discards() === 1)
    const played = stock.lastElementChild as HTMLElement
    expect(played.getAttribute("direction")).toBe("down")
    played.shadowRoot!.querySelector<HTMLElement>("[part=picture]")!.click()
    await waitFor(() => discards() > 1)
    // ... and they follow as the game plays:  the card played from the stock is face up, on the discards
    await waitFor(() => played.getAttribute("direction") === "up")
    await waitFor(() => played.getAttribute("pile") === "DiscardPile#discards")
  })

  test('a viewable list\'s frame:  its cards in its <children/>, a child written in="header" in its <children name="header"/>', async () => {
    const host = await mount(source(CARD_TABLE, "Table"))
    type Element = HTMLElement & { ready: Promise<void> }
    const piles = () => [...host.querySelectorAll<Element>("test-project-pile")]
    await waitFor(() => piles().length === 2 && piles().every((pile) => pile.shadowRoot?.querySelector(".pile")))
    await ElementFixture.settle(host)
    expect(host.querySelector(".spell-draw-error")).toBeNull()
    const [drawn, byHand] = piles()
    // the pile spell drew:  its cards are its children, shown through the unnamed slot
    const cards = [...drawn!.children]
    expect(cards.map((card) => card.localName)).toEqual(["test-project-card", "test-project-card"])
    for (const card of cards) expect(card.assignedSlot?.name).toBe("")
    // the pile written by hand:  its <h3 in="header"> is written slot="header", and shows in the header place
    const header = byHand!.querySelector("h3")!
    expect(header.getAttribute("slot")).toBe("header")
    expect(header.assignedSlot?.name).toBe("header")
    expect(header.assignedSlot?.parentElement?.className).toBe("header")
  })

  test("an element class the program hands over, from `@spell/elements`:  the page defines its tag on it (P10)", async () => {
    const host = await mount(source(HANDED, "Board"))
    type TileElement = HTMLElement & { tap(): string; poke(): string }
    const tile = await waitFor(() => host.querySelector<TileElement>("handed-tile"))
    await ElementFixture.settle(host)
    await waitFor(() => tile.shadowRoot?.querySelector(".tile")?.textContent === "A")
    expect(host.querySelector(".spell-draw-error")).toBeNull()
    // its own method, and the tile's other one, through the tile
    expect(tile.tap()).toBe("tapped by its element:  A")
    expect(tile.poke()).toBe("poked A")
  })

  test("`Solitaire` run again, edited, on the same page:  its tags stay, its new piles draw the new way", async () => {
    const solitaire = await solitaireSource()
    const first = await mount(solitaire)
    await waitFor(() => first.querySelectorAll("test-project-card").length === 52)
    const defined = customElements.get("test-project-foundation")
    // what an empty foundation shows, edited:  a placeholder of another kind
    const edited = solitaire.compiled!.replace(PLACEHOLDER, EDITED_PLACEHOLDER)
    expect(edited).not.toBe(solitaire.compiled)
    const second = await mount({ ...solitaire, compiled: edited })
    await waitFor(() => second.querySelectorAll("test-project-card").length === 52)
    await ElementFixture.settle(second)
    expect(second.querySelector(".spell-draw-error")).toBeNull()
    // one tag per type:  defined once, its elements drawing the latest program
    expect(customElements.get("test-project-foundation")).toBe(defined)
    const placeholders = (host: HTMLElement) =>
      [...host.querySelectorAll("test-project-foundation")].map((pile) => pile.shadowRoot?.querySelector("[part]"))
    // the new program's foundations draw the edit;  the old program's keep drawing their own things
    expect(placeholders(second).map((place) => place?.getAttribute("part"))).toEqual(Array(4).fill("edited"))
    expect(placeholders(first).map((place) => place?.getAttribute("part"))).toEqual(Array(4).fill("placeholder"))
  })

  test("the counter app counted, then its counter library recompiled to draw differently:  the same count, drawn the new way (P16)", async () => {
    const { host, setSource } = await mountSettable(await counterAppSource())
    const button = () => counterButton(host)
    // drawn, and its run finished:  its things are the runtime's, to carry over
    await waitFor(() => button()?.textContent === "Count: 0" && topLevelNames().includes("tally"), 10_000)
    await ElementFixture.settle(host)
    // counted:  two clicks
    button()!.click()
    button()!.click()
    await waitFor(() => button()?.textContent === "Count: 2")
    expect(consoleText()).toContain("test the imported counter")
    expect(consoleText()).toContain("test counting")

    // the counter library's drawing, edited:  a new label
    // (Solitaire imported a card library until epic `spanish` P21, and showed the game kept, drawn the new way;
    //  an edit to the counter app's own file would start afresh:  it starts the app -- P17, below)
    let asked = false
    const edited = await counterAppSource((counter) => counter.replace("`Count: ", "`Clicks: "))
    setSource({ ...edited, importUrl: (id) => ((asked = true), edited.importUrl!(id)) })
    await waitFor(() => asked, 10_000)
    // the same count, drawn the new way:  the counter carried over
    await waitFor(() => button()?.textContent === "Clicks: 2", 10_000)
    await ElementFixture.settle(host)
    expect(host.querySelector(".spell-draw-error")).toBeNull()
    // neither the app's tests nor the library's run again:  the same program, its things carried over
    const printed = consoleText()
    expect(printed).not.toContain("test the imported counter")
    expect(printed).not.toContain("test counting")
  })

  test("`Solitaire` played, then its app's own file edited:  a fresh game, as Restart deals (P17)", async () => {
    const solitaire = await solitaireSource()
    const { host, setSource } = await mountSettable(solitaire)
    type Element = HTMLElement & { ready: Promise<void> }
    const tableaus = () => [...host.querySelectorAll<Element>("test-project-tableau")]
    const stock = () => host.querySelector<Element>("test-project-stock-pile")!
    const discards = () => host.querySelector<Element>("test-project-discard-pile")!
    await waitFor(() => tableaus()[6]?.children.length === 7, 10_000)
    await ElementFixture.settle(host)
    ;(stock().lastElementChild as HTMLElement).shadowRoot!.querySelector<HTMLElement>("[part=picture]")!.click()
    await waitFor(() => discards().children.length === 2)
    expect(consoleText()).toContain("test the moves")

    // Solitaire's own file, which says `start a new game`:  a new score to start from
    const edited = solitaire.compiled!.replace(
      "solitaire.startANewGame()\n",
      "solitaire.score = 1\nsolitaire.startANewGame()\n"
    )
    expect(edited).not.toBe(solitaire.compiled)
    setSource({ ...solitaire, compiled: edited })
    await waitFor(() => consoleText().includes("Started afresh:  the program's start changed"))
    // dealt again:  the tests print again, and the deal ends with one card turned onto the discards
    await waitFor(() => tableaus()[6]?.children.length === 7 && discards().children.length === 1, 10_000)
    expect(consoleText()).toContain("test the moves")
    expect(consoleText()).not.toContain("Kept")
  })

  test("a program's tests and its app's start don't run again on an edit;  its other lines do, a print too (P17)", async () => {
    let controls: SpellAppControls | undefined
    const { host, setSource } = await mountSettable(source(TESTED_COUNTER), (it) => (controls = it))
    ;(await waitFor(() => host.querySelector<HTMLButtonElement>("button.count"))).click()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 2")
    expect(consoleText()).toContain("testing the counter")

    // edited:  a new label
    setSource(source(TESTED_COUNTER.replace('"Count: "', '"Clicks: "')))
    await waitFor(() => host.querySelector("button.count")?.textContent === "Clicks: 2")
    const printed = consoleText()
    expect(printed).toContain("printed at the top")
    expect(printed).toContain("Kept counter")
    expect(printed).not.toContain("testing the counter")

    controls!.restart()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Clicks: 1")
    expect(consoleText()).toContain("testing the counter")
  })

  test("a thing that can't come over:  the program starts afresh as a whole, and the console says why (P17)", async () => {
    const { host, setSource } = await mountSettable(source(TESTED_COUNTER))
    ;(await waitFor(() => host.querySelector<HTMLButtonElement>("button.count"))).click()
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 2")

    // the counter is a `Tally` now:  its type changed, and its start didn't
    setSource(source(TESTED_COUNTER.replace("class Counter", "class Tally").replace("new Counter", "new Tally")))
    await waitFor(() => consoleText().includes("Started afresh:  counter:  its type was Counter, now Tally."))
    await waitFor(() => host.querySelector("button.count")?.textContent === "Count: 1")
    const printed = consoleText()
    expect(printed).toContain("testing the counter")
    expect(printed.split("printed at the top")).toHaveLength(2)
  })

  test("`Todos - Form Based`:  ticking a task shows in the debug JSON;  Active / Completed show only those tasks", async () => {
    const host = await mount(source(await fixtureCompiled("todos-form-based"), "Todos"))
    const titles = () =>
      [...host.querySelectorAll<HTMLElement & { value: string }>("ui-repeat ui-input[name=title]")].map(
        (input) => input.value
      )
    const debugJSON = () => JSON.parse(host.querySelector("ui-form")!.shadowRoot!.querySelector("pre")!.textContent!)
    const menuItem = (text: string) =>
      [...host.querySelectorAll<HTMLElement>("ui-item")].find((item) => item.textContent === text)!
    await waitFor(() => titles().length === 3)
    // each object says its class;  a list shows its items (it was `"tasks": {}`)
    expect(debugJSON()["$type"]).toBe("TodosApp")
    expect(debugJSON().tasks).toEqual({
      $type: "List",
      $items: [
        { $type: "Task", title: "Create todos app", completed: true },
        { $type: "Task", title: "Teach it to draw", completed: false },
        { $type: "Task", title: "Test app", completed: false }
      ]
    })

    // a real click, on the checkbox as the person sees it
    await userEvent.click(host.querySelectorAll("ui-repeat ui-checkbox")[1]!)
    await waitFor(() => debugJSON().tasks["$items"][1].completed === true)

    menuItem("Active").click()
    // a row coming back is a new one:  its controls are bound as it joins the form
    await waitFor(() => titles().join() === "Test app")
    menuItem("Completed").click()
    await waitFor(() => titles().join() === "Create todos app,Teach it to draw")

    // a change from outside the form shows in the JSON too
    menuItem("Change name").click()
    await waitFor(() => debugJSON().tasks["$items"][0].title === "New title")
    menuItem("All").click()
    await waitFor(() => titles().length === 3)
  })
})

describe("<VSCodeRunner>", () => {
  test("a project that imports another:  it asks the extension for the import's javascript, and runs (counter-app)", async () => {
    const [program, counter] = await Promise.all([fixtureCompiled("counter-app"), fixtureCompiled("counter")])
    const { host, posted } = await mountVSCode()
    await waitFor(() => posted.some(({ type }) => type === "ready"))
    tellRunner({ type: "run", compiled: program })
    const asked = await waitFor(() => posted.find((message) => message.type === "loadImport"))
    expect(asked).toEqual({ type: "loadImport", projectId: COUNTER_LIBRARY })
    tellRunner({ type: "imported", projectId: COUNTER_LIBRARY, compiled: counter })
    // it runs:  the counter app draws the library's counter
    await waitFor(() => counterButton(host)?.textContent === "Count: 0", 10_000)
    expect(host.querySelector(".VSCodeRunnerToolbar .error")).toBeNull()
  })

  test("an import the extension couldn't load:  its reason, as the run's error", async () => {
    const program = await fixtureCompiled("counter-app")
    const { host, posted } = await mountVSCode()
    tellRunner({ type: "run", compiled: program })
    await waitFor(() => posted.some(({ type }) => type === "loadImport"))
    tellRunner({ type: "imported", projectId: COUNTER_LIBRARY, error: "Couldn't load project 'x'" })
    const error = await waitFor(() => host.querySelector(".VSCodeRunnerToolbar .error"))
    expect(error.textContent).toContain("Couldn't load project 'x'")
  })
})

describe("<VSCodeRunner>'s Run Tests", () => {
  /** A project with no app:  two tests, the first run by the program itself as it loads, as spell compiles it. */
  const TESTS_ONLY = `
import { core } from "@spell/core"
export function testMath() {
  return core.test("test math", function testMath() {
    core.expect(4, \`2 + 2\`, 4, \`4\`)
    core.expect(5, \`2 + 3\`, 4, \`4\`)
  })
}
export function testLetters() {
  return core.test("test letters", function testLetters() { core.expect("a", \`the letter\`, "a", \`"a"\`) })
}
if (!core.isCarryingOver) testMath()
`
  /** Its words, in Spanish:  what the core says as its tests run. */
  const SPANISH_WORDS = `export const words = { lang: "es", types: {}, messages: {
    "expect-failed": "Inesperado: {what} debería ser {expected} pero en realidad es {actual}"
  } }`

  test("a project with no app runs its tests by itself:  how they went in Output, and to the extension", async () => {
    const { posted } = await mountVSCode()
    tellRunner({ type: "run", compiled: TESTS_ONLY, words: [SPANISH_WORDS] })
    const sent = await waitFor(() => posted.find((message) => message.type === "testResults"))
    // each test once:  `test math` as the program loaded, `test letters` after;  a failed check in the program's words
    expect(sent).toEqual({
      type: "testResults",
      tests: [
        {
          name: "test math",
          method: "testMath",
          passed: false,
          failures: [
            {
              what: "2 + 3",
              expected: "4",
              message: "Inesperado: `2 + 3` debería ser `4` pero en realidad es `5`",
              occurrence: 0
            }
          ]
        },
        { name: "test letters", method: "testLetters", passed: true, failures: [] }
      ]
    })
    const output = consoleText()
    expect(output).toContain("Tests:  1 passed, 1 failed")
    expect(output).toContain("✗ test math\nInesperado: `2 + 3` debería ser `4` pero en realidad es `5`")
    expect(output).toContain("✓ test letters")
  })

  test("the Run Tests button and the extension's `runTests` each run them again", async () => {
    const { host, posted } = await mountVSCode()
    const results = () => posted.filter((message) => message.type === "testResults").length
    tellRunner({ type: "run", compiled: TESTS_ONLY })
    await waitFor(() => results() === 1)
    tellRunner({ type: "runTests" })
    await waitFor(() => results() === 2)
    const button = await waitFor(() => host.querySelector<HTMLElement>(".VSCodeRunnerToolbar .run-tests"))
    await userEvent.click(button)
    await waitFor(() => results() === 3)
  })
})

describe("<RunnerSplit>", () => {
  test("the bottom pane and its bar show only with `showBottom`;  the top pane is never redrawn", async () => {
    const host = document.createElement("div")
    host.style.height = "400px"
    document.body.append(host)
    let show!: (value: boolean) => void
    const { createSignal } = await import("solid-js")
    const dispose = render(() => {
      const [showBottom, setShowBottom] = createSignal(false)
      show = setShowBottom
      return (
        <RunnerSplit split={60} onSplit={() => {}} showBottom={showBottom()} bottom={<p class="bottom">bottom</p>}>
          <p class="top">top</p>
        </RunnerSplit>
      )
    }, host)
    cleanups.push(() => {
      dispose()
      host.remove()
    })
    flush()
    const top = host.querySelector(".top")
    expect(host.querySelector(".RunnerSplitter")).toBeNull()
    expect(host.querySelector<HTMLElement>(".RunnerSplitTop")!.style.flex).toBe("1 1 0px")

    show(true)
    flush()
    expect(host.querySelector(".RunnerSplitter")).not.toBeNull()
    expect(host.querySelector(".RunnerSplitBottom .bottom")).not.toBeNull()
    expect(host.querySelector<HTMLElement>(".RunnerSplitTop")!.style.flex).toBe("60 1 0px")
    expect(host.querySelector(".top")).toBe(top)
  })
})

describe("<spell-viewer>", () => {
  test("defined once;  `width` / `height` set its inline size", async () => {
    await import("spell-app/app/components/spell-viewer")
    expect(customElements.get("spell-viewer")).toBeDefined()
    const app = await mountApp(`<spell-viewer width="300px" height="200px"></spell-viewer>`)
    expect(app.style.width).toBe("300px")
    expect(app.style.height).toBe("200px")
    app.setAttribute("width", "fluid")
    flush()
    await ElementFixture.tick()
    expect(app.style.width).toBe("")
  })

  test("nothing to run:  says so -- or that it waits for its editor", async () => {
    const app = await mountApp(`<spell-viewer></spell-viewer>`)
    expect(app.shadowRoot!.querySelector(".SpellAppError")!.textContent).toBe(
      "Give <spell-viewer> a project or src to run."
    )
    app.setAttribute("editor", "#ed")
    flush()
    expect(app.shadowRoot!.querySelector(".SpellAppError")!.textContent).toBe(
      "Waiting for its editor, #ed, to compile…"
    )
  })

  test("runs code pushed to it, in its shadow root;  a root itself, with Fomantic's icon names", async () => {
    const app = await mountApp(`<spell-viewer toolbar></spell-viewer>`)
    app.run(compiled(COUNTER))
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.count"))
    expect(root.querySelector("ui-root")).toBeNull()
    expect(app.icons).toBe("fomantic")
    expect(root.querySelector(".SpellAppToolbar ui-item[type=header]")!.textContent).toBe("Test")
  })

  test("an editor's compile runs, from `editor`;  a change of what to run drops it", async () => {
    const editor = document.createElement("div")
    editor.id = "ed"
    document.body.append(editor)
    cleanups.push(() => editor.remove())
    const app = await mountApp(`<spell-viewer editor="#ed" toolbar></spell-viewer>`)
    editor.dispatchEvent(
      new CustomEvent("spell-compiled", { detail: compiled(COUNTER), bubbles: true, composed: true })
    )
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.count"))
    expect(app.pushed).toBeDefined()

    app.setAttribute("name", "Renamed")
    flush()
    expect(app.pushed).toBeUndefined()
    // nothing else to run:  waits for its editor again
    await waitFor(() => root.querySelector(".SpellAppError"))
  })

  test("`restart()` runs pushed code afresh", async () => {
    const app = await mountApp(`<spell-viewer toolbar></spell-viewer>`)
    app.run(compiled(COUNTER))
    const root = app.shadowRoot!
    ;(await waitFor(() => root.querySelector<HTMLButtonElement>("button.count"))).click()
    await waitFor(() => root.querySelector("button.count")?.textContent === "Count: 2")
    app.restart()
    await waitFor(() => root.querySelector("button.count")?.textContent === "Count: 1")
  })

  test("a move in one go keeps the app;  leaving the page lets go of it, a microtask later", async () => {
    const app = await mountApp(`<spell-viewer toolbar></spell-viewer>`)
    app.run(compiled(COUNTER))
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.count"))
    const holder = document.createElement("div")
    document.body.append(holder)
    cleanups.push(() => holder.remove())
    holder.append(app)
    await ElementFixture.tick()
    expect(root.querySelector("button.count")).not.toBeNull()
    app.remove()
    await ElementFixture.tick()
    expect(root.childNodes).toHaveLength(0)
    // back on the page:  a new component, running the code pushed before
    holder.append(app)
    await waitFor(() => root.querySelector("button.count"))
  })

  test("Type Explorer links go out as `spell-open`", async () => {
    const app = await mountApp(`<spell-viewer></spell-viewer>`)
    expect(app.component!.elementDefinition.event("spell-open")).toBe("spell-open")
  })
})

////////////////
// ## Helpers
////////////////

/** The runtime, as `loadRuntime()` would hand it over -- see the file's docs. */
async function testRuntime() {
  const url = new URL("/src/app/runner/spellRuntime.ts", location.href).href
  const runtime = (await import(/* @vite-ignore */ url)) as typeof import("spell-app/app/runner/spellRuntime")
  testCore = runtime.core
  return { runtime, coreUrl: url, release: () => {} }
}

/** What the runtime's console holds, as text:  every line's message, in groups too. */
function consoleText(): string {
  type Line = { message?: unknown[]; lines?: Line[] }
  const textOf = (lines: Line[]): string[] =>
    lines.flatMap((line) => [(line.message ?? []).map(String).join(" "), ...textOf(line.lines ?? [])])
  return textOf(testCore!.console.lines as Line[]).join("\n")
}

/** Names of the things the running program made at its top level, e.g. `tally`:  what a recompile carries over. */
function topLevelNames(): string[] {
  return (testCore?.things.topLevel() ?? []).map(({ name }) => name)
}

/** The test runtime's `core`, once a runner has loaded it -- see `testRuntime()`. */
let testCore: (typeof import("spell-app/app/runner/spellRuntime"))["core"] | undefined

/**
 * The Solitaire example, as a runner runs it:  its compiled javascript, its blessed snapshot as text
 * (`tests/spell/__examples__/Solitaire/Solitaire.snapshot.js`).
 * - Vite serves a file by its path.
 * - A snapshot, never the example's build:  an example's compiled output is built when needed, in `build/`
 *   (epic `people-and-orgs` P11), so a fresh checkout has none.
 */
async function solitaireSource(): Promise<SpellAppSource> {
  return source(await snapshotText("Solitaire", "Solitaire.snapshot.js"), "Solitaire")
}

/**
 * The frozen `counter-app`, as a runner runs it:  its compiled javascript, and the counter library's it imports
 * (`@spell/test/counter`), each its blessed snapshot.
 * - The import is handed over as a `blob:` URL, which the runner fetches.
 * - `editCounter`:  an edit to the counter library's, as recompiling it would make.
 */
async function counterAppSource(editCounter = (counter: string) => counter): Promise<SpellAppSource> {
  const [program, written] = await Promise.all([fixtureCompiled("counter-app"), fixtureCompiled("counter")])
  const counterUrl = URL.createObjectURL(new Blob([editCounter(written)], { type: "text/javascript" }))
  return {
    ...source(program, "counter-app"),
    importUrl: (id) => (id === COUNTER_LIBRARY ? counterUrl : `/nowhere/${id}`)
  }
}

/** The frozen counter library `counter-app` imports. */
const COUNTER_LIBRARY = "@spell/test/counter"

/** The counter's button, in `host`:  in the counter's own element, `<test-project-counter>`, its shadow root. */
function counterButton(host: HTMLElement): HTMLElement | null | undefined {
  return host.querySelector("test-project-counter")?.shadowRoot?.querySelector<HTMLElement>("ui-button.Counter")
}

/** Fixture project `name`'s compiled javascript, as text:  its blessed snapshot, `<name>.snapshot.js`. */
async function fixtureCompiled(name: string): Promise<string> {
  return fixtureText(name, `${name}.snapshot.js`)
}

/** File `file` of fixture project `name`, as text. */
async function fixtureText(name: string, file: string): Promise<string> {
  // spell's frozen test projects, beside the built-in groups:  `spaces/@spell/test/` at the repo's root
  return rawText(new URL(`../../../spaces/@spell/test/${name}/${file}`, import.meta.url).pathname)
}

/** Snapshot `file` of example `name`, tested as it is:  in `tests/spell/__examples__/<name>/`. */
async function snapshotText(name: string, file: string): Promise<string> {
  return rawText(new URL(`../../spell/__examples__/${name}/${file}`, import.meta.url).pathname)
}

/** The text of the file at `path`, as Vite serves it. */
async function rawText(path: string): Promise<string> {
  const { default: text } = (await import(/* @vite-ignore */ `${path}?raw`)) as { default: string }
  return text
}

/** What an empty foundation shows, in Solitaire's compiled javascript, and an edit of it. */
const PLACEHOLDER = 'return h("div", { part: "placeholder" },'
/** `PLACEHOLDER`, edited:  another part name. */
const EDITED_PLACEHOLDER = 'return h("div", { part: "edited" },'

/** What to run:  `program`, in memory. */
function source(program: string, name = "Counter"): SpellAppSource {
  return { name, compiledUrl: "/nowhere.spell.js", compiled: program, importUrl: (id) => `/nowhere/${id}` }
}

/** What an editor would push:  `program`, of project `@spell/test/Test`. */
function compiled(program: string): SpellCompiled {
  return { projectId: "@spell/test/Test", compiled: program }
}

/** Render a `<SpellAppRunner>` of `source` in a fresh `<div>`;  unmounted after the test. */
async function mount(source: SpellAppSource, { debug }: { debug?: "things" | "console" } = {}) {
  return (await mountSettable(source, undefined, debug)).host
}

/** Render a `<SpellAppRunner>` whose source can be changed. */
async function mountSettable(
  first: SpellAppSource,
  onControls?: (controls: SpellAppControls) => void,
  debug?: "things" | "console"
) {
  await uiReady
  const { createSignal } = await import("solid-js")
  const host = document.createElement("div")
  host.style.height = "600px"
  document.body.append(host)
  let setSource!: (source: SpellAppSource) => void
  const dispose = render(() => {
    const [current, set] = createSignal(first)
    setSource = (source) => set(() => source)
    return (
      <ui-root icons="fomantic" display="immediately">
        <SpellAppRunner
          source={current()}
          toolbar
          debug={debug}
          fluid={false}
          runtimeUrl="/test-runtime.js"
          builtInsUrl="/nowhere.scopes.js"
          onOpen={() => {}}
          onControls={onControls}
        />
      </ui-root>
    )
  }, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return { host, setSource }
}

/**
 * Render a `<VSCodeRunner>` in a fresh `<div>`, as the extension's webview does;  unmounted after the test.
 * - `posted`:  every message it sent the extension.
 */
async function mountVSCode() {
  await uiReady
  const host = document.createElement("div")
  host.style.height = "600px"
  document.body.append(host)
  const posted: FromRunnerMessage[] = []
  const dispose = render(
    () => (
      <ui-root icons="fomantic" display="immediately">
        <VSCodeRunner post={(message) => posted.push(message)} runtimeUrl="/test-runtime.js" />
      </ui-root>
    ),
    host
  )
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  return { host, posted }
}

/** Send the `<VSCodeRunner>` `message`, as the extension does. */
function tellRunner(message: ToRunnerMessage) {
  window.dispatchEvent(new MessageEvent("message", { data: message }))
}

/** Add `<spell-viewer>` markup `html` to the page;  removed after the test. */
async function mountApp(html: string): Promise<DOMSpellViewerElement> {
  await uiReady
  await import("spell-app/app/components/spell-viewer")
  const holder = document.createElement("div")
  holder.innerHTML = html
  const app = holder.firstElementChild as DOMSpellViewerElement
  document.body.append(app)
  cleanups.push(() => app.remove())
  await ElementFixture.settle(app)
  return app
}

/** Text of the Thing Explorer's property `name`, in the details. */
function valueOf(host: ParentNode, name: string): string | undefined {
  const rows = [...host.querySelectorAll<HTMLTableRowElement>(".ThingDetails .ThingValues tr")]
  return (
    rows.find((row) => row.querySelector("th")?.textContent === name)?.querySelector("td")?.textContent ?? undefined
  )
}

/**
 * `check()`'s answer once it's truthy -- flushing Solid and letting tasks run between tries.
 * - Fails after `timeout` msec.
 */
async function waitFor<T>(check: () => T, timeout = 5000): Promise<NonNullable<T>> {
  const until = Date.now() + timeout
  for (;;) {
    flush()
    const value = check()
    if (value && !(value instanceof NodeList && value.length === 0)) return value as NonNullable<T>
    if (Date.now() > until) throw new Error(`timed out waiting for ${check}`)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
