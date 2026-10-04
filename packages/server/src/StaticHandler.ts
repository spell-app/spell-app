import type { Stats } from "node:fs"
import { readFile } from "node:fs/promises"
import { extname, resolve } from "node:path"

import { SRV, type FileTransform, type Handler, type HtmlTransform, type Mount } from "$/server"

/**
 * Serves folders under URL prefixes:  `GET` / `HEAD` only, never anything outside a folder.
 * - the LONGEST matching prefix wins, e.g. `/element/` over `/`
 * - a folder serves its `index.html`;  asked for without its trailing `/`, it redirects (301) to it
 * - names starting with `.` are 403 unless the mount says `dotFiles`
 * - every answer is `Cache-Control: no-store` (pages change under us) with an `ETag` of the file on disk, so a
 *   page editor can say `If-Match`
 * - hooks:
 *   - `transforms[".ts"]`:  rewrites a file by extension, e.g. `ui`'s smoke server turns `.ts` into JavaScript
 *   - `html`:  rewrites every `.html` page in turn, e.g. inject an import map or `window.SPELL_SERVER`
 *   - NOT for a script's `fetch()` (`Sec-Fetch-Dest: empty`):  it gets the file AS IS.  Why:  `<ui-include>` /
 *     `<ui-code>` / `<ui-markdown>` show a file and save it back, and must never see (or write) the injected
 *     live-reload tags.  Navigations, `<script>`s and module imports still get the hooks.
 * - nothing matched or file missing:  `next()`, so routes after it (an SPA fallback) still get a turn
 */
export class StaticHandler {
  /** folders served, longest prefix first */
  private mounts: Required<Mount>[] = []

  /** rewrites of `.html` pages, in order */
  readonly html: HtmlTransform[]

  /** rewrites by extension (`.ts`), applied before `html` */
  readonly transforms: Record<string, FileTransform>

  constructor({ mounts = [], html = [], transforms = {} }: StaticHandlerProps = {}) {
    this.html = html
    this.transforms = transforms
    for (const mount of mounts) this.mount(mount)
  }

  /** serve `mount.dir` under `mount.prefix` too */
  mount(mount: Mount): this {
    const prefix = mount.prefix.endsWith("/") ? mount.prefix : `${mount.prefix}/`
    this.mounts.push({ dotFiles: false, index: "index.html", ...mount, prefix, dir: resolve(mount.dir) })
    this.mounts.sort((a, b) => b.prefix.length - a.prefix.length)
    return this
  }

  /** the handler:  pass it to `router.use()` */
  handle: Handler = async (request, reply, next) => {
    if (request.method !== "GET" && request.method !== "HEAD") return next()
    const path = request.path
    const resolved = this.resolve(path)
    if (!resolved) return next()
    if ("redirect" in resolved) return void reply.redirect(`${request.baseUrl}${path}/`, 301)
    if ("status" in resolved) {
      if (resolved.status === 404) return next()
      throw new SRV.HttpError(resolved.status, resolved.message)
    }
    await this.serve(request, reply, resolved.file, resolved.stat)
  }

  /**
   * Where URL path `path` leads through the mounts, exactly as `handle()` would serve it;  `undefined`:  no mount.
   * - for routes that act on a page by its URL, e.g. `docs`' details answers (`/worktrees/<w>/...` included)
   */
  resolve(path: string): SRV.Resolved | undefined {
    const mount = this.mounts.find((each) => path.startsWith(each.prefix) || `${path}/` === each.prefix)
    if (!mount) return undefined
    const rest = path.length < mount.prefix.length ? "" : path.slice(mount.prefix.length - 1)
    return SRV.resolveInside(mount.dir, rest || "/", mount)
  }

  /** answer with `file`, through the hooks */
  private async serve(request: SRV.Request, reply: SRV.Reply, file: string, stat: Stats): Promise<void> {
    reply.set({ "Cache-Control": "no-store", ETag: StaticHandler.etagOf(stat) })
    const ext = extname(file).toLowerCase()
    const transform = this.transforms[ext]
    const isHtml = ext === ".html" || ext === ".htm"
    const raw = request.get("sec-fetch-dest") === "empty"
    if (raw || (!transform && !(isHtml && this.html.length))) {
      reply.type(SRV.typeFor(file))
      return reply.sendFile(file, { dotfiles: "allow" })
    }
    const context = { path: decodeURIComponent(request.path), file, request }
    let body: string | Uint8Array = await readFile(file, "utf8")
    let type = SRV.typeFor(file)
    if (transform) ({ body, type } = transform(body, context))
    if (isHtml && typeof body === "string") for (const hook of this.html) body = hook(body, context)
    reply.type(type).send(body)
  }

  /**
   * The `ETag` of a file with `stat`:  its size and modified time, quoted.
   * - cheap (no hashing), and changes on every write that changes the file
   */
  static etagOf(stat: Stats): string {
    return `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`
  }
}

/**
 * `new StaticHandler()` props.
 * - `mounts`:  folders to serve;  `html` / `transforms`:  the hooks (see the class)
 */
export type StaticHandlerProps = {
  mounts?: Mount[]
  html?: HtmlTransform[]
  transforms?: Record<string, FileTransform>
}
