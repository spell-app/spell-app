/**
 * Types of the page server:  route modules and what they get, its settings, component sets and engine routes.
 * - MUST stay runtime-light:  `import type` only, and re-exports of `settings.ts` (node built-ins).
 * - Plain `node` loads this file by path (spell-epic's tools):  so its re-exports name `./settings.ts` in full.
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
  /**
   * module scripts added to every HTML page it serves, before `</body>` (`PageServer.withPageScripts()`);
   * none by default
   * - e.g. the app's `spell-language.js`, which colours spell on the docs pages (epic `repo-split` Q23):
   *   the pages' own tooling (spell-epic) imports nothing of the app, the server's settings add it
   * - the server knows nothing of what they are:  the paths come from here
   */
  pageScripts?: PageScript[]
  /**
   * the COMPONENT SETS it serves, by id, in the top bar's order (`ComponentSet`, `componentSets()`):
   * each at `/components/<id>/`, its pages' folder with its site bundle laid over it at `_assets/`;  none by default
   * - e.g. `"ui": { "name": "Spell UI", "dir": "packages/ui/docs", "assets": "packages/ui/site/_assets" }`
   * - the server knows nothing of what they are:  the folders come from here (epic `repo-split` P4, Q3)
   */
  componentSets?: Record<string, ComponentSetSetting>
  /**
   * ENGINE ROUTES:  URL prefixes served from a folder of the checkout, under every worktree's address too
   * (`EngineRoute`, `engineRoutes()`);  none by default
   * - e.g. `"/_epic/assets/": "spell-epic/src/tools/_assets"`:  the epic engine, through the checkout's link
   * - live reload reports a change in one at its route
   */
  engineRoutes?: Record<string, string>
}

/** One of the page server's `pageScripts`:  a module script added to the pages it serves. */
export type PageScript = {
  /** the script's URL, as a page loads it, e.g. `/element/spell-language.js` */
  src: string
  /**
   * the file it is, relative to the root, e.g. `packages/app/dist-element/spell-language.js`:
   * added only while it exists, so a checkout that hasn't built it serves its pages without it (no 404)
   * - none:  always added
   */
  file?: string
  /**
   * URL paths of pages that DON'T get it, by prefix, e.g. `/components/` (the component sets' pages);
   * matched against a worktree's page without its `/worktrees/<w>` (`/worktrees/w/guides/x.html` => `/guides/x.html`)
   */
  skip?: string[]
}

/**
 * One component set, as the settings name it (`"componentSets"`, under its id).
 * - `name`:  what prose calls it, e.g. `Epic UI`
 * - `dir`:  its pages' folder, relative to the checkout, e.g. `packages/ui/docs`
 *   - Epic UI's is spell-epic's, through the checkout's `spell-epic` link (epic `epic-eject` I5)
 * - `assets`:  the site bundle its pages load as `_assets/`, relative to the checkout
 *   - today Spell UI's site bundle (`packages/ui/site/_assets`), for every set:  it holds `globalThis.SpellUI`
 *     (`SitePacks`) for the component packs a set's pages load, the epics pack, for the comments, on all of them
 *   - the other sets had a build of their own (its `sets/`), from epic `epic-workflow` P10 until epic
 *     `epic-engine` gave Spell UI's pages the packs too
 */
export type ComponentSetSetting = {
  readonly name: string
  readonly dir: string
  readonly assets: string
}

/**
 * A COMPONENT SET:  one set of elements' docs pages, in Spell UI's page shape,
 * kept in its package's `docs/` folder beside the elements' code, versioned with its branch
 * (epic `people-and-orgs` P18;  before it, epic `epic-workflow` P10 / P11).
 * - what the settings say of it (`ComponentSetSetting`), and `prefix`:  the address it's served at,
 *   `/components/<id>` (and `/worktrees/<w>/components/<id>` for a worktree's)
 * - every set the same layout:  one flat folder of pages
 *   - an element's page is its tag, `ui-button.html`
 *   - `__parts/`:  the layout and footer every page shares
 *   - `__data/`:  its side column's, search's and API tables' data
 * - served through ONE overlay (`componentSetPath()`):
 *   - `<prefix>/_assets/...`:  the set's site bundle (`assets`), so its pages load `site.js` and `site.css`,
 *     and the site's shell takes `<prefix>/` as its root (the folder above its `_assets/`)
 *   - `<prefix>/...`:  the set's own folder
 * - Its pages' links are written as from their SERVED address (`/components/<id>/<page>.html`),
 *   so they hold at `/worktrees/<w>/components/<id>/` too
 * - The list:  the settings' `"componentSets"`, in the top bar's order (`componentSets()`).
 */
export type ComponentSet = ComponentSetSetting & {
  readonly prefix: string
}

/**
 * An ENGINE ROUTE:  a URL prefix served from a folder of the checkout, the same under every worktree's address
 * (`engineRoutePath()`).
 * - `route`:  the URL prefix, ending `/`, e.g. `/templates/`
 * - `folder`:  the folder it serves, as a URL path from the checkout, ending `/`
 * - The list:  the settings' `"engineRoutes"` (`engineRoutes()`).
 */
export type EngineRoute = readonly [route: string, folder: string]

/**
 * Where the component sets are served (`COMPONENTS_PREFIX`), from `settings.ts`, which plain `node` loads.
 * - `./settings.ts` with its extension:  plain `node` loads this file by path (spell-epic's tools)
 */
export { COMPONENTS_PREFIX } from "./settings.ts"
