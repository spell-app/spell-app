import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { dirname, join, resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { CLI } from "$/cli"

/** This checkout's root:  `packages/cli/src/commands/` is four folders down. */
const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..", "..")

/**
 * `spell goals <command> ...`:  the goals tool of the nearest goals folder -- the same commands the /goals skills
 * use.  `spell goals help` lists them, e.g. `spell goals update spell/motivation`, `spell goals open`.
 * - Which goals folder:  `GOALS_DIR`, else the nearest `goals/goals.preferences.json5` from the current folder up,
 *   else this checkout's own `goals/`.  See `findGoals()`.
 * - Runs `<goals>/_tools/goals.js` in a child `node` under `tsx` (as `goals.sh` does:  the tools use `$/server`, through
 *   the goals folder's `tsconfig.json`), with this terminal attached:  `talk` and `update` start
 *   Claude Code right here, `serve` runs until Ctrl-C.
 * - NOTE: not the parser's business:  nothing here loads a project.
 * - Returns the tool's exit code.
 */
export async function goalsCommand(_session: CLI.CliSession, args: string[]): Promise<number> {
  const goals = findGoals()
  if (!goals) throw new CLI.CliError("No goals folder here:  no goals/goals.preferences.json5 above this folder")
  const loader = pathToFileURL(join(REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
  const run = spawnSync(
    process.execPath,
    ["--import", loader, join(goals, "_tools", "goals.js"), ...(args.length ? args : ["help"])],
    { stdio: "inherit", env: { ...process.env, TSX_TSCONFIG_PATH: join(goals, "tsconfig.json") } }
  )
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
  const own = join(REPO_ROOT, "goals")
  return existsSync(join(own, "goals.preferences.json5")) ? own : undefined
}
