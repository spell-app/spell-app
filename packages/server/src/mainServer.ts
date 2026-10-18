/**
 * A worktree's files on the MAIN checkout's page server, so every link points to one port.
 * - The main page server serves each worktree under `/worktrees/<w>/` (`$/server/page` `PageServer`).
 * - Used by `spell dev server url` and the VS Code doc preview;  either falls back to the worktree's own server.
 * - Shared content is served from the main checkout itself:  `/epics/...`, not `/worktrees/<w>/epics/...`.
 *   - shared content:  `epics/`, `guides/` ...:  links into ONE shared repo, the same in every checkout
 *   - Why:  a page loads its scripts from the checkout it's served from,
 *     so an epic page shown through an old worktree drew with that worktree's old `<epic-*>` elements
 *     (epic `epic-eject` P1).
 */
import { realpathSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"

import { SRV } from "$/server"

/**
 * `file`'s URL on the main checkout's page server;  else `undefined`.
 * - only when `file` is in a worktree of a main checkout,
 *   and that server is running and serves worktrees
 *   - in a worktree:  as `SRV.checkoutOf()` finds it, e.g. `<main>/.claude/worktrees/<w>/...`
 * - "serves worktrees":  its running epics answer (`RUNNING_EPICS_API`, epics' route module)
 *   - so a main server started before it learned to (an older checkout, not yet restarted)
 *     is never handed a URL it would 404
 *   - NOTE:  `main`'s server answers it only once epic `people-and-orgs` merges;
 *     until then, a worktree's file opens on the worktree's own server
 */
export async function mainServerUrl(file: string): Promise<string | undefined> {
  const at = worktreePath(file)
  if (!at) return undefined
  const running = await new SRV.PidFile(at.main).status()
  if (!running) return undefined
  try {
    const answer = await fetch(`${running.base}${RUNNING_EPICS_API}`, { signal: AbortSignal.timeout(1000) })
    if (!answer.ok) return undefined
  } catch {
    return undefined
  }
  const path = at.path.map(encodeURIComponent).join("/")
  if (isShared(at)) return `${running.base}/${path}`
  return `${running.base}/worktrees/${encodeURIComponent(at.worktree)}/${path}`
}

/**
 * Whether `at`'s file is shared content:  its top folder in the worktree and in the main checkout
 * are the same real folder (both links into the shared repo).
 */
function isShared(at: WorktreePath): boolean {
  const top = at.path[0]
  if (!top || at.path.length < 2) return false
  try {
    const own = realpathSync(join(at.root, top))
    return own === realpathSync(join(at.main, top))
  } catch {
    return false
  }
}

/**
 * Where `file` sits, when it's inside a worktree of a main checkout;  else `undefined`.
 * - `main`:  the main checkout
 * - `root`:  the worktree's folder
 * - `worktree`:  the worktree's name
 * - `path`:  the path inside the worktree, as segments
 * - found as git finds it (`SRV.checkoutOf()`), wherever the worktree's folder is
 */
export function worktreePath(file: string): WorktreePath | undefined {
  const checkout = SRV.checkoutOf(file)
  if (!checkout?.worktree) return undefined
  const path = relative(checkout.root, resolve(file)).split(sep).filter(Boolean)
  return { main: checkout.main, root: checkout.root, worktree: checkout.worktree, path }
}

/** Where a worktree's file sits (`worktreePath()`). */
export type WorktreePath = { main: string; root: string; worktree: string; path: string[] }

/**
 * Where the main page server lists the running epics:  spell-epic's route module answers it (`spell-epic/src/list/runningRoutes.ts`).
 * - here, not imported from epics:  this package is a leaf
 */
export const RUNNING_EPICS_API = "/api/epics/running"
