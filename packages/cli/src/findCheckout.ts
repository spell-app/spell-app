import { existsSync } from "fs"
import { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"

/** This checkout's root:  `packages/cli/src/` is three folders down. */
export const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..")

/**
 * The checkout to work on:  the nearest folder from `from` (default the current one) up that holds `marker`, a
 * path relative to a checkout's root, e.g. `packages/docs/scripts/plan-doc.js`;  else this checkout.
 * - Why:  `spell` is usually linked to the MAIN checkout (`yarn cli:install`), but in a worktree the files to read
 *   or edit are the worktree's.  Every `spell dev` command, and `spell plan-doc`, finds its checkout this way.
 */
export function findCheckout(marker: string, from = process.cwd()): string {
  for (let dir = resolve(from); ; dir = dirname(dir)) {
    if (existsSync(join(dir, marker))) return dir
    if (dirname(dir) === dir) return REPO_ROOT
  }
}
