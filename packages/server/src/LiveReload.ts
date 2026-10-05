import { statSync, watch, type FSWatcher } from "node:fs"
import type { ServerResponse } from "node:http"
import { join, relative, resolve, sep } from "node:path"

import type { Handler } from "$/server"

/**
 * Live reload over server-sent events (SSE):  watches folders, and tells every open page which file changed.
 * - `events` is the `/_server/events` handler:  each page keeps one open (`EventSource`);  `liveClient()` offers
 *   the page its own file's new version (the docs runtime patches itself in place, else it reloads), swaps a
 *   stylesheet it uses, and reloads for a script in the folder of one it loads
 * - a write is often two (write, then a formatter), so each path waits `debounce` ms (250) for quiet
 * - a comment line every `heartbeat` ms (30s) keeps proxies and sleeping laptops from dropping the stream
 * - never reports dot files, `node_modules`, lock files or editor temp files
 * - From the goals server's `/api/events`.
 */
export class LiveReload {
  /** folder that paths are reported relative to, as URL paths (`/guides/x.html`) */
  readonly root: string

  /** ms a path must be quiet before it's reported */
  readonly debounce: number

  /** open event streams, one per page */
  private clients = new Set<ServerResponse>()

  /** one per watched folder */
  private watchers: FSWatcher[] = []

  /** pending reports, by URL path */
  private timers = new Map<string, NodeJS.Timeout>()

  /** keeps streams alive */
  private beat?: NodeJS.Timeout

  constructor({ root, debounce = 250, heartbeat = 30_000 }: LiveReloadProps) {
    this.root = resolve(root)
    this.debounce = debounce
    if (heartbeat) {
      this.beat = setInterval(() => this.write(": beat\n\n"), heartbeat)
      this.beat.unref()
    }
  }

  /** how many pages are listening */
  get clientCount(): number {
    return this.clients.size
  }

  /** the `/_server/events` handler:  holds the response open and adds it to the clients */
  events: Handler = (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive"
    })
    reply.raw.write(": spell server\n\n")
    this.clients.add(reply.raw)
    request.raw.on("close", () => this.clients.delete(reply.raw))
  }

  /**
   * Watch `dir` (recursively) and report its changes.
   * - `ignore`:  more paths (relative to `dir`, `/`-separated) never to report, e.g. `/(^|\/)experiments\//`
   * - a missing folder is skipped
   * - SIDE EFFECT:  an `fs.watch` per call, closed by `close()`
   */
  watch(dir: string, { ignore }: { ignore?: RegExp } = {}): this {
    const folder = resolve(dir)
    try {
      const watcher = watch(folder, { recursive: true }, (_event, name) => {
        if (!name) return
        const inside = name.split(sep).join("/")
        if (IGNORED.test(inside) || ignore?.test(inside)) return
        this.changed(join(folder, name))
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
   */
  changed(file: string): void {
    if (statSync(file, { throwIfNoEntry: false })?.isDirectory()) return
    const path = `/${relative(this.root, file).split(sep).map(encodeURIComponent).join("/")}`
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
    this.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  /** stop watching, end every stream */
  close(): void {
    for (const watcher of this.watchers) watcher.close()
    this.watchers = []
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    clearInterval(this.beat)
    for (const client of this.clients) client.end()
    this.clients.clear()
  }

  /** write raw `text` to every stream */
  private write(text: string): void {
    for (const client of this.clients) client.write(text)
  }
}

/**
 * `new LiveReload()` props.
 * - `root`:  paths are reported relative to it;  `debounce` / `heartbeat`:  ms (see the class)
 */
export type LiveReloadProps = { root: string; debounce?: number; heartbeat?: number }

/** Paths (relative, `/`-separated) never reported:  dot files and folders, `node_modules`, locks, temp files. */
const IGNORED = /(^|\/)(\.|node_modules\/)|\.lock$|~$|\.tmp$|\.swp$/
