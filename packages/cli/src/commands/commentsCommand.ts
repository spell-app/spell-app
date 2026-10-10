// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev comments <verb> ...`:  the comments Owen leaves on docs pages' blocks for Claude (epic `airplane`, P11):
 * `list`, `gather` (into epic `guide-changes`, one phase per page), `answer`.
 * The tool:  `packages/docs/tools/comments.ts`, its header the verbs.
 * - Lean:  `args` only, no `CliSession` (which loads spell).
 * - NOTE: a child process, not an import:  nothing may import `docs`.
 * - Returns the tool's exit code.
 */
export function commentsCommand(args: string[]): Promise<number> {
  return runTool("comments", args)
}
