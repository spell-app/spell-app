// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError } from "$/cli/cli.types"
import { DOCS_VERBS, runEpic } from "$/cli/dev/passThrough"

/**
 * `spell dev docs <verb> ...`:  the old spelling of `epic pages <verb> ...`, the docs tools, `args` verbatim.
 * - The tools are spell-epic's (epic `epic-eject` I5):  `epic` runs its own copy on the caller's checkout.
 * - `update`, `index`, `new`, `open`, `link`:  root `yarn docs:<verb>` aliases each;  the tools' usage is in their
 *   headers, e.g. `spell dev docs open solid/solid-2 --vs`, `spell dev docs link <page> --hash <id> --show`
 * - `fuss`:  the writing checker, `spell dev docs fuss <paths...> | --branch [--json]`
 * - `offline`:  what docs pages load from the internet, `spell dev docs offline [paths...] [--fix] [--json]`
 * - `fuss` and `offline` run in the caller's folder, so their paths are from there.
 * - Throws `CliError` for no verb, or another one.
 * - Returns the tool's exit code.
 */
export function docsCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (!DOCS_VERBS.includes(verb as (typeof DOCS_VERBS)[number])) {
    const what = verb === undefined ? "which docs tool?" : `unknown verb '${verb}':`
    throw new CliError(`${what}  ${DOCS_VERBS.join(", ")}`)
  }
  return runEpic(["pages", verb!, ...rest])
}
