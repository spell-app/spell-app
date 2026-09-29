import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import { spellCore } from "~/spellCore"
import type { LSP } from "~/lsp"
import type { FromRunnerMessage, ProjectSettings, RunnerPaneId, ToRunnerMessage } from "~/app/runner"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { AppContainer } from "~/app/ui/AppContainer"
import { TypeExplorer } from "~/app/ui/TypeExplorer"
import { runCompiled, appIsMounted } from "./runCompiled"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"

import "./VSCodeRunner.css"

/****************
 * ### `<VSCodeRunner>`
 * Runs a spell project inside the VS Code extension's "Run Project" webview:  a toolbar, then two panes, one above
 * the other, split by a bar you drag.
 * - A program with an `app`:  the app on top, then, if the console's shown, a pane switching between
 *   "Type Explorer" and "Program Output".
 * - One with NO `app` has nothing else to show:  "Program Output" on top, the Type Explorer below, and no
 *   "Show Console" button.  See `hasApp`.
 * - Runs whatever the extension sends in a `run` message, afresh each time -- see `runCompiled()`.
 * - Says `ready` once listening, so the extension knows to compile.  Messages sent before then are lost.
 * - How it's shown -- console, tab, split, the Type Explorer's state -- comes from the extension, which remembers
 *   it in the project's `settings.json5`.  See `ProjectSettings`.
 ****************/
export function VSCodeRunner({ post }: VSCodeRunnerProps) {
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

    /** Run what a `run` message carries, showing any error it throws, or keep a `scopes` message's tree. */
    function onMessage({ data }: MessageEvent<ToRunnerMessage>) {
      if (data?.type === "run") {
        void runCompiled(data.compiled).then((error) => {
          setError(error)
          setHasApp(appIsMounted())
        })
      } else if (data?.type === "scopes") setTree(data.tree)
      else if (data?.type === "settings") setSettings(data.settings)
      else if (data?.type === "details") {
        const waiting = detailsWaiting.current.get(data.path)
        detailsWaiting.current.delete(data.path)
        waiting?.forEach((resolve) => resolve(data.details))
      }
    }
  }, [post])

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  React.useEffect(() => {
    const element = spellCore.appElement()
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
  const output = <RunnerConsole console={spellCore.console} />

  // NOTE: the app's pane is ALWAYS first, just hidden without an app -- so its mount point is never redrawn.
  const appPane = (
    <div className={classnames("VSCodeRunnerApp", { hidden: !hasApp })}>
      <AppContainer scrolling padded />
    </div>
  )
  let bottom: ReactNode = undefined
  if (!hasApp) bottom = <RunnerPane tabs={tabsFor("types")} pane="types" content={explorer} />
  else if (showConsole) {
    bottom = (
      <RunnerPane
        tabs={tabsFor("types", "output")}
        pane={pane}
        onPane={(showing) => save({ runner: { ...settings.runner, pane: showing } })}
        content={pane === "types" ? explorer : output}
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
  output: { icon: "terminal", title: "Program Output" }
}

/** Tabs `ids` for a `<RunnerPane>`, in order. */
function tabsFor(...ids: RunnerPaneId[]): RunnerTab<RunnerPaneId>[] {
  return ids.map((id) => ({ id, ...PANE_TABS[id] }))
}
