// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `epic ask <command> ...`:  the `/details` skill's tool, `packages/epics/tools/details.js` (a details page
 * in VS Code's side bar, and Owen's answers on it), the nearest checkout's, `args` verbatim.
 * - Root `yarn details` aliases it.  Runs in `packages/epics`, as `yarn workspace @spell-app/docs details` did in
 *   the docs package.
 * - Returns the tool's exit code.
 */
export function detailsCommand(args: string[]): Promise<number> {
  return runTool("details", args)
}
