// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError } from "$/cli/cli.types"
import { DESIGN_VERBS, runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev design <verb> ...`:  Spell's claude.ai design system (epic `claude-design`), the nearest checkout's
 * tools, `args` verbatim.  Claude's `/design` skill does the claude.ai half (publish, read) with its Artifact tool.
 * - `build [--out <dir>]`:  `packages/ui`'s `yarn design:build` (`scripts/design-build.ts`), which writes the system's
 *   files to `<dir>/project/` (default `packages/ui/build/design-system/`)
 * - `bundle [--out <dir>] [--skip-ui-build]`:  `packages/docs`' `yarn design:bundle`, the system's `bundle.js`
 * - `check [bundle] [outDir]`:  `packages/docs`' `yarn design:check`, the bundle proved inlined and on a Design board
 * - `pull <board.dc.html> <page.html>`, `changed`, `pushed`, `state`:  `packages/docs/tools/design.js`
 * - Runs in the current folder (`bundle` / `check` in `packages/docs`):  a relative path is relative to it.
 * - Throws `CliError` for no verb, or another one.
 * - Returns the tool's exit code.
 */
export function designCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (!DESIGN_VERBS.includes(verb as (typeof DESIGN_VERBS)[number])) {
    const what = verb === undefined ? "which design tool?" : `unknown verb '${verb}':`
    throw new CliError(`${what}  ${DESIGN_VERBS.join(", ")}`)
  }
  if (verb === "build") return runTool("design build", rest)
  if (verb === "bundle") return runTool("design bundle", ["--design", ...rest])
  if (verb === "check") return runTool("design check", rest)
  return runTool("design sync", [verb!, ...rest])
}
