/// <reference types="node" />

/**
 * `yarn test:hmr`:  hot module replacement end to end.  Starts the Vite dev server (the root `vite.config.ts`),
 * opens `tools/demo/hmr.html` in headless chromium, then edits REAL source files on disk and checks
 * what the page does.
 * - Scenarios, in order (the full reloads last):
 *   1. component code (`UIButton.tsx`):  every `<ui-button>` AND `<ie-boton>` re-renders in place
 *   2. component code (`UIDropdown.tsx`):  the dropdown keeps its `options` / `value` PROPERTIES
 *   3. component CSS (`ui-button.css`):  new rules apply, shadow DOM nodes keep their identity (no re-render)
 *   4. vocabulary, same attributes (the `or` text):  hot, new text shown
 *   5. a render that throws:  fallback + `:state(errored)`, other elements unaffected;  the fix recovers
 *   6. a syntax error:  the page keeps the old code;  the fix recovers
 *   7. vocabulary, NEW attribute:  "observed attributes changed, full reload"
 *   8. shared code (`UIElement.tsx`):  full reload
 * - A reload is detected by a window marker the test sets:  gone => the page reloaded.
 * - EVERY edited file is restored after its scenario and again in `after()`, then checked with `git diff --quiet`.
 */

import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { after, before, describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import { chromium, type Browser, type Page } from "playwright"
import { createServer, type ViteDevServer } from "vite"

/** The repo root, with a trailing slash. */
const REPO = fileURLToPath(new URL("../", import.meta.url))

/** Source files the scenarios edit. */
const FILES = {
  button: `${REPO}src/components/ui-button/UIButton.tsx`,
  dropdown: `${REPO}src/components/ui-dropdown/UIDropdown.tsx`,
  css: `${REPO}src/components/ui-button/ui-button.css`,
  vocabulary: `${REPO}src/components/ui-button/ui-button.vocabulary.en.ts`,
  shared: `${REPO}src/elements/UIElement.tsx`
} as const

/** Original text of every file in `FILES`, read before any edit. */
const ORIGINALS = new Map<string, string>(Object.values(FILES).map((file) => [file, readFileSync(file, "utf8")]))

/** Files in `FILES` without uncommitted changes before the run:  `git diff --quiet` must still hold after it. */
const CLEAN = Object.values(FILES).filter((file) => gitClean(file))

/** How long to wait for one update / reload. */
const TIMEOUT = 20_000

let server: ViteDevServer
let browser: Browser
let page: Page
/** Every console message of the page, in order. */
const messages: string[] = []

void describe("hot module replacement (Vite dev, tools/demo/hmr.html)", () => {
  before(async () => {
    server = await createServer({
      root: REPO,
      configFile: `${REPO}vite.config.ts`,
      logLevel: "warn",
      server: { port: 5390, strictPort: false }
    })
    await server.listen()
    browser = await chromium.launch()
    page = await browser.newPage()
    // tsx compiles this file with esbuild `keepNames`, which wraps named functions in `__name(...)` -- also the
    // ones `page.evaluate()` serializes into the page, where no `__name` exists
    await page.addInitScript("globalThis.__name = (fn) => fn")
    page.on("console", (message) => messages.push(message.text()))
    page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`))
    await open()
  })

  after(async () => {
    try {
      for (const file of Object.values(FILES)) restore(file)
      // the restores are checked, not assumed
      for (const file of Object.values(FILES)) assert.equal(readFileSync(file, "utf8"), ORIGINALS.get(file), file)
      for (const file of CLEAN) assert.ok(gitClean(file), `git diff --quiet -- ${file}`)
    } finally {
      await browser?.close()
      await server?.close()
    }
  })

  void it("1. component code:  re-renders every <ui-button> and <ie-boton> in place, keeping attributes and properties", async () => {
    const before = await snapshot()
    await update(() => edit(FILES.button, "onClick={this.onClick}", `onClick={this.onClick} data-hmr="probe"`))
    const after = await snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.deepEqual(after.same, { button: true, boton: true, dropdown: true, segment: true, or: true })
    assert.deepEqual(after.probes, { button: "probe", boton: "probe", grouped: ["probe", "probe"] })
    assert.equal(after.buttonInnerSame, false, "the button re-rendered")
    assert.equal(after.controllerSame, false, "with a new controller")
    // host attributes and properties survive;  the new render uses them
    assert.deepEqual(after.button, before.button)
    assert.equal(after.buttonSize, "large")
    assert.ok(after.buttonClasses.includes("large") && after.buttonClasses.includes("red"), after.buttonClasses)
    assert.ok(after.botonClasses.includes("blue") && after.botonClasses.includes("primary"), after.botonClasses)
    // other tags untouched:  same shadow nodes
    assert.equal(after.segmentInnerSame, true)
    assert.equal(after.dropdownInnerSame, true)

    await update(() => restore(FILES.button))
    assert.deepEqual((await snapshot()).probes, { button: null, boton: null, grouped: [null, null] })
  })

  void it("2. component code:  the dropdown keeps its `options` and `value` properties", async () => {
    await update(() =>
      edit(FILES.dropdown, "onClick={this.onRootClick}>", `onClick={this.onRootClick} data-hmr="probe">`)
    )
    const after = await snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.same.dropdown, true)
    assert.equal(after.dropdownInnerSame, false, "the dropdown re-rendered")
    assert.equal(after.dropdownProbe, "probe")
    assert.deepEqual(after.dropdownOptions, ["de", "fr", "gh"])
    assert.equal(after.dropdownValue, "fr")
    assert.equal(after.dropdownText, "France")
    assert.equal(after.buttonInnerSame, true, "buttons untouched")

    await update(() => restore(FILES.dropdown))
    assert.equal((await snapshot()).dropdownProbe, null)
  })

  void it("3. component CSS:  every shadow root gets the new rules, without a re-render", async () => {
    await update(() => edit(FILES.css, /$/, "\n.ui.button {\n  --hmr-probe: 7;\n}\n"))
    const after = await snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.buttonInnerSame, true, "same shadow DOM nodes")
    assert.equal(after.controllerSame, true, "same controller")
    assert.deepEqual(after.cssProbe, { button: "7", boton: "7" })

    await update(() => restore(FILES.css))
    assert.deepEqual((await snapshot()).cssProbe, { button: "", boton: "" })
  })

  void it("4. vocabulary, same attributes:  hot-swapped, the new `or` text shows", async () => {
    await update(() => edit(FILES.vocabulary, `{ key: "or", text: "or",`, `{ key: "or", text: "ou",`))
    const after = await snapshot()
    assert.equal(after.marker, true, "no reload")
    assert.equal(after.same.or, true)
    assert.equal(after.orText, "ou")

    await update(() => restore(FILES.vocabulary))
    assert.equal((await snapshot()).orText, "or")
  })

  void it("5. a render that throws:  native fallback, `:state(errored)`, the page lives;  the fix recovers", async () => {
    // anchored on the signature alone, so `render()`'s first statements may change
    const renderStart = "  render(): JSX.Element {\n"
    await update(() =>
      edit(FILES.button, renderStart, `  render(): JSX.Element {\n    if (this.host) throw new Error("hmr boom")\n`)
    )
    const broken = await snapshot()
    assert.equal(broken.marker, true, "no reload")
    assert.deepEqual(broken.errored, { button: true, boton: true })
    assert.equal(broken.fallbackControl, "BUTTON", "the native fallback shows")
    assert.ok(
      messages.some((text) => text.includes("hmr boom")),
      "the error is logged"
    )
    // every other element keeps working
    const segmentClasses = await page.evaluate(async () => {
      const segment = document.getElementById("segment")!
      segment.setAttribute("color", "red")
      await new Promise((resolve) => setTimeout(resolve, 50))
      return segment.shadowRoot!.firstElementChild!.className
    })
    assert.ok(segmentClasses.includes("red"), segmentClasses)

    await update(() => restore(FILES.button))
    const fixed = await snapshot()
    assert.equal(fixed.marker, true)
    assert.deepEqual(fixed.errored, { button: false, boton: false })
    assert.deepEqual(fixed.same, { button: true, boton: true, dropdown: true, segment: true, or: true })
    assert.ok(fixed.buttonClasses.includes("large") && fixed.buttonClasses.includes("red"), fixed.buttonClasses)
    assert.equal(fixed.hasController, true)
  })

  void it("6. a syntax error:  the page keeps the old code;  the fix recovers", async () => {
    const before = await snapshot()
    const errors = await page.evaluate(() => (globalThis as any).hmr.errors as number)
    edit(FILES.button, /$/, "\nconst broken = (\n")
    await page.waitForFunction((count) => (globalThis as any).hmr.errors > count, errors, { timeout: TIMEOUT })
    const broken = await snapshot()
    assert.equal(broken.marker, true, "no reload")
    assert.equal(broken.buttonInnerSame, true, "old render still up")
    assert.equal(before.buttonClasses, broken.buttonClasses)
    // `@solidjs/vite-plugin` drops updates within 200 ms of an error (its overlay guard):  let it pass
    await page.waitForTimeout(400)

    await update(() => restore(FILES.button))
    const fixed = await snapshot()
    assert.equal(fixed.marker, true)
    assert.equal(fixed.buttonInnerSame, false, "re-rendered with the fixed code")
    assert.deepEqual(fixed.errored, { button: false, boton: false })
  })

  void it("7. vocabulary, new attribute:  observed attributes changed => full reload", async () => {
    const anchor = `{ name: "value", kind: "string", description: "Form value submitted when this button submits the form." }`
    const reloaded = await reload(() =>
      edit(FILES.vocabulary, anchor, `${anchor},\n    { name: "hmr-probe", kind: "boolean", description: "Probe." }`)
    )
    assert.equal(reloaded, true)
    assert.ok(
      messages.some((text) => text.includes("<ui-button>: observed attributes changed (+hmr-probe), full reload")),
      "names the tag and the reason"
    )
    assert.equal(await reload(() => restore(FILES.vocabulary)), true, "and back")
  })

  void it("8. shared code (`UIElement.tsx`):  full reload", async () => {
    assert.equal(await reload(() => edit(FILES.shared, /$/, "\n// hmr probe\n")), true)
    assert.equal(await reload(() => restore(FILES.shared)), true, "and back")
  })
})

////////////////
// ## Page
////////////////

/** Load `tools/demo/hmr.html`, wait for every element, set the marker and a property the updates must keep. */
async function open() {
  const url = server.resolvedUrls!.local[0]!
  await page.goto(`${url}tools/demo/hmr.html`)
  await ready()
}

/** After a (re)load:  elements ready, marker set, references kept for identity checks. */
async function ready() {
  await page.waitForFunction(() => (globalThis as any).hmr, undefined, { timeout: TIMEOUT })
  await page.evaluate(async () => {
    const page = globalThis as any
    await page.hmr.ready
    const button = document.getElementById("button") as any
    button.size = "large"
    await new Promise((resolve) => setTimeout(resolve, 50))
    page.marker = true
    remember()

    /** Keep the elements and their current shadow nodes, for identity checks. */
    function remember() {
      const byId = (id: string) => document.getElementById(id) as any
      page.refs = {
        button: byId("button"),
        boton: byId("boton"),
        dropdown: byId("dropdown"),
        segment: byId("segment"),
        or: byId("or")
      }
    }
  })
  await capture()
}

/** Remember the current shadow nodes and controller, so the next `snapshot()` can tell a re-render. */
async function capture() {
  await page.evaluate(() => {
    const page = globalThis as any
    const refs = page.refs
    page.nodes = {
      buttonInner: refs.button.shadowRoot.querySelector("[part~=button]"),
      segmentInner: refs.segment.shadowRoot.firstElementChild,
      dropdownInner: refs.dropdown.shadowRoot.firstElementChild,
      controller: refs.button.controller
    }
  })
}

/** What the scenarios check, read from the page;  then `capture()` for the next comparison. */
async function snapshot() {
  const state = await page.evaluate(() => {
    const page = globalThis as any
    const refs = page.refs
    const nodes = page.nodes ?? {}
    const byId = (id: string) => document.getElementById(id) as any
    const inner = (element: any) => element.shadowRoot.querySelector("[part~=button]")
    const buttonInner = inner(byId("button"))
    const grouped = [...byId("buttons").querySelectorAll("ui-button")].map((element: any) =>
      inner(element)?.getAttribute("data-hmr")
    )
    const dropdown = byId("dropdown")
    const dropdownRoot = dropdown.shadowRoot.firstElementChild
    const probe = (element: any) => getComputedStyle(inner(element)).getPropertyValue("--hmr-probe").trim()
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
      controllerSame: byId("button").controller === nodes.controller,
      hasController: !!byId("button").controller,
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
  })
  await capture()
  return state
}

/** Run `change`, then wait until Vite applied the update (`vite:afterUpdate`) and the elements settled. */
async function update(change: () => void) {
  const count = await page.evaluate(() => (globalThis as any).hmr.updates as number)
  change()
  await page.waitForFunction((before) => (globalThis as any).hmr.updates > before, count, { timeout: TIMEOUT })
  await page.waitForTimeout(100)
}

/**
 * Run `change`, then wait for the full reload it causes and the reloaded page's elements.
 * - Returns whether the marker was gone after the load, i.e. the page really reloaded.
 */
async function reload(change: () => void): Promise<boolean> {
  const loaded = page.waitForEvent("load", { timeout: TIMEOUT })
  change()
  await loaded
  const reloaded = await page.evaluate(() => (globalThis as any).marker !== true)
  await ready()
  return reloaded
}

////////////////
// ## Files
////////////////

/** Replace `find` (a string that MUST occur, every occurrence;  or a pattern) in `file`. */
function edit(file: string, find: string | RegExp, replacement: string) {
  const text = readFileSync(file, "utf8")
  if (typeof find === "string") {
    assert.ok(text.includes(find), `${file} has no ${JSON.stringify(find)}`)
    writeFileSync(file, text.split(find).join(replacement))
  } else {
    writeFileSync(file, text.replace(find, replacement))
  }
}

/** Put `file` back as it was before the run;  a no-op when it already is. */
function restore(file: string) {
  const original = ORIGINALS.get(file)!
  if (readFileSync(file, "utf8") !== original) writeFileSync(file, original)
}

/** Does `file` match git's index (`git diff --quiet -- file`)? */
function gitClean(file: string): boolean {
  try {
    execFileSync("git", ["diff", "--quiet", "--", file], { cwd: REPO })
    return true
  } catch {
    return false
  }
}
