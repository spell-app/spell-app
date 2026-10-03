import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { dirname, join, resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { CLI } from "$/cli"

/** This checkout's root:  `packages/cli/src/commands/` is four folders down. */
const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..", "..")

/** The plan-doc tool, relative to a checkout's root. */
const TOOL = join("packages", "docs", "scripts", "plan-doc.js")

/**
 * `spell plan-doc <command> <name> ...`:  `yarn plan-doc`, the tool that edits a plan doc
 * (`packages/docs/epics/<name>/<name>.html`), as the `/epic` skill uses it.  `spell plan-doc` alone lists its
 * commands, e.g. `spell plan-doc summary seo`, `spell plan-doc phase seo 2 done`.
 * - Which checkout:  the nearest one from the current folder up (a worktree's, when run in one), else this
 *   checkout's.  See `findCheckout()`.
 * - Runs the tool in a child `node` under `tsx` (it imports `$/server`, through `packages/docs/tsconfig.json`),
 *   with this terminal attached.
 * - NOTE: a child process, not an import:  nothing may import `docs`.  Not the parser's business either:  nothing
 *   here loads a project.
 * - Returns the tool's exit code.
 */
export async function planDocCommand(_session: CLI.CliSession, args: string[]): Promise<number> {
  const root = findCheckout()
  const loader = pathToFileURL(join(REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
  const run = spawnSync(process.execPath, ["--import", loader, join(root, TOOL), ...args], {
    stdio: "inherit",
    env: { ...process.env, TSX_TSCONFIG_PATH: join(root, "packages", "docs", "tsconfig.json") }
  })
  return run.status ?? CLI.EXIT.ERRORS
}

/**
 * The checkout whose plan docs to edit:  the nearest folder from the current one up that has the tool, else this
 * checkout.  Why:  `spell` is usually the MAIN checkout's, but in a worktree the plan doc is the worktree's.
 */
function findCheckout(): string {
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    if (existsSync(join(dir, TOOL))) return dir
    if (dirname(dir) === dir) return REPO_ROOT
  }
}
