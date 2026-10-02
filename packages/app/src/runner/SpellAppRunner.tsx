/** @jsxImportSource react */
import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import type { LSP } from "$/lsp"
import type { ThingExplorerState, TypeExplorerState } from "$/app/ui/ui.types"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { TypeExplorer } from "$/app/ui/TypeExplorer"
import { ThingExplorer } from "$/app/ui/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { loadScopePack, scopesFromPacks, type ScopesSource } from "$/lsp/ScopesSource"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"
import type { SpellCompiled } from "./runner.types"

import "./SpellAppRunner.css"

/****************
 * ### `<SpellAppRunner>`
 * Runs one spell app in a page, inside `<spell-app>`'s shadow root:  an optional toolbar, the app, and a
 * "debug" pane below it -- the Type Explorer, the Thing Explorer, and the program's console.
 * - Runs on its OWN copy of the spell runtime -- see `loadRuntime()` -- so many can run on a page at once.
 * - Runs `source` when the runtime's loaded, again when `source` changes -- a NEW object -- and on Restart.
 *   Restart fetches the program afresh, so a recompiled one shows -- or runs `source.compiled` again, if set.
 * - A program with NO app shows its console on top instead, and the explorers below.
 * - The Type Explorer is read-only, and shows only if there's a scope pack -- see `ScopesSource`.
 * - NEVER imports `$/core`:  it'd land in the bundle's shared chunk, so every app would share it.
 *   Everything of spell's comes from this app's copy of the runtime.
 ****************/
export function SpellAppRunner(props: SpellAppRunnerProps) {
  const { source, toolbar, fluid, runtimeUrl, builtInsUrl, onOpen, onControls } = props
  const appRef = React.useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = React.useState<LoadedRuntime>()
  const [error, setError] = React.useState<string>()
  // Does the program draw an app?  Assume so until a run says.
  const [hasApp, setHasApp] = React.useState(true)
  const [debugOpen, setDebugOpen] = React.useState(!!props.debug)
  const [pane, setPane] = React.useState<DebugPane>(props.debug ?? "explorer")
  const [split, setSplit] = React.useState(fluid ? DEFAULT_DEBUG_HEIGHT : DEFAULT_SPLIT)
  const [scopes, setScopes] = React.useState<ScopesSource>()
  const [explorerState, setExplorerState] = React.useState<TypeExplorerState>({})
  const [thingsState, setThingsState] = React.useState<ThingExplorerState>({})
  // compiled javascript of each project the last run loaded, by id -- for the Type Explorer's "Compiled Output"
  const compiledRef = React.useRef(new Map<string, string>())

  // this app's own copy of the runtime, for as long as we're here
  React.useEffect(() => {
    const appRoot = appRef.current as AppElement | null
    let copy: LoadedRuntime | undefined
    let gone = false
    loadRuntime(runtimeUrl).then(
      (it) => (gone ? it.release() : setLoaded((copy = it))),
      (problem: unknown) => setError(messageOf(problem))
    )
    return () => {
      gone = true
      appRoot?.REACT_ROOT?.unmount()
      copy?.release()
    }
  }, [runtimeUrl])

  /** Run the program afresh in `copy` -- see `runProgram()` -- and show how it went. */
  const run = React.useCallback(
    async (copy: LoadedRuntime) => {
      const ran = await runProgram(copy, source, appRef.current!)
      compiledRef.current = ran.compiled
      setError(ran.error)
      setHasApp(ran.hasApp)
    },
    [source]
  )

  React.useEffect(() => {
    if (loaded) void run(loaded)
  }, [loaded, run])

  React.useEffect(() => {
    let gone = false
    void loadScopes(source, builtInsUrl, compiledRef).then((it) => gone || setScopes(it))
    return () => {
      gone = true
    }
  }, [source, builtInsUrl])

  React.useEffect(() => {
    onControls?.({ restart })
  })

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  React.useEffect(() => {
    const element = appRef.current
    if (!element) return
    const observer = new MutationObserver(() => {
      if (element.childElementCount) setHasApp(true)
    })
    observer.observe(element, { childList: true })
    return () => observer.disconnect()
  }, [])

  const output = loaded && <RunnerConsole console={loaded.runtime.spellCore.console} />
  const explorer = scopes && (
    <TypeExplorer
      readonly
      tree={scopes.tree}
      loadDetails={scopes.details}
      onOpen={onOpen}
      state={explorerState}
      onStateChange={setExplorerState}
    />
  )
  const things = loaded && (
    <ThingExplorer things={loaded.runtime.spellCore.things} state={thingsState} onStateChange={setThingsState} />
  )
  const content: Record<DebugPane, ReactNode> = { explorer, things, console: output }
  let bottom: ReactNode = undefined
  if (debugOpen) {
    // no app:  its console's on top already
    const ids = [...(explorer ? ["explorer" as const] : []), "things" as const, ...(hasApp ? ["console" as const] : [])]
    const showing = ids.includes(pane) ? pane : ids[0]
    bottom = (
      <RunnerPane tabs={ids.map((id) => DEBUG_TABS[id])} pane={showing} onPane={setPane} content={content[showing]} />
    )
  }

  return (
    <div className={classnames("SpellApp", { fluid })}>
      {toolbar && (
        <SpellAppToolbar
          name={source.name}
          error={error}
          onRestart={restart}
          debugOpen={debugOpen}
          onToggleDebug={() => setDebugOpen(!debugOpen)}
        />
      )}
      {!toolbar && !!error && <div className="SpellAppError">{error}</div>}
      <RunnerSplit unit={fluid ? "px" : "%"} split={split} onSplit={setSplit} bottom={bottom}>
        {/* NOTE: ALWAYS here, just hidden without an app -- so its mount point is never redrawn */}
        <div className={classnames("SpellAppApp", { hidden: !hasApp })}>
          <div ref={appRef} className="App" />
        </div>
        {!hasApp && <RunnerPane tabs={[DEBUG_TABS.console]} pane="console" content={output} />}
      </RunnerSplit>
    </div>
  )

  /** Run the program again, afresh -- once the runtime's loaded. */
  function restart() {
    if (loaded) void run(loaded)
  }
}

/** Props for `<SpellAppRunner>`. */
export type SpellAppRunnerProps = {
  /**
   * What to run, and where its scope pack is -- from `<spell-app>`'s attributes, or pushed by an editor.
   * - Re-run when this is a NEW object -- see `SpellAppSource`.
   */
  source: SpellAppSource
  /** Show the toolbar? */
  toolbar: boolean
  /** Open the debug pane to start, on this tab -- else it starts closed. */
  debug?: DebugPane
  /** As tall as it needs to be, NOT a fixed height -- see `<RunnerSplit unit>`. */
  fluid: boolean
  /** URL of `spell-runtime.js`, which each app loads a copy of. */
  runtimeUrl: string
  /** URL of the built-in types' scope pack, `spellCore.scopes.js`. */
  builtInsUrl: string
  /** A Type Explorer link clicked, e.g. `spell:/@system:examples:Solitaire/Card.spell#L12`. */
  onOpen: (href: string) => void
  /** Hand over what the element can do to us, e.g. `restart()` -- every render. */
  onControls?: (controls: SpellAppControls) => void
}

/**
 * Where a `<spell-app>`'s program, and what's around it, come from -- worked out from its attributes, or from
 * code a `<spell-editor>` pushed to it.  See `pushedSource()`.
 * - NOTE: `compiled` and `scopes` are in memory, the rest are URLs.  An in-memory one wins over its URL.
 */
export type SpellAppSource = {
  /** Name for the toolbar, e.g. `Solitaire`. */
  name: string
  /**
   * URL of its compiled javascript.
   * - NOT fetched while `compiled` is set.  Still required:  every source has one, as a project's is its server's.
   */
  compiledUrl: string
  /** Its compiled javascript, in memory -- run instead of fetching `compiledUrl`, e.g. what an editor compiled. */
  compiled?: string
  /** URL of its scope pack, if it may have one. */
  scopesUrl?: string
  /** Its scope pack, in memory -- used instead of loading `scopesUrl`, e.g. fresh from an editor. */
  scopes?: LSP.ScopePack
  /** URL of the compiled javascript of project `projectId`, which it imports. */
  importUrl: (projectId: string) => string
  /** URL of spell file `uri`, e.g. `spell:/@system:examples:Solitaire/Card.spell` -- if its sources can be had. */
  sourceUrl?: (uri: string) => string
}

/** What a `<spell-app>` can ask its runner to do. */
export type SpellAppControls = {
  /** Run the program again, afresh. */
  restart: () => void
}

/** Tab of the debug pane:  the Type Explorer, the Thing Explorer, or the program's console. */
export type DebugPane = "explorer" | "things" | "console"

/** Each tab of the debug pane, in order -- e.g. what `<spell-app debug>` may say. */
export const DEBUG_PANES: DebugPane[] = ["explorer", "things", "console"]

/****************
 * ### `<SpellAppToolbar>`
 * The app's name, Restart, the last run's error if it threw, then "Debug" at the right.
 ****************/
function SpellAppToolbar({ name, error, onRestart, debugOpen, onToggleDebug }: SpellAppToolbarProps) {
  return (
    <SUI.Menu attached="top" size="small" className="SpellAppToolbar">
      <SUI.Menu.Item header content={name} />
      <SUI.Menu.Item icon="redo" content="Restart" onClick={onRestart} />
      {!!error && <SUI.Menu.Item className="error" icon="warning sign" content={error} />}
      <SUI.Menu.Menu position="right">
        <SUI.Menu.Item icon="bug" content="Debug" active={debugOpen} onClick={onToggleDebug} />
      </SUI.Menu.Menu>
    </SUI.Menu>
  )
}

/** Props for `<SpellAppToolbar>`. */
type SpellAppToolbarProps = {
  /** App's name. */
  name: string
  /** Last run's error message, if it threw. */
  error?: string
  /** Restart pressed. */
  onRestart: () => void
  /** Is the debug pane showing? */
  debugOpen: boolean
  /** "Debug" pressed. */
  onToggleDebug: () => void
}

////////////////
// ## Running
////////////////

/**
 * Run `source`'s program afresh in runtime copy `copy`, drawing into `appRoot`:  fetched again, with each project
 * it imports.
 * - NOTE: its own javascript is NOT fetched if it's in memory, `source.compiled` -- its imports still are.
 * - Answers how it went, and the compiled javascript it loaded, by project id -- the program's own under
 *   `MAIN_PROJECT` -- for the Type Explorer's "Compiled Output".
 */
async function runProgram(copy: LoadedRuntime, source: SpellAppSource, appRoot: HTMLElement): Promise<Ran> {
  const compiled = new Map<string, string>()
  try {
    const text = source.compiled ?? (await fetchText(source.compiledUrl))
    compiled.set(MAIN_PROJECT, text)
    const error = await copy.runtime.runApp(text, {
      appRoot,
      coreUrl: copy.coreUrl,
      loadImport: async (projectId) => {
        const imported = await fetchText(source.importUrl(projectId))
        compiled.set(projectId, imported)
        return imported
      }
    })
    return { error, hasApp: copy.runtime.appIsMounted(), compiled }
  } catch (problem) {
    return { error: messageOf(problem), hasApp: false, compiled }
  }
}

/** How a run went -- see `runProgram()`. */
type Ran = {
  /** Its error message, if it threw. */
  error?: string
  /** Did it start an app? */
  hasApp: boolean
  /** Compiled javascript it loaded, by project id -- the program's own under `MAIN_PROJECT`. */
  compiled: Map<string, string>
}

/**
 * The Type Explorer's data for `source`:  the built-ins' scope pack, then its own -- `undefined` if it has none.
 * - Its own is `source.scopes` if that's set, else loaded from `source.scopesUrl`.
 * - Its `spell` from the sources, if `source` says where they are;  its `compiled` from what the last run
 *   loaded, in `compiledRef`.
 */
async function loadScopes(
  source: SpellAppSource,
  builtInsUrl: string,
  compiledRef: React.MutableRefObject<Map<string, string>>
): Promise<ScopesSource | undefined> {
  const [builtIns, pack] = await Promise.all([
    loadScopePack(builtInsUrl),
    source.scopes ?? (source.scopesUrl ? loadScopePack(source.scopesUrl) : undefined)
  ])
  if (!pack) return undefined
  const { sourceUrl } = source
  return scopesFromPacks(builtIns ? [builtIns, pack] : [pack], {
    loadSource: sourceUrl && ((uri) => fetchText(sourceUrl(uri))),
    loadCompiled: async (projectId) => compiledRef.current.get(projectId === pack.id ? MAIN_PROJECT : projectId)
  })
}

////////////////
// ## Fed by an editor
//  what a `<spell-app editor="<selector>">` decides -- here, NOT in `SpellAppElement`, so it's testable with no DOM.
////////////////

/**
 * What a `<spell-app>` runs for `pushed`, code an editor compiled:  `base` -- its project's source, for its imports
 * and sources -- with `pushed`'s javascript and scope pack in memory.
 * - A NEW object, so `<SpellAppRunner>` re-runs it.
 * - `name`, the app's `name` attribute, wins over `base`'s, if set.
 */
export function pushedSource(base: SpellAppSource, pushed: SpellCompiled, name?: string | null): SpellAppSource {
  return {
    ...base,
    name: name || base.name,
    compiled: pushed.compiled,
    ...(pushed.scopes ? { scopes: pushed.scopes } : {})
  }
}

/**
 * Does changing `<spell-app>` attribute `attribute` from `old` to `value` drop the code an editor pushed to it?
 * - Yes for what says what it runs, or which editor it's fed by:  see `DROPS_PUSHED_CODE`.
 * - NOT `toolbar`, `debug`, `width`, `height`, `assets`:  they change how it looks, and NEVER re-run it.
 * - NOTE: setting an attribute to the value it has is NOT a change.
 */
export function dropsPushedCode(attribute: string, old: string | null, value: string | null): boolean {
  return old !== value && DROPS_PUSHED_CODE.includes(attribute)
}

/** `<spell-app>` attributes whose change drops the code an editor pushed to it -- see `dropsPushedCode()`. */
const DROPS_PUSHED_CODE = ["project", "src", "scopes", "name", "editor"]

/**
 * Is `target`, what fired an event, an element `selector` matches -- e.g. a `<spell-app>`'s `editor`?
 * - `false` if it's not an element, or `selector` isn't a CSS selector.
 * - NOTE: duck-typed, NOT `instanceof Element`, which throws where there's no DOM.
 */
export function isEditor(target: unknown, selector: string): boolean {
  const element = target as { matches?: unknown } | null
  if (typeof element?.matches !== "function") return false
  return orIfBadSelector(() => (target as Element).matches(selector), false)
}

/**
 * What the editor `selector` finds in `root` compiled last -- its `compiled` property -- if anything.
 * - `undefined` if there's no such editor, it hasn't compiled, or `selector` isn't a CSS selector.
 */
export function editorCompiled(root: EditorRoot, selector: string): SpellCompiled | undefined {
  const editor = orIfBadSelector(() => root.querySelector(selector), null) as EditorElement | null
  return editor?.compiled
}

/** Where a `<spell-app>` looks for its editor:  its root node, a document or a shadow root. */
export type EditorRoot = { querySelector(selector: string): Element | null }

/** A `<spell-editor>`, as far as a `<spell-app>` cares:  what it compiled last, if anything. */
type EditorElement = { compiled?: SpellCompiled }

/**
 * `find()` -- else `fallback` if it threw because a selector isn't CSS, a `SyntaxError` `DOMException`.
 * - Anything else it throws, it throws.
 */
function orIfBadSelector<T>(find: () => T, fallback: T): T {
  try {
    return find()
  } catch (problem) {
    if ((problem as { name?: unknown } | null)?.name === "SyntaxError") return fallback
    throw problem
  }
}

////////////////
// ## Helpers
////////////////

/** Each debug pane tab. */
const DEBUG_TABS: Record<DebugPane, RunnerTab<DebugPane>> = {
  explorer: { id: "explorer", icon: "sitemap", title: "Type Explorer" },
  things: { id: "things", icon: "cubes", title: "Thing Explorer" },
  console: { id: "console", icon: "terminal", title: "Console" }
}

/** Debug pane's height to start, in px, when `fluid` -- until dragged. */
const DEFAULT_DEBUG_HEIGHT = 280

/** Key in a run's compiled javascript for the program's own -- its project id isn't known until its pack is. */
const MAIN_PROJECT = ""

/** Text at `url`, fetched afresh -- throwing if it's not there. */
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-cache" })
  if (!response.ok) throw new Error(`Couldn't load ${url}:  ${response.status} ${response.statusText}`)
  return response.text()
}

/** Message of `problem`, whatever was thrown. */
function messageOf(problem: unknown): string {
  return problem instanceof Error ? problem.message : String(problem)
}

/** The app's mount point, with the React root `App.start()` leaves on it. */
type AppElement = HTMLElement & { REACT_ROOT?: { unmount(): void } }
