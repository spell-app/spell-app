/**
 * Types of the page server:  route modules and what they get.
 * - MUST stay runtime-light:  `import type` only.
 */
import type { SRV, ServerInfo } from "$/server"

/**
 * A ROUTE MODULE:  a file that adds routes to the page server, e.g. goals' buttons, the app's `/api`.
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": ["packages/docs/tools/goals/goalsRoutes.ts"] }`
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
  /** folders to live-reload, relative to the root (default:  the docs pages and their bundle, `DEFAULT_WATCH`) */
  watch?: string[]
}

/**
 * Spell UI's docs site, served at `/ui/`:  plain `.html` pages loading the committed bundle `_assets/site.js`
 * (`yarn site:build` in `packages/ui`), in TWO halves (claude-design P6, 2026-10-05):
 * - `pages`:  the hand-written half, the checkout's `ui/`, a link into the shared content repo:  pages, `_parts/`,
 *   `examples/`, `images/`.  The `/` mount serves it at `/ui/` (`/worktrees/<w>/ui/` for a worktree's)
 * - `build`:  the built half each branch commits, `packages/ui/site/`:  `_src/`, `_assets/`, `_data/`
 * - `overlays`:  the build's folders laid over the pages (`StaticHandler.overlays`, `uiBuildPath()`):
 *   `/ui/_assets/site.js` is `packages/ui/site/_assets/site.js`, so every page's relative `_assets/...` and
 *   `_data/...` links resolve unchanged;  a file the build lacks falls through to the pages
 *   (`ui/_data/search.json`, built from the shared pages, is shared too)
 * - Static and live-reloading, like the docs:  no dev server behind it (was `astro dev`, proxied, until 2026-10-02)
 * - `ignore`:  the bundle's entry (`_src/`), which nothing serves, doesn't reload pages;  a rebuilt `_assets/` does
 *   (`yarn site:dev` rebuilds it on every source edit)
 */
export const UI_SITE = {
  prefix: "/ui",
  pages: "ui",
  build: "packages/ui/site",
  overlays: ["_assets", "_data"],
  ignore: /(^|\/)_src\//
} as const
