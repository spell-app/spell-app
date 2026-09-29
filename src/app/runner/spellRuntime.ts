/**
 * Entry of `spell-runtime.js`, in the `<spell-app>` bundle (`yarn build:element`):  what ONE spell app runs on.
 * - Each `<spell-app>` loads its OWN copy -- see `loadRuntime()` -- so each has its own `spellCore`:  its own
 *   `RUNTIME`, console, event listeners and mount point.  So many apps can run on a page at once.
 * - It IS the app's `@spell/core`:  it exports `spellCore`, `Thing`, `List` and `App`, and compiled spell's
 *   `import ... from "@spell/core"` is pointed at this copy's URL -- see `runApp()`.
 * - Holds everything that must be per app:  `spellCore`, and the `UI` forms, which read it.
 *   What's shared -- React, `semantic-ui-react`, `~/util` -- comes from the bundle's shared chunks.
 * - MUST be the only entry that imports `spellCore`'s code -- see `element.build.test.ts`.
 * - NOTE: `UI` is NOT the `~/app/ui` barrel, which would pull in the editor -- as in the VS Code runner's
 *   `main.tsx`.  NEVER rename the `UI` key -- see `src/app/index.tsx`.
 */
import * as SUI from "semantic-ui-react"

import { spellCore, Thing, List, App } from "~/spellCore"
import { F } from "~/app/ui/forms"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import * as SUIPassThroughs from "~/app/ui/SUIPassThroughs"
import { runCompiled, appIsMounted, type RunCompiledOptions } from "./runCompiled"

spellCore.registerElements({ UI: { ...F, ...SUIPassThroughs }, SUI })

// Compiled spell imports these -- `import { spellCore, Thing, List, App } from "@spell/core"`.
export { spellCore, Thing, List, App, appIsMounted }

/**
 * Run `compiled` spell javascript afresh in this copy, drawing any app into `appRoot` -- see `runCompiled()`.
 * - `coreUrl` MUST be this copy's own URL, so the program's `@spell/core` is this `spellCore`.
 * - Answers the error message if it threw, else `undefined`.
 */
export function runApp(compiled: string, { appRoot, ...options }: RunAppOptions): Promise<string | undefined> {
  spellCore.appRoot = appRoot
  return runCompiled(compiled, options)
}

/** Options for `runApp()`. */
export type RunAppOptions = RunCompiledOptions & {
  /** Where the app draws -- see `spellCore.appRoot`. */
  appRoot: HTMLElement
}
