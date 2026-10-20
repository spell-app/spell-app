/**
 * Types of the page server:  route modules and what they get.
 * - MUST stay runtime-light:  `import type` only.
 */
import type { SRV, ServedFile, ServerInfo } from "$/server"

/**
 * A ROUTE MODULE:  a file that adds routes to the page server, e.g. goals' buttons, the app's `/api`.
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": ["spell-epic/src/tools/detailsRoutes.ts"] }`
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
 * - `serveWorktrees`:  serve the worktrees in each of folders `dirs` at `/worktrees/<w>/`, the first that has `<w>`
 *   serving it (`PageServer.serveWorktrees()`)
 * - `serveContent`:  serve the shared content folder `dir` at `/`, after the checkout's own files,
 *   and under every worktree's address;  live-reload it;  write the `writable` folders in it
 *   (`PageServer.serveContent()`, epic `epic-eject` P12)
 *   - so `/epics/...`, `/guides/...` ... need no link at the checkout's root
 *   - epics' running-epics route module calls it, with the repo's `.epic/config.json5`'s `contentFolder`
 *   - optional:  a server serving the content folder by itself has none (spell-epic's `EpicServer`),
 *     so call it as `serveContent?.(dir)`
 * - `addPageConfig`:  more fields for every page's `window.SPELL_SERVER` (`PageServer.addPageConfig()`)
 * - `onListening`:  run `start` once the server listens -- `info.port` is set by then
 *   - e.g. to start a child process that needs the page server's port (`setup()` runs BEFORE it listens)
 * - `onStop`:  run `stop` when the server stops, e.g. to end a child process
 */
export type RouteContext = {
  root: string
  router: SRV.Router
  guard: SRV.Guard
  live: SRV.LiveReload
  web: SRV.WebServer
  info: ServerInfo
  serveWorktrees: (...dirs: string[]) => void
  serveContent?: (dir: string) => void
  addPageConfig: (add: PageConfig) => void
  onListening: (start: () => unknown) => void
  onStop: (stop: () => unknown) => void
}

/** More fields for a page's `window.SPELL_SERVER`, as it's served (`PageServer.addPageConfig()`). */
export type PageConfig = (served: ServedFile) => Record<string, unknown>

/** The `"pageServer"` field of the repo root's `package.json`. */
export type PageServerSettings = {
  /** route modules, paths relative to the repo root */
  routes?: string[]
  /**
   * folders to live-reload, relative to the root (default:  the docs pages and their bundle, `DEFAULT_WATCH`)
   * - one the checkout doesn't have is skipped
   * - the shared content folders (`epics`, `guides` ...):  the content folder's, which the server watches whole once
   *   a route module serves it (`PageServer.serveContent()`);  named for a checkout that still links them in
   */
  watch?: string[]
  /**
   * folders whose files and folders `/api/files` may change (`SRV.FileOperations`),
   * and `/api/pages` may write (`PageEditor`);  none by default
   * - the shared content folders:  each turn's commit of the shared repo makes a mistake undoable
   * - relative to the content folder once a route module serves one (`PageServer.serveContent()`), else to the root
   *   (a checkout that still links them in:  links into another repo, and still "inside":
   *   paths are resolved, never followed, `SRV.fileInside()`)
   */
  writable?: string[]
  /**
   * the bundles' folders, relative to the root:  built on demand, never committed (git-ignored);  none by default
   * - the page server builds the stale ones when it starts (`BundleBuild`),
   *   and a request for a file in one waits while that runs
   * - THE list:  `$/assembler`'s `Bundle.all()` builds the bundles whose output folders it names
   */
  bundles?: string[]
}

/**
 * Where the component sets are served:  `/components/<set>/` (epic `people-and-orgs` P18, Q25).
 * - One home for every set, so the top bar lists them all from one place.
 * - A repo set's name never has an `@`;  a space's always will, so they can't clash.
 */
export const COMPONENTS_PREFIX = "/components"

/**
 * Spell UI's site bundle, relative to the checkout:
 * `site.js` + `site.css` and their lazy chunks, which EVERY component set's pages load (`COMPONENT_SETS`).
 * - built by `yarn site:bundle`, in `packages/ui`
 * - NOT committed:  the page server builds it when it starts, if stale (`BundleBuild`, the settings' `bundles`)
 * - with `globalThis.SpellUI` for the component packs a set's pages load (`SitePacks`):  the epics pack, for the
 *   comments, on every set's;  the other sets' own packs for their examples
 * - the other sets had a build of their own, `SETS_BUNDLE` (its `sets/`), from epic `epic-workflow` P10 until epic
 *   `epic-engine` gave Spell UI's pages the packs too
 */
export const SITE_BUNDLE = "packages/ui/site/_assets"

/**
 * A COMPONENT SET:  one set of elements' docs pages, in Spell UI's page shape,
 * kept in its package's `docs/` folder beside the elements' code, versioned with its branch
 * (epic `people-and-orgs` P18;  before it, epic `epic-workflow` P10 / P11).
 * - `name`:  what prose calls it, e.g. `Epic UI`
 * - `prefix`:  the address it's served at, `/components/<set>`
 *   (and `/worktrees/<w>/components/<set>` for a worktree's)
 * - `dir`:  its pages' folder, relative to the checkout, e.g. `packages/ui/docs`
 *   - Epic UI's is spell-epic's, through the checkout's `spell-epic` link (epic `epic-eject` I5)
 * - `assets`:  the site bundle its pages load as `_assets/`, relative to the checkout:  `SITE_BUNDLE`, for every set
 */
export type ComponentSet = {
  readonly name: string
  readonly prefix: string
  readonly dir: string
  readonly assets: string
}

/**
 * Every component set, in the top bar's order;  Spell UI's first.
 * - Each the same layout:  its package's `docs/`, one flat folder of pages
 *   - an element's page is its tag, `ui-button.html`
 *   - `__parts/`:  the layout and footer every page shares
 *   - `__data/`:  its side column's, search's and API tables' data (`spell dev pack build` writes a pack's)
 * - Served by the page server through ONE overlay (`componentSetPath()`):
 *   - `<prefix>/_assets/...`:  the set's site bundle (`assets`), so its pages load `site.js` and `site.css`,
 *     and the site's shell (`SiteShell`, `SiteRouter`) takes `<prefix>/` as its root (the folder above its `_assets/`)
 *   - `<prefix>/...`:  the set's own folder
 * - Its pages' links are written as from their SERVED address (`/components/epics/epic-page.html`),
 *   so they hold at `/worktrees/<w>/components/epics/` too;  `doc-links.js` checks them that way (`Linker`'s `served`)
 * - Comments:  the comment route takes its pages, kept in `<page>.inbox.json5` beside each (git-ignored)
 * - The old addresses (`/ui/`, `/epic-ui/`, `/app-ui/`, `/brand/components/`) answer "not found":  no redirects (Q30)
 */
export const COMPONENT_SETS = [
  { name: "Spell UI", prefix: `${COMPONENTS_PREFIX}/ui`, dir: "packages/ui/docs", assets: SITE_BUNDLE },
  { name: "Epic UI", prefix: `${COMPONENTS_PREFIX}/epics`, dir: "spell-epic/src/docs", assets: SITE_BUNDLE },
  { name: "App UI", prefix: `${COMPONENTS_PREFIX}/app`, dir: "packages/app/docs", assets: SITE_BUNDLE },
  { name: "Brand", prefix: `${COMPONENTS_PREFIX}/brand`, dir: "packages/brand/docs", assets: SITE_BUNDLE }
] as const satisfies readonly ComponentSet[]

/**
 * How long a request for a bundle's file waits for the startup build, in ms,
 * before it's answered as it stands (a 404, while the file is still missing).
 * - each build takes a few seconds (2 s for both on an M-series Mac, 2026-10-07);  a cold `tsx` and vite add some
 */
export const BUNDLE_WAIT_MS = 120_000

/**
 * Code colours (highlight.js) for every docs page, from the repo instead of cdnjs (epic `airplane` P1).
 * - `cdn`:  the tag older pages still carry;  a plain, blocking `<script>`
 *   - so a hanging network (plane wifi asking to pay first) held up `spell-ui.js` behind it,
 *     and the page showed raw markup for tens of seconds
 * - `local`:  the same file (11.9.0), committed in spell-epic, at its engine route (`/_epic/assets/`)
 *   - the page server serves pages with `cdn` swapped for it (`localHighlight()`), so they load with no network at all
 */
export const HIGHLIGHT_JS = {
  cdn: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
  local: "/_epic/assets/highlight.min.js"
} as const
