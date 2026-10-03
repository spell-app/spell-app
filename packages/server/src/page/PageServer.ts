import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { SRV, type ServerInfo } from "$/server"
import { PageEditor, UI_SITE, type PageServerSettings, type RouteModule } from "$/server/page"

/**
 * THE page server:  one per checkout (the main one, and each worktree), serving the whole repo on one port.
 * - docs, plan docs, goals, Spell UI docs and (once `app` is in) the editor, all live-reloading
 * - `/` -> the docs index;  `/_server/ping` -> `ServerInfo`;  `/_server/page` -> `PageEditor`;  `/ui/` -> Spell UI's
 *   docs:  the static folder `packages/ui/site/` (`UI_SITE`), live-reloading like every page
 * - route modules (`RouteModule`) from the root `package.json`'s `"pageServer"` add the rest, e.g. goals' buttons
 * - port:  `DEFAULT_PORT` (4747) if free, else any;  the real one goes in `<root>/.spell-server.json`, where
 *   `yarn server ensure` and the openers find it
 * - Run it with `yarn server` (`page/cli.ts`), never by hand.
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
      mounts: [
        { prefix: "/", dir: this.root },
        { prefix: UI_SITE.prefix, dir: join(this.root, UI_SITE.dir) }
      ],
      configure: (served) => ({
        root: this.root,
        branch: this.info.branch,
        worktree: this.info.worktree,
        edit: "/_server/page",
        etag: SRV.StaticHandler.etagOf(statSync(served.file))
      })
    })
    const router = this.web.router
    router.get("/", (_request, reply) => reply.redirect("/packages/docs/index.html"))
    // plan docs moved from `plans/` to `epics/` (2026-10-02):  old links and open tabs still land.  302:  a 301 would
    // be cached for good, and a worktree not yet merged still serves `plans/` itself
    router.get("/packages/docs/plans/*", (request, reply) =>
      reply.redirect(request.originalUrl.replace("/packages/docs/plans/", "/packages/docs/epics/"))
    )
    router.get("/_server/ping", (_request, reply) => reply.set("Cache-Control", "no-store").json(this.info))
    // NOTE: no body parsing here:  each route parses its own (the app's `/api` is JSON5), and the proxy streams
    new PageEditor(this.root).route(router, this.web.guard)
  }

  /**
   * Load the route modules, start watching, listen, write the pid file, then run route modules' `onListening`s.
   * - `port`:  wanted port (default `DEFAULT_PORT`);  taken:  any free one
   * - `routes`:  load route modules (default `true`;  tests turn it off)
   * - `pidFile`:  write `.spell-server.json` (default `true`)
   */
  async start({ port = DEFAULT_PORT, routes = true, pidFile = true }: StartOptions = {}): Promise<this> {
    const settings = this.settings()
    for (const dir of settings.watch ?? ["packages/docs"])
      this.web.live!.watch(join(this.root, dir), { ignore: /(^|\/)(scripts|experiments)\// })
    this.web.live!.watch(join(this.root, UI_SITE.dir), { ignore: UI_SITE.ignore })
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
   * The page server of the checkout at `root`, started in the background if it isn't running:  its info, `base`
   * URL, and whether it was `launched` just now.
   * - runs `page/cli.ts serve` under `tsx`, with this package's `tsconfig.json` for the aliases
   *   (`TSX_TSCONFIG_PATH`), whatever the caller's folder;  its output goes to `<root>/.spell-server.log`
   * - what `yarn server ensure`, the goals tools and the openers call
   */
  static ensure(root: string, port = DEFAULT_PORT) {
    return new SRV.PidFile(root).ensure({
      command: [process.execPath, "--import", "tsx", CLI, "serve", "--root", resolve(root), "--port", String(port)],
      env: { TSX_TSCONFIG_PATH: TSCONFIG }
    })
  }

  /** the root `package.json`'s `"pageServer"` field */
  settings(): PageServerSettings {
    const file = join(this.root, "package.json")
    if (!existsSync(file)) return {}
    return (JSON.parse(readFileSync(file, "utf8")) as { pageServer?: PageServerSettings }).pageServer ?? {}
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

/** `page/cli.ts`:  `yarn server`. */
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url))

/** This package's `tsconfig.json`:  the alias table a background server needs. */
const TSCONFIG = fileURLToPath(new URL("../../tsconfig.json", import.meta.url))

/** Port the page server asks for first:  `SPELL_SERVER_PORT`, else 4747 (the goals server's old port). */
export const DEFAULT_PORT = Number(process.env.SPELL_SERVER_PORT) || 4747

/**
 * `PageServer.start()` options.
 * - `port`:  wanted;  `routes`:  load route modules;  `pidFile`:  write the pid file
 */
export type StartOptions = { port?: number; routes?: boolean; pidFile?: boolean }

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

/** Branch and worktree name of the checkout at `root`, when git knows. */
function checkout(root: string): { branch?: string; worktree?: string } {
  const run = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" })
  const branch = run.status === 0 ? run.stdout.trim() : undefined
  const worktree = /[/\\]\.claude[/\\]worktrees[/\\][^/\\]+$/.test(root) ? basename(root) : undefined
  return { ...(branch && { branch }), ...(worktree && { worktree }) }
}
