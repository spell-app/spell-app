// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { runTool } from "$/cli/dev/passThrough"

/**
 * `spell dev server <verb> ...`:  the page server of the nearest checkout (`packages/server`'s `src/page/cli.ts`),
 * `args` verbatim:  `serve`, `start` / `ensure`, `stop`, `status`, `url <file>` -- its header has them.
 * - Root `yarn server` aliases it.
 * - `start --all`:  every web server of the checkout instead -- page server, editor, Spell UI -- and where each is:
 *   `scripts/serve.mjs`, root `yarn serve`
 * - Under `tsx` with `packages/server/tsconfig.json`, in the current folder:  `url <file>` reads `file` from here
 *   (or from `INIT_CWD`, which yarn sets to where it ran).
 * - Returns the tool's exit code.
 */
export function serverCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (verb === "start" && rest.includes("--all"))
    return runTool(
      "serve",
      rest.filter((arg) => arg !== "--all")
    )
  return runTool("server", args)
}
