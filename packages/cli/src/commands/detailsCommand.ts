// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev details <command> ...`:  the `/details` skill's tool, `packages/docs/tools/details.js` (a details page
 * in VS Code's side bar, and Owen's answers on it), the nearest checkout's, `args` verbatim.
 * - Root `yarn details` aliases it.  Runs in `packages/docs`, as `yarn workspace @spell-app/docs details` did.
 * - Returns the tool's exit code.
 */
export function detailsCommand(args: string[]): Promise<number> {
  return runTool("details", args)
}
