import { randomUUID } from "node:crypto"
import { statSync, watch, type FSWatcher } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import type { Duplex } from "node:stream"

import { SRV, type UpgradeHandler } from "$/server"

/**
 * Live reload over websockets:  watches folders, and tells every open page which file changed.
 * - `events` answers the `/api/server/live` websocket upgrade (`LIVE_EVENTS`):  each page keeps one open
 * - `liveClient()`, in the page, acts on each change:
 *   - the page's own file:  offers it the new version (the docs runtime patches itself in place, else it reloads)
 *   - a stylesheet it uses:  swaps it
 *   - a script it loaded, or one beside it:  hot-reloads (`liveAction()`)
 * - each message is JSON `{ event, data }`, e.g. `{ event: "change", data: { path: "/guides/x.html" } }`
 * - a page's socket opens with `{ event: "hello", data: { run } }`:  this server's `run`
 *   - a page served by an EARLIER run (the server restarted:  a merge changed its code) reloads,
 *     so it gets the new `/api/server/live.js` and write token
 * - websockets, not server-sent events:  an `EventSource` holds one of Chrome's 6 connections per host for good,
 *   and every VS Code window shares them (see `webSocket.ts`)
 * - a write is often two (write, then a formatter), so each path waits `debounce` ms (250) for quiet
 * - a ping every `heartbeat` ms (30s) keeps proxies and sleeping laptops from dropping the socket
 * - never reports dot files, `node_modules`, lock files or editor temp files
 * - From the goals server's `/api/events`.
 */
export class LiveReload {
  /** folder that paths are reported relative to, as URL paths (`/guides/x.html`) */
  readonly root: string

  /**
   * this run of the server, a random id:  every page gets it (`SPELL_SERVER.run`), and every socket hears it
   * when it opens (`hello`), so a page from an earlier run knows to reload
   */
  readonly run = randomUUID().slice(0, 8)

  /** ms a path must be quiet before it's reported */
  readonly debounce: number

  /** open websockets, one per page */
  private clients = new Set<Duplex>()

  /** one per watched folder */
  private watchers: FSWatcher[] = []

  /** pending reports, by URL path */
  private timers = new Map<string, NodeJS.Timeout>()

  /** keeps sockets alive */
  private beat?: NodeJS.Timeout

  constructor({ root, debounce = 250, heartbeat = 30_000 }: LiveReloadProps) {
    this.root = resolve(root)
    this.debounce = debounce
    if (heartbeat) {
      this.beat = setInterval(() => this.write(SRV.pingFrame()), heartbeat)
      this.beat.unref()
    }
  }

  /** how many pages are listening */
  get clientCount(): number {
    return this.clients.size
  }

  /**
   * the `/api/server/live` upgrade:  accepts the websocket, says `hello` (`run`),
   * and adds it to the clients until it closes
   */
  events: UpgradeHandler = (raw, socket) => {
    if (!SRV.acceptWebSocket(raw, socket)) return
    socket.write(SRV.textFrame(JSON.stringify({ event: "hello", data: { run: this.run } })))
    this.clients.add(socket)
    socket.on("close", () => this.clients.delete(socket))
  }

  /**
   * Watch `dir` (recursively) and report its changes.
   * - `ignore`:  more paths (relative to `dir`, `/`-separated) never to report, e.g. `/(^|\/)experiments\//`
   * - `servedAt`:  the URL path the folder is served at, when that isn't its path from `root`
   *   (a folder laid over another, `StaticHandler.overlays`)
   *   - its changes are reported there, e.g. `/components/ui/_assets/` for `packages/ui/site/_assets/`,
   *     so a page loading `/components/ui/_assets/site.js` sees its script change
   *   - or a function of the URL paths it's served at NOW, each change reported at every one:
   *     e.g. the page server's content folder, at `/` and under every worktree's address (`PageServer.serveContent()`)
   * - a missing folder is skipped
   * - SIDE EFFECT:  an `fs.watch` per call, closed by `close()`
   */
  watch(dir: string, { ignore, servedAt }: { ignore?: RegExp; servedAt?: string | (() => string[]) } = {}): this {
    const folder = resolve(dir)
    const places = (): (string | undefined)[] =>
      servedAt === undefined
        ? [undefined]
        : (typeof servedAt === "string" ? [servedAt] : servedAt()).map((at) => at.replace(/\/?$/, "/"))
    try {
      const watcher = watch(folder, { recursive: true }, (_event, name) => {
        if (!name) return
        const inside = name.split(sep).join("/")
        if (IGNORED.test(inside) || ignore?.test(inside)) return
        const path = inside.split("/").map(encodeURIComponent).join("/")
        for (const at of places()) this.changed(join(folder, name), at && `${at}${path}`)
      })
      watcher.on("error", () => {})
      this.watchers.push(watcher)
    } catch {
      // missing folder:  nothing to watch
    }
    return this
  }

  /**
   * Report `file` (absolute) as changed, once it's been quiet for `debounce` ms.
   * - folders are skipped:  macOS reports a watched folder's own changes under its name (`docs` -> `docs/docs`)
   * - `served`:  the URL path to report;  default `file`'s path from `root`
   */
  changed(file: string, served?: string): void {
    if (statSync(file, { throwIfNoEntry: false })?.isDirectory()) return
    const path = served ?? `/${relative(this.root, file).split(sep).map(encodeURIComponent).join("/")}`
    clearTimeout(this.timers.get(path))
    this.timers.set(
      path,
      setTimeout(() => {
        this.timers.delete(path)
        this.send("change", { path })
      }, this.debounce)
    )
  }

  /** send event `event` with JSON `data` to every page now */
  send(event: string, data: unknown): void {
    this.write(SRV.textFrame(JSON.stringify({ event, data })))
  }

  /** stop watching, close every socket */
  close(): void {
    for (const watcher of this.watchers) watcher.close()
    this.watchers = []
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    clearInterval(this.beat)
    for (const client of this.clients) client.destroy()
    this.clients.clear()
  }

  /** write `frame` to every socket */
  private write(frame: Buffer): void {
    for (const client of this.clients) client.write(frame)
  }
}

/**
 * `new LiveReload()` props.
 * - `root`:  paths are reported relative to it
 * - `debounce` / `heartbeat`:  ms (see the class)
 */
export type LiveReloadProps = { root: string; debounce?: number; heartbeat?: number }

/** Paths (relative, `/`-separated) never reported:  dot files and folders, `node_modules`, locks, temp files. */
const IGNORED = /(^|\/)(\.|node_modules\/)|\.lock$|~$|\.tmp$|\.swp$/
