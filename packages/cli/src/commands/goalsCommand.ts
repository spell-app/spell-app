import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { dirname, join, resolve } from "path"
import { pathToFileURL } from "url"

import { CLI } from "$/cli"

/** The goals tool, relative to a checkout's root (in `goals/_tools/` until 2026-10-04). */
const TOOL = join("packages", "docs", "tools", "goals", "goals.js")

/**
 * `spell goals <command> ...`:  the goals tool of the nearest goals folder -- the same commands the /goals skills
 * use.  `spell goals help` lists them, e.g. `spell goals update spell/motivation`, `spell goals open`.
 * - Which goals folder:  `GOALS_DIR`, else the nearest `goals/goals.preferences.json5` from the current folder up,
 *   else this checkout's own `goals/`.  See `findGoals()`.
 * - Which tool:  the goals folder's checkout's own `packages/docs/tools/goals/goals.js` (a worktree's, run in one),
 *   else this checkout's.
 *   - the tool gets the folder found here as `GOALS_DIR`:  the tools no longer sit inside it, so they can't tell
 * - Runs it in a child `node` under `tsx` (the tools use `$/server`, through `packages/docs/tsconfig.json`), with
 *   this terminal attached:  `talk` and `update` start Claude Code right here, `serve` runs until Ctrl-C.
 * - NOTE: not the parser's business:  nothing here loads a project.
 * - Returns the tool's exit code.
 */
export async function goalsCommand(_session: CLI.CliSession, args: string[]): Promise<number> {
  const goals = findGoals()
  if (!goals) throw new CLI.CliError("No goals folder here:  no goals/goals.preferences.json5 above this folder")
  const root = existsSync(join(dirname(goals), TOOL)) ? dirname(goals) : CLI.REPO_ROOT
  const loader = pathToFileURL(join(CLI.REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
  const run = spawnSync(process.execPath, ["--import", loader, join(root, TOOL), ...(args.length ? args : ["help"])], {
    stdio: "inherit",
    env: { ...process.env, GOALS_DIR: goals, TSX_TSCONFIG_PATH: join(root, "packages", "docs", "tsconfig.json") }
  })
  return run.status ?? CLI.EXIT.ERRORS
}

/**
 * The goals folder to use:  `GOALS_DIR`, the nearest one from the current folder up, or this checkout's.
 * - a goals folder is one holding `goals.preferences.json5`
 */
function findGoals(): string | undefined {
  if (process.env.GOALS_DIR) return resolve(process.env.GOALS_DIR)
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    if (existsSync(join(dir, "goals.preferences.json5"))) return dir
    if (existsSync(join(dir, "goals", "goals.preferences.json5"))) return join(dir, "goals")
    if (dirname(dir) === dir) break
  }
  const own = join(CLI.REPO_ROOT, "goals")
  return existsSync(join(own, "goals.preferences.json5")) ? own : undefined
}
