/**
 * Running compiled spell javascript -- in every runner:  the app, the VS Code runner's webview, and `<spell-app>`.
 * - Compiled spell `import`s `@spell/core`, and any projects it imports as `@spell/project/<projectId>`.
 *   - Compiled TypeScript's element classes also import `@spell/elements` (epic `drawable-thing` P10):
 *     the runtime exports that too.
 *   - We rewrite them onto URLs -- the runtime's own, and a `blob:` URL per project -- see `linkModule()`.
 *   - NO import map:  a page has one, but each runner needs its own `@spell/core`.
 * - Part of `spell-runtime.js`, NOT the runners themselves:
 *   it runs on the `spellCore` of the runtime copy it's in -- see `spellRuntime.ts`'s `runApp()`.
 */

import { spellCore, SPELL_CORE_MODULE, SPELL_ELEMENTS_MODULE } from "$/core"

/**
 * Run `compiled` spell javascript.
 * - First:  previous app unmounted, new `spellCore.RUNTIME`, empty console -- unless `keepConsole`.
 * - Afresh, unless `keepThings`:  then the last run's things carry over into the new one, e.g. the game in progress,
 *   and the program's start stops at its first pause -- see `spellCore.carryOver()` (epic `drawable-thing` P16).
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Each project it imports comes from `options.loadImport()`, linked onto its own `blob:` URL:
 *   once per run, however many import it, deepest first.
 *   Without `loadImport`, a project which imports another won't run.
 * - SIDE EFFECT:  hands its top-level things to `spellCore.things`, for the Thing Explorer --
 *   NOT those of the projects it imports.
 *   Its classes AND theirs too, so `spellCore.fromJSON()` finds them by name.
 * - Answers the error message if it threw, else `undefined`.
 */
export async function runCompiled(compiled: string, options: RunCompiledOptions): Promise<string | undefined> {
  // the last run's things:  read before the reset forgets them
  const previous = options.keepThings ? lastRun() : undefined
  carryAfterFailure = undefined
  unmountApp()
  spellCore.resetRuntime()
  if (!options.keepConsole) spellCore.console.clear()

  const { loadImport } = options
  if (!loadImport && projectImportsOf(compiled).length) {
    return "This project imports another, which the VS Code runner can't load yet -- run it in the app."
  }
  const { coreUrl } = options
  // blob URL of each project linked this run, by id
  const linked = new Map<string, Promise<string>>()
  const urls: string[] = []
  try {
    // NOTE: the URL first, THEN `import()` it:  vite wraps `import(...)` in an arrow for its preloading,
    // so an `await` in its argument would end up in a function that isn't `async` -- a syntax error in the bundle
    const url = await link(compiled, [])
    spellCore.isCarryingOver = !!previous
    let program: Record<string, unknown>
    try {
      program = (await import(/* @vite-ignore */ url)) as Record<string, unknown>
    } finally {
      spellCore.isCarryingOver = false
    }
    // the classes of each project it imports, e.g. Solitaire's `Card`, for `spellCore.fromJSON()`:
    // the program imported them already, so this runs nothing again
    for (const projectUrl of linked.values()) {
      const project = await projectUrl
      spellCore.things.addClasses((await import(/* @vite-ignore */ project)) as Record<string, unknown>)
    }
    spellCore.things.setTopLevel(program)
    if (previous) carryOver(previous, program)
    return undefined
  } catch (error) {
    // the next recompile carries the last good run's things over, not this broken one's
    carryAfterFailure = previous
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
   * - MUST be the copy this `runCompiled()` is from, so the program's `spellCore` is ours.
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
}

/**
 * The last run's things, to carry over into the next -- `undefined` if it left none.
 * - After a run that threw:  the run before it's, kept in `carryAfterFailure`.
 */
function lastRun(): LastRun | undefined {
  const things = spellCore.things.topLevel()
  if (!things.length) return carryAfterFailure
  const app = (spellCore.appElement() as AppElement | null)?.spellRoot?.app
  return { things, app }
}

/**
 * Put `previous`'s things in place of what `program` made -- see `spellCore.carryOver()`.
 * - Its app, if its start never got to start it (it stopped at a pause before):  started now, as it was.
 */
function carryOver(previous: LastRun, program: Record<string, unknown>) {
  const kept = spellCore.carryOver(previous.things, program)
  if (!previous.app || appIsMounted()) return
  const name = previous.things.find(({ thing }) => thing === previous.app)?.name
  const app = name && kept.includes(name) ? (program[name] as { start?: () => void }) : undefined
  app?.start?.()
}

/** What a run left, for the next to carry over -- see `lastRun()`. */
type LastRun = {
  /** Its top-level things, by name. */
  things: ReturnType<typeof spellCore.things.topLevel>
  /** The app it drew, if any. */
  app?: object
}

/** The things of the last run that ran to its end, while the runs after it throw -- see `lastRun()`. */
let carryAfterFailure: LastRun | undefined

/** Take down the app the last run started, if any -- e.g. before showing another project. */
export function unmountApp() {
  const element = spellCore.appElement() as AppElement | null
  element?.spellRoot?.unmount()
}

/**
 * Did the last run start an app?  `App.start()` leaves it on the mount point (`spellCore.mountApp()`).
 * - An app started later, e.g. from a timer, isn't there yet -- a runner should watch for it drawing.
 */
export function appIsMounted(): boolean {
  return !!(spellCore.appElement() as AppElement | null)?.spellRoot
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

/** Ids of the projects `source` imports, each once, in order -- e.g. `@system:examples:Solitaire`. */
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
 * - NOTE: a copy, NOT imported:  `$/spell` would pull the whole parser into the runner bundle.
 */
const PROJECT_MODULE = "@spell/project/"

/** The app's mount point, with the mounted app `App.start()` leaves on it. */
type AppElement = HTMLElement & { spellRoot?: { app?: object; unmount(): void } }
