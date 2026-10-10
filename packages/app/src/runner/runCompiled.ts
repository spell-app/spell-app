/**
 * Running compiled spell javascript -- in every runner:  the app, the VS Code runner's webview, and `<spell-app>`.
 * - Compiled spell `import`s `@spell/core`, and any projects it imports as `@spell/project/<projectId>`.
 *   We rewrite them onto URLs -- the runtime's own, and a `blob:` URL per project -- see `linkModule()`.  NO
 *   import map:  a page has one, but each runner needs its own `@spell/core`.
 * - Part of `spell-runtime.js`, NOT the runners themselves:  it runs on the `spellCore` of the runtime copy it's
 *   in -- see `spellRuntime.ts`'s `runApp()`.
 */

import { spellCore, SPELL_CORE_MODULE } from "$/core"

/**
 * Run `compiled` spell javascript afresh:  previous app unmounted, new `spellCore.RUNTIME`, empty console --
 * unless `keepConsole`.
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Each project it imports comes from `options.loadImport()`, linked onto its own `blob:` URL -- once per run,
 *   however many import it, deepest first.  Without `loadImport`, a project which imports another won't run.
 * - SIDE EFFECT:  hands its top-level things to `spellCore.things`, for the Thing Explorer -- NOT those of
 *   the projects it imports.  Its classes AND theirs too, so `spellCore.fromJSON()` finds them by name.
 * - Answers the error message if it threw, else `undefined`.
 */
export async function runCompiled(compiled: string, options: RunCompiledOptions): Promise<string | undefined> {
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
    // NOTE: the URL first, THEN `import()` it:  vite wraps `import(...)` in an arrow for its preloading, so an
    // `await` in its argument would end up in a function that isn't `async` -- a syntax error in the bundle
    const url = await link(compiled, [])
    const program = (await import(/* @vite-ignore */ url)) as Record<string, unknown>
    // the classes of each project it imports, e.g. Solitaire's `Card`, for `spellCore.fromJSON()`:  the program
    // imported them already, so this runs nothing again
    for (const projectUrl of linked.values()) {
      const project = await projectUrl
      spellCore.things.addClasses((await import(/* @vite-ignore */ project)) as Record<string, unknown>)
    }
    spellCore.things.setTopLevel(program)
    return undefined
  } catch (error) {
    // Log too, so devtools show the stack.
    console.error(error)
    return error instanceof Error ? error.message : String(error)
  } finally {
    // modules once imported stay imported:  the URLs aren't needed any more
    urls.forEach((url) => URL.revokeObjectURL(url))
  }

  /**
   * `blob:` URL of `source` linked:  its `@spell/core` onto `coreUrl`, each project it imports onto its own,
   * linked first.  `chain` is the projects we're linking this for, to catch projects importing each other.
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
   * URL of the module compiled spell's `@spell/core` import is pointed at:  the runtime copy it runs on --
   * see `loadRuntime()`.  MUST be the copy this `runCompiled()` is from, so the program's `spellCore` is ours.
   */
  coreUrl: string
  /** Compiled javascript of project `projectId`, which the program imports. */
  loadImport?: (projectId: string) => Promise<string>
  /** Keep what's on the console, e.g. the app's own "Compiling ..." lines, above the program's. */
  keepConsole?: boolean
}

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
 * `source` with its imports pointed at URLs:  `@spell/core` at `coreUrl`, and each `@spell/project/<projectId>`
 * at `imports[projectId]`.
 * - Pure.  A project not in `imports` is left as it was.
 */
export function linkModule(source: string, coreUrl: string, imports: Record<string, string> = {}): string {
  return source.replace(SPELL_IMPORT, (whole, from: string, specifier: string) => {
    const url = specifier === SPELL_CORE_MODULE ? coreUrl : imports[specifier.slice(PROJECT_MODULE.length)]
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
type AppElement = HTMLElement & { spellRoot?: { unmount(): void } }
