/// <reference types="node" />

/**
 * `yarn test:hmr`:  hot module replacement end to end.  Starts the Vite dev server (`DevServer`, the package's
 * `vite.config.ts`), opens `tools/demo/hmr.html` in headless chromium, then edits REAL source files on disk and
 * checks what the page does.
 * - Scenarios, in order (the full reloads last):
 *   1. component code (`UIButton.tsx`):  every `<ui-button>` AND `<ie-boton>` re-renders in place
 *   2. component code (`UIDropdown.tsx`):  the dropdown keeps its `options` / `value` PROPERTIES
 *   3. component CSS (`UIButton.css`):  new rules apply, shadow DOM nodes keep their identity (no re-render)
 *   4. vocabulary, same attributes (the `or` text):  hot, new text shown
 *   5. a render that throws:  fallback + `:state(errored)`, other elements unaffected;  the fix recovers
 *   6. a syntax error:  the page keeps the old code;  the fix recovers
 *   7. vocabulary, NEW attribute:  "observed attributes changed, full reload"
 *   8. shared code (`UIComponent.tsx`):  full reload
 * - A reload is detected by a window marker the test sets:  gone => the page reloaded.
 * - EVERY edited file is restored after its scenario and again in `after()`, then checked with `git diff --quiet`
 *   (`SourceFiles`).
 * - `node:test` / `node:assert`, NOT `vite-plus/test` (WWOD §20 › "Test APIs come from Vite+"), on purpose:
 *   `yarn test:hmr` runs this FILE with `tsx`, and node runs a `node:test` suite as a plain script.  Vitest's
 *   `describe()` only works inside its own runner, whose projects (`vitest.config.ts`) are the `browser` and `ssr`
 *   ones;  this test owns its dev server, its browser and real edits to source files, which no project should run
 *   alongside other tests (epic `wwod-spell-ui`, P9).
 */

import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { after, before, describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import { chromium, type Browser, type Page } from "playwright"

import { DevServer } from "./DevServer.ts"

void describe("hot module replacement (Vite dev, tools/demo/hmr.html)", () => {
  // set in `before()`:  the suite's body runs while this module loads, before the classes below exist
  let sources: SourceFiles
  let hmr: HmrPage

  before(async () => {
    sources = new SourceFiles(Object.values(FILES))
    hmr = await HmrPage.open()
  })

  after(async () => {
    try {
      sources?.restoreAll()
      sources?.assertRestored()
    } finally {
      await hmr?.close()
    }
  })

  void it("1. component code:  re-renders every <ui-button> and <ie-boton> in place, keeping attributes and properties", async () => {
    const before = await hmr.snapshot()
    await hmr.update(() =>
      sources.edit(FILES.button, "onClick={this.onClick}", `onClick={this.onClick} data-hmr="probe"`)
    )
    const after = await hmr.snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.deepEqual(after.same, { button: true, boton: true, dropdown: true, segment: true, or: true })
    assert.deepEqual(after.probes, { button: "probe", boton: "probe", grouped: ["probe", "probe"] })
    assert.equal(after.buttonInnerSame, false, "the button re-rendered")
    assert.equal(after.componentSame, false, "with a new component")
    // the DOM element's attributes and properties survive;  the new render uses them
    assert.deepEqual(after.button, before.button)
    assert.equal(after.buttonSize, "large")
    assert.ok(after.buttonClasses.includes("large") && after.buttonClasses.includes("red"), after.buttonClasses)
    assert.ok(after.botonClasses.includes("blue") && after.botonClasses.includes("primary"), after.botonClasses)
    // other tags untouched:  same shadow nodes
    assert.equal(after.segmentInnerSame, true)
    assert.equal(after.dropdownInnerSame, true)

    await hmr.update(() => sources.restore(FILES.button))
    assert.deepEqual((await hmr.snapshot()).probes, { button: null, boton: null, grouped: [null, null] })
  })

  void it("2. component code:  the dropdown keeps its `options` and `value` properties", async () => {
    await hmr.update(() =>
      sources.edit(FILES.dropdown, "onClick={this.onRootClick}", `onClick={this.onRootClick} data-hmr="probe"`)
    )
    const after = await hmr.snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.same.dropdown, true)
    assert.equal(after.dropdownInnerSame, false, "the dropdown re-rendered")
    assert.equal(after.dropdownProbe, "probe")
    assert.deepEqual(after.dropdownOptions, ["de", "fr", "gh"])
    assert.equal(after.dropdownValue, "fr")
    assert.equal(after.dropdownText, "France")
    assert.equal(after.buttonInnerSame, true, "buttons untouched")

    await hmr.update(() => sources.restore(FILES.dropdown))
    assert.equal((await hmr.snapshot()).dropdownProbe, null)
  })

  void it("3. component CSS:  every shadow root gets the new rules, without a re-render", async () => {
    await hmr.update(() => sources.edit(FILES.css, /$/, "\n.ui.button {\n  --hmr-probe: 7;\n}\n"))
    const after = await hmr.snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.buttonInnerSame, true, "same shadow DOM nodes")
    assert.equal(after.componentSame, true, "same component")
    assert.deepEqual(after.cssProbe, { button: "7", boton: "7" })

    await hmr.update(() => sources.restore(FILES.css))
    assert.deepEqual((await hmr.snapshot()).cssProbe, { button: "", boton: "" })
  })

  void it("4. vocabulary, same attributes:  hot-swapped, the new `or` text shows", async () => {
    await hmr.update(() => sources.edit(FILES.orVocabulary, `{ key: "or", text: "or",`, `{ key: "or", text: "ou",`))
    const after = await hmr.snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.same.or, true)
    assert.equal(after.orText, "ou")

    await hmr.update(() => sources.restore(FILES.orVocabulary))
    assert.equal((await hmr.snapshot()).orText, "or")
  })

  void it("5. a render that throws:  native fallback, `:state(errored)`, the page lives;  the fix recovers", async () => {
    // anchored on the signature alone, so `render()`'s first statements may change
    const renderStart = "  render(): JSX.Element {\n"
    await hmr.update(() =>
      sources.edit(
        FILES.button,
        renderStart,
        `  render(): JSX.Element {\n    if (this.domElement) throw new Error("hmr boom")\n`
      )
    )
    const broken = await hmr.snapshot()
    assert.equal(broken.marker, true, "no reload")
    assert.deepEqual(broken.errored, { button: true, boton: true })
    assert.equal(broken.fallbackControl, "BUTTON", "the native fallback shows")
    assert.ok(
      hmr.messages.some((text) => text.includes("hmr boom")),
      "the error is logged"
    )
    // every other element keeps working
    const segmentClasses = await hmr.recolorSegment("red")
    assert.ok(segmentClasses.includes("red"), segmentClasses)

    await hmr.update(() => sources.restore(FILES.button))
    const fixed = await hmr.snapshot()
    assert.equal(fixed.marker, true)
    assert.deepEqual(fixed.errored, { button: false, boton: false })
    assert.deepEqual(fixed.same, { button: true, boton: true, dropdown: true, segment: true, or: true })
    assert.ok(fixed.buttonClasses.includes("large") && fixed.buttonClasses.includes("red"), fixed.buttonClasses)
    assert.equal(fixed.hasComponent, true)
  })

  void it("6. a syntax error:  the page keeps the old code;  the fix recovers", async () => {
    const before = await hmr.snapshot()
    await hmr.failUpdate(() => sources.edit(FILES.button, /$/, "\nconst broken = (\n"))
    const broken = await hmr.snapshot()
    assert.equal(broken.marker, true, "no reload")
    assert.equal(broken.buttonInnerSame, true, "old render still up")
    assert.equal(before.buttonClasses, broken.buttonClasses)

    await hmr.update(() => sources.restore(FILES.button))
    const fixed = await hmr.snapshot()
    assert.equal(fixed.marker, true)
    assert.equal(fixed.buttonInnerSame, false, "re-rendered with the fixed code")
    assert.deepEqual(fixed.errored, { button: false, boton: false })
  })

  void it("7. vocabulary, new attribute:  observed attributes changed => full reload", async () => {
    const anchor = `{ name: "value", kind: "string", description: "Form value submitted when this button submits the form." }`
    const reloaded = await hmr.reload(() =>
      sources.edit(
        FILES.vocabulary,
        anchor,
        `${anchor},\n    { name: "hmr-probe", kind: "boolean", description: "Probe." }`
      )
    )
    assert.equal(reloaded, true)
    assert.ok(
      hmr.messages.some((text) => text.includes("<ui-button>: observed attributes changed (+hmr-probe), full reload")),
      "names the tag and the reason"
    )
    assert.equal(await hmr.reload(() => sources.restore(FILES.vocabulary)), true, "and back")
  })

  void it("8. shared code (`UIComponent.tsx`):  full reload", async () => {
    assert.equal(await hmr.reload(() => sources.edit(FILES.shared, /$/, "\n// hmr probe\n")), true)
    assert.equal(await hmr.reload(() => sources.restore(FILES.shared)), true, "and back")
  })
})

/****************
 * ### `HmrPage`
 * `tools/demo/hmr.html` open in headless chromium, on its own dev server:  what the scenarios do to it, and read
 * from it.
 * - Every in-page function is self-contained:  Playwright serializes it into the page.
 * - `globalThis` in the page:  `hmr` (counters, `tools/demo/hmr.ts`), and this test's own `marker`, `refs` (the
 *   elements) and `nodes` (their shadow nodes and component, for identity checks).
 ****************/
class HmrPage {
  /** Every console message of the page, in order. */
  readonly messages: string[] = []
  /** the dev server */
  private readonly server: DevServer
  /** the headless chromium */
  private readonly browser: Browser
  /** the demo page */
  private readonly page: Page

  private constructor({ server, browser, page }: { server: DevServer; browser: Browser; page: Page }) {
    this.server = server
    this.browser = browser
    this.page = page
    page.on("console", (message) => this.messages.push(message.text()))
    page.on("pageerror", (error) => this.messages.push(`pageerror: ${error.message}`))
  }

  /** Start the dev server and chromium, load the demo page and wait for its elements. */
  static async open(): Promise<HmrPage> {
    const server = await DevServer.start({ port: PORT })
    const browser = await chromium.launch()
    const page = await browser.newPage()
    // tsx compiles this file with esbuild `keepNames`, which wraps named functions in `__name(...)` -- also the
    // ones `page.evaluate()` serializes into the page, where no `__name` exists
    await page.addInitScript("globalThis.__name = (fn) => fn")
    const hmr = new HmrPage({ server, browser, page })
    await page.goto(server.url("/tools/demo/hmr.html"))
    await hmr.ready()
    return hmr
  }

  /** Close chromium and the dev server. */
  async close() {
    await this.browser.close()
    await this.server.close()
  }

  ////////////////
  // ## Changes
  ////////////////

  /** Run `change`, then wait until Vite applied the update (`vite:afterUpdate`) and the elements settled. */
  async update(change: () => void) {
    const count = await this.page.evaluate(() => (globalThis as any).hmr.updates as number)
    change()
    await this.page.waitForFunction((before) => (globalThis as any).hmr.updates > before, count, { timeout: TIMEOUT })
    await this.frames()
  }

  /**
   * Run `change`, which breaks the build, and wait until Vite reported the error (`vite:error`).
   * - Then waits out `ERROR_GUARD`:  the next update must not be dropped.
   */
  async failUpdate(change: () => void) {
    const count = await this.page.evaluate(() => (globalThis as any).hmr.errors as number)
    change()
    await this.page.waitForFunction((before) => (globalThis as any).hmr.errors > before, count, { timeout: TIMEOUT })
    await this.page.waitForTimeout(ERROR_GUARD)
  }

  /**
   * Run `change`, then wait for the full reload it causes and the reloaded page's elements.
   * - Returns whether the marker was gone after the load, i.e. the page really reloaded.
   */
  async reload(change: () => void): Promise<boolean> {
    const loaded = this.page.waitForEvent("load", { timeout: TIMEOUT })
    change()
    await loaded
    const isReloaded = await this.page.evaluate(() => (globalThis as any).marker !== true)
    await this.ready()
    return isReloaded
  }

  /** Set the segment's `color` and wait until its render shows it;  returns its root's classes. */
  async recolorSegment(color: string): Promise<string> {
    await this.page.evaluate((color) => document.getElementById("segment")!.setAttribute("color", color), color)
    const classes = await this.page.waitForFunction(
      (color) => {
        const className = document.getElementById("segment")!.shadowRoot!.firstElementChild!.className
        return className.split(" ").includes(color) && className
      },
      color,
      { timeout: TIMEOUT }
    )
    return (await classes.jsonValue()) as string
  }

  ////////////////
  // ## Reads
  ////////////////

  /** What the scenarios check, read from the page;  then `capture()` for the next comparison. */
  async snapshot() {
    const state = await this.page.evaluate(() => {
      const page = globalThis as any
      const refs = page.refs
      const nodes = page.nodes ?? {}
      const buttonInner = inner(byId("button"))
      const grouped = [...byId("buttons").querySelectorAll("ui-button")].map((element: any) =>
        inner(element)?.getAttribute("data-hmr")
      )
      const dropdown = byId("dropdown")
      const dropdownRoot = dropdown.shadowRoot.firstElementChild
      return {
        marker: page.marker === true,
        same: {
          button: refs.button === byId("button"),
          boton: refs.boton === byId("boton"),
          dropdown: refs.dropdown === dropdown,
          segment: refs.segment === byId("segment"),
          or: refs.or === byId("or")
        },
        probes: {
          button: buttonInner?.getAttribute("data-hmr") ?? null,
          boton: inner(byId("boton"))?.getAttribute("data-hmr") ?? null,
          grouped: grouped.map((value) => value ?? null)
        },
        button: ["primary", "color", "size"].map((name) => byId("button").getAttribute(name)),
        buttonSize: byId("button").size,
        buttonClasses: buttonInner?.className ?? "",
        botonClasses: inner(byId("boton"))?.className ?? "",
        buttonInnerSame: buttonInner === nodes.buttonInner,
        componentSame: byId("button").component === nodes.component,
        hasComponent: !!byId("button").component,
        segmentInnerSame: byId("segment").shadowRoot.firstElementChild === nodes.segmentInner,
        dropdownInnerSame: dropdownRoot === nodes.dropdownInner,
        dropdownProbe: dropdownRoot?.getAttribute("data-hmr") ?? null,
        dropdownOptions: (dropdown.options ?? []).map((option: any) => option.value),
        dropdownValue: dropdown.value,
        dropdownText: dropdown.shadowRoot.querySelector("[part~=text]")?.textContent,
        cssProbe: { button: probe(byId("button")), boton: probe(byId("boton")) },
        orText: byId("or").shadowRoot.querySelector("[part~=or]")?.getAttribute("data-text"),
        errored: {
          button: byId("button").matches(":state(errored)"),
          boton: byId("boton").matches(":state(errored)")
        },
        fallbackControl: buttonInner?.tagName ?? null
      }

      /** The element with `id`. */
      function byId(id: string): any {
        return document.getElementById(id)
      }

      /** A button's inner `<button>` part. */
      function inner(element: any): HTMLElement | null {
        return element.shadowRoot.querySelector("[part~=button]")
      }

      /** The `--hmr-probe` custom property on a button's inner part (scenario 3). */
      function probe(element: any): string {
        return getComputedStyle(inner(element)!).getPropertyValue("--hmr-probe").trim()
      }
    })
    await this.capture()
    return state
  }

  ////////////////
  // ## Page state
  ////////////////

  /** After a (re)load:  elements ready, a property set the updates must keep, marker set, references kept. */
  private async ready() {
    await this.page.waitForFunction(() => (globalThis as any).hmr, undefined, { timeout: TIMEOUT })
    await this.page.evaluate(async () => {
      await (globalThis as any).hmr.ready
      ;(document.getElementById("button") as any).size = "large"
    })
    // the new size reaches the render
    await this.page.waitForFunction(
      () => document.getElementById("button")!.shadowRoot?.querySelector("[part~=button]")?.classList.contains("large"),
      undefined,
      { timeout: TIMEOUT }
    )
    await this.page.evaluate(() => {
      const page = globalThis as any
      page.marker = true
      page.refs = {
        button: document.getElementById("button"),
        boton: document.getElementById("boton"),
        dropdown: document.getElementById("dropdown"),
        segment: document.getElementById("segment"),
        or: document.getElementById("or")
      }
    })
    await this.capture()
  }

  /** Remember the current shadow nodes and component, so the next `snapshot()` can tell a re-render. */
  private async capture() {
    await this.page.evaluate(() => {
      const page = globalThis as any
      const refs = page.refs
      page.nodes = {
        buttonInner: refs.button.shadowRoot.querySelector("[part~=button]"),
        segmentInner: refs.segment.shadowRoot.firstElementChild,
        dropdownInner: refs.dropdown.shadowRoot.firstElementChild,
        component: refs.button.component
      }
    })
  }

  /** Wait `SETTLE_FRAMES` animation frames in the page:  an applied update's re-renders are in by then. */
  private async frames() {
    await this.page.evaluate(async (count) => {
      for (let frame = 0; frame < count; frame++) await new Promise((resolve) => requestAnimationFrame(resolve))
    }, SETTLE_FRAMES)
  }
}

/****************
 * ### `SourceFiles`
 * The source files the scenarios edit ON DISK, and their way back.
 * - The original text is read when it's made, before any edit;  files with no uncommitted changes then must still
 *   match git after the run (`assertRestored()`).
 ****************/
class SourceFiles {
  /** original text of every file */
  private readonly originals: Map<string, string>
  /** files without uncommitted changes before the run */
  private readonly clean: string[]

  constructor(files: readonly string[]) {
    this.originals = new Map(files.map((file) => [file, readFileSync(file, "utf8")]))
    this.clean = files.filter((file) => SourceFiles.isGitClean(file))
  }

  /** Replace `find` (a string that MUST occur, every occurrence;  or a pattern) in `file`. */
  edit(file: string, find: string | RegExp, replacement: string) {
    const text = readFileSync(file, "utf8")
    if (typeof find === "string") {
      assert.ok(text.includes(find), `${file} has no ${JSON.stringify(find)}`)
      writeFileSync(file, text.split(find).join(replacement))
    } else {
      writeFileSync(file, text.replace(find, replacement))
    }
  }

  /** Put `file` back as it was before the run;  a no-op when it already is. */
  restore(file: string) {
    const original = this.originals.get(file)!
    if (readFileSync(file, "utf8") !== original) writeFileSync(file, original)
  }

  /** Put every file back. */
  restoreAll() {
    for (const file of this.originals.keys()) this.restore(file)
  }

  /** The restores are checked, not assumed:  every file as it was, and the clean ones clean in git. */
  assertRestored() {
    for (const [file, original] of this.originals) assert.equal(readFileSync(file, "utf8"), original, file)
    for (const file of this.clean) assert.ok(SourceFiles.isGitClean(file), `git diff --quiet -- ${file}`)
  }

  /** Does `file` match git's index (`git diff --quiet -- file`)?  Static:  asks git, keeps nothing. */
  private static isGitClean(file: string): boolean {
    try {
      execFileSync("git", ["diff", "--quiet", "--", file], { cwd: ROOT })
      return true
    } catch {
      return false
    }
  }
}

/** The package root, with a trailing slash. */
const ROOT = fileURLToPath(new URL("../", import.meta.url))

/** Source files the scenarios edit. */
const FILES = {
  button: `${ROOT}src/components/ui-button/UIButton.tsx`,
  dropdown: `${ROOT}src/components/ui-dropdown/UIDropdown.tsx`,
  css: `${ROOT}src/components/ui-button/UIButton.css`,
  vocabulary: `${ROOT}src/components/ui-button/UIButton.vocabulary.en.ts`,
  orVocabulary: `${ROOT}src/components/ui-button/UIOr.vocabulary.en.ts`,
  shared: `${ROOT}src/elements/UIComponent.tsx`
} as const

/** Preferred dev server port (the next free one is taken if busy). */
const PORT = 5390

/** How long to wait for one update / reload, ms. */
const TIMEOUT = 20_000

/**
 * How long to wait after a build error before the next edit, ms.
 * - `@solidjs/vite-plugin` drops updates within 200 ms of an error (its overlay guard), and says so with no event.
 */
const ERROR_GUARD = 400

/** Animation frames an applied update gets to re-render:  `vite:afterUpdate` fires before Solid's flush paints. */
const SETTLE_FRAMES = 2
