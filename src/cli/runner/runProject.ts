/**
 * Child process of `spell run` / `spell test`:  runs one compiled spell project under node.
 * - Started by `runCommand.ts` as `node --import tsx --import hooks.mjs runProject.ts`,
 *   with a `CLI.RunSpec` in env var `SPELL_RUN`.
 *   A fresh process per run, so every run gets a fresh `core`.
 * - Headless:  what needs a browser does nothing, and says so -- see `headless()`.
 * - `run`:  loads the project, which runs its top-level statements.
 *   Its `print`s go straight to the terminal:  its data to stdout, a dump of a thing (`print the card`) to stderr.
 * - `test`:  loads it quietly, then calls each `test ...` function it exports which hasn't already run
 *   (`core.runTests()`, which the runners' Run Tests share), and reports each one:  ✓, or ✗ with the checks that
 *   failed.  Exits 1 if any failed.
 * - NEVER imports `spell-app/cli`'s values:  this process needs only spell's runtime.
 */
import chalk from "chalk"
import { format } from "util"

import { bridgeSolid } from "spell-kit/util"
import { App, core, type TestResult } from "spell-lang/core"
import type { CLI } from "spell-app/cli"

const spec = JSON.parse(process.env.SPELL_RUN!) as CLI.RunSpec
/** What the project tried to do which needs a browser, e.g. `start the game`. */
const skipped = new Set<string>()
if (spec.dom) await fakeDom()
else headless()
// a fresh state bag + event hub for the project, e.g. for `on card-click` -- as the app's runners do
core.resetRuntime()
// `--seed`, and the core contract:  the same random numbers every run, so a shuffle deals the same cards
if (spec.seed !== undefined) core.seedRandom(spec.seed)
// a test's lines in the language the program speaks, e.g. Spanish:  English when it has no messages
core.useMessages(spec.messages)
// a dump of a thing (`print the card`) to stderr, so stdout holds only the program's data
// (epic page python-target, Q17);  at call time, so `quiet()` silences it too
core.console.printDump = (...message) => console.error(...message)
// output piped into e.g. `head`, which closed it:  nothing more to say
process.stdout.on("error", (error: NodeJS.ErrnoException) => error.code === "EPIPE" && process.exit(0))

if (spec.mode === "run") await runProject()
else await testProject()

////////////////
// ## Modes
////////////////

/**
 * Load the project, running its top-level statements, then say if it wanted a browser.
 * - Started by `spell run`, with an IPC channel:
 *   - tells it what was skipped (`{ skipped: [...] }`), so it can open the project in a browser
 *   - lets the channel go, so this process can end
 * - Exits 1 if it threw.
 *   Otherwise leaves the process to end on its own, so anything it started, e.g. a `pause`, gets to finish.
 */
async function runProject() {
  const loaded = await load()
  if (process.send) {
    process.send({ skipped: [...skipped] } satisfies CLI.RunReport)
    process.disconnect()
  }
  if (!loaded) process.exit(1)
  if (skipped.size) note(`${spec.name} shows a UI (${[...skipped].join(", ")}), which needs a browser.`)
}

/**
 * Load the project quietly, then run each `test ...` function it exports, and report -- see `core.runTests()`.
 * - Tests the project runs ITSELF as it loads count, and don't run again:
 *   a second run would start from what the first left behind, e.g. a dealt deck.
 * - `spec.filter`:  only tests whose names contain it, e.g. `deck` -- ignoring case, and spaces ~== `-` ~== `_`.
 */
async function testProject() {
  const restore = quiet()
  const module = await load()
  if (!module) process.exit(1)
  const results = core.runTests(module, spec.filter)
  restore()

  if (!results.length) {
    note(
      spec.filter
        ? `${spec.name} has no tests matching '${spec.filter}'`
        : `${spec.name} has no tests -- write one as \`to test <something>:\``
    )
    process.exit(0)
  }
  for (const result of results) report(result)
  const failed = results.filter((result) => !result.passed).length
  const summary = `${results.length - failed} passed${failed ? `, ${failed} failed` : ""}`
  process.stdout.write(`\n${failed ? chalk.red(summary) : chalk.green(summary)}\n`)
  process.exit(failed ? 1 : 0)
}

////////////////
// ## Tests
////////////////

/** Print how `result` went:  ✓ and how many checks, or ✗ and the checks that failed -- every check if `verbose`. */
function report({ name, passed, checks, output, threw }: TestResult) {
  const count = checks.length ? chalk.dim(`  (${checks.length} check${checks.length === 1 ? "" : "s"})`) : ""
  process.stdout.write(`${passed ? chalk.green("✓") : chalk.red("✗")} ${name}${count}\n`)
  for (const line of output) {
    const isFailure = Array.isArray(line) && line[0] === "❌"
    if (spec.verbose || isFailure) process.stdout.write(`    ${Array.isArray(line) ? format(...line) : format(line)}\n`)
  }
  if (threw) process.stdout.write(chalk.red(`    threw:  ${threw instanceof Error ? threw.message : format(threw)}\n`))
}

////////////////
// ## Helpers
////////////////

/** Import the project's compiled javascript, running it -- or print why it threw, and return `undefined`. */
async function load(): Promise<Record<string, unknown> | undefined> {
  try {
    return (await import(spec.entry)) as Record<string, unknown>
  } catch (error) {
    process.stderr.write(chalk.red(`${spec.name} threw:  ${error instanceof Error ? error.stack : String(error)}\n`))
    return undefined
  }
}

/**
 * SIDE EFFECT:  make what needs a browser do nothing, noting it in `skipped` instead.
 * - `App.start()`:  draws the app into the page, e.g. `start the game`
 * - `core.installStyles()`:  adds a project's `.css` to the page
 */
function headless() {
  App.prototype.start = function start() {
    skipped.add(`start the ${this.constructor.name.toLowerCase()}`)
  }
  core.installStyles = () => {}
}

/**
 * SIDE EFFECT:  a fake page for `spec.dom`, so what needs a browser runs:
 * linkedom's `document`, and `App.start()` draws into it.
 * - A drawable thing draws as its own element, as on a page:  `<solitaire-card>`, its drawing in its shadow root,
 *   a drawable list's items its children -- see `fakeElements()`.
 * - When the program is done, prints the page's `<body>`:  what it drew, to compare.
 *   - As it shows:  each element's shadow root in its place, its `<slot>`s holding its children
 *     (`withShadowsInPlace()`).
 *   - Each tag's attributes are sorted (`withSortedAttributes()`).
 *   - Without the empty comments Solid marks its places with, which javascript's `h()` never writes.
 * - Only for the core contract test, `contract.test.ts`:  a real browser is `spell run`'s.
 *   The contract seeds the random numbers too (`spec.seed`), so a shuffle deals the same cards on every target.
 */
async function fakeDom() {
  const { parseHTML } = await import("linkedom")
  const page = parseHTML("<!doctype html><html><head></head><body></body></html>")
  readsEmptyComments(page.HTMLTemplateElement.prototype)
  const globals = ["window", "document", "navigator", "customElements", "HTMLElement", "Element", "Node", "Event"]
  for (const name of [...globals, "CustomEvent"]) {
    Object.defineProperty(globalThis, name, {
      value: page[name as keyof typeof page],
      configurable: true,
      writable: true
    })
  }
  core.installStyles = () => {}
  // Solid follows spell's values, as a runner's page does (`cellsBridge.ts`):  the hooks give us its browser build
  const { enableExternalSource, flush } = await import("solid-js")
  bridgeSolid({ enableExternalSource, flush })
  await fakeElements()
  process.once("beforeExit", () => {
    core.flush()
    withShadowsInPlace(page.document.body)
    // without Solid's empty markers, `<!---->`:  javascript's `h()` writes none, so both targets print the same
    const drawn = withSortedAttributes(page.document.body.innerHTML.replaceAll("<!---->", ""))
    if (drawn) process.stdout.write(`\n${drawn}\n`)
  })
}

/**
 * SIDE EFFECT:  the fake page's templates (`proto`, theirs) read an empty comment, `<!>`, as a comment,
 *   as a browser does.
 * - Solid's compiled JSX marks where each of two dynamic children side by side goes with one:
 *   `<ui-grid columns=7><!><div></div><!>...` for `{draw its stock}<div/>{draw its clubs}`.
 * - linkedom's parser drops it and what follows, so the drawing can't find its places ("reading 'nextSibling'").
 * - So a template's markup has each written out, `<!---->`, which it reads.
 */
function readsEmptyComments(proto: object) {
  let owner: object | null = proto
  while (owner && !Object.getOwnPropertyDescriptor(owner, "innerHTML")) owner = Object.getPrototypeOf(owner)
  const innerHTML = owner && Object.getOwnPropertyDescriptor(owner, "innerHTML")
  if (!innerHTML?.set) return
  Object.defineProperty(proto, "innerHTML", {
    ...innerHTML,
    set(this: Element, html: string) {
      innerHTML.set!.call(this, html.replaceAll("<!>", "<!---->"))
    }
  })
}

/**
 * SIDE EFFECT:  the fake page defines each drawable thing's element, e.g. `<solitaire-card>`, as app's runners do
 * (`installSpellElements()`), so the contract compares what a page draws:  cards in their piles.
 * - Just enough of app's `SpellElement`, which needs Spell UI, which can't load here:
 *   its `thing` drawn in its shadow root (`core.drawOwn()`);  a drawable list's items are its children,
 *   shown in its drawing's `<slot>` (`core.drawThing()` puts them there).
 * - No attributes, no layout:  just the drawing.
 * - Its events are handled in its shadow root, as Solid delegates them per render root.
 */
async function fakeElements() {
  const { insert, registerDelegatedRoot } = await import("@solidjs/web")
  core.elementDefiner = (tag) => {
    if (customElements.get(tag)) return
    customElements.define(
      tag,
      class extends HTMLElement {
        /** Draw `thing`, as the program hands it:  `draw the card`. */
        set thing(thing: unknown) {
          const root = this.shadowRoot ?? this.attachShadow({ mode: "open" })
          registerDelegatedRoot(root as unknown as Element)
          insert(root as unknown as Element, () => core.drawOwn(thing))
        }
      }
    )
  }
}

/**
 * SIDE EFFECT:  each element's shadow root put in its place under `root`, as the page shows it:
 * its `<slot>`s holding the element's children, a named one those with that `slot`.
 * - So the printed page shows what a person sees:  `<solitaire-tableau>` holding its drawing, its cards in it.
 * - Shadow roots inside shadow roots too.
 */
function withShadowsInPlace(root: ParentNode) {
  for (const host of [...root.querySelectorAll("*")]) {
    const shadow = host.shadowRoot
    if (!shadow) continue
    withShadowsInPlace(shadow)
    const children = [...host.childNodes]
    for (const slot of [...shadow.querySelectorAll("slot")]) {
      const name = slot.getAttribute("name")
      const slotted = children.filter((child) =>
        child instanceof Element ? child.getAttribute("slot") === name : name === null
      )
      slot.replaceWith(...slotted)
    }
    host.replaceChildren(...shadow.childNodes)
  }
}

/**
 * `html` with each tag's attributes in alphabetical order:  so two targets drawing the same element print it the same.
 * - Why:  linkedom prints the two ways of setting attributes in different orders.
 *   - set one by one (`setAttribute()`, as `h()` sets them):  LAST FIRST
 *   - parsed (Solid's JSX templates):  in their order
 *   - So `<th class="a" colspan="2">`, drawn either way, prints two ways.
 *   - A browser prints both in the order they were set.
 * - Reads linkedom's own output:  every value in double quotes, a `"` in one written `&quot;`.
 */
function withSortedAttributes(html: string): string {
  return html.replace(START_TAG, (_tag, name: string, attributes: string, end: string) => {
    const sorted = (attributes.match(ATTRIBUTE) ?? []).map((attribute) => attribute.trim()).sort()
    return `<${name}${sorted.map((attribute) => ` ${attribute}`).join("")}${end}>`
  })
}

/** A start tag, as linkedom writes one:  its name, its attributes, and `/` if it closes itself. */
const START_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:="[^"]*")?)*)\s*(\/?)>/g

/** One attribute in a start tag:  `name="value"`, or a bare `name`. */
const ATTRIBUTE = /\s+[^\s"'>/=]+(?:="[^"]*")?/g

/** Silence `console.*` -- the project's `print`s -- unless `verbose`.  Returns how to put it back. */
function quiet(): () => void {
  const methods = ["log", "info", "debug", "warn", "error", "group", "groupCollapsed", "groupEnd"] as const
  const saved = methods.map((method) => console[method])
  if (!spec.verbose) for (const method of methods) console[method] = () => {}
  return () => methods.forEach((method, index) => (console[method] = saved[index]!))
}

/** Print `text` as a dim note, on stderr:  it's about the run, not the program's output. */
function note(text: string) {
  process.stderr.write(chalk.dim(`${text}\n`))
}
