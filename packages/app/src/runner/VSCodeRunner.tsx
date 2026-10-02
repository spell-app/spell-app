/** @jsxImportSource react */
import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import type { LSP } from "$/lsp"
import type { FromRunnerMessage, ProjectSettings, RunnerPaneId, ToRunnerMessage } from "$/app/runner"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { TypeExplorer } from "$/app/ui/TypeExplorer"
import { ThingExplorer } from "$/app/ui/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"

import "$/app/ui/AppContainer.css"
import "./VSCodeRunner.css"

/****************
 * ### `<VSCodeRunner>`
 * Runs a spell project inside the VS Code extension's "Run Project" webview:  a toolbar, then two panes, one above
 * the other, split by a bar you drag.
 * - A program with an `app`:  the app on top, then, if the console's shown, a pane switching between
 *   "Type Explorer", "Thing Explorer" and "Program Output".
 * - One with NO `app` has nothing else to show:  "Program Output" on top, the explorers below, and no
 *   "Show Console" button.  See `hasApp`.
 * - Runs whatever the extension sends in a `run` message, afresh each time, on its OWN copy of the spell runtime
 *   -- see `loadRuntime()`.  One sent before that's loaded runs once it is.
 * - NEVER imports `$/core`:  it'd be bundled beside this, a second copy -- see `spellRuntime.ts`.
 * - Says `ready` once listening, so the extension knows to compile.  Messages sent before then are lost.
 * - How it's shown -- console, tab, split, the explorers' state -- comes from the extension, which remembers
 *   it in the project's `settings.json5`.  See `ProjectSettings`.
 ****************/
export function VSCodeRunner({ post, runtimeUrl }: VSCodeRunnerProps) {
  const appRef = React.useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = React.useState<LoadedRuntime>()
  // what the last `run` message sent -- a new object each time, so the same javascript runs again
  const [toRun, setToRun] = React.useState<{ compiled: string }>()
  const [error, setError] = React.useState<string>()
  const [settings, setSettings] = React.useState<ProjectSettings>({})
  const { showConsole = false, pane = "types", split = DEFAULT_SPLIT } = settings.runner ?? {}
  // Does the program draw an app?  Assume so until a run says -- see `appIsMounted()`.
  const [hasApp, setHasApp] = React.useState(true)
  const [tree, setTree] = React.useState<LSP.ScopeNode>()
  // who's waiting for which details -- see `loadDetails()`
  const detailsWaiting = React.useRef(new Map<string, Array<(details: LSP.ScopeDetails | null) => void>>())

  React.useEffect(() => {
    window.addEventListener("message", onMessage)
    post({ type: "ready" })
    return () => window.removeEventListener("message", onMessage)

    /** Keep what a `run` message carries, to run -- or a `scopes` message's tree, or our settings ... */
    function onMessage({ data }: MessageEvent<ToRunnerMessage>) {
      if (data?.type === "run") setToRun({ compiled: data.compiled })
      else if (data?.type === "scopes") setTree(data.tree)
      else if (data?.type === "settings") setSettings(data.settings)
      else if (data?.type === "details") {
        const waiting = detailsWaiting.current.get(data.path)
        detailsWaiting.current.delete(data.path)
        waiting?.forEach((resolve) => resolve(data.details))
      }
    }
  }, [post])

  // our own copy of the spell runtime -- SIDE EFFECT:  its `spellCore` is global `spellCore`, for devtools
  React.useEffect(() => {
    loadRuntime(runtimeUrl).then(
      (copy) => {
        Object.assign(globalThis, { spellCore: copy.runtime.spellCore })
        setLoaded(copy)
      },
      (problem: unknown) => setError(problem instanceof Error ? problem.message : String(problem))
    )
  }, [runtimeUrl])

  // run what we were sent, once the runtime's here
  React.useEffect(() => {
    if (!loaded || !toRun) return
    void loaded.runtime.runApp(toRun.compiled, { appRoot: appRef.current!, coreUrl: loaded.coreUrl }).then((error) => {
      setError(error)
      setHasApp(loaded.runtime.appIsMounted())
    })
  }, [loaded, toRun])

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

  const explorer = (
    <TypeExplorer
      tree={tree}
      onOpen={(href) => post({ type: "open", href })}
      onSaveDescription={(at, text) => post({ type: "setDescription", ...at, text })}
      loadDetails={loadDetails}
      onRefresh={() => post({ type: "refreshScopes" })}
      state={settings.typeExplorer}
      onStateChange={(typeExplorer) => save({ typeExplorer })}
    />
  )
  const things = loaded && (
    <ThingExplorer
      things={loaded.runtime.spellCore.things}
      state={settings.thingExplorer}
      onStateChange={(thingExplorer) => save({ thingExplorer })}
    />
  )
  const output = loaded && <RunnerConsole console={loaded.runtime.spellCore.console} />
  const content: Record<RunnerPaneId, ReactNode> = { types: explorer, things, output }

  // NOTE: the app's pane is ALWAYS first, just hidden without an app -- so its mount point is never redrawn.
  const appPane = (
    <div className={classnames("VSCodeRunnerApp", { hidden: !hasApp })}>
      <div className="AppContainer scrolling padded">
        <div ref={appRef} className="App" />
      </div>
    </div>
  )
  let bottom: ReactNode = undefined
  if (!hasApp || showConsole) {
    // no app:  its output's on top already
    const ids: RunnerPaneId[] = hasApp ? ["types", "things", "output"] : ["types", "things"]
    const showing = ids.includes(pane) ? pane : ids[0]
    bottom = (
      <RunnerPane
        tabs={tabsFor(...ids)}
        pane={showing}
        onPane={(changed) => save({ runner: { ...settings.runner, pane: changed } })}
        content={content[showing]}
      />
    )
  }

  return (
    <div className="VSCodeRunner">
      <VSCodeRunnerToolbar
        error={error}
        onRestart={() => post({ type: "restart" })}
        showConsole={hasApp ? showConsole : undefined}
        onToggleConsole={() => save({ runner: { ...settings.runner, showConsole: !showConsole } })}
      />
      <RunnerSplit
        split={split}
        onSplit={(changed) => save({ runner: { ...settings.runner, split: changed } })}
        bottom={bottom}
      >
        {appPane}
        {!hasApp && <RunnerPane tabs={tabsFor("output")} pane="output" content={output} />}
      </RunnerSplit>
    </div>
  )

  /** Details of Type Explorer node or member `path`, from the extension -- asked for once, however many wait. */
  function loadDetails(path: string): Promise<LSP.ScopeDetails | null> {
    return new Promise((resolve) => {
      const waiting = detailsWaiting.current.get(path) ?? []
      waiting.push(resolve)
      detailsWaiting.current.set(path, waiting)
      if (waiting.length === 1) post({ type: "details", path })
    })
  }

  /** Change `changed` sections of our settings here, and have the extension write them to `settings.json5`. */
  function save(changed: ProjectSettings) {
    setSettings({ ...settings, ...changed })
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
 ****************/
function VSCodeRunnerToolbar({ error, onRestart, showConsole, onToggleConsole }: VSCodeRunnerToolbarProps) {
  return (
    <SUI.Menu attached="top" size="small" className="VSCodeRunnerToolbar">
      <SUI.Menu.Item icon="redo" content="Restart" onClick={onRestart} />
      {!!error && <SUI.Menu.Item className="error" icon="warning sign" content={error} />}
      {showConsole !== undefined && (
        <SUI.Menu.Menu position="right">
          <SUI.Menu.Item
            icon="terminal"
            content={showConsole ? "Hide Console" : "Show Console"}
            active={showConsole}
            onClick={onToggleConsole}
          />
        </SUI.Menu.Menu>
      )}
    </SUI.Menu>
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
