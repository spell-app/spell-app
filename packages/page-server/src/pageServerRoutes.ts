import { componentSets, pageServerSettings, HIGHLIGHT_JS, type RouteModule } from "$/server/page"
import { BundleBuild, MOVED_FOLDERS, MOVED_OUT } from "$/page-server"

/**
 * What only spell-app's page server does, on the generic one (`$/server/page`'s `PageServer`):  a ROUTE MODULE,
 * listed FIRST in the repo root's `package.json` `"pageServer": { "routes": [...] }` (epic `repo-split` P4).
 * - builds the bundles it serves, which aren't committed (`BundleBuild`):  `spell dev bundles build --stale`,
 *   as it starts;  a request for a missing file of one waits while that runs
 * - swaps the cdnjs highlight.js tag on every page for the engine's copy (`localHighlight()`):  pages load offline
 * - the bridges for the SHARED pages, which every checkout shows:
 *   - the engine's old folders still serve from spell-epic (`movedFolderPath()`):  a safety net
 *   - folders moved out of the shared content answer "not found" (`MOVED_OUT`), though the shared repo still holds them
 * - The sets, engine routes and page scripts it serves are the settings' (`"componentSets"` ...), not this module's.
 */
const pageServerRoutes: RouteModule = {
  name: "page-server",
  setup({ root, router, web, onStop }) {
    const bundles = new BundleBuild({ root })
    router.use(bundles.wait)
    bundles.start()
    onStop(() => bundles.stop())

    web.files.html.push(localHighlight)
    web.files.overlays.push(movedFolderPath)
    const home = componentSets(pageServerSettings(root))[0]?.prefix ?? ""
    for (const path of MOVED_OUT) {
      router.use(path, (_request, reply) => reply.status(404).send(`${path}/ moved:  see ${home}/`))
    }
  }
}
export default pageServerRoutes

/** `html`, its cdnjs highlight.js tag (`HIGHLIGHT_JS.cdn`) pointing at the engine's copy:  pages load offline. */
export function localHighlight(html: string): string {
  return html.replaceAll(HIGHLIGHT_JS.cdn, HIGHLIGHT_JS.local)
}

/**
 * The URL path a folder that MOVED serves from its new place;  else `undefined`.
 * - the folders:  `MOVED_FOLDERS`, and the same under `/worktrees/<w>/`
 * - the engine's old checkout paths (epic `people-and-orgs` P16 J49, P18;  `epic-eject` I5):  a safety net for a page
 *   that still links them
 * - a `StaticHandler` overlay:  served only when the file is there
 */
export function movedFolderPath(path: string): string | undefined {
  const match = /^((?:\/worktrees\/[^/]+)?)(\/.*)$/.exec(path)
  if (!match) return undefined
  const [, base = "", rest = "/"] = match
  const moved = MOVED_FOLDERS.find(([from]) => rest.startsWith(`${from}/`))
  return moved && `${base}${moved[1]}${rest.slice(moved[0].length)}`
}
