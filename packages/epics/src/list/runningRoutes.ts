/**
 * The RUNNING epics on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`).
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": [...] }`
 * - the logic:  `RunningEpics`
 * - `GET /api/epics/running` -- every running epic, as JSON (`RunningEpic[]`), never cached
 * - the Epics list page (`epics/index.html`), as it's served (`RunningEpics.render()`):
 *   the running epics' cards added, every card marked again and regrouped
 * - live reload:  a worktree's epic page changing reloads its page and the Epics list (`RunningEpics.watch()`);
 *   the watcher closes when the server stops
 * - worktree `<w>`'s files, at `/worktrees/<w>/...`, are the page server's own mount, not this module's
 * - reads only:  nothing here needs the page server's token
 */
import type { RouteModule } from "$/server/page"

import { RunningEpics } from "./RunningEpics"

/** Where the list is answered. */
export const RUNNING_API = "/api/epics/running"

const runningRoutes: RouteModule = {
  name: "running epics",
  setup({ root, router, web, live, onStop }) {
    const epics = new RunningEpics(root)
    router.get(RUNNING_API, (_request, reply) => reply.set("Cache-Control", "no-store").json(epics.list()))
    web.files.html.push((page, served) => (served.file === epics.index ? epics.render(page) : page))
    epics.watch(live)
    onStop(() => epics.close())
  }
}

export default runningRoutes
