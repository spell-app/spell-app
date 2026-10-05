import { spawnSync } from "child_process"
import { join } from "path"
import { pathToFileURL } from "url"

import { CLI } from "$/cli"

/** The plan-doc tool, relative to a checkout's root. */
const TOOL = join("packages", "docs", "tools", "plan-doc.js")

/**
 * `spell plan-doc <command> <name> ...`:  `yarn plan-doc`, the tool that edits a plan doc
 * (`packages/docs/content/epics/<name>/<name>.plan.html`), as the `/epic` skill uses it.  `spell plan-doc` alone lists its
 * commands, e.g. `spell plan-doc summary seo`, `spell plan-doc phase seo 2 done`.
 * - Which checkout:  the nearest one from the current folder up (a worktree's, when run in one), else this
 *   checkout's (`CLI.findCheckout()`).
 * - Runs the tool in a child `node` under `tsx` (it imports `$/server`, through `packages/docs/tsconfig.json`),
 *   with this terminal attached.
 * - NOTE: a child process, not an import:  nothing may import `docs`.  Not the parser's business either:  nothing
 *   here loads a project.
 * - Returns the tool's exit code.
 */
export async function planDocCommand(_session: CLI.CliSession, args: string[]): Promise<number> {
  const root = CLI.findCheckout(TOOL)
  const loader = pathToFileURL(join(CLI.REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
  const run = spawnSync(process.execPath, ["--import", loader, join(root, TOOL), ...args], {
    stdio: "inherit",
    env: { ...process.env, TSX_TSCONFIG_PATH: join(root, "packages", "docs", "tsconfig.json") }
  })
  return run.status ?? CLI.EXIT.ERRORS
}
