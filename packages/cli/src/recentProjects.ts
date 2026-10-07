/**
 * The last few projects (or files) picked at the project prompt -- see `<ProjectPrompt>` -- newest first, so it can
 * offer them again first.
 * - Kept in `packages/cli/.recent-projects.json`, gitignored:  each checkout keeps its own.
 *   - Was `.recent-targets.json`, until compile targets took the word (epic `output-targets`, T6):  the first read
 *     renames an old file it finds beside it.
 * - Only what the prompt picked:  projects typed on the command line aren't remembered.
 * - Never throws:  a missing or broken file is no recents.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

/** How many to keep. */
const MAX_RECENT = 3

/** Where they're kept:  beside our `package.json`. */
export const RECENT_PROJECTS_FILE = resolve(fileURLToPath(import.meta.url), "..", "..", ".recent-projects.json")

/** What that file was called before, in the same folder -- see the header. */
const OLD_RECENT_FILE_NAME = ".recent-targets.json"

/** Projects picked most recently, newest first -- at most `MAX_RECENT`. */
export function recentProjects(file = RECENT_PROJECTS_FILE): string[] {
  moveOldRecents(file)
  try {
    const list: unknown = JSON.parse(readFileSync(file, "utf8"))
    return Array.isArray(list) ? list.filter((it) => typeof it === "string").slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

/** Remember `arg` as the newest pick, dropping any earlier copy of it, and the oldest past `MAX_RECENT`. */
export function rememberProject(arg: string, file = RECENT_PROJECTS_FILE): void {
  const list = [arg, ...recentProjects(file).filter((it) => it !== arg)].slice(0, MAX_RECENT)
  try {
    writeFileSync(file, `${JSON.stringify(list, null, 2)}\n`)
  } catch {
    // e.g. a read-only checkout:  nothing to remember with, which is fine
  }
}

/** Rename `OLD_RECENT_FILE_NAME` beside `file` to `file`, if `file` isn't there yet.  NEVER throws. */
function moveOldRecents(file: string): void {
  const oldFile = resolve(dirname(file), OLD_RECENT_FILE_NAME)
  if (existsSync(file) || !existsSync(oldFile)) return
  try {
    renameSync(oldFile, file)
  } catch {
    // e.g. a read-only checkout:  no recents, which is fine
  }
}
