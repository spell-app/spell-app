/**
 * Types of the page server:  route modules and what they get.
 * - MUST stay runtime-light:  `import type` only.
 */
import type { SRV, ServerInfo } from "$/server"

/**
 * A ROUTE MODULE:  a file that adds routes to the page server, e.g. goals' buttons, the app's `/api`.
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": ["goals/_tools/goalsRoutes.ts"] }`
 * - its DEFAULT export is this;  `setup()` runs once, before the server listens
 */
export type RouteModule = {
  /** for logs, e.g. `goals` */
  name: string
  setup: (context: RouteContext) => void | Promise<void>
}

/**
 * What a route module gets.
 * - `router`:  add routes here;  they run BEFORE static files
 * - `guard`:  `guard.writeCheck` on every route that changes something
 * - `live`:  `live.watch(dir)` to reload pages when files under `dir` change
 * - `web`:  the whole server, e.g. `web.files.html.push()` for an html hook
 * - `info`:  pid, port, root, branch ...
 * - `onListening`:  run `start` once the server listens -- `info.port` is set by then, e.g. to start a child process
 *   that needs the page server's port (`setup()` runs BEFORE it listens)
 * - `onStop`:  run `stop` when the server stops, e.g. to end a child process
 */
export type RouteContext = {
  root: string
  router: SRV.Router
  guard: SRV.Guard
  live: SRV.LiveReload
  web: SRV.WebServer
  info: ServerInfo
  onListening: (start: () => unknown) => void
  onStop: (stop: () => unknown) => void
}

/** The `"pageServer"` field of the repo root's `package.json`. */
export type PageServerSettings = {
  /** route modules, paths relative to the repo root */
  routes?: string[]
  /** folders to live-reload, relative to the root (default `["packages/docs"]`) */
  watch?: string[]
}
