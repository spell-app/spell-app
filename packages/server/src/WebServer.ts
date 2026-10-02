import { createServer, type IncomingMessage, type Server } from "node:http"
import { relative, sep } from "node:path"
import type { Duplex } from "node:stream"

import { SRV, type FileTransform, type HtmlTransform, type Mount, type ServedFile } from "$/server"

/**
 * A local web server:  `node:http` + `Guard` + `Router` + `StaticHandler` (+ `LiveReload`), in that order.
 * - requests go:  host check -> `/_server/events` and `/_server/live.js` (when `live`) -> `router` -> static
 *   files -> `fallback` (e.g. an SPA's `index.html`) -> 404
 * - `live`:  watches nothing by itself -- call `live.watch(dir)`;  every `.html` page gets `window.SPELL_SERVER` and
 *   the live client before `</head>`
 * - loopback only (`127.0.0.1`) unless `listen()` says otherwise
 */
export class WebServer {
  /** folder pages are reported relative to (live reload, `SPELL_SERVER.file`);  `/` mount's folder by default */
  readonly root?: string

  /** routes tried BEFORE static files */
  readonly router = new SRV.Router()

  /** routes tried AFTER static files */
  readonly fallback = new SRV.Router()

  /** the static folders */
  readonly files: SRV.StaticHandler

  /** host and write checks */
  readonly guard: SRV.Guard

  /** live reload, when asked for */
  readonly live?: SRV.LiveReload

  /** node's server */
  readonly server: Server

  /** extra fields for each page's `window.SPELL_SERVER` */
  private configure?: (served: ServedFile) => Record<string, unknown>

  /** websocket upgrades by path prefix, e.g. `/ui` -> a dev server's HMR */
  private upgrades: { claims: (request: SRV.Request) => boolean; handle: UpgradeHandler }[] = []

  /** upgraded sockets:  `closeAllConnections()` doesn't see them, so `close()` ends them itself */
  private sockets = new Set<Duplex>()

  /** port once listening;  0 before */
  port = 0

  constructor(props: WebServerProps = {}) {
    const { mounts = [], html = [], transforms, live = false, checkHost = true, onError } = props
    this.root = props.root ?? mounts.find((mount) => mount.prefix === "/")?.dir
    this.configure = props.configure
    this.guard = new SRV.Guard({ token: props.token })
    if (live) this.live = new SRV.LiveReload({ root: this.root ?? process.cwd() })
    this.files = new SRV.StaticHandler({
      mounts,
      transforms,
      html: live ? [...html, (page, served) => this.inject(page, served)] : html
    })

    const top = new SRV.Router()
    if (checkHost) top.use(this.guard.hostCheck)
    if (this.live) {
      top.get("/_server/events", this.live.events)
      top.get("/_server/live.js", (_request, reply) =>
        reply.type("text/javascript; charset=utf-8").set("Cache-Control", "no-store").send(SRV.liveClientScript())
      )
    }
    top.use(this.router, this.files.handle, this.fallback)
    this.server = createServer(SRV.toListener(top.handle, { onError: onError ?? logError }))
    this.server.on("upgrade", (raw: IncomingMessage, socket: Duplex, head: Buffer) => this.onUpgrade(raw, socket, head))
  }

  /**
   * Answer websocket upgrades under `prefix` (or that `claims()` accepts) with `handle`, e.g. `SRV.proxyUpgrade` to
   * a dev server.
   * - the host check applies;  an upgrade nothing claims is refused
   */
  upgrade(prefix: string | ((request: SRV.Request) => boolean), handle: UpgradeHandler): this {
    const claims = typeof prefix === "string" ? (request: SRV.Request) => SRV.underPrefix(request.path, prefix) : prefix
    this.upgrades.push({ claims, handle })
    return this
  }

  /** route one upgrade */
  private onUpgrade(raw: IncomingMessage, socket: Duplex, head: Buffer): void {
    const request = new SRV.Request(raw)
    const claim = this.upgrades.find(({ claims }) => claims(request))
    this.sockets.add(socket)
    socket.on("close", () => this.sockets.delete(socket))
    try {
      if (!claim) throw new SRV.HttpError(404, "no upgrade here")
      this.guard.checkHost(request)
      void Promise.resolve(claim.handle(raw, socket, head)).catch(() => socket.destroy())
    } catch {
      socket.destroy()
    }
  }

  /** base URL once listening, e.g. `http://127.0.0.1:4747` */
  get url(): string {
    return `http://127.0.0.1:${this.port}`
  }

  /**
   * Start listening:  on `port` (0:  any), falling back to any free port if it's taken (unless `fallback: false`).
   * - SIDE EFFECT:  the guard now accepts this port's host names
   */
  async listen(options: SRV.ListenOptions = {}): Promise<{ url: string; port: number }> {
    this.port = await SRV.listenPreferred(this.server, options)
    this.guard.allowPort(this.port)
    return { url: this.url, port: this.port }
  }

  /** stop:  live reload, open connections and websockets, the server */
  close(): Promise<void> {
    this.live?.close()
    for (const socket of this.sockets) socket.destroy()
    this.server.closeAllConnections()
    return new Promise((done) => this.server.close(() => done()))
  }

  /** the config every live page gets, as `window.SPELL_SERVER` */
  config(served: ServedFile): SRV.ServerConfig {
    const file = this.root
      ? `/${relative(this.root, served.file).split(sep).map(encodeURIComponent).join("/")}`
      : served.path
    return {
      port: this.port,
      token: this.guard.token,
      events: "/_server/events",
      file,
      ...this.configure?.(served)
    }
  }

  /** `page` with `window.SPELL_SERVER` and the live client, before `</head>` (or first, without one) */
  private inject(page: string, served: ServedFile): string {
    const config = JSON.stringify(this.config(served)).replace(/</g, "\\u003c")
    const tags = `<script>window.SPELL_SERVER = ${config}</script>\n<script src="/_server/live.js" defer></script>\n`
    const head = page.search(/<\/head>/i)
    return head < 0 ? tags + page : page.slice(0, head) + tags + page.slice(head)
  }
}

/**
 * `new WebServer()` props.
 * - `mounts` / `html` / `transforms`:  as `StaticHandler`
 * - `root`:  folder pages are reported relative to;  default the `/` mount's
 * - `live`:  live reload + `window.SPELL_SERVER` on every page;  `configure`:  more fields for it
 * - `token`:  the guard's (default:  random);  `checkHost`:  refuse foreign `Host` headers (default `true`)
 * - `onError`:  told of 5xx failures (default:  `console.error`)
 */
export type WebServerProps = {
  mounts?: Mount[]
  html?: HtmlTransform[]
  transforms?: Record<string, FileTransform>
  root?: string
  live?: boolean
  configure?: (served: ServedFile) => Record<string, unknown>
  token?: string
  checkHost?: boolean
  onError?: (error: unknown, request: SRV.Request) => void
}

/** Answers a websocket upgrade:  takes over `socket`. */
export type UpgradeHandler = (raw: IncomingMessage, socket: Duplex, head: Buffer) => unknown

/** Log a failure:  method, URL and stack. */
function logError(error: unknown, request: SRV.Request): void {
  console.error(`${request.method} ${request.originalUrl}:`, error)
}
