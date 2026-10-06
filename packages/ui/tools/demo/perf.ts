/**
 * The dropdown benchmark (`test/PerfRun.ts`) on the dev server:  1000 options, `"united sta"` typed one character
 * per keystroke, update / + layout / + frame per step.
 * - Dev build of Solid (Vite serves the `development` export condition);  `yarn smoke` runs the same benchmark
 *   against `dist/` + the vendored production Solid.
 * - Result goes to `#result`, and `window.perfResult` for scripted runs.  Reload to run again.
 */

import { flush } from "solid-js"

import type { E } from "$/ui/core"
import { PerfRun } from "$/ui/test/PerfRun"

import "$/ui/components/ui-dropdown"

const host = document.getElementById("perf") as E.UIHost
await host.ready
const result = await PerfRun.run(host as Parameters<typeof PerfRun.run>[0], { settle: () => flush() })
;(window as unknown as { perfResult: unknown }).perfResult = result
document.getElementById("result")!.textContent = JSON.stringify(result, null, 2)
