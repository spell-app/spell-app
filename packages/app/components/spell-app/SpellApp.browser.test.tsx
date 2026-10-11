import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SpellCompiled } from "$/app/runner/runner.types"
import type { DOMSpellAppElement } from "$/app/components/spell-app"
import type { P } from "$/parser"
import type { SP } from "$/spell"

/**
 * `<spell-app>` as a root (`UIRoot`), on a page with nothing else of Spell UI.
 * - NO `loadUI.ts` here:
 *   every `<ui-*>` the runner draws is defined by the element itself, the first time it appears.
 * - The runtime and the shadow styles are stubbed, as in `runner.browser.test.tsx`.
 */
vi.mock("$/app/runner/loadRuntime", async (importOriginal) => {
  const original = await importOriginal<typeof import("$/app/runner/loadRuntime")>()
  return { ...original, loadRuntime: testRuntime }
})
vi.mock("$/app/runner/shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("$/app/runner/shadowStyles")>()
  return { ...original, adoptShadowStyles: async () => {} }
})

/** A program with an app:  a button. */
const PROGRAM = `
import { App, h } from "@spell/core"
export class Shown extends App {
  draw() { return h("button", { class: "shown" }, "Shown") }
}
export let shown = new Shown()
shown.start()
`

/** A program with two named tiles, drawable, and an app whose own drawing a layout replaces. */
const TILES = `
import { spellCore, App, Drawable, h } from "@spell/core"
export class Tile extends Drawable {
  static elementTag = spellCore.defineElement(this, "Layout")
  get name() { return this.getProp('name') }
  set name(value) { this.setProp('name', value) }
  draw() { return h("b", { class: "tile" }, () => this.name) }
}
export class Board extends App {
  draw() { return h("p", { class: "own-drawing" }, "its own") }
}
export let t1 = new Tile()
t1.name = "T1"
export let t2 = new Tile()
t2.name = "T2"
export let board = new Board()
board.start()
`

describe("<spell-app>, a root", () => {
  test("loads the Spell UI widgets its runner draws, on demand:  none before", async () => {
    expect(customElements.get("ui-menu")).toBeUndefined()
    const app = await mountApp(`<spell-app toolbar></spell-app>`)
    app.run({ projectId: "@test:fixtures:Test", compiled: PROGRAM } satisfies SpellCompiled)
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.shown"))
    await customElements.whenDefined("ui-menu")
    await waitFor(() => root.querySelector(".SpellAppToolbar")?.matches(":defined"))
    // its own settings, as a root:  Fomantic's icon names inside it
    expect(app.icons).toBe("fomantic")
  })

  test("loads a spell tag inside it from beside its script:  `<spell-editor>` => `spell-editor.js`", async () => {
    const app = await mountApp(`<spell-app><spell-nothing-here></spell-nothing-here></spell-app>`)
    const failed = await new Promise<{ tag: string; reason: string }[]>((resolve) =>
      app.addEventListener("ui-ready", (event) => resolve((event as CustomEvent).detail.failed), { once: true })
    )
    // in dev the script beside it is its source folder's, where no such file is:  tried, and failed
    expect(failed.map(({ tag, reason }) => `${tag} ${reason}`)).toEqual(["spell-nothing-here failed"])
  })
})

describe("<spell-app> laid out in markup (epic `drawable-thing` P9)", () => {
  test("its markup is the app's drawing, not its `to draw`;  each tag is the program's thing named by its id", async () => {
    const app = await mountApp(
      `<spell-app><div class="row">` +
        `<layout-tile id="T1"></layout-tile><layout-tile id="T2"></layout-tile><layout-tile id="T9"></layout-tile>` +
        `</div></spell-app>`
    )
    app.run({ projectId: "@test:fixtures:Tiles", compiled: TILES } satisfies SpellCompiled)
    const tile = (id: string) => app.querySelector(`layout-tile#${id}`)!.shadowRoot?.textContent
    await waitFor(() => tile("T1") === "T1")
    expect(tile("T2")).toBe("T2")
    expect(tile("T9")).toBe('⚠ no Tile named "T9"')
    // shown through the runner's slot;  the app's own drawing isn't drawn
    expect(app.querySelector(".row")!.assignedSlot).not.toBeNull()
    expect(app.shadowRoot!.querySelector(".own-drawing")).toBeNull()
  })
})

describe("<spell-app>'s layout:  the spell in its markup (P9, Q11, Q12, Q18)", () => {
  /** A game with a score, a function that bumps it, and one drawable tile, as a project compiles them. */
  const GAME = [
    "a tile is a drawable thing",
    "a tile has a name as text",
    "a tile has a count as a number",
    "a game is an app",
    "a game has a score as a number",
    "set the game to a new game",
    "set the score of the game to 3",
    "to bump the score",
    "\tset the score of the game to the score of the game + 1",
    'set the first-tile to a new tile with name = "T1", count = 2',
    "to draw a tile",
    '\treturn <b className="tile">{its name}</b>',
    "to draw a game",
    '\treturn <p className="own-drawing">its own</p>',
    "start the game"
  ].join("\n")

  test("holes show the program's values, live;  an action runs on a click;  a <spell> block handles its element's", async () => {
    const app = await mountApp(
      `<spell-app>` +
        `<p class="score">Score {the score of the game}</p>` +
        `<button class="bump" action="{bump the score}">Bump</button>` +
        `<test-project-tile id="T1"><spell>\n  when clicked\n    set its count to its count + 1\n</spell></test-project-tile>` +
        `<p class="count">{the count of T1} left</p>` +
        `</spell-app>`
    )
    app.run({ projectId: "@test:fixtures:Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
    const text = (selector: string) => app.querySelector(selector)?.textContent
    await waitFor(() => text(".score") === "Score 3", 10_000)
    expect(text(".count")).toBe("2 left")
    expect(app.querySelector<HTMLElement>("spell")!.hidden).toBe(true)

    app.querySelector<HTMLElement>(".bump")!.click()
    await waitFor(() => text(".score") === "Score 4")

    app.querySelector<HTMLElement>("test-project-tile")!.click()
    await waitFor(() => text(".count") === "3 left")
    // its `to draw` isn't drawn:  the markup is its drawing
    expect(app.shadowRoot!.querySelector(".own-drawing")).toBeNull()
  })

  test("spell that doesn't read shows ⚠ where it was -- a hole that leaves out `the` too (J26)", async () => {
    const app = await mountApp(
      `<spell-app><p class="bad">{no such thing at all}</p><p class="short">{score of the game}</p></spell-app>`
    )
    app.run({ projectId: "@test:fixtures:Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
    await waitFor(() => app.querySelector(".bad")?.textContent === "⚠", 10_000)
    expect(app.querySelector(".short")?.textContent).toBe("⚠")
  })
})

/**
 * Spell project `text`, one file, compiled as a project is:  its javascript, and its declarations.
 * - Spell imported only now:  imported with the file, it loads before `<spell-app>`'s own setup has run.
 */
async function compiledProject(text: string): Promise<{ compiled: string; declarations: SP.SpellDeclarationsData }> {
  const [{ P }, { SP }] = await Promise.all([import("$/parser"), import("$/spell")])
  const parentScope = SP.SpellParser.rootScope
  const scope = new P.ProjectScope({
    name: "test-project",
    path: "/test-project",
    parser: parentScope.parser!.clone({ module: "/test-project" }),
    parentScope
  })
  scope.parser!.stubDeclaredTypes(scope, [text])
  const match = new P.FileScope({ name: "/Main.spell", path: "/Main.spell", parentScope: scope }).parse(text, "block")!
  const marked = SP.SpellProject.combineCompiled(
    [match.AST as P.ASTStatementGroup],
    undefined,
    SP.SpellProject.importHeaderFor(scope),
    scope
  )
  const { code, declarations } = SP.SpellDeclarations.split(marked, scope)
  return { compiled: code, declarations }
}

////////////////
// ## Helpers
////////////////

/** Cleanups to run after each test. */
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

/** The runtime, as `loadRuntime()` would hand it over:  `spellRuntime.ts` as vite serves it. */
async function testRuntime() {
  const url = new URL("/src/runner/spellRuntime.ts", location.href).href
  const runtime = (await import(/* @vite-ignore */ url)) as typeof import("$/app/runner/spellRuntime")
  return { runtime, coreUrl: url, release: () => {} }
}

/** Add `<spell-app>` markup `html` to the page;  removed after the test. */
async function mountApp(html: string): Promise<DOMSpellAppElement> {
  await import("$/app/components/spell-app")
  const holder = document.createElement("div")
  holder.innerHTML = html
  const app = holder.firstElementChild as DOMSpellAppElement
  document.body.append(app)
  cleanups.push(() => app.remove())
  await ElementFixture.settle(app)
  return app
}

/** `check()`'s answer once it's truthy, flushing Solid and letting tasks run between tries;  fails after 5s. */
async function waitFor<T>(check: () => T, timeout = 5000): Promise<NonNullable<T>> {
  const start = performance.now()
  for (;;) {
    flush()
    const value = check()
    if (value) return value
    if (performance.now() - start > timeout) throw new Error(`waitFor() timed out:  ${check}`)
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}
