/**
 * Entry of the runner bundle (`yarn build:runner` => `dist-runner/`), loaded by the VS Code extension's
 * "Run Project" webview -- see `RunnerPanel` there.
 * - Sets up `UI` / `SUI` JSX tags, and globals `spellCore` / `assert` for poking at in devtools.  Compiled spell
 *   itself `import`s `spellCore` -- see `runCompiled()`.
 * - NOTE: `UI` is NOT the `~/app/ui` barrel, which would pull in the editor.  It's what spell programs use:
 *   the forms barrel plus the `semantic-ui-react` pass-throughs (`UI.Button` ...).
 *   NEVER rename the `UI` key -- see `src/app/index.tsx`.
 */
import { createRoot } from "react-dom/client"
import * as SUI from "semantic-ui-react"

import { spellCore, assert } from "~/spellCore"
import { F } from "~/app/ui/forms"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import * as SUIPassThroughs from "~/app/ui/SUIPassThroughs"
import { VSCodeRunner, type FromRunnerMessage } from "~/app/runner"

/** VS Code's handle to post to the extension -- callable ONCE per webview. */
declare function acquireVsCodeApi(): { postMessage(message: FromRunnerMessage): void }

Object.assign(globalThis, { spellCore, assert })
spellCore.registerElements({ UI: { ...F, ...SUIPassThroughs }, SUI })

const vscode = acquireVsCodeApi()
createRoot(document.getElementById("runner-root")!).render(
  <VSCodeRunner post={(message) => vscode.postMessage(message)} />
)
