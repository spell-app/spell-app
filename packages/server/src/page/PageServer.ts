import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { SRV, type ServedFile, type ServerInfo } from "$/server"
import {
  COMPONENT_SETS,
  PageEditor,
  componentSets,
  engineRoutes,
  pageServerSettings,
  type ComponentSet,
  type EngineRoute,
  type PageConfig,
  type PageScript,
  type PageServerSettings,
  type RouteContext,
  type RouteModule
} from "$/server/page"

/**
 * THE page server:  one per checkout (the main one, and each worktree), serving the whole repo on one port.
 * - docs, epic pages, saga pages, Spell UI's docs site and (once `app` is in) the editor, all live-reloading
 * - pages and files are plain URLs;  every CALL is under `/api/`, one prefix per package that answers it:
 *   - `/api/server` -> `ServerInfo` (which checkout, branch and port:  what the openers ask);
 *     `/api/server/live` and `/api/server/live.js`, live reload (`SRV.WebServer`)
 *   - `/api/files` -> `SRV.FileOperations`:  files and folders saved, made, moved, copied and deleted
 *   - `/api/pages` -> `PageEditor`:  a page's source, saving it, saving one section
 *   - both write only inside the root `package.json`'s `"pageServer"` `"writable"` folders (the shared content ones):
 *     the content folder's, once it's served (`serveContent()`)
 *   - the rest come from route modules:
 *     - epics':  `/api/epics/...` and `/api/docs/...`
 *     - spaces':  `/api/projects/...` and `/api/spaces/...`
 * - `/` -> the home page (`pages/index.html`)
 * - `/<x>` -> the checkout's file `<x>`, else the shared content folder's (epic `epic-eject` P12)
 *   - once a route module says where that folder is (`serveContent()`):  epics', from the repo's `.epic/config.json5`
 *   - so `/epics/...`, `/guides/...`, `/pages/...`, `/sagas/...`, `/brand/...` need no link at the checkout's root
 *   - the checkout first:  a page of the content folder may load the checkout's files (`../packages/<x>/...`)
 *   - the same under `/worktrees/<w>/`, after the worktree's own files
 * - `/components/<set>/` -> the component sets' docs:  the settings' `"componentSets"` (`componentSets`)
 *   - each its pages' folder, with its site bundle laid over it at `_assets/` (`componentSetPath()`)
 *   - live-reloading like every page;  the same at `/worktrees/<w>/components/<set>/`
 * - `/worktrees/<w>/...` -> worktree `<w>`'s checkout, with the same URLs inside (dot files still refused)
 *   - once a route module says where the worktrees are (`serveWorktrees()`):
 *     epics' running epics, in the main checkout;  the server itself knows no worktree folder
 *   - from several folders at once, the first that has `<w>` serving it:
 *     the worktrees beside the repo, and those left in the old `.claude/worktrees` (epic `epic-eject` J28)
 * - what pages are told (`window.SPELL_SERVER`):  the checkout, its branch, the edit API ... and what route modules
 *   add (`addPageConfig()`), e.g. epics' airplane mode
 * - route modules (`RouteModule`) from the root `package.json`'s `"pageServer"` add the rest, e.g. the running epics,
 *   and what only one repo's page server does (spell-app's `$/page-server`:  building its bundles ...)
 * - the page scripts there (`"pageScripts"`) go on every page, before `</body>` (`withPageScripts()`)
 * - the ENGINE ROUTES there (`"engineRoutes"`):  URL prefixes served from a folder of the checkout
 *   (`engineRoutePath()`, epic `epic-eject` P7), e.g. `/_epic/assets/...`, from the epic engine through a link
 *   - under every worktree's address too (`/worktrees/<w>/templates/...`):  ONE copy, this checkout's
 * - NO redirects for old URLs (epic `people-and-orgs`, Q30):  an old address answers "not found"
 * - The server knows nothing of what the sets, routes and scripts are:  the folders come from the settings
 *   (epic `repo-split` P4).
 * - port:  `DEFAULT_PORT` (4747) if free, else any
 *   - the real one goes in `<root>/.spell-server.json`, where `spell dev server ensure` and the openers find it
 * - Run it with `spell dev server` (`page/cli.ts`), never by hand.
 */
export class PageServer {
  /** the checkout served */
  readonly root: string

  /** the web server underneath */
  readonly web: SRV.WebServer

  /** `<root>/.spell-server.json` */
  readonly pidFile: SRV.PidFile

  /** what `/api/server` answers;  `port` is set by `start()` */
  readonly info: ServerInfo

  /** the component sets it serves, from the settings as it starts (`componentSets()`) */
  readonly componentSets: readonly ComponentSet[]

  /** the engine routes it serves, from the settings as it starts (`engineRoutes()`) */
  readonly engineRoutes: readonly EngineRoute[]

  /** run once listening, from route modules */
  private listenings: (() => unknown)[] = []

  /** run on `stop()`, from route modules */
  private stops: (() => unknown)[] = []

  /** more fields for every page's `window.SPELL_SERVER`, from route modules (`addPageConfig()`) */
  private pageConfigs: PageConfig[] = []

  /** the folders `/worktrees/<w>/` serves, in order, once `serveWorktrees()` has said;  none before */
  private worktrees: string[] = []

  /** the shared content folder served after the checkout, once `serveContent()` has said;  none before */
  private content?: string

  /** whether the content folder is mounted under every worktree's address yet (`mountContentInWorktrees()`) */
  private contentInWorktrees = false

  /** what `/api/files` and `/api/pages` write through:  told the content folder by `serveContent()` */
  private writes: SRV.FileOperations

  /** the module scripts every page gets (`"pageScripts"`, `withPageScripts()`), from the settings as it starts */
  private readonly pageScripts: PageScript[]

  constructor({ root, token }: { root: string; token?: string }) {
    this.root = resolve(root)
    this.pidFile = new SRV.PidFile(this.root)
    this.info = {
      pid: process.pid,
      port: 0,
      root: this.root,
      started: new Date().toISOString(),
      ...checkoutInfo(this.root)
    }
    const settings = this.settings()
    const { writable, pageScripts = [] } = settings
    this.pageScripts = pageScripts
    // REFACTOR (epic `repo-split` P4):  settings naming no sets serve this checkout's (`COMPONENT_SETS`), as before;
    // only for spell-epic's route-module tests, whose scratch checkouts have none.  `[]` once spell-epic writes them.
    this.componentSets = settings.componentSets ? componentSets(settings) : COMPONENT_SETS
    this.engineRoutes = engineRoutes(settings)
    this.web = new SRV.WebServer({
      root: this.root,
      token,
      live: true,
      mounts: [{ prefix: "/", dir: this.root }],
      html: [(page, served) => this.withPageScripts(page, served)],
      configure: (served) => ({
        root: this.root,
        branch: this.info.branch,
        worktree: this.info.worktree,
        // a worktree's page served from here (`/worktrees/<w>/`):  ITS branch and name, for the header's badge;
        // and its worktrees' folder, with its URL path:  live reload reports its changes under it (`SRV.servedPath()`)
        ...this.worktreesConfig(served),
        // a content folder's page:  its path there, what the page editor saves and live reload reports
        ...this.contentFileConfig(served.file),
        edit: PageEditor.PREFIX,
        etag: SRV.StaticHandler.etagOf(statSync(served.file)),
        // e.g. Owen is offline, no Claude:  pages say "queued for when you land" (epics' airplane mode)
        ...Object.assign({}, ...this.pageConfigs.map((add) => add(served)))
      })
    })
    this.web.files.overlays.push(
      (path) => componentSetPath(path, this.componentSets),
      (path) => engineRoutePath(path, this.engineRoutes)
    )
    const router = this.web.router
    router.get("/", (_request, reply) => reply.redirect(DOCS_HOME))
    // a component set's address without its slash:  with it, so its pages' relative links resolve
    // - the router takes a trailing `/` as optional, so the address WITH it passes on
    for (const set of this.componentSets)
      router.get(set.prefix, (request, reply, next) =>
        request.path.endsWith("/") ? next() : reply.redirect(`${set.prefix}/`)
      )
    router.get(SERVER_API, (_request, reply) => reply.set("Cache-Control", "no-store").json(this.info))
    // NOTE: no body parsing here:  each route parses its own (the app's `/api` is JSON5), and the proxy streams.

    // `/api/pages` and `/api/files`:  saving, making, moving and deleting files, only inside the `"writable"` folders
    this.writes = new SRV.FileOperations({ root: this.root, writable })
    new PageEditor({ root: this.root, files: this.writes }).route(router, this.web.guard)
    this.writes.route(router, this.web.guard)
  }

  /**
   * Start watching, load the route modules, listen, write the pid file, then run route modules' `onListening`s.
   * - `port`:  wanted port (default `DEFAULT_PORT`);  taken:  any free one
   * - `routes`:  load route modules (default `true`;  tests turn it off)
   * - `pidFile`:  write `.spell-server.json` (default `true`)
   */
  async start({ port = DEFAULT_PORT, routes = true, pidFile = true }: StartOptions = {}): Promise<this> {
    const settings = this.settings()
    for (const dir of settings.watch ?? DEFAULT_WATCH) this.web.live!.watch(join(this.root, dir), { ignore: UNWATCHED })
    // the component sets' pages, parts and data, and their site bundle (rebuilt by `yarn site:dev`),
    // as their pages load them:  `/components/ui/_assets/site.js`, so a rebuilt bundle reloads them
    for (const set of this.componentSets) {
      this.web.live!.watch(join(this.root, set.dir), { servedAt: set.prefix })
      this.web.live!.watch(join(this.root, set.assets), { servedAt: `${set.prefix}/${SET_ASSETS}` })
    }
    // the engine routes' files at their routes too, so a page loading `/_epic/...` hot-reloads them
    for (const [route, folder] of this.engineRoutes)
      this.web.live!.watch(join(this.root, folder.slice(1)), { servedAt: route })
    if (routes) for (const path of settings.routes ?? []) await this.loadRoutes(path)
    const { port: actual } = await this.web.listen({ port })
    this.info.port = actual
    if (pidFile) this.pidFile.write(this.info)
    for (const start of this.listenings)
      await Promise.resolve(start()).catch((error: unknown) => {
        console.error("page server:  a route module's onListening failed:", error)
      })
    return this
  }

  /** stop:  route modules' stops, the pid file (if ours), the server */
  async stop(): Promise<void> {
    for (const stop of this.stops) await Promise.resolve(stop()).catch(() => {})
    this.pidFile.removeIfOurs()
    await this.web.close()
  }

  /**
   * The page server of the checkout at `root`, started in the background if it isn't running.
   * - returns its info, `base` URL, and whether it was `launched` just now
   * - runs `page/cli.ts serve` under `tsx`, whatever the caller's folder,
   *   with this package's `tsconfig.json` for the aliases (`TSX_TSCONFIG_PATH`)
   * - its output goes to `<root>/.spell-server.log`
   * - what `spell dev server ensure`, the goals tools and the openers call
   */
  static ensure(root: string, port = DEFAULT_PORT) {
    // its code:  this package's, and its route modules' folders;  a server older than them restarts (I5 of `skillz`)
    const routes = (pageServerSettings(root).routes ?? []).map((path) => dirname(join(root, path)))
    return new SRV.PidFile(root).ensure({
      command: [process.execPath, "--import", "tsx", CLI, "serve", "--root", resolve(root), "--port", String(port)],
      env: { TSX_TSCONFIG_PATH: TSCONFIG },
      sources: [SOURCE, ...new Set(routes)]
    })
  }

  /**
   * Serve every worktree in each of folders `dirs` at `/worktrees/<w>/`, with the same URLs inside (dot files
   * refused);  returns `this`.
   * - so the main checkout's server shows a running epic's pages
   * - called by epics' running-epics route module, in the main checkout:
   *   the worktrees' folders are set in the repo's `.epic/config.json5`,
   *   which this package can't read (it imports no other package)
   * - several folders (epic `epic-eject` J28):  the place new worktrees go first, then the old places still holding
   *   some;  a `<w>` in two is served from the first
   *   - one mount per folder at the same prefix, laid over each other (`SRV.StaticHandler`)
   *   - called again:  the new folders join the end;  a folder already served is skipped
   * - a page served from one gets ITS branch and worktree name (the header's badge)
   * - every page gets a folder (`SPELL_SERVER.worktrees`):  its own worktree's, else the first
   * - `/api/server` gets the first (`ServerInfo.worktrees`) and all of them (`ServerInfo.worktreesFolders`)
   */
  serveWorktrees(...dirs: string[]): this {
    for (const dir of dirs.map((each) => resolve(each))) {
      if (this.worktrees.includes(dir)) continue
      this.worktrees.push(dir)
      this.web.files.mount({ prefix: WORKTREES_PREFIX, dir })
    }
    this.info.worktrees = this.worktrees[0]
    this.info.worktreesFolders = [...this.worktrees]
    this.mountContentInWorktrees()
    return this
  }

  /**
   * Serve the shared content folder `dir` at `/`, after the checkout's own files;  returns `this`
   * (epic `epic-eject` P12).
   * - so `/epics/x/x.plan.html` is `<dir>/epics/x/x.plan.html`, with no `epics` link at the checkout's root
   *   - the checkout FIRST:  a path it has is its own (a content page may load `../packages/<x>/...`)
   * - called by epics' running-epics route module, in every checkout:
   *   the folder is the repo's `.epic/config.json5`'s `contentFolder`, which this package can't read
   * - under every worktree's address too, `/worktrees/<w>/...`, after that worktree's own files
   *   (`Mount.skip`), once the worktrees are served (`serveWorktrees()`), in either order
   * - live reload watches it whole (but `UNWATCHED`), reporting each change at `/<path>`,
   *   and at `/worktrees/<w>/<path>`'s served path for every worktree (`contentAddresses()`)
   * - a page from it is told its path there (`SPELL_SERVER.file`, `/epics/x/x.plan.html`):
   *   what the page editor saves and live reload reports
   * - `/api/files` and `/api/pages` write in it:  the `"writable"` folders are its folders (`SRV.FileOperations.content`)
   * - `/api/server` reports it (`ServerInfo.contentFolder`)
   * - called again with the same folder:  nothing;  with another:  throws a `TypeError` (one content folder a server)
   * - works with old links at the checkout's root, or none:  a linked folder is the checkout's, the same files
   */
  serveContent(dir: string): this {
    const content = resolve(dir)
    if (this.content === content) return this
    if (this.content)
      throw new TypeError(`PageServer.serveContent():  already serving ${this.content};  one content folder a server`)
    this.content = content
    this.web.files.mount({ prefix: "/", dir: content })
    this.mountContentInWorktrees()
    this.writes.content = content
    this.info.contentFolder = content
    this.web.live!.watch(content, { ignore: UNWATCHED, servedAt: () => this.contentAddresses() })
    return this
  }

  /** the content folder under every worktree's address, once both are known:  after the worktrees' own files */
  private mountContentInWorktrees(): void {
    if (!this.content || !this.worktrees.length || this.contentInWorktrees) return
    this.web.files.mount({ prefix: WORKTREES_PREFIX, dir: this.content, skip: 1 })
    this.contentInWorktrees = true
  }

  /**
   * The URL folders a content folder's change is reported at, as the live client reads them (`SRV.servedPath()`):
   * `/`, and each worktree's, `<worktreesPath><w>/`, once worktrees are served
   * - read at each change:  a worktree made since is reported too
   */
  private contentAddresses(): string[] {
    const worktrees = this.worktrees.flatMap((folder) =>
      subfolders(folder).map((name) => `${urlPathOf(this.root, folder)}${encodeURIComponent(name)}/`)
    )
    return ["/", ...worktrees]
  }

  /** A content folder's page's `SPELL_SERVER.file`:  its path from the content folder;  `{}` for any other file. */
  private contentFileConfig(file: string): { file?: string } {
    if (!this.content || !isInside(file, this.content)) return {}
    return { file: `/${relative(this.content, file).split(sep).map(encodeURIComponent).join("/")}` }
  }

  /**
   * What `served`'s page's `window.SPELL_SERVER` says of the worktrees;  `{}` before `serveWorktrees()`.
   * - `worktrees`:  the folder holding the page's worktree, else the first served;  `worktreesPath`:  its URL path
   * - in a worktree:  its `branch` and `worktree` name too (`worktreeOf()`)
   *   - a content folder's page at `/worktrees/<w>/...`:  worktree `<w>`'s, as its address says
   */
  private worktreesConfig({
    file,
    path
  }: ServedFile): Partial<Record<"branch" | "worktree" | "worktrees" | "worktreesPath", string>> {
    if (!this.worktrees.length) return {}
    const name = this.content && isInside(file, this.content) ? WORKTREE_ADDRESS.exec(path)?.[1] : undefined
    const at = name ? this.worktrees.map((each) => join(each, name)).find((each) => existsSync(each)) : file
    const folder = (at && this.worktrees.find((each) => isInside(at, each))) ?? this.worktrees[0]!
    return { ...(at && worktreeOf(at, folder)), worktrees: folder, worktreesPath: urlPathOf(this.root, folder) }
  }

  /**
   * `page` with the settings' page scripts (`"pageScripts"`) before its `</body>` (at its end without one):
   * each one whose file exists, unless `served`'s path is under one of its `skip` prefixes.
   * - The settings are read as the server starts;  the files at each page, so a build that lands meanwhile counts.
   * - The server knows nothing of what they are (the app's `spell-language.js`):  the paths come from the settings.
   */
  withPageScripts(page: string, served: ServedFile): string {
    const path = served.path.replace(WORKTREE_ADDRESS, "/")
    const tags = this.pageScripts
      .filter(
        ({ file, skip }) =>
          !skip?.some((prefix) => path.startsWith(prefix)) && (!file || existsSync(join(this.root, file)))
      )
      .map(({ src }) => `<script type="module" src="${src}"></script>\n`)
      .join("")
    if (!tags) return page
    const end = page.search(/<\/body>/i)
    return end < 0 ? page + tags : page.slice(0, end) + tags + page.slice(end)
  }

  /** Add `add`'s fields to every page's `window.SPELL_SERVER`, from a route module;  returns `this`. */
  addPageConfig(add: PageConfig): this {
    this.pageConfigs.push(add)
    return this
  }

  /** the root `package.json`'s `"pageServer"` field */
  settings(): PageServerSettings {
    return pageServerSettings(this.root)
  }

  /** import route module `path` (relative to the root) and run its `setup()`;  a failure is logged, not fatal */
  private async loadRoutes(path: string): Promise<void> {
    try {
      const module = (await import(pathToFileURL(join(this.root, path)).href)) as { default: RouteModule }
      await module.default.setup(this.routeContext())
    } catch (error) {
      console.error(`page server:  route module ${path} failed to load:`, error)
    }
  }

  /**
   * What a route module's `setup()` gets:  this server's router, guard, live reload ..., and its hooks.
   * - tests set a route module up by hand with it, on a server started with `routes: false`
   */
  routeContext(): RouteContext {
    return {
      root: this.root,
      router: this.web.router,
      guard: this.web.guard,
      live: this.web.live!,
      web: this.web,
      info: this.info,
      serveWorktrees: (...dirs) => void this.serveWorktrees(...dirs),
      serveContent: (dir) => void this.serveContent(dir),
      addPageConfig: (add) => void this.addPageConfig(add),
      onListening: (start) => this.listenings.push(start),
      onStop: (stop) => this.stops.push(stop)
    }
  }
}

/**
 * Folder `dir` as a URL path from `root`, ending `/`:  `/.claude/worktrees/` for `<root>/.claude/worktrees`.
 * - outside `root` (worktrees beside the repo):  its `../` path, as `LiveReload` reports a file there
 */
export function urlPathOf(root: string, dir: string): string {
  const inside = relative(root, dir).split(sep).map(encodeURIComponent).join("/")
  return `/${inside}${inside ? "/" : ""}`
}

/** `page/cli.ts`:  `spell dev server`. */
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url))

/** This package's `src/`:  the code a page server runs. */
const SOURCE = fileURLToPath(new URL("..", import.meta.url))

/** This package's `tsconfig.json`:  the alias table a background server needs. */
const TSCONFIG = fileURLToPath(new URL("../../tsconfig.json", import.meta.url))

/** Where worktrees are served, once a route module says where they are (`serveWorktrees()`). */
const WORKTREES_PREFIX = "/worktrees/"

/** A worktree's address, `/worktrees/<w>/...`:  `[1]` is `<w>`. */
const WORKTREE_ADDRESS = /^\/worktrees\/([^/]+)\//

/** Port the page server asks for first:  `SPELL_SERVER_PORT`, else 4747 (the goals server's old port). */
export const DEFAULT_PORT = Number(process.env.SPELL_SERVER_PORT) || 4747

/** The page server's own call:  its `ServerInfo` (`SRV.SERVER_API`). */
const SERVER_API = SRV.SERVER_API

/**
 * `PageServer.start()` options.
 * - `port`:  wanted
 * - `routes`:  load route modules
 * - `pidFile`:  write the pid file
 * - `bundles`:  REFACTOR (epic `repo-split` P4):  read by nothing since the bundles' build moved into
 *   `$/page-server`'s route module (which `routes: false` leaves out);  kept so spell-epic's tests, which pass it,
 *   still compile.  Delete it once spell-epic stops passing it.
 */
export type StartOptions = { port?: number; routes?: boolean; pidFile?: boolean; bundles?: boolean }

/**
 * The checkout at `root`:  the folder holding `.git` at or above `start`.
 * - a worktree's `.git` is a FILE:  still its root
 */
export function findRoot(start: string): string | undefined {
  for (let dir = resolve(start); ; dir = dirname(dir)) {
    if (existsSync(join(dir, ".git"))) return dir
    if (dirname(dir) === dir) return undefined
  }
}

/**
 * Branch and worktree name of the worktree `file` is in, when it's in worktrees' folder `worktrees`;  else `{}`.
 * - cached per worktree:  every page served asks
 */
function worktreeOf(file: string, worktrees: string): { branch?: string; worktree?: string } {
  if (!isInside(file, worktrees)) return {}
  const name = relative(worktrees, file).split(sep)[0]!
  const folder = join(worktrees, name)
  let found = WORKTREES.get(folder)
  // its name is its folder's, in the worktrees' folder
  if (!found) WORKTREES.set(folder, (found = { ...checkoutInfo(folder), worktree: name }))
  return found
}

/** The folders right inside `dir`, by name, but dot folders;  none when it can't be read. */
function subfolders(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
  } catch {
    return []
  }
}

/** Whether `file` is inside folder `dir`, below it (never `dir` itself). */
function isInside(file: string, dir: string): boolean {
  const inside = relative(dir, file)
  return Boolean(inside) && !inside.startsWith("..") && !isAbsolute(inside)
}

/** `worktreeOf()`'s cache, by worktree folder:  two worktrees folders may each hold a `<w>`. */
const WORKTREES = new Map<string, { branch?: string; worktree?: string }>()

/** Folder of a component set's address served from its site bundle (`ComponentSet.assets`, `componentSetPath()`). */
const SET_ASSETS = "_assets"

/** The home page's URL. */
export const DOCS_HOME = "/pages/index.html"

/**
 * Paths in the watched folders that live reload never reports:
 * a guide's `scripts/` and `experiments/` (their sources, their own tools' output).
 * - except an experiment's built bundle, `*.bundle.js`, which its guide loads:
 *   a rebuild hot-reloads the guide (the live client's `liveAction()`, epic `epic-workflow` P24)
 */
const UNWATCHED = /(^|\/)scripts\/|(^|\/)experiments\/(?!(.*\/)?[^/]+\.bundle\.js$)/

/**
 * Folders the page server live-reloads when the root `package.json` names none:  the docs areas and their bundle.
 * - each relative to the checkout;  one it doesn't have is skipped
 * - the content folder's (`epics` ...) are the content folder's once it's served, which is watched whole
 *   (`serveContent()`):  named here for a checkout that still links them in
 */
const DEFAULT_WATCH = ["epics", "guides", "pages", "brand"]

/**
 * The URL path a component set's address serves, of the component sets `sets` (epic `people-and-orgs` P18);
 * else `undefined`.
 * - `/components/<set>/_assets/<x>` -> the set's site bundle (`assets`)
 *   - the bundle then takes `/components/<set>/` as its site's root (the folder above its `_assets/`)
 * - `/components/<set>/<x>` -> its pages' folder (`dir`):  the set's pages, `__parts/` and `__data/`
 * - the same under `/worktrees/<w>/` (that worktree's set and bundle)
 * - a `StaticHandler` overlay:  served only when the file is there, else the path as asked (a 404)
 */
export function componentSetPath(path: string, sets: readonly ComponentSet[]): string | undefined {
  const match = /^((?:\/worktrees\/[^/]+)?)(\/[^/]+\/[^/]+)(\/.*)$/.exec(path)
  const set = match && sets.find((each) => each.prefix === match[2])
  if (!match || !set) return undefined
  const [, base = "", , rest = "/"] = match
  return rest.startsWith(`/${SET_ASSETS}/`)
    ? `${base}/${set.assets}${rest.slice(SET_ASSETS.length + 1)}`
    : `${base}/${set.dir}${rest}`
}

/**
 * The URL path an ENGINE ROUTE of `routes` serves from in this checkout;  else `undefined`.
 * - e.g. `/_epic/assets/<x>` => `/engine/assets/<x>`, for the route `["/_epic/assets/", "/engine/assets/"]`
 * - from a worktree's address too (`/worktrees/<w>/templates/<x>`):  ONE copy, this checkout's
 *   - a worktree's pages' `../templates/` leads there
 * - the routes:  the settings' `"engineRoutes"` (`engineRoutes()`);  e.g. the epic engine's, at the routes its own
 *   server serves it at too (epic `epic-eject` P7)
 * - a `StaticHandler` overlay:  served only when the file is there
 */
export function engineRoutePath(path: string, routes: readonly EngineRoute[]): string | undefined {
  const route = routes.find(([prefix]) => path.startsWith(prefix))
  if (route) return `${route[1]}${path.slice(route[0].length)}`
  const inWorktree = /^\/worktrees\/[^/]+(\/.*)$/.exec(path)?.[1]
  return inWorktree && engineRoutePath(inWorktree, routes)
}

/**
 * Branch and worktree name of the checkout at `root`, when git knows.
 * - `worktree`:  when `root` is a worktree's own folder (`SRV.checkoutOf()`)
 */
function checkoutInfo(root: string): { branch?: string; worktree?: string } {
  const run = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" })
  const branch = run.status === 0 ? run.stdout.trim() : undefined
  const found = SRV.checkoutOf(root)
  const worktree = found?.root === resolve(root) ? found.worktree : undefined
  return { ...(branch && { branch }), ...(worktree && { worktree }) }
}
