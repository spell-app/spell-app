/**
 * Running compiled spell javascript in a page with no import map:  the VS Code runner's webview,
 * and `<spell-app>`.
 * - Compiled spell `import`s `@spell/core`, and any projects it imports as `@spell/project/<projectId>`.
 *   With no import map to resolve those, we rewrite them onto `blob:` URLs -- see `linkModule()`.
 * - Mirrors `SpellProject.executeCompiled()` + `editor.selectPath()`'s unmount, which fetch from the server instead.
 */
import type { Root } from "react-dom/client"

import { spellCore, Thing, List, App, SPELL_CORE_MODULE, SPELL_CORE_NAMES } from "~/spellCore"

/**
 * Run `compiled` spell javascript afresh:  previous app unmounted, new `spellCore.RUNTIME`, empty console.
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Each project it imports comes from `options.loadImport()`, linked onto its own `blob:` URL -- once per run,
 *   however many import it, deepest first.  Without `loadImport`, a project which imports another won't run.
 * - Answers the error message if it threw, else `undefined`.
 */
export async function runCompiled(compiled: string, options: RunCompiledOptions = {}): Promise<string | undefined> {
  const element = spellCore.appElement() as AppElement | null
  element?.REACT_ROOT?.unmount()
  if (element) delete element.REACT_ROOT
  spellCore.resetRuntime()
  spellCore.console.clear()

  const { loadImport } = options
  if (!loadImport && projectImportsOf(compiled).length) {
    return "This project imports another, which the VS Code runner can't load yet -- run it in the app."
  }
  const coreUrl = options.coreUrl ?? spellCoreModuleUrl()
  // blob URL of each project linked this run, by id
  const linked = new Map<string, Promise<string>>()
  const urls: string[] = []
  try {
    // NOTE: the URL first, THEN `import()` it:  vite wraps `import(...)` in an arrow for its preloading, so an
    // `await` in its argument would end up in a function that isn't `async` -- a syntax error in the bundle
    const url = await link(compiled, [])
    await import(/* @vite-ignore */ url)
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
   * URL of the module compiled spell's `@spell/core` import is pointed at.
   * - Default:  a module re-exporting THIS bundle's `spellCore` -- see `spellCoreModuleUrl()`.
   * - `<spell-app>` gives its own copy's, so each app on a page has its own `spellCore`.
   */
  coreUrl?: string
  /** Compiled javascript of project `projectId`, which the program imports. */
  loadImport?: (projectId: string) => Promise<string>
}

/**
 * Did the last run start an app?  `App.start()` leaves its React root on the mount point.
 * - An app started later, e.g. from a timer, isn't there yet -- a runner should watch for it drawing.
 */
export function appIsMounted(): boolean {
  return !!(spellCore.appElement() as AppElement | null)?.REACT_ROOT
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
 * - NOTE: a copy, NOT imported:  `~/languages/spell` would pull the whole parser into the runner bundle.
 */
const PROJECT_MODULE = "@spell/project/"

/** Key on `globalThis` for what `spellCoreModuleUrl()`'s module re-exports. */
const RUNNER_SPELL_CORE = "__RUNNER_SPELL_CORE__"

/** `blob:` URL of a module re-exporting this bundle's `spellCore` and built-ins -- made once, on first use. */
let spellCoreUrl: string | undefined

/**
 * URL compiled spell's `@spell/core` import is pointed at by default:  a module re-exporting OUR `spellCore`,
 * `Thing` ... -- see `SPELL_CORE_NAMES`.
 * - Why:  the app resolves `@spell/core` with an import map, which a webview doesn't have.  And it MUST be this
 *   same `spellCore`:  a second copy would be a second `RUNTIME` and console, which the runner never shows.
 * - SIDE EFFECT:  puts those on `globalThis[RUNNER_SPELL_CORE]`, where the module reads them.
 */
function spellCoreModuleUrl(): string {
  if (spellCoreUrl) return spellCoreUrl
  Object.assign(globalThis, { [RUNNER_SPELL_CORE]: { spellCore, Thing, List, App } })
  const source = SPELL_CORE_NAMES.map((name) => `export const ${name} = globalThis.${RUNNER_SPELL_CORE}.${name}`)
  spellCoreUrl = URL.createObjectURL(new Blob([source.join("\n")], { type: "text/javascript" }))
  return spellCoreUrl
}

/** The app's mount point, with the React root `App.start()` leaves on it. */
type AppElement = HTMLElement & { REACT_ROOT?: Root }
