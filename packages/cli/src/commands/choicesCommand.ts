// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev choices <command> ...`:  syntax-choices pages, `packages/docs/tools/choices.js` (a table of names Claude
 * recommends, one row per use site, which Owen goes through one by one and sends with "Do it"), the nearest
 * checkout's, `args` verbatim.
 * - Runs in `packages/docs`, as `spell dev details` does.
 * - Returns the tool's exit code.
 */
export function choicesCommand(args: string[]): Promise<number> {
  return runTool("choices", args)
}
