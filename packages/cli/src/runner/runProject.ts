/**
 * Child process of `spell run` / `spell test`:  runs one compiled spell project under node.
 * - Started by `runCommand.ts` as `node --import tsx --import hooks.mjs runProject.ts`, with a `CLI.RunSpec` in
 *   env var `SPELL_RUN`.  A fresh process per run, so every run gets a fresh `spellCore`.
 * - Headless:  what needs a browser does nothing, and says so -- see `headless()`.
 * - `run`:  loads the project, which runs its top-level statements.  Its `print`s go straight to the terminal.
 * - `test`:  loads it quietly, then calls each `test ...` function it exports which hasn't already run, and
 *   reports each one:  ✓, or ✗ with the checks that failed.  Exits 1 if any failed.
 * - NEVER imports `$/cli`'s values:  this process needs only spell's runtime.
 */
import chalk from "chalk"
import { format } from "util"

import { App, spellCore } from "$/core"
import type { CLI } from "$/cli"

const spec = JSON.parse(process.env.SPELL_RUN!) as CLI.RunSpec
/** What the project tried to do which needs a browser, e.g. `start the game`. */
const skipped = new Set<string>()
if (spec.dom) await fakeDom()
else headless()
// a fresh state bag + event hub for the project, e.g. for `on card-click` -- as the app's runners do
spellCore.resetRuntime()
// output piped into e.g. `head`, which closed it:  nothing more to say
process.stdout.on("error", (error: NodeJS.ErrnoException) => error.code === "EPIPE" && process.exit(0))

if (spec.mode === "run") await runProject()
else await testProject()

////////////////
// ## Modes
////////////////

/**
 * Load the project, running its top-level statements, then say if it wanted a browser.
 * - Started by `spell run`, with an IPC channel:  tells it what was skipped -- `{ skipped: [...] }` -- so it can
 *   open the project in a browser, and lets the channel go, so this process can end.
 * - Exits 1 if it threw.  Otherwise leaves the process to end on its own, so anything it started, e.g. a `pause`,
 *   gets to finish.
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
 * Load the project quietly, then run each `test ...` function it exports, and report.
 * - Tests the project runs ITSELF as it loads count, and don't run again:  a second run would start
 *   from what the first left behind, e.g. a dealt deck.
 * - `spec.filter`:  only tests whose names contain it, e.g. `deck` -- ignoring case, and spaces ~== `-` ~== `_`.
 */
async function testProject() {
  const restore = quiet()
  const all: TestResult[] = []
  spellCore.test = (message: unknown, testMethod: () => void) => runTest(message, testMethod, all)
  const module = await load()
  if (!module) process.exit(1)

  const wanted = (name: string) => !spec.filter || comparable(name).includes(comparable(spec.filter))
  const tests = Object.entries(module).filter(
    ([name, value]) => name.startsWith("test_") && typeof value === "function" && wanted(name.slice(5))
  )
  for (const [name, test] of tests) {
    if (!all.some((result) => comparable(result.name) === comparable(name))) (test as () => void)()
  }
  restore()

  const results = all.filter((result) => wanted(result.name.replace(/^test[\s_]/, "")))
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

/** A test's name or its function's, for comparing:  `test_deck_creation` ~== `test deck creation`. */
function comparable(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim()
}

////////////////
// ## Tests
////////////////

/**
 * Stand-in for `spellCore.test()`:  run `testMethod` as test `message`, into `results`.
 * - As `spellCore.test()`, but a test which THROWS fails, with why -- rather than being silently swallowed.
 */
function runTest(message: unknown, testMethod: () => void, results: TestResult[]) {
  spellCore.startTest(message, true)
  const test = spellCore.ACTIVE_TEST!
  let threw: unknown
  try {
    testMethod()
  } catch (error) {
    threw = error
  }
  spellCore.ACTIVE_TEST = undefined
  results.push({ name: String(message), passed: !threw && test.result !== false, output: test.output, threw })
}

/** Print how `result` went:  ✓ and how many checks, or ✗ and the checks that failed -- every check if `verbose`. */
function report({ name, passed, output, threw }: TestResult) {
  const checks = output.filter((line) => Array.isArray(line) && /^[✅❌]$/.test(String(line[0])))
  const count = checks.length ? chalk.dim(`  (${checks.length} check${checks.length === 1 ? "" : "s"})`) : ""
  process.stdout.write(`${passed ? chalk.green("✓") : chalk.red("✗")} ${name}${count}\n`)
  for (const line of output) {
    const isFailure = Array.isArray(line) && line[0] === "❌"
    if (spec.verbose || isFailure) process.stdout.write(`    ${Array.isArray(line) ? format(...line) : format(line)}\n`)
  }
  if (threw) process.stdout.write(chalk.red(`    threw:  ${threw instanceof Error ? threw.message : format(threw)}\n`))
}

/**
 * How one test went.
 * - `output`:  what it logged -- each `expect` a `[icon, ...words]` array, see `spellCore.expect()`
 * - `threw`:  what it threw, if it didn't finish
 */
type TestResult = {
  name: string
  passed: boolean
  output: unknown[]
  threw?: unknown
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
 * - `spellCore.installStyles()`:  adds a project's `.css` to the page
 */
function headless() {
  App.prototype.start = function start() {
    skipped.add(`start the ${this.constructor.name.toLowerCase()}`)
  }
  spellCore.installStyles = () => {}
}

/**
 * SIDE EFFECT:  a fake page for `spec.dom`, so what needs a browser runs:  linkedom's `document`, and `App.start()`
 * draws into it.  When the program is done, prints the page's `<body>`:  what it drew, to compare.
 * - `Math.random()` is SEEDED, so a shuffle comes out the same every run, on every target:  by `hooks.mjs`, before
 *   lodash loads and keeps its own reference to it.
 * - Only for the core contract test, `contract.test.ts`:  a real browser is `spell run`'s.
 */
async function fakeDom() {
  const { parseHTML } = await import("linkedom")
  const page = parseHTML("<!doctype html><html><head></head><body></body></html>")
  for (const name of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "Event", "CustomEvent"]) {
    Object.defineProperty(globalThis, name, {
      value: page[name as keyof typeof page],
      configurable: true,
      writable: true
    })
  }
  spellCore.installStyles = () => {}
  // `tsx` compiles `core`'s `App.tsx` with classic JSX here, which reads a global `React`
  Object.assign(globalThis, { React: await import("react") })
  process.once("beforeExit", () => {
    const drawn = page.document.body.innerHTML
    if (drawn) process.stdout.write(`\n${drawn}\n`)
  })
}

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
