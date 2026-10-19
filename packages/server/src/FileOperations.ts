import { existsSync, lstatSync, statSync } from "node:fs"
import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { basename, dirname, join, relative, resolve } from "node:path"

import { SRV } from "$/server"

/**
 * Changes files and folders on disk:  save, create, rename, duplicate, delete.
 * - Two ways in:
 *   - in-process, on ABSOLUTE paths:  the static methods (`FileOperations.save(file, contents)` ...)
 *     - they check no list of writable folders:  that's the caller's job
 *     - spaces saves its projects' files this way, and the page editor its pages
 *   - over HTTP, for pages the server served:  `/api/files` (`route()`), on URL paths,
 *     and ONLY inside the folders of a `writable` list (the page server's:  the shared content folders).
 *     The page editor (`/api/pages`) checks its writes against the same list (`writableFile()`).
 *     - those folders are in `root`, or in the content folder once the page server serves one (`content`)
 * - Every change is made under the file's `FileLock`, so tools writing the same file take turns.
 * - A save is all at once:  a temp file beside the file, then a rename,
 *   so a reader never sees half a file.
 * - Knows files and folders only:  nothing of pages, projects, people or orgs.
 * - Node built-ins only, like the rest of `$/server`.
 */
export class FileOperations {
  /** checkout the URL paths are under */
  readonly root: string

  /**
   * the shared content folder, once the page server serves one (`PageServer.serveContent()`):
   * the `writable` folders are ITS folders from then on, not `root`'s
   * - so `/epics/x/x.plan.html` is written in `<content>/epics/x/`, with no `epics` link in the checkout
   */
  content?: string

  /** the `writable` folders' names, relative to `writableRoot` */
  private writableNames: string[]

  constructor({ root, writable = [] }: FileOperationsProps) {
    this.root = resolve(root)
    this.writableNames = writable
  }

  /** folder the `writable` folders are in:  `content` once set, else `root` */
  get writableRoot(): string {
    return this.content ?? this.root
  }

  /** absolute folders `/api/files` may change things in;  nothing outside them */
  get writable(): string[] {
    return this.writableNames.map((folder) => resolve(this.writableRoot, folder))
  }

  ////////////////
  // ## HTTP
  ////////////////

  /**
   * Add the `/api/files` routes to `router`:  every one is a write,
   * so each needs `guard`'s strong check (this run's token, the server's own origin).
   * - `PUT /api/files?path=<url path>`:  save the whole file
   *   - body:  the contents (`text/*`, or JSON `{ contents }`)
   *   - `If-Match` optional
   * - `POST /api/files/create`:  `{ path, contents? }`, or `{ path, folder: true }`
   * - `POST /api/files/rename`:  `{ path, to }`
   * - `POST /api/files/duplicate`:  `{ path, to }`
   * - `DELETE /api/files?path=<url path>`
   * - Each answers `{ path }`, plus `etag` for a file saved or created;  `rename` / `duplicate` name `to`.
   * - Reading is the file's plain URL:  no route here.
   * - Bodies up to 10mb.
   */
  route(router: SRV.Router, guard: SRV.Guard): this {
    const body = SRV.parseBodies({ limit: 10 * 1024 * 1024 })
    const writes = [guard.writeCheck, body]
    router.put(FileOperations.PREFIX, ...writes, (request, reply) => this.request_save(request, reply))
    router.post(`${FileOperations.PREFIX}/create`, ...writes, (request, reply) => this.request_create(request, reply))
    router.post(`${FileOperations.PREFIX}/rename`, ...writes, (request, reply) => this.request_rename(request, reply))
    router.post(`${FileOperations.PREFIX}/duplicate`, ...writes, (request, reply) =>
      this.request_duplicate(request, reply)
    )
    router.delete(FileOperations.PREFIX, ...writes, (request, reply) => this.request_delete(request, reply))
    return this
  }

  /**
   * `PUT /api/files?path=<url path>` -- save the whole file, making its folders.
   * - Client sends:  the contents as `text/*`, or JSON `{ contents }`;  `If-Match`, optional:  the `ETag` it loaded
   * - Returns:  `{ path, etag }`, the file's new `ETag`
   * - Failure:  400 no contents;  403 not writable;  409 the file changed since (with `If-Match`)
   */
  private async request_save(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const { path, file } = this.writableFile(request.query.path)
    const body = request.body as string | { contents?: unknown }
    const contents = typeof body === "string" ? body : body.contents
    if (typeof contents !== "string")
      throw new SRV.HttpError(400, "nothing to save:  send the contents as text, or as JSON { contents }")
    const etag = await FileOperations.save(file, contents, { ifMatch: request.get("if-match") })
    reply.set("Cache-Control", "no-store").json({ path, etag })
  }

  /**
   * `POST /api/files/create` -- a new file or folder, making its folders.
   * - Client sends:  `{ path, contents? }` (a file, `""` by default), or `{ path, folder: true }`
   * - Returns:  `{ path, etag }` for a file, `{ path }` for a folder
   * - Failure:  403 not writable;  409 something is there
   */
  private async request_create(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const body = request.body as { path?: unknown; contents?: unknown; folder?: unknown }
    const { path, file } = this.writableFile(body.path)
    const contents = typeof body.contents === "string" ? body.contents : undefined
    const etag = await FileOperations.create(file, { contents, folder: body.folder === true })
    reply.set("Cache-Control", "no-store").json({ path, etag })
  }

  /**
   * `POST /api/files/rename` -- move a file or folder, making the target's folders.
   * - Client sends:  `{ path, to }`
   * - Returns:  `{ path, to }`
   * - Failure:  400 a folder into itself;  403 either not writable;  404 `path` missing;  409 `to` is there
   */
  private async request_rename(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const { from, to } = this.writablePair(request.body)
    await FileOperations.rename(from.file, to.file)
    reply.set("Cache-Control", "no-store").json({ path: from.path, to: to.path })
  }

  /**
   * `POST /api/files/duplicate` -- copy a file or folder, everything inside.
   * - Client sends:  `{ path, to }`
   * - Returns:  `{ path, to }`
   * - Failure:  400 a folder into itself;  403 either not writable;  404 `path` missing;  409 `to` is there
   */
  private async request_duplicate(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const { from, to } = this.writablePair(request.body)
    await FileOperations.duplicate(from.file, to.file)
    reply.set("Cache-Control", "no-store").json({ path: from.path, to: to.path })
  }

  /**
   * `DELETE /api/files?path=<url path>` -- delete a file or folder, everything inside.
   * - Returns:  `{ path }`
   * - Failure:  403 not writable;  404 missing
   */
  private async request_delete(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const { path, file } = this.writableFile(request.query.path)
    await FileOperations.delete(file)
    reply.set("Cache-Control", "no-store").json({ path })
  }

  /**
   * The file a request names by URL path:  under `writableRoot`, inside a `writable` folder, there or not.
   * - throws `HttpError`:  400 no path or a bad one;  403 `..`, a dot file, or not in a `writable` folder
   *   (nor a `writable` folder itself)
   * - the page editor (`/api/pages`) holds its writes to the same list through this
   */
  writableFile(asked: unknown): { path: string; file: string } {
    const one = Array.isArray(asked) ? (asked[0] as unknown) : asked
    if (typeof one !== "string" || !one)
      throw new SRV.HttpError(400, "a path is required, e.g. /guides/server/notes.md")
    const path = one.startsWith("/") ? one : `/${one}`
    const file = SRV.fileInside(this.writableRoot, path)
    const writable = this.writable
    if (!writable.some((folder) => file !== folder && SRV.isInside(folder, file))) {
      const folders = writable.map((folder) => `${relative(this.writableRoot, folder)}/`).join(", ")
      throw new SRV.HttpError(
        403,
        `can't change ${path}:  only files in ${folders || "no folders"} can be changed here`
      )
    }
    return { path, file }
  }

  /** `{ path, to }` from a request's body, both writable;  throws as `writableFile()` */
  private writablePair(body: unknown): Record<"from" | "to", { path: string; file: string }> {
    const { path, to } = body as { path?: unknown; to?: unknown }
    if (typeof to !== "string" || !to) throw new SRV.HttpError(400, "send JSON { path, to }")
    return { from: this.writableFile(path), to: this.writableFile(to) }
  }

  ////////////////
  // ## In-process
  ////////////////

  /**
   * Save `file` whole, making its folders;  returns its new `ETag` (`StaticHandler.etagOf()`).
   * - `contents`:  the new contents, or a function of the current ones (`""` for a new file),
   *   called holding the lock, so nobody writes in between (the page editor's section edits)
   * - `ifMatch`:  the `ETag` the caller loaded;  the file changed since (or is gone):
   *   `HttpError(409)`, with body `{ error, etag }`, the current `ETag`
   * - all at once:  `writeAtomic()`, under the file's lock
   * - throws whatever `contents()` throws, e.g. an `HttpError(400)`
   */
  static async save(file: string, contents: FileContents, { ifMatch }: FileSaveOptions = {}): Promise<string> {
    await mkdir(dirname(file), { recursive: true })
    return SRV.FileLock.runAsync(file, async () => {
      if (ifMatch !== undefined) {
        const current = FileOperations.etagFor(file)
        if (current !== ifMatch)
          throw new SRV.HttpError(409, FileOperations.CHANGED, { error: FileOperations.CHANGED, etag: current })
      }
      const next = typeof contents === "function" ? contents(await FileOperations.readText(file)) : contents
      await FileOperations.writeAtomic(file, next)
      return FileOperations.etagFor(file)!
    })
  }

  /**
   * Make a new file (`contents`, `""` by default) or, with `folder`, a new folder;  makes its folders.
   * - Returns the new file's `ETag`;  `undefined` for a folder.
   * - throws `HttpError(409)` if something is there
   */
  static async create(
    file: string,
    { contents = "", folder = false }: FileCreateOptions = {}
  ): Promise<string | undefined> {
    await mkdir(dirname(file), { recursive: true })
    return SRV.FileLock.runAsync(file, async () => {
      FileOperations.dieIfThere(file)
      if (folder) {
        await mkdir(file)
        return undefined
      }
      await FileOperations.writeAtomic(file, contents)
      return FileOperations.etagFor(file)
    })
  }

  /**
   * Move a file or folder to `to`, making `to`'s folders.
   * - holds both their locks:  `file`'s, then `to`'s
   * - across disks, copies then deletes
   * - throws `HttpError`:  404 `file` missing;  409 `to` is there;  400 a folder into itself
   */
  static async rename(file: string, to: string): Promise<void> {
    FileOperations.dieIfMissing(file)
    FileOperations.dieIfInside(file, to)
    await mkdir(dirname(to), { recursive: true })
    await SRV.FileLock.runAsync(file, () =>
      SRV.FileLock.runAsync(to, async () => {
        FileOperations.dieIfMissing(file)
        FileOperations.dieIfThere(to)
        try {
          await rename(file, to)
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "EXDEV") throw error
          await cp(file, to, { recursive: true, errorOnExist: true, force: false })
          await rm(file, { recursive: true })
        }
      })
    )
  }

  /**
   * Copy a file or folder to `to`, everything inside, making `to`'s folders.
   * - holds `to`'s lock
   * - throws `HttpError`:  404 `file` missing;  409 `to` is there;  400 a folder into itself
   */
  static async duplicate(file: string, to: string): Promise<void> {
    FileOperations.dieIfMissing(file)
    FileOperations.dieIfInside(file, to)
    await mkdir(dirname(to), { recursive: true })
    await SRV.FileLock.runAsync(to, async () => {
      FileOperations.dieIfThere(to)
      await cp(file, to, { recursive: true, errorOnExist: true, force: false })
    })
  }

  /**
   * Delete a file or folder, everything inside.
   * - a link is deleted itself, never what it points to
   * - throws `HttpError(404)` if nothing is there
   */
  static async delete(file: string): Promise<void> {
    FileOperations.dieIfMissing(file)
    await SRV.FileLock.runAsync(file, async () => {
      FileOperations.dieIfMissing(file)
      await rm(file, { recursive: true })
    })
  }

  /**
   * Write `file` all at once:  a temp file beside it (`.<name>.<pid>.tmp`), then a rename over it.
   * - takes NO lock:  call it holding the file's `FileLock` (`save()` does)
   * - the folder must be there
   */
  static async writeAtomic(file: string, contents: string | Buffer): Promise<void> {
    const temp = join(dirname(file), `.${basename(file)}.${process.pid}.tmp`)
    await writeFile(temp, contents)
    await rename(temp, file)
  }

  ////////////////
  // ## Internal
  ////////////////

  /** `file`'s `ETag`, as `StaticHandler` serves it;  `undefined` if it's not there */
  private static etagFor(file: string): string | undefined {
    const found = statSync(file, { throwIfNoEntry: false })
    return found ? SRV.StaticHandler.etagOf(found) : undefined
  }

  /** `file`'s text;  `""` if it's not there */
  private static async readText(file: string): Promise<string> {
    return existsSync(file) ? readFile(file, "utf8") : ""
  }

  /** `HttpError(404)` unless something is at `file` (a link counts, even a broken one) */
  private static dieIfMissing(file: string): void {
    if (!lstatSync(file, { throwIfNoEntry: false })) throw new SRV.HttpError(404, `nothing at ${file}`)
  }

  /** `HttpError(409)` if something is at `file` */
  private static dieIfThere(file: string): void {
    if (lstatSync(file, { throwIfNoEntry: false })) throw new SRV.HttpError(409, `${file} is already there`)
  }

  /** `HttpError(400)` if `to` is `file` or inside it:  a folder can't go into itself */
  private static dieIfInside(file: string, to: string): void {
    if (SRV.isInside(resolve(file), resolve(to)))
      throw new SRV.HttpError(400, `can't put ${file} inside itself:  pick a place outside it`)
  }

  /** where `route()` listens */
  static readonly PREFIX = "/api/files"

  /** the 409 when an `If-Match` fails */
  static readonly CHANGED = "the file changed since it was loaded:  reload it"
}

/**
 * `new FileOperations()` props.
 * - `root`:  folder URL paths are under (the checkout)
 * - `writable`:  folders, relative to `root`, that `/api/files` may change things in;  none by default
 *   - relative to the content folder instead, once it's set (`FileOperations.content`)
 */
export type FileOperationsProps = { root: string; writable?: string[] }

/** What `FileOperations.save()` writes:  the contents, or a function of the current ones. */
export type FileContents = string | Buffer | ((current: string) => string | Buffer)

/**
 * `FileOperations.save()` options.
 * - `ifMatch`:  the `ETag` the caller loaded the file with;  changed since:  409
 */
export type FileSaveOptions = { ifMatch?: string }

/**
 * `FileOperations.create()` options.
 * - `contents`:  a new file's contents (default `""`)
 * - `folder`:  make a folder instead
 */
export type FileCreateOptions = { contents?: string | Buffer; folder?: boolean }
