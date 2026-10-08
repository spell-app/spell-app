// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError } from "$/cli/cli.types"
import { DOCS_VERBS, runTool, type ToolName } from "$/cli/dev/passThrough"

/**
 * `spell dev docs <verb> ...`:  the docs tools in `packages/docs/tools`, the nearest checkout's, `args` verbatim.
 * - `update`, `index`, `new`, `open`, `link`:  root `yarn docs:<verb>` aliases each;  the tools' usage is in their
 *   headers, e.g. `spell dev docs open solid/solid-2 --vs`, `spell dev docs link <page> --hash <id> --show`
 * - `fuss`:  the writing checker, `spell dev docs fuss <paths...> | --branch [--json]`
 * - Runs each as `packages/docs/package.json`'s script did (`TOOLS` in `dev/passThrough.ts`):
 *   in `packages/docs`, under `node`, `link` under `tsx`
 * - `fuss` runs under `tsx` in the caller's folder, so its paths are from there.
 * - Throws `CliError` for no verb, or another one.
 * - Returns the tool's exit code.
 */
export function docsCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (!DOCS_VERBS.includes(verb as (typeof DOCS_VERBS)[number])) {
    const what = verb === undefined ? "which docs tool?" : `unknown verb '${verb}':`
    throw new CliError(`${what}  ${DOCS_VERBS.join(", ")}`)
  }
  return runTool(`docs ${verb}` as ToolName, rest)
}
