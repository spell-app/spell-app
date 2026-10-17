/**
 * A worktree's files on the MAIN checkout's page server, so every link points to one port.
 * - The main page server serves each worktree under `/worktrees/<w>/` (`$/server/page` `RunningEpics`).
 * - Used by `spell dev server url` and the VS Code doc preview;  either falls back to the worktree's own server.
 * - Shared content (`epics/`, `guides/` ...:  links into ONE shared repo, the same in every checkout) is served from
 *   the main checkout itself, `/epics/...`, not `/worktrees/<w>/epics/...`.
 *   - Why:  a page loads its scripts from the checkout it's served from, so a plan doc shown through an old
 *     worktree drew with that worktree's old `<epic-*>` elements (epic `epic-eject` P1).
 */
import { realpathSync } from "node:fs"
import { join, resolve, sep } from "node:path"

import { SRV } from "$/server"

/**
 * `file`'s URL on the main checkout's page server;  else `undefined`.
 * - only when `file` is in a worktree (`<main>/.claude/worktrees/<w>/...`),
 *   and that server is running and serves worktrees
 * - "serves worktrees":  `/_server/epics` answers
 *   - so a main server started before it learned to (an older checkout, not yet restarted)
 *     is never handed a URL it would 404
 */
export async function mainServerUrl(file: string): Promise<string | undefined> {
  const at = worktreePath(file)
  if (!at) return undefined
  const running = await new SRV.PidFile(at.main).status()
  if (!running) return undefined
  try {
    const answer = await fetch(`${running.base}/_server/epics`, { signal: AbortSignal.timeout(1000) })
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
function isShared(at: { main: string; worktree: string; path: string[] }): boolean {
  const top = at.path[0]
  if (!top || at.path.length < 2) return false
  try {
    const own = realpathSync(join(at.main, ".claude", "worktrees", at.worktree, top))
    return own === realpathSync(join(at.main, top))
  } catch {
    return false
  }
}

/**
 * Where `file` sits, when it's inside a worktree of a main checkout;  else `undefined`.
 * - `main`:  the main checkout
 * - `worktree`:  the worktree's name
 * - `path`:  the path inside the worktree, as segments
 */
export function worktreePath(file: string): { main: string; worktree: string; path: string[] } | undefined {
  const parts = resolve(file).split(sep)
  for (let i = parts.length - 3; i >= 1; i--) {
    if (parts[i] !== ".claude" || parts[i + 1] !== "worktrees") continue
    const worktree = parts[i + 2]
    if (!worktree) return undefined
    return { main: parts.slice(0, i).join(sep) || sep, worktree, path: parts.slice(i + 3) }
  }
  return undefined
}
