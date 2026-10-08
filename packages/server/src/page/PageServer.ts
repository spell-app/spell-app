import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { SRV, type ServerInfo } from "$/server"
import {
  BundleBuild,
  PageEditor,
  RunningEpics,
  UI_SITE,
  type PageServerSettings,
  type RouteModule
} from "$/server/page"

/**
 * THE page server:  one per checkout (the main one, and each worktree), serving the whole repo on one port.
 * - docs, plan docs, goals, Spell UI docs and (once `app` is in) the editor, all live-reloading
 * - `/` -> the docs home (`pages/index.html`);  `/_server/ping` -> `ServerInfo`;  `/_server/page` -> `PageEditor`
 * - `/ui/` -> Spell UI's docs (`UI_SITE`), live-reloading like every page:  the shared pages (`ui/`), with the
 *   branch's built `_assets/` and `_data/` (`packages/ui/site/`) laid over them;  the same at `/worktrees/<w>/ui/`
 * - `/worktrees/<w>/` and `/_server/epics` -> running epics' plan docs (`RunningEpics`)
 * - the bundles it serves (Spell UI's site, the brand pages) aren't committed:  `start()` builds the stale ones in the
 *   background (`BundleBuild`), and a request for one of their files waits while that runs
 * - route modules (`RouteModule`) from the root `package.json`'s `"pageServer"` add the rest, e.g. goals' buttons
 * - port:  `DEFAULT_PORT` (4747) if free, else any;  the real one goes in `<root>/.spell-server.json`, where
 *   `spell dev server ensure` and the openers find it
 * - Run it with `spell dev server` (`page/cli.ts`), never by hand.
 */
export class PageServer {
  /** the checkout served */
  readonly root: string

  /** the web server underneath */
  readonly web: SRV.WebServer

  /** `<root>/.spell-server.json` */
  readonly pidFile: SRV.PidFile

  /** what `/_server/ping` answers;  `port` is set by `start()` */
  readonly info: ServerInfo

  /** running epics' plan docs, from the worktrees */
  readonly epics: RunningEpics

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
    this.web = new SRV.WebServer({
      root: this.root,
      token,
      live: true,
      // `/ui/` too:  the root's `ui` link (`UI_SITE.pages`), with the build laid over it (`uiBuildPath()`, below)
      mounts: [{ prefix: "/", dir: this.root }],
      configure: (served) => ({
        root: this.root,
        branch: this.info.branch,
        worktree: this.info.worktree,
        // a worktree's page served from here (`/worktrees/<w>/`):  ITS branch and name, for the header's badge
        ...worktreeOf(served.file, this.root),
        edit: "/_server/page",
        etag: SRV.StaticHandler.etagOf(statSync(served.file))
      })
    })
    this.web.files.overlays.push(uiBuildPath)
    const router = this.web.router
    router.get("/", (_request, reply) => reply.redirect(DOCS_HOME))
    // plan docs moved from `plans/` to `epics/` (2026-10-02), then into `content/`, then to the root `epics/`:  old
    // links and open tabs still land.  302:  a 301 would be cached for good
    router.get("/packages/docs/plans/*", (request, reply) =>
      reply.redirect(request.originalUrl.replace("/packages/docs/plans/", "/epics/"))
    )
    // docs pages moved into `packages/docs/content/`, plan docs renamed `epics/<n>/<n>.html` -> `<n>.plan.html`
    // (both 2026-10-04), then the content split into root folders (2026-10-05, claude-design P4):  old links and
    // open tabs still land, here and in a worktree served from here (`/worktrees/<w>/`).  302.  Likewise Spell UI's
    // pages, from `packages/ui/site/` to the shared `ui/` (2026-10-05, claude-design P6)
    for (const prefix of ["/packages/docs/*", "/packages/ui/site/*", "/worktrees/*", "/epics/*"])
      router.get(prefix, (request, reply, next) => {
        const url = request.originalUrl
        const moved = movedDocsPage(url, this.root) ?? renamedPlanDoc(url, this.root) ?? movedUiPage(url, this.root)
        if (moved) reply.redirect(moved)
        else next()
      })
    router.get("/_server/ping", (_request, reply) => reply.set("Cache-Control", "no-store").json(this.info))
    this.bundles = new BundleBuild({ root: this.root })
    router.use(this.bundles.wait)
    // NOTE: no body parsing here:  each route parses its own (the app's `/api` is JSON5), and the proxy streams
    new PageEditor(this.root).route(router, this.web.guard)
    this.epics = new RunningEpics(this.root).route(this.web)
  }

  /**
   * Start the bundles' build, load the route modules, start watching, listen, write the pid file, then run route
   * modules' `onListening`s.
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
    this.web.live!.watch(join(this.root, UI_SITE.pages))
    // the build's changes as the pages load them:  `/ui/_assets/site.js`, so a rebuilt bundle reloads them
    this.web.live!.watch(join(this.root, UI_SITE.build), { ignore: UI_SITE.ignore, servedAt: UI_SITE.prefix })
    this.epics.watch(this.web.live!)
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
    this.epics.close()
    this.pidFile.removeIfOurs()
    await this.web.close()
  }

  /**
   * The page server of the checkout at `root`, started in the background if it isn't running:  its info, `base`
   * URL, and whether it was `launched` just now.
   * - runs `page/cli.ts serve` under `tsx`, with this package's `tsconfig.json` for the aliases
   *   (`TSX_TSCONFIG_PATH`), whatever the caller's folder;  its output goes to `<root>/.spell-server.log`
   * - what `spell dev server ensure`, the goals tools and the openers call
   */
  static ensure(root: string, port = DEFAULT_PORT) {
    // its code:  this package's, and its route modules' folders;  a server older than them restarts (I5 of `skillz`)
    const routes = (settingsOf(root).routes ?? []).map((path) => dirname(join(root, path)))
    return new SRV.PidFile(root).ensure({
      command: [process.execPath, "--import", "tsx", CLI, "serve", "--root", resolve(root), "--port", String(port)],
      env: { TSX_TSCONFIG_PATH: TSCONFIG },
      sources: [SOURCE, ...new Set(routes)]
    })
  }

  /** the root `package.json`'s `"pageServer"` field */
  settings(): PageServerSettings {
    return settingsOf(this.root)
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

/** The `"pageServer"` field of the `package.json` at `root`;  `{}` without one. */
function settingsOf(root: string): PageServerSettings {
  const file = join(root, "package.json")
  if (!existsSync(file)) return {}
  return (JSON.parse(readFileSync(file, "utf8")) as { pageServer?: PageServerSettings }).pageServer ?? {}
}

/** `page/cli.ts`:  `spell dev server`. */
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url))

/** This package's `src/`:  the code a page server runs. */
const SOURCE = fileURLToPath(new URL("..", import.meta.url))

/** This package's `tsconfig.json`:  the alias table a background server needs. */
const TSCONFIG = fileURLToPath(new URL("../../tsconfig.json", import.meta.url))

/** Port the page server asks for first:  `SPELL_SERVER_PORT`, else 4747 (the goals server's old port). */
export const DEFAULT_PORT = Number(process.env.SPELL_SERVER_PORT) || 4747

/**
 * `PageServer.start()` options.
 * - `port`:  wanted;  `routes`:  load route modules;  `pidFile`:  write the pid file;  `bundles`:  build the stale
 *   bundles
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

/** The docs home's URL. */
export const DOCS_HOME = "/pages/index.html"

/** Folders the page server live-reloads when the root `package.json` names none:  the docs areas and their bundle. */
const DEFAULT_WATCH = ["epics", "guides", "pages", "templates", "brand", "packages/docs/tools/_assets"]

/**
 * Where top-level entry `name` of the old `packages/docs/content/` went (claude-design P4, 2026-10-05):  `epics` and
 * `templates` to the root, `details` and `index.html` into `pages/`, anything else into `guides/`.
 * - SAME as `packages/docs/tools/relocate.js` `reorgEntry()`:  the server is a leaf, so a copy
 */
export function reorgEntry(name: string): string {
  return REORG[name] ?? `guides/${name}`
}

/** `reorgEntry()`'s exceptions. */
const REORG: Record<string, string> = {
  epics: "epics",
  templates: "templates",
  details: "pages/details",
  "index.html": "pages/index.html"
}

/**
 * The new URL of an old docs URL `url` (or the same under `/worktrees/<w>/`), query kept;  else `undefined`:
 * - `/packages/docs/content/<x>` (2026-10-04 .. 10-05):  where the reorg put `<x>` (`reorgEntry()`), when that's
 *   there;  `/packages/docs/content/` itself:  the docs home.  Even while the old path still resolves (the old-path
 *   links in the shared repo, a checkout's old content link):  ONE address per page
 * - `/packages/docs/<x>` (before 2026-10-04):  the same, but pages and folders only (`.html`, `.md`, no extension),
 *   and only while the old one is gone:  the package's own files (`package.json`, `README.md` ...) stay put
 * - an old plan doc name (`epics/<n>/<n>.html`) lands on its new name in ONE hop (`renamedPlanDoc()`)
 * - `root`:  the checkout served;  `/worktrees/<w>/...` is its `.claude/worktrees/<w>/...` (`RunningEpics`)
 */
export function movedDocsPage(url: string, root: string): string | undefined {
  const [path = "", query] = url.split("?")
  const match = /^((?:\/worktrees\/[^/]+)?)\/packages\/docs(?:\/(.*))?$/.exec(path)
  if (!match) return undefined
  const [, base = "", whole = ""] = match
  const content = /^content(\/|$)/.test(whole)
  const rest = content ? whole.replace(/^content\/?/, "") : whole
  if (!content) {
    if (/^tools(\/|$)/.test(rest) || !/(^|\/)([^/.]*|[^/]*\.(html|md))$/.test(rest)) return undefined
    const before = decode(path)
    if (!before || existsSync(servedFile(pageOf(before), root))) return undefined
  }
  const [entry = "", ...more] = rest.split("/")
  const moved = `${base}/${entry ? [reorgEntry(entry), ...more].join("/") : DOCS_HOME.slice(1)}`
  const after = decode(moved)
  if (!after) return undefined
  const tail = query === undefined ? "" : `?${query}`
  if (existsSync(servedFile(content ? after : pageOf(after), root))) return `${moved}${tail}`
  return renamedPlanDoc(`${moved}${tail}`, root)
}

/**
 * The new URL of an old plan doc's URL `url` (`/epics/<n>/<n>.html`, or the same under `/worktrees/<w>/`, or under
 * an old place:  `packages/docs/content/`, `packages/docs/`):  `<n>.plan.html`, query kept, when the old file is gone
 * and the new one is there;  else `undefined`.
 * - `root`:  the checkout served;  `/worktrees/<w>/...` is its `.claude/worktrees/<w>/...` (`RunningEpics`)
 */
export function renamedPlanDoc(url: string, root: string): string | undefined {
  const [path = "", query] = url.split("?")
  const decoded = decode(path)
  if (!decoded) return undefined
  if (!/^\/(?:worktrees\/[^/]+\/)?(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1\.html$/.test(decoded))
    return undefined
  const renamed = decoded.replace(/\.html$/, ".plan.html")
  if (existsSync(servedFile(decoded, root)) || !existsSync(servedFile(renamed, root))) return undefined
  return `${path.replace(/\.html$/, ".plan.html")}${query === undefined ? "" : `?${query}`}`
}

/**
 * The URL path Spell UI's built half lays over URL path `path` (`UI_SITE.overlays`):  `/ui/_assets/<x>` ->
 * `/packages/ui/site/_assets/<x>`, `/ui/_data/<x>` likewise, the same under `/worktrees/<w>/` (that worktree's
 * build);  else `undefined`.
 * - a `StaticHandler` overlay:  served only when the build has the file, else the shared pages' own
 */
export function uiBuildPath(path: string): string | undefined {
  const match = /^((?:\/worktrees\/[^/]+)?)\/ui\/([^/]+)(\/.*)?$/.exec(path)
  if (!match || !(UI_SITE.overlays as readonly string[]).includes(match[2]!)) return undefined
  return `${match[1]}/${UI_SITE.build}/${match[2]}${match[3] ?? ""}`
}

/**
 * The new URL of an old Spell UI page URL `url` (`/packages/ui/site/<x>`, or the same under `/worktrees/<w>/`):
 * `/ui/<x>` (`/worktrees/<w>/ui/<x>`), query kept, when the old file is gone and the new one is there;  else
 * `undefined` (2026-10-05, claude-design P6).
 * - a checkout on older code still has its pages at the old place:  served there
 * - the built half (`_assets/`, `_data/`, `_src/`) never moved:  still served at its own path too
 */
export function movedUiPage(url: string, root: string): string | undefined {
  const [path = "", query] = url.split("?")
  const match = /^((?:\/worktrees\/[^/]+)?)\/packages\/ui\/site(\/.*)?$/.exec(path)
  if (!match) return undefined
  const [, base = "", rest = "/"] = match
  const before = decode(path)
  const moved = `${base}${UI_SITE.prefix}${rest}`
  const after = decode(moved)
  if (!before || !after || existsSync(servedFile(fileOf(before), root))) return undefined
  if (!existsSync(servedFile(fileOf(after), root))) return undefined
  return `${moved}${query === undefined ? "" : `?${query}`}`
}

/** The file URL path `served` names:  a folder (`/x/`) its `index.html`;  anything else itself. */
function fileOf(served: string): string {
  return served.endsWith("/") ? `${served}index.html` : served
}

/** URL path `path` decoded;  `undefined` when malformed. */
function decode(path: string): string | undefined {
  try {
    return decodeURIComponent(path)
  } catch {
    return undefined
  }
}

/** The page URL path `served` shows:  itself for a `.html` / `.md`, else its folder's `index.html`. */
function pageOf(served: string): string {
  return /\.(html|md)$/.test(served) ? served : `${served.replace(/\/$/, "")}/index.html`
}

/** URL path `served` (decoded) as a file under the checkout `root`:  `/worktrees/<w>/...` is under `.claude/`. */
function servedFile(served: string, root: string): string {
  return served.startsWith("/worktrees/") ? join(root, ".claude", served) : join(root, served)
}

/** Branch and worktree name of the checkout at `root`, when git knows. */
function checkout(root: string): { branch?: string; worktree?: string } {
  const run = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" })
  const branch = run.status === 0 ? run.stdout.trim() : undefined
  const worktree = /[/\\]\.claude[/\\]worktrees[/\\][^/\\]+$/.test(root) ? basename(root) : undefined
  return { ...(branch && { branch }), ...(worktree && { worktree }) }
}
