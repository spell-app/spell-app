import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SpellCompiled } from "$/app/runner/runner.types"
import { uiReady } from "$/app/solid/loadUI"
import { SpellAppRunner, type SpellAppControls, type SpellAppSource } from "./SpellAppRunner"
import { RunnerSplit } from "./RunnerSplit"
import type { DOMSpellAppElement } from "$/app/components/spell-app"

/**
 * The Solid runners, in the browser:
 * `<SpellAppRunner>` running compiled spell into its app root, live, and the `<spell-app>` element around it.
 * - The runtime:  `spellRuntime.ts` as vite serves it, imported by its URL --
 *   ALSO the program's `@spell/core`, so the program and the runner share its `spellCore`,
 *   as with a real `spell-runtime.js` copy.
 *   `loadRuntime()`'s `blob:` copy can't load in dev:
 *   vite's imports are root-relative, which a `blob:` URL can't resolve.
 * - The program draws with React, into the runner's app root.
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
      children: ["Count: ", this.count]
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

  test("runs code pushed to it, in its shadow root;  a root itself, with Fomantic's icon names", async () => {
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
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
