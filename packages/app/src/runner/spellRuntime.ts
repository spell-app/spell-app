/**
 * Entry of `spell-runtime.js`:  what spell programs run on, in every runner's bundle -- `<spell-app>`'s
 * (`yarn build:element`), the VS Code runner's (`yarn build:runner`) and the web app's (`yarn build`).
 * - A runner loads it to run programs on -- `<spell-app>` loads its OWN copy per element, see `loadRuntime()`,
 *   so each has its own `spellCore`:  its own `RUNTIME`, console, event listeners and mount point.
 * - It IS a program's `@spell/core`:  it exports `spellCore`, `Thing`, `List` and `App`, and compiled spell's
 *   `import ... from "@spell/core"` is pointed at this module's URL -- see `runApp()`.
 * - Registers the `UI` / `SUI` tags spell programs once drew with:  React kits, which can't draw with Solid, so a
 *   program naming one shows a stand-in until epic `output-targets` P11 moves it onto Spell UI's `<ui-*>` elements.
 * - MUST be the only module in a bundle that imports `spellCore`'s code, so it's all HERE, not in a shared
 *   chunk -- see `element.build.test.ts`, `parser/build.test.ts`.
 * - NOTE: `UI` is NOT the `$/app/ui` barrel, which would pull in the editor:  it's the forms plus the
 *   `semantic-ui-react` pass-throughs.  NEVER rename the `UI` key -- `.spell` sources write `<UI.Form>`,
 *   `<UI.Button>` etc, so it's the spell language's public namespace.
 */
import * as SUI from "semantic-ui-react"

import { spellCore, Thing, List, App } from "$/core"
import { F } from "$/app/ui/forms"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import * as SUIPassThroughs from "$/app/ui/SUIPassThroughs"
import { runCompiled, appIsMounted, unmountApp, type RunCompiledOptions } from "./runCompiled"

spellCore.registerElements({ UI: { ...F, ...SUIPassThroughs }, SUI })

// Compiled spell imports these -- `import { spellCore, Thing, List, App } from "@spell/core"`.
export { spellCore, Thing, List, App, appIsMounted, unmountApp }

/**
 * Run `compiled` spell javascript afresh in this copy, drawing any app into `appRoot` -- see `runCompiled()`.
 * - No `appRoot`:  wherever it last drew -- else `#spell-app-root`, see `spellCore.appElement()`.
 * - `coreUrl` MUST be this copy's own URL, so the program's `@spell/core` is this `spellCore`.
 * - Answers the error message if it threw, else `undefined`.
 */
export function runApp(compiled: string, { appRoot, ...options }: RunAppOptions): Promise<string | undefined> {
  if (appRoot) spellCore.appRoot = appRoot
  return runCompiled(compiled, options)
}

/** Options for `runApp()`. */
export type RunAppOptions = RunCompiledOptions & {
  /** Where the app draws -- see `spellCore.appRoot`. */
  appRoot?: HTMLElement
}
