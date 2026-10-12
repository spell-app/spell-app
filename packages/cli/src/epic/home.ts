import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * The TOOLING HOME:  the epic every session sends dev-tooling requests to (epic `epic-workflow`, Q2 and Q7).
 * - Dev tooling:  how Owen works, not what a session builds:  the plan doc page, comments, the Review tab, every
 *   skill and hook, windows, worktrees, `spell dev` and `spell epic` (the rule:  the root `CLAUDE.md`).
 * - Kept in `epics/home.json`, shared content:  every checkout reads the same one, and the turn-end hook commits it.
 *
 * ```json
 * { "epic": "epic-workflow", "set": "2026-10-11" }
 * ```
 */

/** The tooling home's epic, or `null` when none is set. */
export function epicHome(root: string): string | null {
  const path = homeFile(root)
  if (!existsSync(path)) return null
  const home = CLI.parseJSONLine(readFileSync(path, "utf8"))
  return typeof home.epic === "string" && home.epic ? home.epic : null
}

/**
 * Make `epic` the tooling home;  throws when it has no plan doc.
 * - SIDE EFFECT:  writes `epics/home.json`
 */
export function setEpicHome(root: string, epic: string): void {
  if (!existsSync(join(root, "epics", epic, `${epic}.plan.html`))) {
    throw new CLI.CliError(`no epic '${epic}':  epics/${epic}/${epic}.plan.html isn't there`)
  }
  const set = new Date().toISOString().slice(0, 10)
  writeFileSync(homeFile(root), `${JSON.stringify({ epic, set }, null, 2)}\n`)
}

/** Where the tooling home is kept. */
function homeFile(root: string): string {
  return join(root, "epics", "home.json")
}
