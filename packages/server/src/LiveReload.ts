import { statSync, watch, type FSWatcher } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import type { Duplex } from "node:stream"

import { SRV, type UpgradeHandler } from "$/server"

/**
 * Live reload over websockets:  watches folders, and tells every open page which file changed.
 * - `events` answers the `/_server/events` websocket upgrade:  each page keeps one open;  `liveClient()` offers
 *   the page its own file's new version (the docs runtime patches itself in place, else it reloads), swaps a
 *   stylesheet it uses, and reloads for a script in the folder of one it loads
 * - each message is JSON `{ event, data }`, e.g. `{ event: "change", data: { path: "/guides/x.html" } }`
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

  /** the `/_server/events` upgrade:  accepts the websocket and adds it to the clients until it closes */
  events: UpgradeHandler = (raw, socket) => {
    if (!SRV.acceptWebSocket(raw, socket)) return
    this.clients.add(socket)
    socket.on("close", () => this.clients.delete(socket))
  }

  /**
   * Watch `dir` (recursively) and report its changes.
   * - `ignore`:  more paths (relative to `dir`, `/`-separated) never to report, e.g. `/(^|\/)experiments\//`
   * - `servedAt`:  the URL path the folder is served at, when that isn't its path from `root` (a folder laid over
   *   another, `StaticHandler.overlays`):  its changes are reported there, e.g. `/ui/` for `packages/ui/site/`, so a
   *   page loading `/ui/_assets/site.js` sees its script change
   * - a missing folder is skipped
   * - SIDE EFFECT:  an `fs.watch` per call, closed by `close()`
   */
  watch(dir: string, { ignore, servedAt }: { ignore?: RegExp; servedAt?: string } = {}): this {
    const folder = resolve(dir)
    const at = servedAt?.replace(/\/?$/, "/")
    try {
      const watcher = watch(folder, { recursive: true }, (_event, name) => {
        if (!name) return
        const inside = name.split(sep).join("/")
        if (IGNORED.test(inside) || ignore?.test(inside)) return
        this.changed(join(folder, name), at && `${at}${inside.split("/").map(encodeURIComponent).join("/")}`)
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
 * - `root`:  paths are reported relative to it;  `debounce` / `heartbeat`:  ms (see the class)
 */
export type LiveReloadProps = { root: string; debounce?: number; heartbeat?: number }

/** Paths (relative, `/`-separated) never reported:  dot files and folders, `node_modules`, locks, temp files. */
const IGNORED = /(^|\/)(\.|node_modules\/)|\.lock$|~$|\.tmp$|\.swp$/
