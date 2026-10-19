/**
 * A worktree's files, and the shared content folder's, on the MAIN checkout's page server, so every link points to
 * one port.
 * - The main page server serves each worktree under `/worktrees/<w>/` (`$/server/page` `PageServer`).
 * - Used by `spell dev server url` and the VS Code doc preview;  either falls back to the worktree's own server.
 * - Shared content is served from the main checkout itself:  `/epics/...`, not `/worktrees/<w>/epics/...`.
 *   - shared content:  `epics/`, `guides/` ...:  ONE shared repo, the same in every checkout
 *     - a file in it by its own path, as spell-epic hands them out (`.../spell-app.epics/epics/x/x.plan.html`):
 *       the content folder the main server serves at `/` (`contentFolder` in its `/api/server`), from any checkout
 *     - or through an old link at a checkout's root
 *   - Why:  a page loads its scripts from the checkout it's served from,
 *     so an epic page shown through an old worktree drew with that worktree's old `<epic-*>` elements
 *     (epic `epic-eject` P1).
 */
import { readdirSync, realpathSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"

import { SRV } from "$/server"

/**
 * `file`'s URL on the main checkout's page server;  else `undefined`.
 * - only when `file` is in a worktree of a main checkout, or in the shared content folder that server serves,
 *   and that server is running and serves worktrees
 *   - in a worktree:  as `SRV.checkoutOf()` finds it, e.g. `<main>/.claude/worktrees/<w>/...`
 *   - in the content folder (epic `epic-eject` P12):  its path there, `/epics/...`, from the content folder the
 *     server says it serves (`contentFolder` in its `/api/server`, live:  the server knows it, this package can't
 *     read `.epic/config.json5`)
 *     - which main checkout:  `file`'s;  else that of checkout `from`;  else the one beside the content repo whose
 *       page server serves it (`contentServerOf()`), so a caller that knows no checkout (the doc preview) finds it
 * - "serves worktrees":  its running epics answer (`RUNNING_EPICS_API`, epics' route module)
 *   - so a main server started before it learned to (an older checkout, not yet restarted)
 *     is never handed a URL it would 404
 */
export async function mainServerUrl(file: string, from?: string): Promise<string | undefined> {
  const at = worktreePath(file)
  const main = at?.main ?? (from && SRV.checkoutOf(from)?.main) ?? contentServerOf(file)
  if (!main) return undefined
  const running = await new SRV.PidFile(main).status()
  if (!running) return undefined
  try {
    const answer = await fetch(`${running.base}${RUNNING_EPICS_API}`, { signal: AbortSignal.timeout(1000) })
    if (!answer.ok) return undefined
  } catch {
    return undefined
  }
  const content = contentPathOf(file, (await liveInfo(running.base)) ?? running)
  if (content) return `${running.base}${content}`
  if (!at) return undefined
  const path = at.path.map(encodeURIComponent).join("/")
  if (isShared(at)) return `${running.base}/${path}`
  return `${running.base}/worktrees/${encodeURIComponent(at.worktree)}/${path}`
}

/**
 * File `file`'s URL path on a page server that serves the content folder `server.contentFolder`
 * (`PageServer.serveContent()`):  `/epics/x/x.plan.html`;  `undefined` for a file outside it.
 * - by its path, else by its real path:  a file reached through a link into the content folder (a checkout's old
 *   `epics` link, the worktrees' folder's `spell-app.epics`) is the content folder's
 */
export function contentPathOf(file: string, server: Pick<SRV.ServerInfo, "contentFolder">): string | undefined {
  const folder = server.contentFolder
  if (!folder) return undefined
  const inside = (path: string, root: string) => (path !== root && SRV.isInside(root, path) ? relative(root, path) : "")
  const path = inside(resolve(file), folder) || inside(realOrSelf(file), realOrSelf(folder))
  return path ? `/${path.split(sep).map(encodeURIComponent).join("/")}` : undefined
}

/**
 * The main checkout whose page server serves the content folder `file` is in;  else `undefined`.
 * - the content folder is a repo of its own, beside the checkouts (`../spell-app.epics`), and names none of them:
 *   so each folder beside it is asked, by its page server's pid file (`.spell-server.json`, written once the route
 *   modules have said what it serves:  `contentFolder`)
 * - a worktree's server serves it too:  that worktree's main checkout, then
 * - real paths compared, so a file through a link to the content folder counts
 * - NEVER throws
 */
export function contentServerOf(file: string): string | undefined {
  const repo = SRV.checkoutOf(realOrSelf(file))
  if (!repo || repo.worktree) return undefined
  const content = realOrSelf(repo.root)
  const beside = dirname(content)
  let entries
  try {
    entries = readdirSync(beside, { withFileTypes: true })
  } catch {
    return undefined
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || join(beside, entry.name) === content) continue
    const info = new SRV.PidFile(join(beside, entry.name)).read()
    if (info?.contentFolder && realOrSelf(info.contentFolder) === content)
      return SRV.checkoutOf(info.root)?.main ?? info.root
  }
  return undefined
}

/** The page server at `base`'s info, as it is now (`/api/server`);  `undefined` when it doesn't answer. */
async function liveInfo(base: string): Promise<SRV.ServerInfo | undefined> {
  try {
    const answer = await fetch(`${base}${SRV.SERVER_API}`, { signal: AbortSignal.timeout(1000) })
    return answer.ok ? ((await answer.json()) as SRV.ServerInfo) : undefined
  } catch {
    return undefined
  }
}

/** `path`'s real path;  `path` itself when it isn't there. */
function realOrSelf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return resolve(path)
  }
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
