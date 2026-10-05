// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev plan-doc <command> <name> ...`:  the tool that edits a plan doc
 * (`epics/<name>/<name>.plan.html`), as the `/epic` skill uses it.  `spell dev plan-doc` alone
 * lists its commands, e.g. `spell dev plan-doc summary seo`, `spell dev plan-doc phase seo 2 done`.
 * - Root `yarn plan-doc` aliases it;  `spell plan-doc` too, until skills stop calling it (deprecated).
 * - Which checkout:  the nearest one from the current folder up (a worktree's, when run in one), else this
 *   checkout's (`findCheckout()`).
 * - Runs the tool in a child `node` under `tsx` (it imports `$/server`, through `packages/docs/tsconfig.json`),
 *   in the current folder, with this terminal attached:  `runTool()`.
 * - NOTE: a child process, not an import:  nothing may import `docs`.
 * - Lean, like every pass-through:  `args` only, no `CliSession` (which loads spell).
 * - Returns the tool's exit code.
 */
export function planDocCommand(args: string[]): Promise<number> {
  return runTool("plan-doc", args)
}
