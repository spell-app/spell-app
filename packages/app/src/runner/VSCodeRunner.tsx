import { Match, Show, Switch, createSignal, onCleanup, onSettled } from "solid-js"

import type { LSP } from "$/lsp"
import type { FromRunnerMessage, ProjectSettings, RunnerPaneId, ToRunnerMessage } from "$/app/runner"
// Import directly, NOT through the `$/app/solid` barrel, which pulls in the editor
import { TypeExplorer } from "$/app/solid/TypeExplorer"
import { ThingExplorer } from "$/app/solid/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"

import "$/app/solid/AppContainer.css"
import "./VSCodeRunner.css"

/****************
 * ### `<VSCodeRunner>`
 * Runs a spell project inside the VS Code extension's "Run Project" webview:  a toolbar, then two panes, one above
 * the other, split by a bar you drag.
 * - A program with an `app`:  the app on top, then, if the console's shown, a pane switching between
 *   "Type Explorer", "Thing Explorer" and "Program Output".
 * - One with NO `app` has nothing else to show:  "Program Output" on top, the explorers below, and no
 *   "Show Console" button.  See `hasApp`.  One that starts its app AFTER the run finished, e.g. from a timer,
 *   shows it once it draws.
 * - Runs whatever the extension sends in a `run` message, afresh each time, on its OWN copy of the spell runtime
 *   -- see `loadRuntime()`.  One sent before that's loaded runs once it is.
 * - The program draws with REACT (`App.start()` makes its own root) into `appRoot`, a `<div>` drawn once.
 * - NEVER imports `$/core`:  it'd be bundled beside this, a second copy -- see `spellRuntime.ts`.
 * - Says `ready` once listening, so the extension knows to compile.  Messages sent before then are lost.
 * - How it's shown -- console, tab, split, the explorers' state -- comes from the extension, which remembers
 *   it in the project's `settings.json5`.  See `ProjectSettings`.
 * - `post` and `runtimeUrl` are read once.  Its `<ui-*>` tags are the caller's to define (`$/app/solid/loadUI`),
 *   with Fomantic's icon names (`<ui-root icons="fomantic">` in the webview's HTML).
 ****************/
export function VSCodeRunner(props: VSCodeRunnerProps) {
  const { post, runtimeUrl } = props
  const [loaded, setLoaded] = createSignal<LoadedRuntime>()
  const [error, setError] = createSignal<string>()
  const [settings, setSettings] = createSignal<ProjectSettings>({})
  const showConsole = () => settings().runner?.showConsole ?? false
  const pane = () => settings().runner?.pane ?? "types"
  const split = () => settings().runner?.split ?? DEFAULT_SPLIT
  // Does the program draw an app?  Assume so until a run says -- see `appIsMounted()`.
  const [hasApp, setHasApp] = createSignal(true)
  const [tree, setTree] = createSignal<LSP.ScopeNode>()
  // who's waiting for which details -- see `loadDetails()`
  const detailsWaiting = new Map<string, Array<(details: LSP.ScopeDetails | null) => void>>()
  // what the last `run` message sent, if it came before the runtime -- run once that's loaded
  let toRun: string | undefined

  // NOTE: the app's pane is ALWAYS first, just hidden without an app -- so its mount point is never redrawn.
  const appRoot = (<div class="App" />) as HTMLDivElement
  const appPane = (
    <div class={["VSCodeRunnerApp", { hidden: !hasApp() }]}>
      <div class="AppContainer scrolling padded">{appRoot}</div>
    </div>
  )

  window.addEventListener("message", onMessage)
  onCleanup(() => window.removeEventListener("message", onMessage))
  post({ type: "ready" })

  // our own copy of the spell runtime -- SIDE EFFECT:  its `spellCore` is global `spellCore`, for devtools
  loadRuntime(runtimeUrl).then(
    (copy) => {
      Object.assign(globalThis, { spellCore: copy.runtime.spellCore })
      setLoaded(copy)
      if (toRun !== undefined) run(copy, toRun)
      toRun = undefined
    },
    (problem: unknown) => setError(problem instanceof Error ? problem.message : String(problem))
  )

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  onSettled(() => {
    const observer = new MutationObserver(() => {
      if (appRoot.childElementCount) setHasApp(true)
    })
    observer.observe(appRoot, { childList: true })
    return () => observer.disconnect()
  })

  /** Tabs of the pane below:  no output without an app, it's on top already. */
  const tabIds = (): RunnerPaneId[] => (hasApp() ? ["types", "things", "output"] : ["types", "things"])
  /** Tab the pane below shows:  the one chosen, if it has it, else its first. */
  const showing = () => (tabIds().includes(pane()) ? pane() : tabIds()[0]!)

  return (
    <div class="VSCodeRunner">
      <VSCodeRunnerToolbar
        error={error()}
        onRestart={() => post({ type: "restart" })}
        showConsole={hasApp() ? showConsole() : undefined}
        onToggleConsole={() => save({ runner: { ...settings().runner, showConsole: !showConsole() } })}
      />
      <RunnerSplit
        split={split()}
        onSplit={(changed) => save({ runner: { ...settings().runner, split: changed } })}
        showBottom={!hasApp() || showConsole()}
        bottom={
          <RunnerPane
            tabs={tabsFor(...tabIds())}
            pane={showing()}
            onPane={(changed) => save({ runner: { ...settings().runner, pane: changed } })}
          >
            <Switch>
              <Match when={showing() === "types"}>{explorer()}</Match>
              <Match when={showing() === "things"}>{things()}</Match>
              <Match when={showing() === "output"}>{output()}</Match>
            </Switch>
          </RunnerPane>
        }
      >
        {appPane}
        <Show when={!hasApp()}>
          <RunnerPane tabs={tabsFor("output")} pane="output">
            {output()}
          </RunnerPane>
        </Show>
      </RunnerSplit>
    </div>
  )

  /** Keep what a `run` message carries, to run -- or a `scopes` message's tree, or our settings ... */
  function onMessage({ data }: MessageEvent<ToRunnerMessage>) {
    if (data?.type === "run") {
      const copy = loaded()
      if (copy) run(copy, data.compiled)
      else toRun = data.compiled
    } else if (data?.type === "scopes") setTree(data.tree)
    else if (data?.type === "settings") setSettings(data.settings)
    else if (data?.type === "details") {
      const waiting = detailsWaiting.get(data.path)
      detailsWaiting.delete(data.path)
      waiting?.forEach((resolve) => resolve(data.details))
    }
  }

  /** Run `compiled` afresh in `copy`, drawing into `appRoot`, and show how it went. */
  function run(copy: LoadedRuntime, compiled: string) {
    void copy.runtime.runApp(compiled, { appRoot, coreUrl: copy.coreUrl }).then((problem) => {
      setError(problem)
      setHasApp(copy.runtime.appIsMounted())
    })
  }

  /** The Type Explorer, from the scopes the extension sends. */
  function explorer() {
    return (
      <TypeExplorer
        tree={tree()}
        onOpen={(href) => post({ type: "open", href })}
        onSaveDescription={(at, text) => post({ type: "setDescription", ...at, text })}
        loadDetails={loadDetails}
        onRefresh={() => post({ type: "refreshScopes" })}
        state={settings().typeExplorer}
        onStateChange={(typeExplorer) => save({ typeExplorer })}
      />
    )
  }

  /** The Thing Explorer, once the runtime's loaded. */
  function things() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => (
          <ThingExplorer
            things={copy.runtime.spellCore.things}
            state={settings().thingExplorer}
            onStateChange={(thingExplorer) => save({ thingExplorer })}
          />
        )}
      </Show>
    )
  }

  /** The program's output, once the runtime's loaded. */
  function output() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => <RunnerConsole console={copy.runtime.spellCore.console} />}
      </Show>
    )
  }

  /** Details of Type Explorer node or member `path`, from the extension -- asked for once, however many wait. */
  function loadDetails(path: string): Promise<LSP.ScopeDetails | null> {
    return new Promise((resolve) => {
      const waiting = detailsWaiting.get(path) ?? []
      waiting.push(resolve)
      detailsWaiting.set(path, waiting)
      if (waiting.length === 1) post({ type: "details", path })
    })
  }

  /** Change `changed` sections of our settings here, and have the extension write them to `settings.json5`. */
  function save(changed: ProjectSettings) {
    setSettings((settings) => ({ ...settings, ...changed }))
    post({ type: "saveSettings", settings: changed })
  }
}

/** Props for `<VSCodeRunner>`. */
export type VSCodeRunnerProps = {
  /** Send a message to the extension -- `acquireVsCodeApi().postMessage`. */
  post: (message: FromRunnerMessage) => void
  /** URL of `spell-runtime.js`, beside the runner's bundle -- see `loadRuntime()`. */
  runtimeUrl: string
}

/****************
 * ### `<VSCodeRunnerToolbar>`
 * Restart button, the last run's error if it threw, then "Show Console" at the right -- if there's an app.
 * - HACK: icons are slotted `<ui-icon>`s, not the items' `icon`:  see `<RunnerPane>`.
 ****************/
function VSCodeRunnerToolbar(props: VSCodeRunnerToolbarProps) {
  return (
    <ui-menu attached="top" size="small" class="VSCodeRunnerToolbar">
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
      <Show when={props.showConsole !== undefined}>
        <ui-menu position="right">
          <ui-item link="" class="console" selected={!!props.showConsole} onClick={() => props.onToggleConsole()}>
            <ui-icon name="terminal" />
            {props.showConsole ? "Hide Console" : "Show Console"}
          </ui-item>
        </ui-menu>
      </Show>
    </ui-menu>
  )
}

/** Props for `<VSCodeRunnerToolbar>`. */
type VSCodeRunnerToolbarProps = {
  /** Last run's error message, if it threw. */
  error?: string
  /** Restart button pressed. */
  onRestart: () => void
  /** Is the console showing?  `undefined` for no button:  a program with no app always shows it. */
  showConsole?: boolean
  /** "Show Console" / "Hide Console" pressed. */
  onToggleConsole: () => void
}

/** Icon and title of each tab of the runner's panes. */
const PANE_TABS: Record<RunnerPaneId, Omit<RunnerTab<RunnerPaneId>, "id">> = {
  types: { icon: "sitemap", title: "Type Explorer" },
  things: { icon: "cubes", title: "Thing Explorer" },
  output: { icon: "terminal", title: "Program Output" }
}

/** Tabs `ids` for a `<RunnerPane>`, in order. */
function tabsFor(...ids: RunnerPaneId[]): RunnerTab<RunnerPaneId>[] {
  return ids.map((id) => ({ id, ...PANE_TABS[id] }))
}
