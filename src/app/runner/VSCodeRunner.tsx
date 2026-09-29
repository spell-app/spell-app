import React from "react"
import classnames from "classnames"
import type { Root } from "react-dom/client"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { spellCore, Thing, List, App, SPELL_CORE_MODULE, SPELL_CORE_NAMES } from "~/spellCore"
import type { LSP } from "~/lsp"
import type { FromRunnerMessage, ProjectSettings, RunnerPane, ToRunnerMessage } from "~/app/runner"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { AppContainer } from "~/app/ui/AppContainer"
import { ConsoleLines } from "~/app/ui/ConsoleLines"
import { TypeExplorer } from "~/app/ui/TypeExplorer"

import "./VSCodeRunner.less"

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
        const waiting = detailsWaiting.current.get(data.id)
        detailsWaiting.current.delete(data.id)
        waiting?.forEach((resolve) => resolve(data.details))
      }
    }
  }, [post])

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  React.useEffect(() => {
    const element = document.getElementById(spellCore.REACT_APP_ROOT_ID)
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
  const output = <VSCodeRunnerConsole />

  // NOTE: the app's pane is ALWAYS first, just hidden without an app -- so its mount point is never redrawn.
  const appPane = (
    <div className={classnames("VSCodeRunnerApp", { hidden: !hasApp })}>
      <AppContainer scrolling padded />
    </div>
  )
  let bottom: ReactNode = undefined
  if (!hasApp) bottom = <VSCodeRunnerPane tabs={["types"]} pane="types" content={explorer} />
  else if (showConsole) {
    bottom = (
      <VSCodeRunnerPane
        tabs={["types", "output"]}
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
      <VSCodeRunnerSplit
        split={split}
        onSplit={(changed) => save({ runner: { ...settings.runner, split: changed } })}
        bottom={bottom}
      >
        {appPane}
        {!hasApp && <VSCodeRunnerPane tabs={["output"]} pane="output" content={output} />}
      </VSCodeRunnerSplit>
    </div>
  )

  /** Details of Type Explorer node or member `id`, from the extension -- asked for once, however many wait. */
  function loadDetails(id: string): Promise<LSP.ScopeDetails | null> {
    return new Promise((resolve) => {
      const waiting = detailsWaiting.current.get(id) ?? []
      waiting.push(resolve)
      detailsWaiting.current.set(id, waiting)
      if (waiting.length === 1) post({ type: "details", id })
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

/****************
 * ### `<VSCodeRunnerSplit>`
 * `children` in a pane on top, then `bottom` below, if any -- split by a bar you drag.
 * - `split` is the top pane's share of the height, in %.  Dragging shows as it goes, and says `onSplit()`
 *   only when let go -- so the extension writes `settings.json5` once.
 * - Without `bottom`, the top pane fills it all.
 ****************/
function VSCodeRunnerSplit({ split, onSplit, bottom, children }: VSCodeRunnerSplitProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  // while dragging, else `undefined` -- `split` as given
  const [dragging, setDragging] = React.useState<number>()
  const top = dragging ?? split
  const hasBottom = bottom !== undefined && bottom !== null && bottom !== false
  return (
    <div ref={ref} className="VSCodeRunnerSplit">
      <div className="VSCodeRunnerSplitTop" style={{ flex: hasBottom ? `${top} 1 0` : "1 1 0" }}>
        {children}
      </div>
      {hasBottom && (
        <>
          <div
            className="VSCodeRunnerSplitter"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <div className="VSCodeRunnerSplitBottom" style={{ flex: `${100 - top} 1 0` }}>
            {bottom}
          </div>
        </>
      )}
    </div>
  )

  /** Start dragging the bar -- capturing the pointer, so it keeps coming to us off the bar. */
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    setDragging(split)
  }

  /** Move the bar to the pointer, as a share of our height. */
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (dragging === undefined || !rect?.height) return
    const percent = ((event.clientY - rect.top) / rect.height) * 100
    setDragging(Math.round(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, percent))))
  }

  /** Let go:  keep where the bar ended up. */
  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (dragging !== undefined && dragging !== split) onSplit(dragging)
    setDragging(undefined)
  }
}

/** Props for `<VSCodeRunnerSplit>`. */
type VSCodeRunnerSplitProps = {
  /** Top pane's share of the height, in %. */
  split: number
  /** Bar dragged and let go, to `split` %. */
  onSplit: (split: number) => void
  /** What's in the bottom pane -- none for just the top. */
  bottom?: ReactNode
  /** What's in the top pane. */
  children: ReactNode
}

/****************
 * ### `<VSCodeRunnerPane>`
 * One of the runner's panes:  a toolbar of `tabs`, then `content`, showing `pane`.
 * - A single tab just says what it is.
 ****************/
function VSCodeRunnerPane({ tabs, pane, onPane, content }: VSCodeRunnerPaneProps) {
  return (
    <div className="VSCodeRunnerPane">
      <SUI.Menu attached size="mini" className="VSCodeRunnerPaneToolbar">
        {tabs.map((tab) => (
          <SUI.Menu.Item
            key={tab}
            icon={PANE_TABS[tab].icon}
            content={PANE_TABS[tab].title}
            active={pane === tab}
            onClick={onPane && (() => onPane(tab))}
          />
        ))}
      </SUI.Menu>
      {content}
    </div>
  )
}

/** Props for `<VSCodeRunnerPane>`. */
type VSCodeRunnerPaneProps = {
  /** Tabs in its toolbar, in order. */
  tabs: RunnerPane[]
  /** Tab showing. */
  pane: RunnerPane
  /** Tab clicked -- none if there's nothing to switch to. */
  onPane?: (pane: RunnerPane) => void
  /** What `pane` shows. */
  content: ReactNode
}

/** Icon and title of each tab of a `<VSCodeRunnerPane>`. */
const PANE_TABS: Record<RunnerPane, { icon: SUI.SemanticICONS; title: string }> = {
  types: { icon: "sitemap", title: "Type Explorer" },
  output: { icon: "terminal", title: "Program Output" }
}

/** Top pane's share of the height to start, in % -- until dragged. */
const DEFAULT_SPLIT = 60

/** Least share of the height either pane can be dragged to, in %. */
const MIN_SPLIT = 10

/** Most share of the height the top pane can be dragged to, in %. */
const MAX_SPLIT = 100 - MIN_SPLIT

/****************
 * ### `<VSCodeRunnerConsole>`
 * `spellCore.console`, e.g. what `print` statements say.
 * - `view()` so it redraws as lines are logged.
 ****************/
const VSCodeRunnerConsole = view(function VSCodeRunnerConsole() {
  return (
    <div className="VSCodeRunnerConsole ConsoleViewer scrolling">
      <div className="stretcher">
        <ConsoleLines lines={spellCore.console.lines} indent={0} />
      </div>
    </div>
  )
})

////////////////
// ## Running
////////////////

/**
 * Run `compiled` spell javascript afresh:  previous app unmounted, new `spellCore.RUNTIME`, empty console.
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Answers the error message if it threw, else `undefined`.
 * - Mirrors `SpellProject.executeCompiled()` + `editor.selectPath()`'s unmount, which fetch from the server instead.
 */
async function runCompiled(compiled: string): Promise<string | undefined> {
  const element = document.getElementById(spellCore.REACT_APP_ROOT_ID) as (HTMLElement & { REACT_ROOT?: Root }) | null
  element?.REACT_ROOT?.unmount()
  if (element) delete element.REACT_ROOT
  spellCore.resetRuntime()
  spellCore.console.clear()

  if (compiled.includes(`from "${PROJECT_MODULE}`)) {
    return "This project imports another, which the VS Code runner can't load yet -- run it in the app."
  }
  // no import map in a webview:  point `@spell/core` at OUR `spellCore`, not a second copy
  const linked = compiled.replaceAll(`from "${SPELL_CORE_MODULE}"`, `from "${spellCoreModuleUrl()}"`)
  const url = URL.createObjectURL(new Blob([linked], { type: "text/javascript" }))
  try {
    await import(/* @vite-ignore */ url)
    return undefined
  } catch (error) {
    // Log too, so the webview's devtools show the stack.
    console.error(error)
    return error instanceof Error ? error.message : String(error)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Did the last run start an app?  `App.start()` leaves its React root on the mount point.
 * - An app started later, e.g. from a timer, isn't there yet -- `<VSCodeRunner>` watches for it drawing.
 */
function appIsMounted(): boolean {
  const element = document.getElementById(spellCore.REACT_APP_ROOT_ID) as (HTMLElement & { REACT_ROOT?: Root }) | null
  return !!element?.REACT_ROOT
}

/**
 * Start of the specifier compiled spell imports another project by -- `SP.SPELL_PROJECT_MODULE`.
 * - NOTE: a copy, NOT imported:  `~/languages/spell` would pull the whole parser into the runner bundle.
 */
const PROJECT_MODULE = "@spell/project/"

/** Key on `globalThis` for what `spellCoreModuleUrl()`'s module re-exports. */
const RUNNER_SPELL_CORE = "__RUNNER_SPELL_CORE__"

/** `blob:` URL of a module re-exporting this runner's `spellCore` and built-ins -- made once, on first use. */
let spellCoreUrl: string | undefined

/**
 * URL compiled spell's `@spell/core` import is pointed at in the runner:  a module re-exporting OUR `spellCore`,
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
