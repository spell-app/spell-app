import { existsSync } from "fs"
import { join } from "path"

import { CLI } from "$/cli"
import { DataFile } from "$/epics/data/DataFile"

/**
 * The TOOLING HOME:  the epic every session sends dev-tooling requests to (epic `epic-workflow`, Q2 and Q7).
 * - Dev tooling:  how Owen works, not what a session builds:  the epic page, comments, the Review tab, every
 *   skill and hook, windows, worktrees, `spell dev` and `spell epic` (the rule:  the root `CLAUDE.md`).
 * - Kept in `epics/home.json5`, shared content:  every checkout reads the same one, and the turn-end hook commits it.
 *   - a data file (`DataFile`, epic `epic-workflow` P21):  JSON5, a comment added by hand kept, its old
 *     `home.json` read while there's no `.json5`
 *
 * ```json5
 * { "epic": "epic-workflow", "set": "2026-10-11" }
 * ```
 */

/** The tooling home's epic, or `null` when none is set (or its file won't read). */
export function epicHome(root: string): string | null {
  let home: { epic?: unknown } | undefined
  try {
    home = DataFile.read<{ epic?: unknown }>(homeFile(root))
  } catch {
    return null
  }
  return typeof home?.epic === "string" && home.epic ? home.epic : null
}

/**
 * Make `epic` the tooling home;  throws when it has no epic page.
 * - SIDE EFFECT:  writes `epics/home.json5` (removing its old `.json`)
 */
export function setEpicHome(root: string, epic: string): void {
  if (!existsSync(join(root, "epics", epic, `${epic}.plan.html`))) {
    throw new CLI.CliError(`no epic '${epic}':  epics/${epic}/${epic}.plan.html isn't there`)
  }
  const set = new Date().toISOString().slice(0, 10)
  DataFile.write(homeFile(root), { epic, set })
}

/** Where the tooling home is kept. */
function homeFile(root: string): string {
  return join(root, "epics", `home${DataFile.SUFFIX}`)
}
