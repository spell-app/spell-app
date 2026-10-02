/** @jsxImportSource react */
/**
 * Entry of the runner bundle (`yarn build:runner` => `dist-runner/`), loaded by the VS Code extension's
 * "Run Project" webview -- see `RunnerPanel` there.
 * - Draws `<VSCodeRunner>`, which runs programs on its own copy of the spell runtime, `spell-runtime.js` beside
 *   this -- see `spellRuntime.ts`.  That's where `UI` / `SUI` are registered, and `spellCore` lives.
 * - NEVER imports `$/core`:  it'd be bundled here, a second copy, NOT the one programs run on.
 *   Devtools get the runtime's as global `spellCore` -- see `<VSCodeRunner>`.
 */
import { createRoot } from "react-dom/client"

import type { FromRunnerMessage } from "$/app/runner"
// NOT through the `$/app/runner` barrel:  it holds `runCompiled()`, whose `spellCore` would come along -- see above
import { VSCodeRunner } from "./VSCodeRunner"

/** VS Code's handle to post to the extension -- callable ONCE per webview. */
declare function acquireVsCodeApi(): { postMessage(message: FromRunnerMessage): void }

/**
 * URL of `spell-runtime.js`, beside this bundle.
 * - NOTE: NOT `new URL(..., import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const RUNTIME_URL = `${import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)}spell-runtime.js`

const vscode = acquireVsCodeApi()
createRoot(document.getElementById("runner-root")!).render(
  <VSCodeRunner post={(message) => vscode.postMessage(message)} runtimeUrl={RUNTIME_URL} />
)
