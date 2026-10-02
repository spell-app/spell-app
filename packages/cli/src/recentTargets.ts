/**
 * The last few targets picked at the target prompt -- see `<TargetPrompt>` -- newest first, so it can offer them
 * again first.
 * - Kept in `packages/cli/.recent-targets.json`, gitignored:  each checkout keeps its own.
 * - Only what the prompt picked:  targets typed on the command line aren't remembered.
 * - Never throws:  a missing or broken file is no recents.
 */
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { fileURLToPath } from "url"

/** How many to keep. */
const MAX_RECENT = 3

/** Where they're kept:  beside our `package.json`. */
export const RECENT_TARGETS_FILE = resolve(fileURLToPath(import.meta.url), "..", "..", ".recent-targets.json")

/** Targets picked most recently, newest first -- at most `MAX_RECENT`. */
export function recentTargets(file = RECENT_TARGETS_FILE): string[] {
  try {
    const list: unknown = JSON.parse(readFileSync(file, "utf8"))
    return Array.isArray(list) ? list.filter((it) => typeof it === "string").slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

/** Remember `target` as the newest pick, dropping any earlier copy of it, and the oldest past `MAX_RECENT`. */
export function rememberTarget(target: string, file = RECENT_TARGETS_FILE): void {
  const list = [target, ...recentTargets(file).filter((it) => it !== target)].slice(0, MAX_RECENT)
  try {
    writeFileSync(file, `${JSON.stringify(list, null, 2)}\n`)
  } catch {
    // e.g. a read-only checkout:  nothing to remember with, which is fine
  }
}
