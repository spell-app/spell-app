/**
 * The RUNNING epics on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`).
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": [...] }`
 * - the logic:  `RunningEpics`
 * - `GET /api/epics/running` -- every running epic, as JSON (`RunningEpic[]`), never cached
 * - the Epics list page (`epics/index.html`), as it's served (`RunningEpics.render()`):
 *   the running epics' cards added, every card marked again and regrouped
 * - live reload:  a worktree's epic page changing reloads its page and the Epics list (`RunningEpics.watch()`);
 *   its rebuilt page assets (docs bundle, packs) hot-reload its pages served here;
 *   the watcher closes when the server stops
 * - worktree `<w>`'s files, at `/worktrees/<w>/...`:  the page server's mount, which this module tells it to make
 *   (`serveWorktrees()`), in the MAIN checkout only:  the worktrees' folder is the repo's `.epic/config.json5`'s
 *   (`EpicConfig`), which the server can't read
 * - reads only:  nothing here needs the page server's token
 */
import { resolve } from "node:path"

import type { RouteModule } from "$/server/page"

import { EpicConfig } from "$/epics/config/EpicConfig"

import { RunningEpics } from "./RunningEpics"

/** Where the list is answered. */
export const RUNNING_API = "/api/epics/running"

const runningRoutes: RouteModule = {
  name: "running epics",
  setup({ root, router, web, live, onStop, serveWorktrees }) {
    const config = EpicConfig.of(root)
    // the main checkout's server shows every worktree;  a worktree's own server shows none
    if (config.main === resolve(root)) serveWorktrees(config.worktreesFolder)
    const epics = new RunningEpics(root)
    router.get(RUNNING_API, (_request, reply) => reply.set("Cache-Control", "no-store").json(epics.list()))
    web.files.html.push((page, served) => (served.file === epics.index ? epics.render(page) : page))
    epics.watch(live)
    onStop(() => epics.close())
  }
}

export default runningRoutes
