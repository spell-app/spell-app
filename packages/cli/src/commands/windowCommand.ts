// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev window <command> ...`:  VS Code windows per package and per worktree, `scripts/window.mjs` of the
 * nearest checkout, `args` verbatim:  `open`, `close`, `handoff`, `show`, `stay-check`, `init` ... (its header).
 * - Root `yarn window` aliases it.
 * - Works in a worktree before its `yarn install`:  `spell` is the MAIN checkout's, `window.mjs` imports only node's
 *   own modules, and it runs in the current folder, which it reads to tell which window it's in.
 * - Returns the tool's exit code.
 */
export function windowCommand(args: string[]): Promise<number> {
  return runTool("window", args)
}
