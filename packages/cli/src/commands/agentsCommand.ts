// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev agents <verb> ...`:  the running-agents list of this checkout's epic, else of the checkout (epic
 * `skillz`):  `add`, `set`, `done`, `list`.  The tool:  `packages/docs/tools/agents.ts`, its header the verbs.
 * - Claude sessions and their agents call it as agents start and finish (`/bg`, the root `CLAUDE.md`), so it's lean:
 *   `args` only, no `CliSession` (which loads spell).
 * - NOTE: a child process, not an import:  nothing may import `docs`.
 * - Until epic `skillz`, `spell dev agents check` was WWOD's citation check:  now `spell dev wwod check`.
 * - Returns the tool's exit code.
 */
export function agentsCommand(args: string[]): Promise<number> {
  return runTool("agents", args)
}
