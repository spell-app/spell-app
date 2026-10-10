import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SpellCompiled } from "$/app/runner/runner.types"
import { uiReady } from "$/app/solid/loadUI"
import { SpellAppRunner, type SpellAppControls, type SpellAppSource } from "./SpellAppRunner"
import { RunnerSplit } from "./RunnerSplit"
import type { DOMSpellAppElement } from "$/app/components/spell-app"

/**
 * The Solid runners, in the browser:  `<SpellAppRunner>` running compiled spell into its app root, live, and the
 * `<spell-app>` element around it.
 * - The runtime:  `spellRuntime.ts` as vite serves it, imported by its URL --
 *   ALSO the program's `@spell/core`, so the program and the runner share its `spellCore`,
 *   as with a real `spell-runtime.js` copy.
 *   `loadRuntime()`'s `blob:` copy can't load in dev:
 *   vite's imports are root-relative, which a `blob:` URL can't resolve.
 * - The program draws with Solid (`spellCore.element()`), into the runner's app root:
 *   as compiled spell writes it, a value that can change is a function (`() => this.count`).
 * - `adoptShadowStyles()` is stubbed:  the test server doesn't serve `static/` (Semantic UI, Lato).
 */
vi.mock("./loadRuntime", async (importOriginal) => {
  const original = await importOriginal<typeof import("./loadRuntime")>()
  return { ...original, loadRuntime: testRuntime }
})
vi.mock("./shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("./shadowStyles")>()
  return { ...original, adoptShadowStyles: async () => {} }
})

/** A program with an app:  a counter, drawn as a button that counts its clicks.  It logs as it starts. */
const COUNTER = `
import { spellCore, Thing, App } from "@spell/core"
export class Counter extends App {
  get count() { return this.getProp('count') }
  set count(value) { this.setProp('count', value) }
  draw() {
    return spellCore.element({
      tag: "button",
      props: { className: "count", onClick: (event) => { this.count = this.count + 1 } },
      children: ["Count: ", () => this.count]
    })
  }
}
export let counter = new Counter()
counter.count = 1
spellCore.console.log("started")
counter.start()
`

/** A program with no app:  it only prints. */
const PRINTER = `
import { spellCore } from "@spell/core"
spellCore.console.log("hello from a program")
`

/** A program that starts its app LATER, from a timer -- after the run has finished. */
const LATE = `
import { spellCore, App } from "@spell/core"
export class Late extends App {
  draw() { return spellCore.element({ tag: "p", props: { className: "late" }, children: ["late!"] }) }
}
export let late = new Late()
setTimeout(() => late.start(), 50)
`

/**
 * A card game, as compiled spell draws it:  a card's `draw()` chooses its face by an `if` (read OUTSIDE its live
 * values), its rank is a live value, the pile draws its cards with `drawItems()`, and one card can't draw.
 * - React spellings (`className`, `colSpan`), as spell programs write them.
 */
const CARDS = `
import { spellCore, Thing, List, App } from "@spell/core"
export class Card extends Thing {
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }
  get is_face_down() { return this.getProp('is_face_down') }
  set is_face_down(value) { this.setProp('is_face_down', value) }
  draw() {
    if (this.is_face_down) return spellCore.element({ tag: "div", props: { className: "card back" } })
    return spellCore.element({ tag: "div", props: { className: () => "card " + this.rank }, children: [() => this.rank] })
  }
}
export class Joker extends Card {
  draw() { throw new Error("no face") }
}
export class Pile extends List {}
export class Game extends App {
  draw() {
    return spellCore.element({ tag: "table", children: [
      spellCore.element({ tag: "tr", children: [
        spellCore.element({ tag: "td", props: { colSpan: "2", className: "pile" }, children: [() => spellCore.drawThing(this.pile)] })
      ] })
    ] })
  }
}
export let ace = new Card({ rank: "A" })
export let king = new Card({ rank: "K", is_face_down: true })
export let joker = new Joker({ rank: "J" })
export let game = new Game()
game.pile = new Pile()
game.pile.add(ace, king, joker)
game.start()
globalThis.cardGame = { ace, king, game, Card }
`

/** What `CARDS` leaves on `globalThis`, for a test to play with. */
type CardGame = {
  ace: { rank: string; is_face_down: boolean }
  king: { rank: string; is_face_down: boolean }
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

    king.is_face_down = false
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
    await mount(source(`import { spellCore } from "@spell/core"\nspellCore.notify("hello from spell")`, "Notifier"))
    const toast = await waitFor(() =>
      [...document.querySelectorAll("ui-toast")].find((it) => it.getAttribute("message") === "hello from spell")
    )
    cleanups.push(() => toast.remove())
  })

  test("the `Todos - Form Based` example:  a form bound to the app, a row per task, Add Task adds one", async () => {
    const host = await mount(source(await todosExample(), "Todos"))
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

  test("`Todos - Form Based`:  ticking a task shows in the debug JSON;  Active / Completed show only those tasks", async () => {
    const host = await mount(source(await todosExample(), "Todos"))
    const titles = () =>
      [...host.querySelectorAll<HTMLElement & { value: string }>("ui-repeat ui-input[name=title]")].map(
        (input) => input.value
      )
    const debugJSON = () => JSON.parse(host.querySelector("ui-form")!.shadowRoot!.querySelector("pre")!.textContent!)
    const menuItem = (text: string) =>
      [...host.querySelectorAll<HTMLElement>("ui-item")].find((item) => item.textContent === text)!
    await waitFor(() => titles().length === 3)
    // each object says its class;  a list shows its items (it was `"tasks": {}`)
    expect(debugJSON()["@type"]).toBe("Todos_App")
    expect(debugJSON().tasks).toEqual({
      "@type": "Task_List",
      items: [
        { "@type": "Task", title: "Create todos app", completed: true },
        { "@type": "Task", title: "Teach it to draw", completed: false },
        { "@type": "Task", title: "Test app", completed: false }
      ]
    })

    // a real click, on the checkbox as the person sees it
    await userEvent.click(host.querySelectorAll("ui-repeat ui-checkbox")[1]!)
    await waitFor(() => debugJSON().tasks.items[1].completed === true)

    menuItem("Active").click()
    // a row coming back is a new one:  its controls are bound as it joins the form
    await waitFor(() => titles().join() === "Test app")
    menuItem("Completed").click()
    await waitFor(() => titles().join() === "Create todos app,Teach it to draw")

    // a change from outside the form shows in the JSON too
    menuItem("Change name").click()
    await waitFor(() => debugJSON().tasks.items[0].title === "New title")
    menuItem("All").click()
    await waitFor(() => titles().length === 3)
  })

  test("React's spellings become the page's:  `className` => `class`, `colSpan` => `colspan`", async () => {
    const host = await mount(source(CARDS, "Game"))
    const cell = await waitFor(() => host.querySelector<HTMLTableCellElement>("td.pile"))
    expect(cell.getAttribute("colspan")).toBe("2")
    expect(cell.hasAttribute("classname")).toBe(false)
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

describe("<spell-app>", () => {
  test("defined once;  `width` / `height` set its inline size", async () => {
    await import("$/app/components/spell-app")
    expect(customElements.get("spell-app")).toBeDefined()
    const app = await mountApp(`<spell-app width="300px" height="200px"></spell-app>`)
    expect(app.style.width).toBe("300px")
    expect(app.style.height).toBe("200px")
    app.setAttribute("width", "fluid")
    flush()
    await ElementFixture.tick()
    expect(app.style.width).toBe("")
  })

  test("nothing to run:  says so -- or that it waits for its editor", async () => {
    const app = await mountApp(`<spell-app></spell-app>`)
    expect(app.shadowRoot!.querySelector(".SpellAppError")!.textContent).toBe(
      "Give <spell-app> a project or src to run."
    )
    app.setAttribute("editor", "#ed")
    flush()
    expect(app.shadowRoot!.querySelector(".SpellAppError")!.textContent).toBe(
      "Waiting for its editor, #ed, to compile…"
    )
  })

  test("runs code pushed to it, in its shadow root, inside a `<ui-root icons=fomantic>`", async () => {
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
    app.run(compiled(COUNTER))
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.count"))
    expect(root.querySelector("ui-root")!.getAttribute("icons")).toBe("fomantic")
    expect(root.querySelector(".SpellAppToolbar ui-item[type=header]")!.textContent).toBe("Test")
  })

  test("an editor's compile runs, from `editor`;  a change of what to run drops it", async () => {
    const editor = document.createElement("div")
    editor.id = "ed"
    document.body.append(editor)
    cleanups.push(() => editor.remove())
    const app = await mountApp(`<spell-app editor="#ed" toolbar></spell-app>`)
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
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
    app.run(compiled(COUNTER))
    const root = app.shadowRoot!
    ;(await waitFor(() => root.querySelector<HTMLButtonElement>("button.count"))).click()
    await waitFor(() => root.querySelector("button.count")?.textContent === "Count: 2")
    app.restart()
    await waitFor(() => root.querySelector("button.count")?.textContent === "Count: 1")
  })

  test("a move in one go keeps the app;  leaving the page lets go of it, a microtask later", async () => {
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
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
    const app = await mountApp(`<spell-app></spell-app>`)
    expect(app.component!.elementDefinition.event("spell-open")).toBe("spell-open")
  })
})

////////////////
// ## Helpers
////////////////

/** The runtime, as `loadRuntime()` would hand it over -- see the file's docs. */
async function testRuntime() {
  const url = new URL("/src/runner/spellRuntime.ts", location.href).href
  const runtime = (await import(/* @vite-ignore */ url)) as typeof import("./spellRuntime")
  return { runtime, coreUrl: url, release: () => {} }
}

/** The `Todos - Form Based` example's committed compiled javascript, as text:  Vite serves a file by its path. */
async function todosExample(): Promise<string> {
  const file = new URL(
    "../../../spell/projects/system/examples/Todos - Form Based/Todos - Form Based.compiled.js",
    import.meta.url
  ).pathname
  const { default: compiled } = (await import(/* @vite-ignore */ `${file}?raw`)) as { default: string }
  return compiled
}

/** What to run:  `program`, in memory. */
function source(program: string, name = "Counter"): SpellAppSource {
  return { name, compiledUrl: "/nowhere.compiled.js", compiled: program, importUrl: (id) => `/nowhere/${id}` }
}

/** What an editor would push:  `program`, of project `@test:fixtures:Test`. */
function compiled(program: string): SpellCompiled {
  return { projectId: "@test:fixtures:Test", compiled: program }
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

/** Add `<spell-app>` markup `html` to the page;  removed after the test. */
async function mountApp(html: string): Promise<DOMSpellAppElement> {
  await uiReady
  await import("$/app/components/spell-app")
  const holder = document.createElement("div")
  holder.innerHTML = html
  const app = holder.firstElementChild as DOMSpellAppElement
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
