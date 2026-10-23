import { Match, Show, Switch, createSignal, onCleanup, onSettled } from "solid-js"

import type { LSP } from "spell-app/lsp"
import type { SP } from "spell-lang/spell"
import type { FromRunnerMessage, ProjectSettings, RunnerPaneId, ToRunnerMessage } from "spell-app/app/runner"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
// Import directly, NOT through the `spell-app/app/solid` barrel, which pulls in the editor
import { TypeExplorer } from "spell-app/app/solid/TypeExplorer"
import { ThingExplorer } from "spell-app/app/solid/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"
import { wordsIn, wordsOfLanguages } from "./words"
import { showTestResults, testReportsOf } from "./testResults"

import "spell-app/app/solid/AppContainer.css"
import "./VSCodeRunner.css"

/****************
 * ### `<VSCodeRunner>`
 * Runs a spell project inside the VS Code extension's "Run Project" webview:
 * a toolbar, then two panes, one above the other, split by a bar you drag.
 * - A program with an `app`:  the app on top, then, if the console's shown, a pane switching between
 *   "Type Explorer", "Thing Explorer" and "Program Output".
 * - One with NO `app` has nothing else to show (see `hasApp`):
 *   "Program Output" on top, the explorers below, and no "Show Console" button.
 * - One that starts its app AFTER the run finished, e.g. from a timer, shows it once it draws.
 * - Runs whatever the extension sends in a `run` message, on its OWN copy of the spell runtime -- see `loadRuntime()`.
 *   - One sent before that's loaded runs once it is.
 *   - Each run keeps the program's things, e.g. the game in progress:  only Restart starts afresh (see `run()`).
 * - A project it imports, e.g. `@spell/library/people`, it asks the extension for (`loadImport`), each run.
 * - Its Thing Explorer shows things' members in spell's words, from the words each `run` message brings:
 *   the project's `<Project>.en.js` (`SP.SpellWords`).
 *   - Their `messages` are what the core says as the program runs, e.g. its tests' lines, in its language.
 * - Runs the project's tests, as `spell test` does (`testApp()`), on a copy of the runtime of their own,
 *   so the game in progress is left alone:
 *   - after a run that started no app and didn't throw, e.g. a project of types and their tests
 *   - on its Run Tests button, and the extension's `runTests` (the Run Tests command)
 *   - How they went shows in "Program Output" (`showTestResults()`), and goes to the extension (`testResults`),
 *     which shows each failed check in the editor, on its line.
 * - The program draws with the page's Solid (`App.start()` makes its own root) into `appRoot`, a `<div>` drawn once.
 * - NEVER imports `spell-lang/core`:  it'd be bundled beside this, a second copy -- see `spellRuntime.ts`.
 * - Says `ready` once listening, so the extension knows to compile.  Messages sent before then are lost.
 * - How it's shown comes from the extension, which remembers it in the project's `settings.json5`:
 *   console, tab, split, the explorers' state.  See `ProjectSettings`.
 * - `post` and `runtimeUrl` are read once.
 * - Its `<ui-*>` tags are the caller's to define (`spell-app/app/solid/loadUI`),
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
  const [words, setWords] = createSignal<SP.SpellWordsData>()
  // how many `run` messages came:  a slow load of an older one's words mustn't win
  let runsSent = 0
  // how many test runs started:  only the last one's results show
  let testRuns = 0
  // the javascript of the last run, and its words' messages:  what Run Tests runs
  let lastRun: PendingRun | undefined
  // Run Tests was asked for before anything ran:  run them after the first run
  let testsWanted = false
  // the copy of the runtime the tests run on, loaded the first time they run -- see `runTests()`
  let testCopy: Promise<LoadedRuntime> | undefined
  // who's waiting for which details -- see `loadDetails()`
  const detailsWaiting = new Map<string, Array<(details: LSP.ScopeDetails | null) => void>>()
  // who's waiting for which imported project's javascript -- see `loadImport()`
  const importsWaiting = new Map<string, Array<ImportWaiting>>()
  // what the last `run` message sent, if it came before the runtime -- run once that's loaded
  let toRun: PendingRun | undefined
  // Restart was pressed:  the `run` it brings starts afresh, a new deal.
  // So does the panel's first run:  it has nothing of its own to carry over
  // (a runtime shared with another runner, as in tests, may still hold that one's things).
  // Every other run keeps the program's things.
  let startAfresh = true

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

  // our own copy of the spell runtime -- SIDE EFFECT:  its `core` is global `core`, for devtools
  loadRuntime(runtimeUrl).then(
    (copy) => {
      Object.assign(globalThis, { core: copy.runtime.core })
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
        onRestart={() => {
          startAfresh = true
          post({ type: "restart" })
        }}
        onRunTests={() => void runTests()}
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

  /** Keep what a `run` message carries, to run -- or a `scopes` message's tree, a `words` message's words ... */
  function onMessage({ data }: MessageEvent<ToRunnerMessage>) {
    if (data?.type === "run") {
      const sent = ++runsSent
      const { compiled, runTests: andTests } = data
      // its words first:  a words file per language its files are in, as one
      void Promise.all((data.words ?? []).map(wordsIn)).then((loadedWords) => {
        if (sent !== runsSent) return
        const words = wordsOfLanguages(loadedWords)
        setWords(words)
        const pending = { compiled, messages: words?.messages, runTests: !!andTests }
        const copy = loaded()
        if (copy) run(copy, pending)
        else toRun = pending
      })
    } else if (data?.type === "runTests") void runTests()
    else if (data?.type === "scopes") setTree(data.tree)
    else if (data?.type === "settings") setSettings(data.settings)
    else if (data?.type === "details") {
      const waiting = detailsWaiting.get(data.path)
      detailsWaiting.delete(data.path)
      waiting?.forEach((resolve) => resolve(data.details))
    } else if (data?.type === "imported") {
      const waiting = importsWaiting.get(data.projectId)
      importsWaiting.delete(data.projectId)
      const { compiled, error } = data
      waiting?.forEach(({ resolve, reject }) =>
        compiled !== undefined ? resolve(compiled) : reject(new Error(error ?? `Couldn't load '${data.projectId}'`))
      )
    }
  }

  /**
   * Run `compiled` in `copy`, drawing into `appRoot`, and show how it went.
   * - The panel's project compiled again:  its things carry over (epic `drawable-thing` P16), unless:
   *   - Restart asked for a fresh start (Q25)
   *   - or the edit changed its start (`runCompiled()`, P17)
   */
  function run(copy: LoadedRuntime, pending: PendingRun) {
    const { compiled, messages } = pending
    const keepThings = !startAfresh
    startAfresh = false
    lastRun = pending
    const options = { appRoot, coreUrl: copy.coreUrl, keepThings, loadImport, messages }
    void copy.runtime.runApp(compiled, options).then((problem) => {
      setError(problem)
      const startedApp = copy.runtime.appIsMounted()
      setHasApp(startedApp)
      // a program that threw isn't worth testing by itself:  Run Tests still does
      if (pending.runTests || testsWanted || (!problem && !startedApp)) void runTests()
    })
  }

  /**
   * Run the project's tests, as `spell test` does, on the copy of the runtime they run on:
   * the javascript the last run ran, afresh -- see `testApp()`.
   * - Then show how they went on the program's console, and send them to the extension.
   * - Nothing run yet:  after the first run.
   * - NEVER throws:  a test copy that won't load shows as the run's error.
   */
  async function runTests() {
    const copy = loaded()
    const ran = lastRun
    if (!copy || !ran) {
      testsWanted = true
      return
    }
    testsWanted = false
    const sent = ++testRuns
    try {
      testCopy ??= loadRuntime(runtimeUrl)
      const tester = await testCopy
      const options = { coreUrl: tester.coreUrl, loadImport, messages: ran.messages }
      const tested = await tester.runtime.testApp(ran.compiled, options)
      if (sent !== testRuns) return
      showTestResults(copy.runtime.core.console, tested, tester.runtime.core)
      post({ type: "testResults", tests: testReportsOf(tested.results, tester.runtime.core) })
    } catch (problem) {
      testCopy = undefined
      setError(problem instanceof Error ? problem.message : String(problem))
    }
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
            things={copy.runtime.core.things}
            words={words()}
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
        {(copy) => <RunnerConsole console={copy.runtime.core.console} />}
      </Show>
    )
  }

  /**
   * Compiled javascript of project `projectId`, which the program imports, e.g. `@spell/library/people`:
   * from the extension, which asks the language server (`spell/compiledImport`).
   * - Asked for afresh each run, so a library compiled since shows at once;  once, however many wait.
   * - Rejects with why, if the extension couldn't load it:  the run shows it as its error.
   */
  function loadImport(projectId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const waiting = importsWaiting.get(projectId) ?? []
      waiting.push({ resolve, reject })
      importsWaiting.set(projectId, waiting)
      if (waiting.length === 1) post({ type: "loadImport", projectId })
    })
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

/** What a `run` message asks for, its words loaded:  run now, or once the runtime's loaded -- see `run()`. */
type PendingRun = {
  /** The project's javascript. */
  compiled: string
  /** What the core says as it runs, in the program's language:  its words' `messages`. */
  messages?: Record<string, string>
  /** Run its tests after it, as `runTests()` does. */
  runTests: boolean
}

/** A run waiting for an imported project's javascript -- see `loadImport()`. */
type ImportWaiting = { resolve: (compiled: string) => void; reject: (error: Error) => void }

/** Props for `<VSCodeRunner>`. */
export type VSCodeRunnerProps = {
  /** Send a message to the extension -- `acquireVsCodeApi().postMessage`. */
  post: (message: FromRunnerMessage) => void
  /** URL of `spell-runtime.js`, beside the runner's bundle -- see `loadRuntime()`. */
  runtimeUrl: string
}

/****************
 * ### `<VSCodeRunnerToolbar>`
 * Restart and Run Tests buttons, the last run's error if it threw, then "Show Console" at the right -- if there's an app.
 * - HACK: icons are slotted `<ui-icon>`s, not the items' `icon`:  see `<RunnerPane>`.
 ****************/
function VSCodeRunnerToolbar(props: VSCodeRunnerToolbarProps) {
  return (
    <ui-menu attached="top" size="small" class="VSCodeRunnerToolbar">
      <ui-item link="" class="restart" onClick={() => props.onRestart()}>
        <ui-icon name="redo" />
        {appTexts.text("restart")}
      </ui-item>
      <ui-item link="" class="run-tests" onClick={() => props.onRunTests()}>
        <ui-icon name="flask" />
        {appTexts.text("runTests")}
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
            {appTexts.text(props.showConsole ? "hideConsole" : "showConsole")}
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
  /** Run Tests button pressed. */
  onRunTests: () => void
  /** Is the console showing?  `undefined` for no button:  a program with no app always shows it. */
  showConsole?: boolean
  /** "Show Console" / "Hide Console" pressed. */
  onToggleConsole: () => void
}

/** Icon of each tab of the runner's panes, and its title's key. */
const PANE_TABS: Record<RunnerPaneId, { icon: string; text: AppTextKey }> = {
  types: { icon: "sitemap", text: "typeExplorer" },
  things: { icon: "cubes", text: "thingExplorer" },
  output: { icon: "terminal", text: "programOutput" }
}

/** Tabs `ids` for a `<RunnerPane>`, in order, titled in the page's language. */
function tabsFor(...ids: RunnerPaneId[]): RunnerTab<RunnerPaneId>[] {
  return ids.map((id) => ({ id, icon: PANE_TABS[id].icon, title: appTexts.text(PANE_TABS[id].text) }))
}
