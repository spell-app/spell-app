/**
 * Entry of `spell-runtime.js`:  what spell programs run on, in every runner's bundle.
 * - The bundles:
 *   - `<spell-app>`'s (`yarn build:element`)
 *   - the VS Code runner's (`yarn build:runner`)
 *   - the web app's (`yarn build`)
 * - A runner loads it to run programs on.
 *   `<spell-app>` loads its OWN copy per element (see `loadRuntime()`),
 *   so each has its own `core`:  its own `RUNTIME`, console, event listeners and mount point.
 * - It IS a program's `@spell/core`:
 *   compiled spell's `import ... from "@spell/core"` is pointed at this module's URL -- see `runApp()`.
 *   It exports what compiled spell imports:
 *   - `core`, `Thing`, `List`, `App`, `Drawable`, `DrawableList`
 *   - Solid's `h()`, which it draws with
 *   - the helpers it calls by name:  `on()`, `trigger()`, `positionOf()` ...
 *   - the `css` tag a drawable type's style sheet is written with
 * - It's a program's `@spell/elements` too, for compiled TypeScript's element classes (epic `drawable-thing` P10):
 *   `SpellElement`, and Spell UI's `E` as they use it -- see `spellElements.ts`.
 * - Programs draw with Solid, on the page's Spell UI:  `<ui-form>`, `<ui-button>` ... by their own tags.
 * - A drawable thing draws as its own Spell UI element, e.g. `<solitaire-card>`:  see `SpellElement`.
 * - MUST be the only module in a bundle that imports `core`'s code,
 *   so it's all HERE, not in a shared chunk -- see `element.build.test.ts`, `parser/build.test.ts`.
 */
import {
  core,
  Thing,
  List,
  App,
  Drawable,
  DrawableList,
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
  withSpellPositions
} from "spell-lang/core"
import { runCompiled, appIsMounted, unmountApp, type RunCompiledOptions } from "./runCompiled"
import { installSpellElements } from "./SpellElement"
import { E as UIElements, SpellElement } from "./spellElements"

// a drawable thing's element, e.g. `<solitaire-card>`:  Spell UI's, which core can't make itself
installSpellElements(core)

/**
 * Spell UI's `E`, as compiled TypeScript's element classes use it as they run (epic `drawable-thing` P10):
 * its two decorators, `@E.proto static vocabulary = ...` and `@E.protoMerged static elementSetup = ...`.
 * - Not the whole of `E`:  re-exporting Spell UI's namespace puts copies of its files in this bundle (`build.test.ts`).
 * - Its types are the whole `E`'s, for the type check:  see `spellElements.ts`.
 */
const E = { proto: UIElements.proto, protoMerged: UIElements.protoMerged }

// What compiled spell imports, e.g. `import { core, Thing, List, App, h } from "@spell/core"`.
// - `Drawable`, `DrawableList`:  what a drawable type extends (epic `drawable-thing`).
// - The helpers it calls by name, e.g. `trigger("card-click", ...)`, `positionOf(...)` (epic `output-targets`, P19).
// - `h`:  what compiled spell draws with (P20), Solid's own.
//   The PAGE's one copy, taken through `spell-solid-shared.js` as core's drawing takes it,
//   never one of its own (`element.build.test.ts`).
// - `css`:  the tag a drawable type's `<css>` block compiles to (epic `drawable-thing` P10).
// - `E`, `SpellElement`:  what compiled TypeScript's element classes build on, imported as `@spell/elements` (P10).
//   Spell UI's core comes from `spell-solid-shared.js`, as `SpellElement`'s does:  never a copy of its own.
export {
  core,
  Thing,
  List,
  App,
  Drawable,
  DrawableList,
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

/** Options for `runApp()`. */
export type RunAppOptions = RunCompiledOptions & {
  /** Where the app draws -- see `core.appRoot`. */
  appRoot?: HTMLElement
  /** Is the app's page laid out in markup, e.g. inside its `<spell-app>`?  Then its `to draw` isn't drawn. */
  layout?: boolean
}
