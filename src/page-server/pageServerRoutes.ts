import { componentSets, pageServerSettings, type RouteModule } from "spell-kit/server/page"
import { BundleBuild, HIGHLIGHT_JS, MOVED_OUT } from "spell-app/page-server"

/**
 * What only spell-app's page server does, on the generic one (`spell-kit/server/page`'s `PageServer`):  a ROUTE MODULE,
 * listed FIRST in the repo root's `package.json` `"pageServer": { "routes": [...] }` (epic `repo-split` P4).
 * - builds the bundles it serves, which aren't committed (`BundleBuild`):  `spell bundle --stale`,
 *   as it starts;  a request for a missing file of one waits while that runs
 * - swaps the cdnjs highlight.js tag on every page for the engine's copy (`localHighlight()`):  pages load offline
 * - the bridge for the SHARED pages, which every checkout shows:  folders moved out of the shared content answer
 *   "not found" (`MOVED_OUT`), though the shared repo still holds them
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
