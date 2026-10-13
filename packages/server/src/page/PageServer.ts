import { spawnSync } from "node:child_process"
import { existsSync, statSync } from "node:fs"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { SRV, type ServerInfo } from "$/server"
import {
  AirplaneMode,
  BundleBuild,
  COMPONENT_SETS,
  HIGHLIGHT_JS,
  PageEditor,
  pageServerSettings,
  type PageServerSettings,
  type RouteModule
} from "$/server/page"

/**
 * THE page server:  one per checkout (the main one, and each worktree), serving the whole repo on one port.
 * - docs, plan docs, goals, Spell UI docs and (once `app` is in) the editor, all live-reloading
 * - pages and files are plain URLs;  every CALL is under `/api/`, one prefix per package that answers it:
 *   - `/api/server` -> `ServerInfo` (which checkout, branch and port:  what the openers ask);
 *     `/api/server/live` and `/api/server/live.js`, live reload (`SRV.WebServer`)
 *   - `/api/files` -> `SRV.FileOperations`:  files and folders saved, made, moved, copied and deleted
 *   - `/api/pages` -> `PageEditor`:  a page's source, saving it, saving one section
 *   - both write only inside the root `package.json`'s `"pageServer"` `"writable"` folders (the shared content ones)
 *   - the rest come from route modules:  `/api/epics/...` and `/api/docs/...` (epics), `/api/projects/...` and
 *     `/api/spaces/...` (spaces)
 * - `/` -> the docs home (`pages/index.html`)
 * - `/components/<set>/` -> the component sets' docs (`COMPONENT_SETS`):  Spell UI's, Epic UI's, App UI's, the brand's
 *   - each its package's `docs/` folder, with Spell UI's site bundle laid over it at `_assets/` (`componentSetPath()`)
 *   - live-reloading like every page;  the same at `/worktrees/<w>/components/<set>/`
 * - `/worktrees/<w>/...` -> worktree `<w>`'s checkout, with the same URLs inside (dot files still refused)
 * - the bundles it serves (Spell UI's site, the brand pages) aren't committed:
 *   `start()` builds the stale ones in the background (`BundleBuild`),
 *   and a request for one of their files waits while that runs
 * - route modules (`RouteModule`) from the root `package.json`'s `"pageServer"` add the rest, e.g. the running epics
 * - NO redirects for old URLs (epic `people-and-orgs`, Q30):  an old address answers "not found"
 *   - until `people-and-orgs` merges into `main`, two temporary bridges for the SHARED pages, which every checkout
 *     shows:  folders this branch moved still serve from their new place (`movedFolderPath()`), and folders it moved
 *     out of the shared content answer "not found" here though the shared repo still holds them (`MOVED_OUT`)
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

  /** the startup build of the bundles it serves */
  readonly bundles: BundleBuild

  /** run once listening, from route modules */
  private listenings: (() => unknown)[] = []

  /** run on `stop()`, from route modules */
  private stops: (() => unknown)[] = []

  constructor({ root, token }: { root: string; token?: string }) {
    this.root = resolve(root)
    this.pidFile = new SRV.PidFile(this.root)
    this.info = {
      pid: process.pid,
      port: 0,
      root: this.root,
      started: new Date().toISOString(),
      ...checkout(this.root)
    }
    const { writable } = this.settings()
    this.web = new SRV.WebServer({
      root: this.root,
      token,
      live: true,
      mounts: [
        { prefix: "/", dir: this.root },
        // every worktree's checkout, so the main server shows a running epic's plan doc (epics' running epics)
        { prefix: "/worktrees/", dir: join(this.root, ".claude", "worktrees") }
      ],
      html: [localHighlight],
      configure: (served) => ({
        root: this.root,
        branch: this.info.branch,
        worktree: this.info.worktree,
        // a worktree's page served from here (`/worktrees/<w>/`):  ITS branch and name, for the header's badge
        ...worktreeOf(served.file, this.root),
        edit: PageEditor.PREFIX,
        etag: SRV.StaticHandler.etagOf(statSync(served.file)),
        // Owen is offline, no Claude:  pages say "queued for when you land" (epic `airplane`)
        ...(AirplaneMode.isOn && { airplane: true })
      })
    })
    this.web.files.overlays.push(componentSetPath, movedFolderPath)
    const router = this.web.router
    router.get("/", (_request, reply) => reply.redirect(DOCS_HOME))
    // TEMPORARY (until the merge):  what this branch moved out of the shared folders, though they still hold it
    for (const path of MOVED_OUT) {
      router.use(path, (_request, reply) => reply.status(404).send(`${path}/ moved:  see ${COMPONENTS_HOME}`))
    }
    // a component set's address without its slash:  with it, so its pages' relative links resolve
    // - the router takes a trailing `/` as optional, so the address WITH it passes on
    for (const set of COMPONENT_SETS)
      router.get(set.prefix, (request, reply, next) =>
        request.path.endsWith("/") ? next() : reply.redirect(`${set.prefix}/`)
      )
    router.get(SERVER_API, (_request, reply) => reply.set("Cache-Control", "no-store").json(this.info))
    this.bundles = new BundleBuild({ root: this.root })
    router.use(this.bundles.wait)
    // NOTE: no body parsing here:  each route parses its own (the app's `/api` is JSON5), and the proxy streams
    // `/api/pages` and `/api/files`:  saving, making, moving and deleting files, only inside the `"writable"` folders
    new PageEditor({ root: this.root, writable }).route(router, this.web.guard)
    new SRV.FileOperations({ root: this.root, writable }).route(router, this.web.guard)
  }

  /**
   * Start the bundles' build, load the route modules, start watching, listen, write the pid file,
   * then run route modules' `onListening`s.
   * - `port`:  wanted port (default `DEFAULT_PORT`);  taken:  any free one
   * - `routes`:  load route modules (default `true`;  tests turn it off)
   * - `pidFile`:  write `.spell-server.json` (default `true`)
   * - `bundles`:  build the stale bundles in the background (default `true`;  a checkout without the CLI has none)
   */
  async start({
    port = DEFAULT_PORT,
    routes = true,
    pidFile = true,
    bundles = true
  }: StartOptions = {}): Promise<this> {
    if (bundles) this.bundles.start()
    const settings = this.settings()
    for (const dir of settings.watch ?? DEFAULT_WATCH)
      this.web.live!.watch(join(this.root, dir), { ignore: /(^|\/)(scripts|experiments)\// })
    // the component sets' pages, parts and data, and their site bundle (rebuilt by `yarn site:dev`), as their pages
    // load them:  `/components/ui/_assets/site.js`, so a rebuilt bundle reloads them
    for (const set of COMPONENT_SETS) {
      this.web.live!.watch(join(this.root, set.dir), { servedAt: set.prefix })
      this.web.live!.watch(join(this.root, set.assets), { servedAt: `${set.prefix}/${SET_ASSETS}` })
    }
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

  /** stop:  the bundles' build, route modules' stops, the pid file (if ours), the server */
  async stop(): Promise<void> {
    this.bundles.stop()
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

  /** the root `package.json`'s `"pageServer"` field */
  settings(): PageServerSettings {
    return pageServerSettings(this.root)
  }

  /** import route module `path` (relative to the root) and run its `setup()`;  a failure is logged, not fatal */
  private async loadRoutes(path: string): Promise<void> {
    try {
      const module = (await import(pathToFileURL(join(this.root, path)).href)) as { default: RouteModule }
      await module.default.setup({
        root: this.root,
        router: this.web.router,
        guard: this.web.guard,
        live: this.web.live!,
        web: this.web,
        info: this.info,
        onListening: (start) => this.listenings.push(start),
        onStop: (stop) => this.stops.push(stop)
      })
    } catch (error) {
      console.error(`page server:  route module ${path} failed to load:`, error)
    }
  }
}

/** `html`, its cdnjs highlight.js tag (`HIGHLIGHT_JS.cdn`) pointing at the repo's copy:  pages load offline. */
export function localHighlight(html: string): string {
  return html.replaceAll(HIGHLIGHT_JS.cdn, HIGHLIGHT_JS.local)
}

/** `page/cli.ts`:  `spell dev server`. */
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url))

/** This package's `src/`:  the code a page server runs. */
const SOURCE = fileURLToPath(new URL("..", import.meta.url))

/** This package's `tsconfig.json`:  the alias table a background server needs. */
const TSCONFIG = fileURLToPath(new URL("../../tsconfig.json", import.meta.url))

/** Port the page server asks for first:  `SPELL_SERVER_PORT`, else 4747 (the goals server's old port). */
export const DEFAULT_PORT = Number(process.env.SPELL_SERVER_PORT) || 4747

/** The page server's own call:  its `ServerInfo` (`SRV.SERVER_API`). */
const SERVER_API = SRV.SERVER_API

/**
 * `PageServer.start()` options.
 * - `port`:  wanted
 * - `routes`:  load route modules
 * - `pidFile`:  write the pid file
 * - `bundles`:  build the stale bundles
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
 * Branch and worktree name of the worktree `file` is in, when it's under `<root>/.claude/worktrees/`;  else `{}`.
 * - cached per worktree:  every page served asks
 */
function worktreeOf(file: string, root: string): { branch?: string; worktree?: string } {
  const inside = relative(join(root, ".claude", "worktrees"), file)
  if (!inside || inside.startsWith("..") || isAbsolute(inside)) return {}
  const name = inside.split(sep)[0]!
  let found = WORKTREES.get(name)
  if (!found) WORKTREES.set(name, (found = checkout(join(root, ".claude", "worktrees", name))))
  return found
}

/** `worktreeOf()`'s cache, by worktree name. */
const WORKTREES = new Map<string, { branch?: string; worktree?: string }>()

/** Folder of a component set's address served from its site bundle (`ComponentSet.assets`, `componentSetPath()`). */
const SET_ASSETS = "_assets"

/** The docs home's URL. */
export const DOCS_HOME = "/pages/index.html"

/** Spell UI's docs home:  every set is a tab of the top bar from there. */
const COMPONENTS_HOME = `${COMPONENT_SETS[0].prefix}/`

/** Folders the page server live-reloads when the root `package.json` names none:  the docs areas and their bundle. */
const DEFAULT_WATCH = ["epics", "guides", "pages", "templates", "brand", "packages/epics/tools/_assets"]

/**
 * The URL path a component set's address serves (`COMPONENT_SETS`, epic `people-and-orgs` P18);  else `undefined`.
 * - `/components/<set>/_assets/<x>` -> the set's site bundle (`assets`):  Spell UI's own for `/components/ui/`, the
 *   sets' build for the others (`SETS_BUNDLE`);  the bundle then takes `/components/<set>/` as its site's root (the
 *   folder above its `_assets/`)
 * - `/components/<set>/<x>` -> its `docs/` folder:  the set's pages, `__parts/` and `__data/`
 * - the same under `/worktrees/<w>/` (that worktree's set and bundle)
 * - a `StaticHandler` overlay:  served only when the file is there, else the path as asked (a 404)
 */
export function componentSetPath(path: string): string | undefined {
  const match = /^((?:\/worktrees\/[^/]+)?)(\/[^/]+\/[^/]+)(\/.*)$/.exec(path)
  const set = match && COMPONENT_SETS.find((each) => each.prefix === match[2])
  if (!match || !set) return undefined
  const [, base = "", , rest = "/"] = match
  return rest.startsWith(`/${SET_ASSETS}/`)
    ? `${base}/${set.assets}${rest.slice(SET_ASSETS.length + 1)}`
    : `${base}/${set.dir}${rest}`
}

/**
 * The URL path a folder this branch MOVED serves from its new place (`MOVED_FOLDERS`, and the same under
 * `/worktrees/<w>/`);  else `undefined`.
 * - TEMPORARY (epic `people-and-orgs`, P16 J49, P18):  the shared pages, which every checkout shows, keep linking
 *   the old folders until this branch merges into `main`;  then a script rewrites their links (`relocate.js
 *   relink`, `relink-sets`) and this overlay goes (the epic's T3)
 * - a `StaticHandler` overlay:  served only when the file is there
 */
export function movedFolderPath(path: string): string | undefined {
  const match = /^((?:\/worktrees\/[^/]+)?)(\/.*)$/.exec(path)
  if (!match) return undefined
  const [, base = "", rest = "/"] = match
  const moved = MOVED_FOLDERS.find(([from]) => rest.startsWith(`${from}/`))
  return moved && `${base}${moved[1]}${rest.slice(moved[0].length)}`
}

/**
 * TEMPORARY (until the merge, T3):  folders this branch moved, as URL paths:  old => new.
 * - the docs assets (P16, J49), into `$/epics`
 * - the epics pack (P18), into its components' `__pack/`:  every shared plan doc loads it
 */
const MOVED_FOLDERS: readonly (readonly [from: string, to: string])[] = [
  ["/packages/docs/tools/_assets", "/packages/epics/tools/_assets"],
  ["/packages/epics/pack", "/packages/epics/components/__pack"]
]

/**
 * TEMPORARY (until the merge, T3):  what this branch moved OUT of the shared folders into its packages, as URL paths.
 * The shared repo still holds them for `main` and every other checkout, so the root mount would serve them:  here they
 * answer "not found", as they will everywhere once this branch merges (Q30).
 * - `/ui`:  Spell UI's docs, now `/components/ui/` (`packages/ui/docs/`)
 * - `/brand/components`:  the brand elements' docs, now `/components/brand/` (`packages/brand/docs/`)
 */
const MOVED_OUT = ["/ui", "/brand/components"]

/** Branch and worktree name of the checkout at `root`, when git knows. */
function checkout(root: string): { branch?: string; worktree?: string } {
  const run = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" })
  const branch = run.status === 0 ? run.stdout.trim() : undefined
  const worktree = /[/\\]\.claude[/\\]worktrees[/\\][^/\\]+$/.test(root) ? basename(root) : undefined
  return { ...(branch && { branch }), ...(worktree && { worktree }) }
}
