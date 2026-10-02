import { createServer, type Server } from "node:http"
import { relative, sep } from "node:path"

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

  /** stop:  live reload, open connections, the server */
  close(): Promise<void> {
    this.live?.close()
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

/** Log a failure:  method, URL and stack. */
function logError(error: unknown, request: SRV.Request): void {
  console.error(`${request.method} ${request.originalUrl}:`, error)
}
