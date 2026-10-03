import { spawn, type ChildProcess } from "node:child_process"
import { existsSync, openSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

import { SRV } from "$/server"

/**
 * Spell UI's docs (the Astro site, `packages/ui/site`) at `/ui/` of the page server.
 * - `astro dev` starts on the FIRST `/ui` request, on a free port, and stops with the page server
 * - requests and the HMR websocket are proxied with the path unchanged:  the site's `base` is `/ui`
 * - while it runs, Vite's own dev paths go to it too:  in dev, Astro serves modules from the ROOT, base or not
 *   (`/@vite/client`, `/@fs/...`, `/src/...`, `/node_modules/.vite/...`) -- `VITE_PATHS`;  none exists at the repo
 *   root, and its HMR websocket is known by its `vite-hmr` subprotocol
 * - its output goes to `<root>/.spell-server.astro.log`
 * - runs Astro's own script with this `node`, NOT `yarn astro dev`:  a page server launched by a `yarn` script
 *   (`yarn server ensure`, `yarn serve`) inherits a PATH whose `yarn` is a temporary shim, gone once that script
 *   exits
 * - NOTE: if the page server dies without stopping (kill -9), `astro dev` keeps running:  find it with
 *   `ps aux | grep "astro dev"`
 */
export class AstroProxy {
  /** URL prefix, also the site's `base` */
  static readonly prefix = "/ui"

  /** the checkout */
  readonly root: string

  /** `packages/ui/site` */
  readonly site: string

  /** the running `astro dev` */
  private child?: ChildProcess

  /** its port, once it answers */
  private starting?: Promise<number>

  constructor(root: string) {
    this.root = root
    this.site = join(root, "packages/ui/site")
  }

  /** whether this checkout has the site */
  get exists(): boolean {
    return existsSync(join(this.site, "astro.config.mjs"))
  }

  /** proxy `/ui` on `web` (and Vite's paths while it runs):  requests (before body parsing) and websocket upgrades */
  route(web: SRV.WebServer): void {
    const forward = SRV.proxyTo(() => this.ensure())
    const prefix = AstroProxy.prefix
    web.router.all(prefix, forward)
    web.router.all(`${prefix}/*`, forward)
    web.router.use((request, reply, next) =>
      this.running && VITE_PATHS.test(request.path) ? forward(request, reply, next) : next()
    )
    web.upgrade(
      (request) =>
        SRV.underPrefix(request.path, prefix) ||
        (this.running && /\bvite-hmr\b/.test(request.get("sec-websocket-protocol") ?? "")),
      async (raw, socket, head) => SRV.proxyUpgrade(raw, socket, head, await this.ensure())
    )
  }

  /** whether `astro dev` is up (or coming up) */
  get running(): boolean {
    return Boolean(this.starting)
  }

  /** `astro dev`'s port, starting it first if needed;  rejects (502) if it doesn't answer in 60s */
  ensure(): Promise<number> {
    this.starting ??= this.start().catch((error: unknown) => {
      this.starting = undefined
      throw error
    })
    return this.starting
  }

  /** stop `astro dev` and everything it started */
  stop(): void {
    const pid = this.child?.pid
    this.child = undefined
    this.starting = undefined
    if (!pid) return
    try {
      process.kill(-pid, "SIGTERM")
    } catch {
      // already gone
    }
  }

  /** start `astro dev` on a free port;  resolves once it answers */
  private async start(): Promise<number> {
    const port = await SRV.freePort()
    const log = openSync(join(this.root, ".spell-server.astro.log"), "a")
    // `--ignore-lock`:  stay in the foreground, ours to stop -- Astro 7 backgrounds itself when it detects an agent
    // (`CLAUDECODE` ...) in the environment, and then exits at once
    const astro = join(
      dirname(createRequire(join(this.site, "package.json")).resolve("astro/package.json")),
      "bin/astro.mjs"
    )
    this.child = spawn(
      process.execPath,
      [astro, "dev", "--port", String(port), "--host", "127.0.0.1", "--ignore-lock"],
      {
        cwd: this.site,
        detached: true,
        stdio: ["ignore", log, log],
        env: { ...process.env, BROWSER: "none" }
      }
    )
    const child = this.child
    child.on("exit", () => {
      if (this.child === child) this.stop()
    })
    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
      if (child.exitCode !== null) break
      try {
        await fetch(`http://127.0.0.1:${port}${AstroProxy.prefix}/`, { signal: AbortSignal.timeout(2000) })
        return port
      } catch {
        await new Promise((done) => setTimeout(done, 250))
      }
    }
    this.stop()
    throw new SRV.HttpError(502, "astro dev didn't start:  see .spell-server.astro.log")
  }
}

/** Paths Vite's dev server serves from the root, whatever the site's `base`. */
const VITE_PATHS = /^\/(@vite|@id|@fs|@react-refresh|@astro|src|node_modules\/\.vite|__vite|_astro|\.astro)(\/|$)/
