// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError } from "$/cli/cli.types"
import { DESIGN_VERBS, runTool, type ToolName } from "$/cli/dev/passThrough"

/**
 * `spell dev design <verb> ...`:  Spell UI's claude.ai design system (epic `claude-design`), the nearest checkout's
 * tools, `args` verbatim.
 * - `build [--out <dir>]`:  `packages/ui`'s `yarn design:build` (`scripts/design-build.ts`), which writes the system's
 *   files to `<dir>/project/` (default `packages/ui/build/design-system/`)
 * - Runs in the current folder:  a relative `--out` is relative to it.
 * - Throws `CliError` for no verb, or another one.
 * - Returns the tool's exit code.
 */
export function designCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (!DESIGN_VERBS.includes(verb as (typeof DESIGN_VERBS)[number])) {
    const what = verb === undefined ? "which design tool?" : `unknown verb '${verb}':`
    throw new CliError(`${what}  ${DESIGN_VERBS.join(", ")}`)
  }
  return runTool(`design ${verb}` as ToolName, rest)
}
