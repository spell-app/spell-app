/**
 * Running compiled spell javascript -- in every runner:  the app, the VS Code runner's webview, and `<spell-app>`.
 * - Compiled spell `import`s `@spell/core`, and any projects it imports as `@spell/project/<projectId>`.
 *   - Compiled TypeScript's element classes also import `@spell/elements` (epic `drawable-thing` P10):
 *     the runtime exports that too.
 *   - We rewrite them onto URLs -- the runtime's own, and a `blob:` URL per project -- see `linkModule()`.
 *   - NO import map:  a page has one, but each runner needs its own `@spell/core`.
 * - Part of `spell-runtime.js`, NOT the runners themselves:
 *   it runs on the `core` of the runtime copy it's in -- see `spellRuntime.ts`'s `runApp()`.
 */

import { core, SPELL_CORE_MODULE, SPELL_ELEMENTS_MODULE } from "spell-lang/core"

/**
 * Run `compiled` spell javascript.
 * - First:  previous app unmounted, new `core.RUNTIME`, empty console -- unless `keepConsole`.
 * - Afresh, unless `keepThings` (epic `drawable-thing` P16, P17):
 *   then the last run's things carry over into the new one, e.g. the game in progress -- see `core.carryOver()`.
 *   - The program's start is skipped:  its top-level test calls, and starting its app (`core.isCarryingOver`).
 *     Its app starts again as the last run had it.
 *   - Afresh after all, saying why on the console, when:
 *     - the edit changed the program's start:  the file that starts its app -- see `startChanged()`
 *     - one of the last run's things can't come over, e.g. its type changed -- see `core.carryProblems()`
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Each project it imports comes from `options.loadImport()`, linked onto its own `blob:` URL:
 *   once per run, however many import it, deepest first.
 *   Without `loadImport`, a project which imports another won't run.
 * - `runTests`:  then the tests it didn't run itself, as `spell test` does.
 * - SIDE EFFECT:  hands its top-level things to `core.things`, for the Thing Explorer --
 *   NOT those of the projects it imports.
 *   Its classes AND theirs too, so `core.fromJSON()` finds them by name.
 * - Answers the error message if it threw, else `undefined`.
 */
export async function runCompiled(compiled: string, options: RunCompiledOptions): Promise<string | undefined> {
  // the last run's things:  read before the reset forgets them
  const last = options.keepThings ? lastRun() : undefined
  const isNewStart = !!last && startChanged(last.compiled, compiled)
  const previous = isNewStart ? undefined : last
  carryAfterFailure = undefined
  unmountApp()
  core.resetRuntime()
  // what the core says, e.g. a test's lines, in the program's language:  English with none
  core.useMessages(options.messages)
  if (!options.keepConsole) core.console.clear()
  if (isNewStart) core.console.info(`Started afresh:  the program's start changed, in the file that starts its app.`)
  // what's on the console now:  put back if the run starts again afresh, below
  const restoreConsole = consoleRestorer()

  const { loadImport } = options
  if (!loadImport && projectImportsOf(compiled).length) {
    return "This project imports another, which this runner can't load."
  }
  const { coreUrl } = options
  // blob URL of each project linked this run, by id
  const linked = new Map<string, Promise<string>>()
  const urls: string[] = []
  try {
    // NOTE: the URL first, THEN `import()` it:  vite wraps `import(...)` in an arrow for its preloading,
    // so an `await` in its argument would end up in a function that isn't `async` -- a syntax error in the bundle
    const url = await link(compiled, [])
    core.isCarryingOver = !!previous
    let program: Record<string, unknown>
    try {
      program = (await import(/* @vite-ignore */ url)) as Record<string, unknown>
    } finally {
      core.isCarryingOver = false
    }
    // the classes of each project it imports, e.g. Solitaire's `Card`, for `core.fromJSON()` and carrying over:
    // the program imported them already, so this runs nothing again
    for (const projectUrl of linked.values()) {
      const project = await projectUrl
      core.things.addClasses((await import(/* @vite-ignore */ project)) as Record<string, unknown>)
    }
    core.things.setTopLevel(program)
    // the tests it didn't run itself as it loaded:  never on a run that carries things over, which skipped its own
    if (options.runTests && !previous) core.runTests(program)
    const problems = previous ? core.carryProblems(previous.things, program) : []
    if (problems.length) {
      // with its start skipped, a thing that starts afresh by itself would miss what the start does to it
      restoreConsole()
      core.console.info(`Started afresh:  ${problems.join(";  ")}.`)
      const problem = await runCompiled(compiled, { ...options, keepThings: false, keepConsole: true })
      if (problem) carryAfterFailure = previous
      return problem
    }
    if (previous) carryOver(previous, program)
    lastCompiled = compiled
    return undefined
  } catch (error) {
    // the next recompile carries the last good run's things over, not this broken one's
    carryAfterFailure = last
    // Log too, so devtools show the stack.
    console.error(error)
    return error instanceof Error ? error.message : String(error)
  } finally {
    // modules once imported stay imported:  the URLs aren't needed any more
    urls.forEach((url) => URL.revokeObjectURL(url))
  }

  /**
   * `blob:` URL of `source`, linked:  its `@spell/core` onto `coreUrl`, each project it imports onto its own.
   * - Each project it imports is linked first.
   * - `chain`:  the projects we're linking this for, to catch projects importing each other.
   */
  async function link(source: string, chain: string[]): Promise<string> {
    const imports: Record<string, string> = {}
    for (const projectId of projectImportsOf(source)) {
      if (chain.includes(projectId)) throw new Error(`Projects import each other: ${[...chain, projectId].join(" → ")}`)
      let url = linked.get(projectId)
      if (!url) linked.set(projectId, (url = loadImport!(projectId).then((text) => link(text, [...chain, projectId]))))
      imports[projectId] = await url
    }
    const url = URL.createObjectURL(new Blob([linkModule(source, coreUrl, imports)], { type: "text/javascript" }))
    urls.push(url)
    return url
  }
}

/** Options for `runCompiled()`. */
export type RunCompiledOptions = {
  /**
   * URL of the module compiled spell's `@spell/core` import is pointed at:  the runtime copy it runs on.
   * - See `loadRuntime()`.
   * - MUST be the copy this `runCompiled()` is from, so the program's `core` is ours.
   */
  coreUrl: string
  /** Compiled javascript of project `projectId`, which the program imports. */
  loadImport?: (projectId: string) => Promise<string>
  /** Keep what's on the console, e.g. the app's own "Compiling ..." lines, above the program's. */
  keepConsole?: boolean
  /**
   * Carry the last run's things over, e.g. the game in progress -- for a recompile of the same program.
   * - Never for Restart, which starts afresh on purpose (Q25), nor for another program.
   */
  keepThings?: boolean
  /**
   * Then run each `to test ...` it exports which it didn't run itself as it loaded (`core.runTests()`):
   * how they went is in `core.testResults()`.  See `testApp()`.
   */
  runTests?: boolean
  /**
   * The program's words for what the core says to the person running it, e.g. a test's lines:
   * its words file's `messages` (epic `spanish` P12) -- English with none.
   */
  messages?: Record<string, string>
}

/**
 * The last run's things, to carry over into the next -- `undefined` if it left none.
 * - After a run that threw:  the run before it's, kept in `carryAfterFailure`.
 */
function lastRun(): LastRun | undefined {
  const things = core.things.topLevel()
  if (!things.length || lastCompiled === undefined) return carryAfterFailure
  const app = (core.appElement() as AppElement | null)?.spellRoot?.app
  return { things, app, compiled: lastCompiled }
}

/**
 * Put `previous`'s things in place of what `program` made -- see `core.carryOver()`.
 * - Its app, as it was:  started now, since the program's start, which would have started it, was skipped.
 */
function carryOver(previous: LastRun, program: Record<string, unknown>) {
  const kept = core.carryOver(previous.things, program)
  if (!previous.app || appIsMounted()) return
  const name = previous.things.find(({ thing }) => thing === previous.app)?.name
  const app = name && kept.includes(name) ? (program[name] as { start?: () => void }) : undefined
  app?.start?.()
}

/**
 * What puts the console back as it is now, e.g. a run's output, when the run starts again afresh:
 * the lines in its open group, or at its top.
 * - Lines are replaced, never changed in place (`SpellConsole.lines`):  the old array is what was there.
 */
function consoleRestorer(): () => void {
  const { console: output } = core
  const groups = [...output.groups]
  const into = groups[0] ?? output
  const { lines } = into
  return () => {
    output.groups = groups
    into.lines = lines
  }
}

/** What a run left, for the next to carry over -- see `lastRun()`. */
type LastRun = {
  /** Its top-level things, by name. */
  things: ReturnType<typeof core.things.topLevel>
  /** The app it drew, if any. */
  app?: object
  /** The javascript it ran, to tell whether the next changes the program's start -- see `startChanged()`. */
  compiled: string
}

/** The things of the last run that ran to its end, while the runs after it throw -- see `lastRun()`. */
let carryAfterFailure: LastRun | undefined

/** The javascript of the last run that ran to its end. */
let lastCompiled: string | undefined

/**
 * Does `after`, a program compiled again, change its START from `before`?
 * Then it runs afresh, as Restart does (Owen, epic `drawable-thing` P17).
 * - A project of several files:  when the file that starts its app changed,
 *   e.g. Solitaire's, which says `start the game`.
 *   - An edit to a file of types, e.g. Card's, keeps the game in progress.
 * - A project of one file:  when its start's own lines changed -- starting its app, or which tests it runs.
 * - When it has a file more or less:  yes.
 * - No app started:  never, as nothing tells which file starts it.
 * - Reads the compiled javascript, which every runner has:  a file's code is between two `FILE_SEPARATOR`s.
 *   - NOTE: a method one file declares on another's type is compiled into that type's class, in ITS file:
 *     Solitaire's `to play a card` is in Card's code, so an edit to it keeps things.
 *   - The lines `import`ing from the runtime don't count:  they change with what any file uses.
 * - Pure.
 */
export function startChanged(before: string, after: string): boolean {
  const [was, now] = [filesOf(before), filesOf(after)]
  if (was.length !== now.length) return true
  if (now.filter((code) => code.some((line) => !STYLES_LINE.test(line))).length <= 1) {
    return startLinesOf(was).join("\n") !== startLinesOf(now).join("\n")
  }
  return now.some((code, index) => {
    const startsApp = [code, was[index]!].some((file) => file.some((line) => APP_START_LINE.test(line)))
    return startsApp && code.join("\n") !== was[index]!.join("\n")
  })
}

/** Each file's code in `compiled`, as its lines:  without blank lines, or those importing from the runtime. */
function filesOf(compiled: string): string[][] {
  return compiled
    .split(FILE_SEPARATOR)
    .map((code) => code.split("\n").filter((line) => line.trim() && !RUNTIME_IMPORT_LINE.test(line)))
}

/** The lines of `files` that are part of the program's start:  its tests' calls, starting its app. */
function startLinesOf(files: string[][]): string[] {
  return files.flat().filter((line) => line.startsWith(START_LINE))
}

/**
 * How a line of the program's start begins, as compiled -- `P.ASTProgramStart`:
 * `if (!core.isCarryingOver) game.start()`.
 * - NOTE: a copy, NOT imported:  `spell-lang/parser` would pull the whole parser into the runner bundle.
 */
const START_LINE = "if (!core.isCarryingOver) "

/** A line of the program's start that starts its app:  `if (!core.isCarryingOver) game.start()`. */
const APP_START_LINE = /^if \(!core\.isCarryingOver\) .+\??\.start\(\)$/

/** A line that only installs a stylesheet:  a `.css` file's code. */
const STYLES_LINE = /^core\.installStyles\(/

/** A line importing from the runtime, `import { core, ... } from "@spell/core"`. */
const RUNTIME_IMPORT_LINE = /^import .* from "@spell\/(core|elements)"$/

/**
 * Between each file's code in compiled javascript -- `SP.SpellProject.FILE_SEPARATOR`.
 * - NOTE: a copy, NOT imported:  `spell-lang/spell` would pull the whole parser into the runner bundle.
 */
const FILE_SEPARATOR = "\n// -----------\n"

/** Take down the app the last run started, if any -- e.g. before showing another project. */
export function unmountApp() {
  const element = core.appElement() as AppElement | null
  element?.spellRoot?.unmount()
}

/**
 * Did the last run start an app?  `App.start()` leaves it on the mount point (`core.mountApp()`).
 * - An app started later, e.g. from a timer, isn't there yet -- a runner should watch for it drawing.
 */
export function appIsMounted(): boolean {
  return !!(core.appElement() as AppElement | null)?.spellRoot
}

/**
 * `source` with its imports pointed at URLs:
 * `@spell/core` at `coreUrl`, and each `@spell/project/<projectId>` at `imports[projectId]`.
 * - `@spell/elements` at `coreUrl` too:  the runtime copy exports `SpellElement` (`spellRuntime.ts`).
 * - Pure.  A project not in `imports` is left as it was.
 */
export function linkModule(source: string, coreUrl: string, imports: Record<string, string> = {}): string {
  return source.replace(SPELL_IMPORT, (whole, from: string, specifier: string) => {
    const isRuntime = specifier === SPELL_CORE_MODULE || specifier === SPELL_ELEMENTS_MODULE
    const url = isRuntime ? coreUrl : imports[specifier.slice(PROJECT_MODULE.length)]
    return url ? `${from}"${url}"` : whole
  })
}

/** Ids of the projects `source` imports, each once, in order -- e.g. `@spell/examples/Solitaire`. */
export function projectImportsOf(source: string): string[] {
  const ids = [...source.matchAll(SPELL_IMPORT)]
    .map(([, , specifier]) => specifier)
    .filter((specifier) => specifier.startsWith(PROJECT_MODULE))
    .map((specifier) => specifier.slice(PROJECT_MODULE.length))
  return [...new Set(ids)]
}

/** `from "@spell/..."` in an `import` -- its `from`, then the specifier. */
const SPELL_IMPORT = /(\bfrom\s*)"(@spell\/[^"]+)"/g

/**
 * Start of the specifier compiled spell imports another project by -- `SP.SPELL_PROJECT_MODULE`.
 * - NOTE: a copy, NOT imported:  `spell-lang/spell` would pull the whole parser into the runner bundle.
 */
const PROJECT_MODULE = "@spell/project/"

/** The app's mount point, with the mounted app `App.start()` leaves on it. */
type AppElement = HTMLElement & { spellRoot?: { app?: object; unmount(): void } }
