// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev notes <verb> ...`:  the page notes Owen leaves on docs pages for Claude (epic `airplane`, P3):  `list`,
 * `answer`, `done`.  The tool:  `packages/docs/tools/notes.ts`, its header the verbs.
 * - Lean:  `args` only, no `CliSession` (which loads spell).
 * - NOTE: a child process, not an import:  nothing may import `docs`.
 * - Returns the tool's exit code.
 */
export function notesCommand(args: string[]): Promise<number> {
  return runTool("notes", args)
}
