import { Match, Show, Switch, createEffect, createSignal, onSettled, untrack } from "solid-js"

import type { LSP } from "$/lsp"
import type { ThingExplorerState, TypeExplorerState } from "$/app/ui/ui.types"
// Import directly, NOT through the `$/app/solid` barrel, which pulls in the editor
import { TypeExplorer } from "$/app/solid/TypeExplorer"
import { ThingExplorer } from "$/app/solid/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { fetchJSON, fetchText } from "./fetchFresh"
import { loadScopePack, scopesFromPacks, type CompiledDeclarations, type ScopesSource } from "$/lsp/ScopesSource"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"
import type { SpellCompiled } from "./runner.types"

import "./SpellAppRunner.css"

/****************
 * ### `<SpellAppRunner>`
 * Runs one spell app in a page, inside `<spell-app>`'s shadow root:
 * an optional toolbar, the app, and a "debug" pane below it --
 * the Type Explorer, the Thing Explorer, and the program's console.
 * - Runs on its OWN copy of the spell runtime -- see `loadRuntime()` -- so many can run on a page at once.
 * - Runs `source` when the runtime's loaded, again when `source` changes -- a NEW object -- and on Restart.
 *   Restart fetches the program afresh, so a recompiled one shows -- or runs `source.compiled` again, if set.
 * - The program draws with Solid (`App.start()` mounts its own root, `spellCore.mountApp()`):
 *   we only hand it `appRoot`, a `<div>` drawn once and never touched again.
 *   The app it mounted is unmounted with us.
 * - A program with NO app shows its console on top instead, and the explorers below.
 *   One that starts its app AFTER the run finished, e.g. from a timer, shows it once it draws.
 * - The Type Explorer is read-only, and shows only if there's a scope pack -- see `ScopesSource`.
 * - `debug` and `fluid` are read once, to start;  `runtimeUrl` once per copy loaded.
 * - Its `<ui-*>` tags are the caller's to define, with Fomantic's icon names:
 *   `<spell-app>` is a root that loads them as they appear;  the VS Code runner imports `$/app/solid/loadUI`.
 * - NEVER imports `$/core`:  it'd land in the bundle's shared chunk, so every app would share it.
 *   Everything of spell's comes from this app's copy of the runtime.
 ****************/
export function SpellAppRunner(props: SpellAppRunnerProps) {
  const [loaded, setLoaded] = createSignal<LoadedRuntime>()
  const [error, setError] = createSignal<string>()
  // Does the program draw an app?  Assume so until a run says.
  const [hasApp, setHasApp] = createSignal(true)
  const [debugOpen, setDebugOpen] = createSignal(!!untrack(() => props.debug))
  const [pane, setPane] = createSignal<DebugPane>(untrack(() => props.debug) ?? "explorer")
  const [split, setSplit] = createSignal(untrack(() => props.fluid) ? DEFAULT_DEBUG_HEIGHT : DEFAULT_SPLIT)
  const [scopes, setScopes] = createSignal<ScopesSource>()
  // the explorers' state, kept here so it outlives switching tabs:  each reads it once, as it mounts
  let explorerState: TypeExplorerState = {}
  let thingsState: ThingExplorerState = {}
  // compiled javascript of each project the last run loaded, by id -- for the Type Explorer's "Compiled Output"
  const compiledRef: CompiledRef = { current: new Map() }

  // NOTE: ALWAYS here, just hidden without an app -- so its mount point is never redrawn
  const appRoot = (<div class="App" />) as HTMLDivElement
  const appPane = <div class={["SpellAppApp", { hidden: !hasApp() }]}>{appRoot}</div>

  // this app's own copy of the runtime, for as long as we're here -- and its app, unmounted with us
  createEffect(
    () => props.runtimeUrl,
    (runtimeUrl) => {
      let copy: LoadedRuntime | undefined
      let gone = false
      loadRuntime(runtimeUrl).then(
        (it) => (gone ? it.release() : setLoaded((copy = it))),
        (problem: unknown) => setError(messageOf(problem))
      )
      return () => {
        gone = true
        ;(appRoot as AppElement).spellRoot?.unmount()
        copy?.release()
      }
    }
  )

  // run the program -- once the runtime's loaded, and again for each new `source`
  createEffect(
    () => [loaded(), props.source] as const,
    ([copy, source]) => {
      if (copy) void run(copy, source)
    }
  )

  // the Type Explorer's scopes, for each new `source`
  createEffect(
    () => [props.source, props.builtInsUrl] as const,
    ([source, builtInsUrl]) => {
      let gone = false
      void loadScopes(source, builtInsUrl, compiledRef).then((it) => gone || setScopes(it))
      return () => {
        gone = true
      }
    }
  )

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  onSettled(() => {
    const observer = new MutationObserver(() => {
      if (appRoot.childElementCount) setHasApp(true)
    })
    observer.observe(appRoot, { childList: true })
    return () => observer.disconnect()
  })

  props.onControls?.({ restart })

  return (
    <div class={["SpellApp", { fluid: props.fluid }]}>
      <Show when={props.toolbar}>
        <SpellAppToolbar
          name={props.source.name}
          error={error()}
          onRestart={restart}
          debugOpen={debugOpen()}
          onToggleDebug={() => setDebugOpen(!debugOpen())}
        />
      </Show>
      <Show when={!props.toolbar && error()}>
        <div class="SpellAppError">{error()}</div>
      </Show>
      <RunnerSplit
        unit={props.fluid ? "px" : "%"}
        split={split()}
        onSplit={setSplit}
        showBottom={debugOpen()}
        bottom={
          <RunnerPane tabs={debugTabs().map((id) => DEBUG_TABS[id])} pane={showing()} onPane={setPane}>
            <Switch>
              <Match when={showing() === "explorer"}>{explorer()}</Match>
              <Match when={showing() === "things"}>{things()}</Match>
              <Match when={showing() === "console"}>{output()}</Match>
            </Switch>
          </RunnerPane>
        }
      >
        {appPane}
        <Show when={!hasApp()}>
          <RunnerPane tabs={[DEBUG_TABS.console]} pane="console">
            {output()}
          </RunnerPane>
        </Show>
      </RunnerSplit>
    </div>
  )

  /** Tabs the debug pane has now -- no console without an app:  it's on top already. */
  function debugTabs(): DebugPane[] {
    return [...(scopes() ? ["explorer" as const] : []), "things" as const, ...(hasApp() ? ["console" as const] : [])]
  }

  /** Tab the debug pane shows:  the one chosen, if it has it, else its first. */
  function showing(): DebugPane {
    const tabs = debugTabs()
    return tabs.includes(pane()) ? pane() : tabs[0]!
  }

  /** Run the program again, afresh -- once the runtime's loaded. */
  function restart() {
    const copy = loaded()
    if (copy) void run(copy, props.source)
  }

  /** Run `source` afresh in `copy` -- see `runProgram()` -- and show how it went. */
  async function run(copy: LoadedRuntime, source: SpellAppSource) {
    const ran = await runProgram(copy, source, appRoot)
    compiledRef.current = ran.compiled
    setError(ran.error)
    setHasApp(ran.hasApp)
  }

  /** The Type Explorer, read-only, if there's a scope pack. */
  function explorer() {
    return (
      <Show when={scopes()} keyed>
        {(it) => (
          <TypeExplorer
            readonly
            tree={it.tree}
            loadDetails={it.details}
            onOpen={(href) => props.onOpen(href)}
            state={explorerState}
            onStateChange={(state) => (explorerState = state)}
          />
        )}
      </Show>
    )
  }

  /** The Thing Explorer, once the runtime's loaded. */
  function things() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => (
          <ThingExplorer
            things={copy.runtime.spellCore.things}
            state={thingsState}
            onStateChange={(state) => (thingsState = state)}
          />
        )}
      </Show>
    )
  }

  /** The program's console, once the runtime's loaded. */
  function output() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => <RunnerConsole console={copy.runtime.spellCore.console} />}
      </Show>
    )
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
 * Where a `<spell-app>`'s program, and what's around it, come from --
 * worked out from its attributes, or from code a `<spell-editor>` pushed to it.  See `pushedSource()`.
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
  /** URL of its declarations, `<Project>.declarations.json`, if it may have them:  where the Type Explorer finds code. */
  declarationsUrl?: string
  /** Its declarations, in memory -- used instead of loading `declarationsUrl`, e.g. fresh from an editor. */
  declarations?: CompiledDeclarations
  /** URL of the compiled javascript of project `projectId`, which it imports. */
  importUrl: (projectId: string) => string
  /** URL of the declarations of project `projectId`, which it imports -- if it may have them. */
  importDeclarationsUrl?: (projectId: string) => string
  /** URL of spell file `uri`, e.g. `spell:/@system:examples:Solitaire/Card.spell` -- if its sources can be had. */
  sourceUrl?: (uri: string) => string
}

/** What a `<spell-app>` can ask its runner to do. */
export type SpellAppControls = {
  /** Run the program again, afresh. */
  restart: () => void
}

/** Tab of the debug pane:  the Type Explorer, the Thing Explorer, or the program's console (`<spell-app debug>`). */
export type DebugPane = "explorer" | "things" | "console"

/****************
 * ### `<SpellAppToolbar>`
 * The app's name, Restart, the last run's error if it threw, then "Debug" at the right.
 * - HACK: icons are slotted `<ui-icon>`s, not the items' `icon`:  see `<RunnerPane>`.
 ****************/
function SpellAppToolbar(props: SpellAppToolbarProps) {
  return (
    <ui-menu attached="top" size="small" class="SpellAppToolbar">
      <ui-item type="header">{props.name}</ui-item>
      <ui-item link="" class="restart" onClick={() => props.onRestart()}>
        <ui-icon name="redo" />
        Restart
      </ui-item>
      <Show when={props.error}>
        <ui-item class="error">
          <ui-icon name="warning sign" />
          {props.error}
        </ui-item>
      </Show>
      <ui-menu position="right">
        <ui-item link="" class="debug" selected={props.debugOpen} onClick={() => props.onToggleDebug()}>
          <ui-icon name="bug" />
          Debug
        </ui-item>
      </ui-menu>
    </ui-menu>
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
 * Run `source`'s program afresh in runtime copy `copy`, drawing into `appRoot`:
 * fetched again, with each project it imports.
 * - NOTE: its own javascript is NOT fetched if it's in memory, `source.compiled` -- its imports still are.
 * - Answers how it went, and the compiled javascript it loaded, by project id --
 *   the program's own under `MAIN_PROJECT` -- for the Type Explorer's "Compiled Output".
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
 * - Its `spell` from the sources, if `source` says where they are;
 *   its `compiled` from what the last run loaded, in `compiledRef`.
 */
async function loadScopes(
  source: SpellAppSource,
  builtInsUrl: string,
  compiledRef: CompiledRef
): Promise<ScopesSource | undefined> {
  const [builtIns, pack] = await Promise.all([
    loadScopePack(builtInsUrl),
    source.scopes ?? (source.scopesUrl ? loadScopePack(source.scopesUrl) : undefined)
  ])
  if (!pack) return undefined
  const { sourceUrl } = source
  return scopesFromPacks(builtIns ? [builtIns, pack] : [pack], {
    loadSource: sourceUrl && ((uri) => fetchText(sourceUrl(uri))),
    loadCompiled: async (projectId) => compiledRef.current.get(projectId === pack.id ? MAIN_PROJECT : projectId),
    loadDeclarations: async (projectId) => {
      if (projectId !== pack.id) return fetchJSON(source.importDeclarationsUrl?.(projectId))
      return source.declarations ?? fetchJSON(source.declarationsUrl)
    }
  })
}

////////////////
// ## Fed by an editor
//  what a `<spell-app editor="<selector>">` decides --
//  here, NOT in its component (`SpellApp`), so it's testable with no DOM.
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
    ...(pushed.scopes ? { scopes: pushed.scopes } : {}),
    ...(pushed.declarations ? { declarations: pushed.declarations } : {})
  }
}

/**
 * What code pushed to a `<spell-app>` was pushed FOR:  the app's `project`, `src`, `scopes`, `name` and `editor` then
 * (`PUSHED_FOR`), as one string.
 * - Pushed code counts only while the app's are the same:
 *   a change of what it runs, or of which editor feeds it, drops it.
 * - NOT `toolbar`, `debug`, `width`, `height`, `assets`:  they change how it looks, and NEVER re-run it.
 * - `undefined` and `null` are the same:  no such attribute.
 */
export function pushedKey(app: PushedFor): string {
  return JSON.stringify(PUSHED_FOR.map((name) => app[name] ?? null))
}

/** The `<spell-app>` attributes whose change drops the code an editor pushed to it -- see `pushedKey()`. */
export const PUSHED_FOR = ["project", "src", "scopes", "name", "editor"] as const

/** A `<spell-app>`, or its component, as far as `pushedKey()` cares. */
export type PushedFor = { readonly [Name in (typeof PUSHED_FOR)[number]]?: string | null }

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

/** Message of `problem`, whatever was thrown. */
function messageOf(problem: unknown): string {
  return problem instanceof Error ? problem.message : String(problem)
}

/** The app's mount point, with the mounted app `App.start()` leaves on it (`spellCore.mountApp()`). */
type AppElement = HTMLElement & { spellRoot?: { unmount(): void } }

/** Compiled javascript the last run loaded, by project id -- a box, so the Type Explorer reads the latest. */
type CompiledRef = { current: Map<string, string> }
