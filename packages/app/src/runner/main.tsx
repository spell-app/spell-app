/**
 * Entry of the runner bundle (`yarn build:runner` => `dist-runner/`), loaded by the VS Code extension's
 * "Run Project" webview -- see `RunnerPanel` there.
 * - Draws `<VSCodeRunner>` (Solid), which runs programs on its own copy of the spell runtime, `spell-runtime.js`
 *   beside this -- see `spellRuntime.ts`.  That's where `UI` / `SUI` are registered, `spellCore` lives, and
 *   programs draw with React.
 * - NEVER imports `$/core`:  it'd be bundled here, a second copy, NOT the one programs run on.
 *   Devtools get the runtime's as global `spellCore` -- see `<VSCodeRunner>`.
 * - SIDE EFFECT:  `loadUI` defines every `<ui-*>` the runner draws;  the webview's HTML wraps `#runner-root` in
 *   `<ui-root icons="fomantic">`, for the runner's Fomantic icon names.
 */
import { render } from "@solidjs/web"

import type { FromRunnerMessage } from "$/app/runner"
// NOT through the `$/app/runner` barrel:  it holds `runCompiled()`, whose `spellCore` would come along -- see above
import { VSCodeRunner } from "./VSCodeRunner"

import "$/app/solid/loadUI"

/** VS Code's handle to post to the extension -- callable ONCE per webview. */
declare function acquireVsCodeApi(): { postMessage(message: FromRunnerMessage): void }

/**
 * URL of `spell-runtime.js`, beside this bundle.
 * - NOTE: NOT `new URL(..., import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const RUNTIME_URL = `${import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)}spell-runtime.js`

const vscode = acquireVsCodeApi()
render(
  () => <VSCodeRunner post={(message) => vscode.postMessage(message)} runtimeUrl={RUNTIME_URL} />,
  document.getElementById("runner-root")!
)
