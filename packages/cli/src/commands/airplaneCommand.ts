// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev airplane <verb> ...`:  airplane mode (epic `airplane`):  Owen works on the docs with no Claude, and
 * what he leaves waits for `/airplane land`.  `on`, `off`, `status`, `check [--fix]`.  The tool:
 * `packages/docs/tools/airplane.ts`, its header the verbs;  the `/airplane` skill runs it.
 * - NOTE: a child process, not an import:  nothing may import `docs`.
 * - Returns the tool's exit code.
 */
export function airplaneCommand(args: string[]): Promise<number> {
  return runTool("airplane", args)
}
