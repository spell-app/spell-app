/**
 * MOVED:  the plan-doc tool is TypeScript in `packages/epics/src/tool/` (epic `epic-components`, P7), which
 * `spell dev plan-doc` runs in its own process.  This file forwards:
 * - its API, for old imports (`shared.test.js`, other tools):  `PlanDoc` and its types, the files and git
 *   (`PlanDocFiles`;  `sharedDocLog()` as before), the command line (`PlanDocCommands`)
 * - its command line, for callers that still run THIS file (`yarn plan-doc` in `packages/docs`, `spell dev worktree`
 *   reading summaries, a checkout on older code):  under `tsx`, with this package's `tsconfig.json` for the aliases
 */
import { pathToFileURL } from "node:url"

import { PlanDocCommands } from "$/epics/tool/PlanDocCommands"
import { PlanDocFiles } from "$/epics/tool/PlanDocFiles"

export * from "$/epics/tool/planDoc.types"
export { PlanDoc } from "$/epics/tool/PlanDoc"
export { PlanDocCommands } from "$/epics/tool/PlanDocCommands"
export { PlanDocFiles } from "$/epics/tool/PlanDocFiles"

/** `PlanDocFiles.sharedDocLog()`:  a shared doc's commits, from `checkout`'s history (`shared.test.js`). */
export const sharedDocLog = PlanDocFiles.sharedDocLog

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await new PlanDocCommands().run(process.argv.slice(2))
}
