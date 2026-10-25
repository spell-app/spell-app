import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"

import { ElementFixture } from "spell/test-helpers/ElementFixture"
import type { SpellCompiled } from "spell-app/app/runner/runner.types"
import type { DOMSpellViewerElement } from "spell-app/app/components/spell-viewer"
import type { P } from "spell-parser/parser"
import type { SP } from "spell-parser/spell"

/**
 * `<spell-viewer>` as a root (`UIRoot`), on a page with nothing else of Spell UI.
 * - NO `loadUI.ts` here:
 *   every `<ui-*>` the runner draws is defined by the element itself, the first time it appears.
 * - The runtime and the shadow styles are stubbed, as in `runner.browser.test.tsx`.
 */
vi.mock("spell-app/app/runner/loadRuntime", async (importOriginal) => {
  const original = await importOriginal<typeof import("spell-app/app/runner/loadRuntime")>()
  return { ...original, loadRuntime: testRuntime }
})
vi.mock("spell-app/app/runner/shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("spell-app/app/runner/shadowStyles")>()
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

/** A program with two named tiles, both views, and an app whose own drawing a layout replaces. */
const TILES = `
import { core, App, View, h } from "@spell/core"
export class Tile extends View {
  static elementTag = core.defineElement(this, "Layout")
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

describe("<spell-viewer>, a root", () => {
  test("loads the Spell UI widgets its runner draws, on demand:  none before", async () => {
    expect(customElements.get("ui-menu")).toBeUndefined()
    const app = await mountApp(`<spell-viewer toolbar></spell-viewer>`)
    app.run({ projectId: "@spell/test/Test", compiled: PROGRAM } satisfies SpellCompiled)
    const root = app.shadowRoot!
    await waitFor(() => root.querySelector("button.shown"))
    await customElements.whenDefined("ui-menu")
    await waitFor(() => root.querySelector(".SpellAppToolbar")?.matches(":defined"))
    // its own settings, as a root:  Fomantic's icon names inside it
    expect(app.icons).toBe("fomantic")
  })

  test("loads a spell tag inside it from beside its script:  `<spell-editor>` => `spell-editor.js`", async () => {
    const app = await mountApp(`<spell-viewer><spell-nothing-here></spell-nothing-here></spell-viewer>`)
    const failed = await new Promise<{ tag: string; reason: string }[]>((resolve) =>
      app.addEventListener("ui-ready", (event) => resolve((event as CustomEvent).detail.failed), { once: true })
    )
    // in dev the script beside it is its source folder's, where no such file is:  tried, and failed
    expect(failed.map(({ tag, reason }) => `${tag} ${reason}`)).toEqual(["spell-nothing-here failed"])
  })
})

describe("<spell-viewer> laid out in markup (epic `drawable-thing` P9)", () => {
  test("its markup is the app's drawing, not its `to draw`;  each tag is the program's thing named by its id", async () => {
    const app = await mountApp(
      `<spell-viewer><div class="row">` +
        `<layout-tile id="T1"></layout-tile><layout-tile id="T2"></layout-tile><layout-tile id="T9"></layout-tile>` +
        `</div></spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Tiles", compiled: TILES } satisfies SpellCompiled)
    const tile = (id: string) => app.querySelector(`layout-tile#${id}`)!.shadowRoot?.textContent
    await waitFor(() => tile("T1") === "T1")
    expect(tile("T2")).toBe("T2")
    expect(tile("T9")).toBe('⚠ no Tile named "T9"')
    // shown through the runner's slot;  the app's own drawing isn't drawn
    expect(app.querySelector(".row")!.assignedSlot).not.toBeNull()
    expect(app.shadowRoot!.querySelector(".own-drawing")).toBeNull()
  })
})

describe("<spell-viewer>'s layout:  a tag's id is its thing's reference (P18, J43)", () => {
  /** Two piles, a sub-type's:  a tableau is a pile.  The project's word "drawable" stays out of its tags. */
  const PILES = `
import { core, App, View, h } from "@spell/core"
export class Pile extends View {
  static elementTag = core.defineElement(this, "Drawable Floor")
  get name() { return this.getProp('name') }
  set name(value) { this.setProp('name', value) }
  draw() { return h("b", {}, () => this.name) }
}
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "Drawable Floor")
}
export class Board extends App {
  draw() { return h("p", {}, "its own") }
}
export let t1 = new Tableau()
t1.name = "T1"
export let t2 = new Tableau()
t2.name = "T2"
export let board = new Board()
board.start()
`

  test("<floor-tableau id=T1>, id=1 and <floor-pile id=T1> each find tableau T1, as Tableau#T1, Tableau#1 and Pile#T1 do", async () => {
    const app = await mountApp(
      `<spell-viewer>` +
        `<floor-tableau id="T1"></floor-tableau>` +
        `<floor-tableau id="1"></floor-tableau>` +
        `<floor-pile id="T1"></floor-pile>` +
        `<floor-pile id="T2"></floor-pile>` +
        `<floor-tableau id="9"></floor-tableau>` +
        `</spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Floor", compiled: PILES } satisfies SpellCompiled)
    const drawn = () => [...app.children].map((tag) => tag.shadowRoot?.textContent)
    await waitFor(() => drawn()[0] === "T1")
    expect(drawn()).toEqual(["T1", "T1", "T1", "T2", '⚠ no Tableau named "9"'])
  })
})

describe("<spell-viewer>'s layout:  the spell in its markup (P9, Q11, Q12, Q18)", () => {
  /** A game with a score, a function that bumps it, and one tile that's a view, as a project compiles them. */
  const GAME = [
    "a tile is a view",
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
      `<spell-viewer>` +
        `<p class="score">Score {the score of the game}</p>` +
        `<button class="bump" action="{bump the score}">Bump</button>` +
        `<test-project-tile id="T1"><spell>\n  when clicked\n    set its count to its count + 1\n</spell></test-project-tile>` +
        `<p class="count">{the count of T1} left</p>` +
        `</spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
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

  test("a hole names one thing by its name or place:  {the count of tile T1}, {the count of the first tile} (P19)", async () => {
    const app = await mountApp(
      `<spell-viewer>` +
        `<test-project-tile id="T1"><spell>\n  when clicked\n    set its count to its count + 1\n</spell></test-project-tile>` +
        `<p class="named">{the count of tile T1}</p>` +
        `<p class="placed">{the name of the first tile}:  {the count of the last tile}</p>` +
        `</spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
    const text = (selector: string) => app.querySelector(selector)?.textContent
    // its count:  2 as made, or more, kept from an earlier test's run of the same program (P16)
    const count = Number(await waitFor(() => /^\d+$/.exec(text(".named") ?? "")?.[0], 10_000))
    expect(count).toBeGreaterThanOrEqual(2)
    expect(text(".placed")).toBe(`T1:  ${count}`)

    app.querySelector<HTMLElement>("test-project-tile")!.click()
    await waitFor(() => text(".named") === `${count + 1}`)
    expect(text(".placed")).toBe(`T1:  ${count + 1}`)
  })

  test("any element handles events (P12):  a one-line handler, `on`, several words, and on-click= / when-clicked=", async () => {
    const app = await mountApp(
      `<spell-viewer>` +
        `<p class="score">Score {the score of the game}</p>` +
        `<button class="one-line"><spell>when clicked: bump the score</spell></button>` +
        `<div class="on-words"><spell>\n  on double click:\n    bump the score\n</spell></div>` +
        `<button class="on-click" on-click="{bump the score}">+1</button>` +
        // no quotes:  the browser splits it at its spaces, and the layout puts it back together (C15)
        `<button class="bare" when-clicked={bump the score}>+1</button>` +
        `</spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
    const score = () => app.querySelector(".score")?.textContent
    await waitFor(() => score() === "Score 3", 10_000)

    app.querySelector<HTMLElement>(".one-line")!.click()
    await waitFor(() => score() === "Score 4")
    app.querySelector(".on-words")!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))
    await waitFor(() => score() === "Score 5")
    app.querySelector<HTMLElement>(".on-click")!.click()
    await waitFor(() => score() === "Score 6")
    app.querySelector<HTMLElement>(".bare")!.click()
    await waitFor(() => score() === "Score 7")
    // the handler's attributes are taken off while it listens
    expect(app.querySelector(".bare")!.getAttributeNames()).toEqual(["class"])
  })

  test("a <spell> block's handlers:  one line or several, `when` or `on`, an event in several words", async () => {
    const { LayoutSpell } = await import("spell-app/app/runner/LayoutSpell")
    expect(LayoutSpell.handlersIn("when clicked: play a song\non drag: play another song")).toEqual([
      { event: "clicked", body: "play a song" },
      { event: "drag", body: "play another song" }
    ])
    expect(LayoutSpell.handlersIn("when double clicked\n  bump the score")).toEqual([
      { event: "double-clicked", body: "bump the score" }
    ])
    expect(LayoutSpell.domEventFor("double-clicked")).toBe("dblclick")
    expect(LayoutSpell.domEventFor("dragged")).toBe("drag")
    expect(LayoutSpell.domEventFor("keydown")).toBe("keydown")
    expect(LayoutSpell.eventOfAttribute("when-double-clicked")).toBe("double-clicked")
    expect(LayoutSpell.eventOfAttribute("on-click")).toBe("click")
    expect(LayoutSpell.eventOfAttribute("one-click")).toBeUndefined()
  })

  test("a <spell> block's handlers are read by spell's own `on` rule:  Spanish's `al` and `cuando` too", async () => {
    const { LayoutSpell } = await import("spell-app/app/runner/LayoutSpell")
    expect(LayoutSpell.handlersIn("al carta elegida: imprimir 1\ncuando clic en carta\n  imprimir 2")).toEqual([
      { event: "carta-elegida", body: "imprimir 1" },
      { event: "clic-en-carta", body: "imprimir 2" }
    ])
    expect(LayoutSpell.handlersIn("When Clicked: play")).toEqual([{ event: "clicked", body: "play" }])
    expect(LayoutSpell.handlersIn("play a song")[0]!.error).toBeDefined()
  })

  test("a tag written by hand says which named place it goes in with `in=`, as in a drawing (Q21 B, J35)", async () => {
    const PILES = [
      "a tile is a view",
      "a pile is a viewable list of tiles",
      "to draw a pile",
      '\treturn <div className="frame"><children name="header"/><children/></div>',
      "set the first-pile to a new pile",
      "a board is an app",
      "set the board to a new board",
      "start the board"
    ].join("\n")
    const app = await mountApp(
      `<spell-viewer><test-project-pile><h3 class="title" in="header">Stock</h3><p class="body">cards</p></test-project-pile></spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Piles", ...(await compiledProject(PILES)) } satisfies SpellCompiled)
    const title = app.querySelector(".title")!
    await waitFor(() => title.getAttribute("slot") === "header", 10_000)
    await waitFor(() => title.assignedSlot?.name === "header")
    expect(app.querySelector(".body")!.assignedSlot?.name).toBe("")
  })

  test("spell that doesn't read shows ⚠ where it was -- a hole that leaves out `the` too (J26)", async () => {
    const app = await mountApp(
      `<spell-viewer><p class="bad">{no such thing at all}</p><p class="short">{score of the game}</p></spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Game", ...(await compiledProject(GAME)) } satisfies SpellCompiled)
    await waitFor(() => app.querySelector(".bad")?.textContent === "⚠", 10_000)
    expect(app.querySelector(".short")?.textContent).toBe("⚠")
  })
})

describe("<markdown> blocks:  drawn by <ui-markdown>, their holes live (P14, Q22, Q23, Q24)", () => {
  /** A game with a score, a function that bumps it, and a rules panel in its drawing. */
  const RULES = [
    "a game is an app",
    "a game has a score as a number",
    "set the game to a new game",
    "set the score of the game to 3",
    "to bump the score",
    "\tset the score of the game to the score of the game + 1",
    "to draw a game",
    '\treturn <div className="rules">',
    '\t\t<button className="bump" onClick={bump the score}>Bump</button>',
    "\t\t<markdown>",
    "\t\t\t## Klondike",
    "\t\t\tBuild each pile **down**.  Score:  **{the score of the game}**",
    "\t\t</markdown>",
    "\t</div>",
    "start the game"
  ].join("\n")

  /** The markdown `<ui-markdown>` drew, in `root`. */
  const articleIn = (root: ParentNode | null | undefined) =>
    root?.querySelector("ui-markdown")?.shadowRoot?.querySelector("article")
  /** The text of each bold bit in `article`. */
  const boldIn = (article: Element | null | undefined) =>
    [...(article?.querySelectorAll("strong") ?? [])].map((bold) => bold.textContent)

  test("a drawn rules panel shows the heading and the bold text;  a hole follows its value", async () => {
    const app = await mountApp(`<spell-viewer></spell-viewer>`)
    app.run({ projectId: "@spell/test/Rules", ...(await compiledProject(RULES)) } satisfies SpellCompiled)
    const article = () => articleIn(app.shadowRoot!.querySelector(".rules"))
    await waitFor(() => article()?.querySelector("h2")?.textContent === "Klondike", 10_000)
    expect(boldIn(article())).toEqual(["down", "3"])

    app.shadowRoot!.querySelector<HTMLElement>(".bump")!.click()
    await waitFor(() => boldIn(article())[1] === "4")
  })

  test("in a layout:  drawn by <ui-markdown> too, its holes live", async () => {
    const app = await mountApp(
      `<spell-viewer>` +
        `<markdown>\n  ## Rules\n  Score:  **{the score of the game}**, and \`{code}\` keeps its braces\n</markdown>` +
        `<button class="bump" action="{bump the score}">Bump</button>` +
        `</spell-viewer>`
    )
    app.run({ projectId: "@spell/test/Rules", ...(await compiledProject(RULES)) } satisfies SpellCompiled)
    const article = () => articleIn(app)
    await waitFor(() => article()?.querySelector("h2")?.textContent === "Rules", 10_000)
    expect(boldIn(article())).toEqual(["3"])
    expect(article()!.querySelector("code")!.textContent).toBe("{code}")
    expect(app.querySelector("markdown")).toBeNull()

    app.querySelector<HTMLElement>(".bump")!.click()
    await waitFor(() => boldIn(article())[0] === "4")
  })
})

/**
 * Spell project `text`, one file, compiled as a project is:  its javascript, and its declarations.
 * - Spell imported only now:  imported with the file, it loads before `<spell-viewer>`'s own setup has run.
 */
async function compiledProject(text: string): Promise<{ compiled: string; declarations: SP.SpellDeclarationsData }> {
  const [{ P }, { SP }] = await Promise.all([import("spell-parser/parser"), import("spell-parser/spell")])
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
  const url = new URL("/src/app/runner/spellRuntime.ts", location.href).href
  const runtime = (await import(/* @vite-ignore */ url)) as typeof import("spell-app/app/runner/spellRuntime")
  return { runtime, coreUrl: url, release: () => {} }
}

/** Add `<spell-viewer>` markup `html` to the page;  removed after the test. */
async function mountApp(html: string): Promise<DOMSpellViewerElement> {
  await import("spell-app/app/components/spell-viewer")
  const holder = document.createElement("div")
  holder.innerHTML = html
  const app = holder.firstElementChild as DOMSpellViewerElement
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
