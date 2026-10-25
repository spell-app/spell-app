/**
 * Entry of `spell-runtime.js`:  what spell programs run on, in every runner's bundle.
 * - The bundles:
 *   - `<spell-viewer>`'s (`yarn build:element`)
 *   - the VS Code runner's (`yarn build:runner`)
 *   - the web app's (`yarn build`)
 * - A runner loads it to run programs on.
 *   `<spell-viewer>` loads its OWN copy per element (see `loadRuntime()`),
 *   so each has its own `core`:  its own `RUNTIME`, console, event listeners and mount point.
 * - It IS a program's `@spell/core`:
 *   compiled spell's `import ... from "@spell/core"` is pointed at this module's URL -- see `runApp()`.
 *   It exports what compiled spell imports:
 *   - `core`, `Thing`, `List`, `App`, `View`, `ViewableList`, `Page`, `TwoSidedView`
 *   - Solid's `h()`, which it draws with
 *   - the helpers it calls by name:  `on()`, `trigger()`, `positionOf()` ...
 *   - the `css` tag a view template's style sheet is written with
 * - It's a program's `@spell/elements` too, for compiled TypeScript's element classes (epic `drawable-thing` P10):
 *   `SpellElement`, and Spell UI's `E` as they use it -- see `spellElements.ts`.
 * - Programs draw with Solid, on the page's Spell UI:  `<ui-form>`, `<ui-button>` ... by their own tags.
 * - A view draws as its own Spell UI element, e.g. `<solitaire-card>`:  see `SpellElement`.
 * - MUST be the only module in a bundle that imports `core`'s code,
 *   so it's all HERE, not in a shared chunk -- see `element.build.test.ts`, `parser/build.test.ts`.
 */
import {
  core,
  Thing,
  List,
  App,
  View,
  ViewableList,
  Page,
  TwoSidedView,
  h,
  css,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions,
  type TestResult
} from "spell-parser/core"
import { runCompiled, appIsMounted, unmountApp, type RunCompiledOptions } from "./runCompiled"
import { installSpellElements } from "./SpellElement"
import { E as UIElements, SpellElement } from "./spellElements"

// a view's element, e.g. `<solitaire-card>`:  Spell UI's, which core can't make itself
installSpellElements(core)

/**
 * Spell UI's `E`, as compiled TypeScript's element classes use it as they run (epic `drawable-thing` P10):
 * its two decorators, `@E.proto static vocabulary = ...` and `@E.protoMerged static elementSetup = ...`.
 * - Not the whole of `E`:  re-exporting Spell UI's namespace puts copies of its files in this bundle (`build.test.ts`).
 * - Its types are the whole `E`'s, for the type check:  see `spellElements.ts`.
 */
const E = { proto: UIElements.proto, protoMerged: UIElements.protoMerged }

// What compiled spell imports, e.g. `import { core, Thing, List, App, h } from "@spell/core"`.
// - `View`, `ViewableList`, `Page`, `TwoSidedView`:  what a view template extends (epic `drawable-thing`).
// - The helpers it calls by name, e.g. `trigger("card-click", ...)`, `positionOf(...)` (epic `output-targets`, P19).
// - `h`:  what compiled spell draws with (P20), Solid's own.
//   The PAGE's one copy, taken through `spell-solid-shared.js` as core's drawing takes it,
//   never one of its own (`element.build.test.ts`).
// - `css`:  the tag a view template's `<css>` block compiles to (epic `drawable-thing` P10).
// - `E`, `SpellElement`:  what compiled TypeScript's element classes build on, imported as `@spell/elements` (P10).
//   Spell UI's core comes from `spell-solid-shared.js`, as `SpellElement`'s does:  never a copy of its own.
export {
  core,
  Thing,
  List,
  App,
  View,
  ViewableList,
  Page,
  TwoSidedView,
  h,
  css,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions,
  appIsMounted,
  unmountApp,
  E,
  SpellElement
}

/**
 * Run `compiled` spell javascript in this copy, drawing any app into `appRoot` -- see `runCompiled()`.
 * - Afresh, unless `keepThings`:  then the last run's things carry over, e.g. the game in progress.
 * - No `appRoot`:  wherever it last drew -- else `#spell-app-root`, see `core.appElement()`.
 * - `coreUrl` MUST be this copy's own URL, so the program's `@spell/core` is this `core`.
 * - Answers the error message if it threw, else `undefined`.
 */
export function runApp(compiled: string, { appRoot, layout, ...options }: RunAppOptions): Promise<string | undefined> {
  if (appRoot) core.appRoot = appRoot
  core.appLayout = !!layout
  return runCompiled(compiled, options)
}

/**
 * Run `compiled`'s tests in this copy, as `spell test` does:
 * answers how each went, and the error message if it threw.
 * - It loads the program afresh, which runs the tests it runs itself;  then each other `to test ...` it exports.
 * - Headless while it loads:  starting its app does nothing, nor does adding its styles, so the page shows nothing of it.
 *   - Its view templates' tags aren't defined either:  the page's `<solitaire-card>`s stay the app's copy's.
 *   - Put back as they were after.
 * - MUST be a copy of its own, never the one an app runs in (the VS Code runner's Run Tests):
 *   loading afresh takes down that copy's app, and clears its things and console.
 * - Remembers nothing, whatever `options.projectId` says:  a test mustn't change what a person's runs remember.
 * - NEVER throws:  a test that throws fails.
 */
export async function testApp(compiled: string, options: RunCompiledOptions): Promise<TestRun> {
  const { start } = App.prototype
  const { installStyles, elementDefiner, appRoot } = core
  App.prototype.start = function start() {}
  core.installStyles = () => {}
  core.elementDefiner = undefined
  core.appRoot = document.createElement("div")
  try {
    const problem = await runCompiled(compiled, { ...options, projectId: undefined, keepThings: false, runTests: true })
    // a view class tells the definer a microtask after it's declared:  let that pass, with none, first
    await new Promise((resolve) => setTimeout(resolve))
    return { problem, results: core.testResults() }
  } finally {
    App.prototype.start = start
    Object.assign(core, { installStyles, elementDefiner, appRoot })
  }
}

/** How a project's tests went, as `testApp()` answers it. */
export type TestRun = {
  /** The error message, if loading it threw:  then only the tests it ran before that are in `results`. */
  problem?: string
  /** Each test that ran, in the order they ended. */
  results: TestResult[]
}

/** Options for `runApp()`. */
export type RunAppOptions = RunCompiledOptions & {
  /** Where the app draws -- see `core.appRoot`. */
  appRoot?: HTMLElement
  /** Is the app's page laid out in markup, e.g. inside its `<spell-viewer>`?  Then its `to draw` isn't drawn. */
  layout?: boolean
}
