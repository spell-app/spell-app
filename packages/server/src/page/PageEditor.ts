import { readFile, rename, stat, writeFile } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { parse } from "parse5"

import { SRV } from "$/server"

/**
 * Edits pages IN PLACE, for the page server:  `/_server/page`.
 * - `GET ?path=<url path>[&id=<id>][&parent=<tag>][&inner=1]`:  the page's source (or one element's), and its
 *   `ETag`
 * - `PUT ?path=`:  the whole file;  body `text/*` (`text/html`, `text/plain` ...), or JSON `{ html }`
 *   - a page, or any TEXT file (`TEXT_FILE`:  `.md`, `.ts`, `.css`, `.spell` ...;  not `.json`):  what `<ui-code>` /
 *     `<ui-markdown>` save through `SPELL_SERVER.saveFile()`
 * - `PATCH ?path=`:  one element by `id`;  body JSON `{ id, html, inner?, parent? }`
 * - `parent`:  a tag name, e.g. `section`:  the nearest such ANCESTOR of `#id` instead -- a docs section has no
 *   `id` of its own, but its heading does
 * - writes the ORIGINAL file in the checkout, and never commits:  that's for whoever reviews the change
 * - a section edit splices the element's exact byte range (parse5 source locations):  every other byte of the
 *   file stays as it was, so diffs show only the edit
 * - safety:
 *   - writes need the `Guard` token and same origin
 *   - under the root only, through `resolveInside()` (no dot files, no `..`):  `.html` for `PATCH`, any
 *     `TEXT_FILE` for `GET` / `PUT`
 *   - `If-Match` MUST be the `ETag` the page was served with:  if the file changed since (an editor, an agent),
 *     409, and the caller reloads;  missing:  428
 *   - written under `FileLock`, atomically (temp file + rename)
 */
export class PageEditor {
  /** Files `PATCH` edits:  pages. */
  static readonly PAGE_FILE = /\.html?$/i

  /**
   * Files `GET` / `PUT` read and write:  pages and the text files the source elements show.
   * - NOT `.json`:  config (`package.json` holds the page server's own), not content
   */
  static readonly TEXT_FILE = /\.(html?|md|markdown|txt|ts|tsx|js|mjs|cjs|jsx|css|spell|ya?ml|svg)$/i

  /** folder pages live under */
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  /** add the `/_server/page` routes to `router`, guarded by `guard`;  bodies up to 10mb */
  route(router: SRV.Router, guard: SRV.Guard): void {
    const body = SRV.parseBodies({ limit: 10 * 1024 * 1024 })
    router.get("/_server/page", (request, reply) => this.read(request, reply))
    router.put("/_server/page", guard.writeCheck, body, (request, reply) => this.write(request, reply, "put"))
    router.patch("/_server/page", guard.writeCheck, body, (request, reply) => this.write(request, reply, "patch"))
  }

  /** answer `GET`:  `{ path, etag, html }` */
  private async read(request: SRV.Request, reply: SRV.Reply): Promise<void> {
    const { path, file } = this.pageFile(request, PageEditor.TEXT_FILE)
    const source = await readFile(file, "utf8")
    const etag = SRV.StaticHandler.etagOf(await stat(file))
    const id = one(request.query.id)
    const range = id ? findById(source, id, one(request.query.parent)) : undefined
    const html = range ? sliceOf(source, range, Boolean(one(request.query.inner))) : source
    reply.set("Cache-Control", "no-store").json({ path, etag, html })
  }

  /** answer `PUT` / `PATCH`:  `{ path, etag }`, the file's new `ETag` */
  private async write(request: SRV.Request, reply: SRV.Reply, how: "put" | "patch"): Promise<void> {
    const { path, file } = this.pageFile(request, how === "put" ? PageEditor.TEXT_FILE : PageEditor.PAGE_FILE)
    const expected = request.get("if-match")
    if (!expected) throw new SRV.HttpError(428, "If-Match required:  send the ETag the page was served with")
    const body = request.body as string | { html?: unknown; id?: unknown; inner?: unknown; parent?: unknown }
    const etag = await SRV.FileLock.runAsync(file, async () => {
      const current = SRV.StaticHandler.etagOf(await stat(file))
      if (current !== expected)
        throw new SRV.HttpError(409, "the page changed since it was loaded:  reload it", {
          error: "the page changed since it was loaded:  reload it",
          etag: current
        })
      const source = await readFile(file, "utf8")
      let next: string
      if (how === "put") {
        next = typeof body === "string" ? body : typeof body.html === "string" ? body.html : ""
        if (!next.trim()) throw new SRV.HttpError(400, "nothing to write")
      } else {
        if (typeof body !== "object" || typeof body.id !== "string" || typeof body.html !== "string")
          throw new SRV.HttpError(400, "PATCH body must be JSON { id, html, inner?, parent? }")
        const parent = typeof body.parent === "string" ? body.parent : undefined
        next = replaceById(source, body.id, body.html, Boolean(body.inner), parent)
      }
      const temp = join(dirname(file), `.${basename(file)}.${process.pid}.tmp`)
      await writeFile(temp, next)
      await rename(temp, file)
      return SRV.StaticHandler.etagOf(await stat(file))
    })
    reply.set("Cache-Control", "no-store").json({ path, etag })
  }

  /** the file a request names in `?path=`:  one under the root that `allowed` matches, or an `HttpError` */
  private pageFile(request: SRV.Request, allowed: RegExp): { path: string; file: string } {
    const asked = one(request.query.path)
    if (!asked) throw new SRV.HttpError(400, "?path= required, e.g. /pages/index.html")
    const path = asked.startsWith("/") ? asked : `/${asked}`
    const resolved = SRV.resolveInside(this.root, path, { index: false })
    if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
    if ("redirect" in resolved || !allowed.test(resolved.file))
      throw new SRV.HttpError(
        400,
        `can't edit ${path}:  ${allowed === PageEditor.PAGE_FILE ? "not an .html page" : "not a text file"}`
      )
    return { path, file: resolved.file }
  }
}

/**
 * Where one element sits in a page's source:  character offsets.
 * - `start` / `end`:  the whole element, tags included
 * - `innerStart` / `innerEnd`:  its content;  `undefined` for an element with no end tag
 */
export type ElementRange = { start: number; end: number; innerStart?: number; innerEnd?: number }

/**
 * The range of the ONE element with `id="<id>"` in `source` -- or, with `parent` (a tag name), of its nearest
 * `<parent>` ancestor.
 * - none:  `HttpError(404)`;  several:  `HttpError(409)` -- an edit must name exactly one
 * - looks inside `<template>`s too
 */
export function findById(source: string, id: string, parent?: string): ElementRange {
  const found: Parse5Node[] = []
  const ancestors: Parse5Node[] = []
  visit(parse(source, { sourceCodeLocationInfo: true }) as unknown as Parse5Node)
  if (!found.length) throw new SRV.HttpError(404, `no element with id "${id}"`)
  if (found.length > 1) throw new SRV.HttpError(409, `${found.length} elements with id "${id}":  ids must be unique`)
  const location = found[0]!.sourceCodeLocation!
  return {
    start: location.startOffset,
    end: location.endOffset,
    innerStart: location.endTag ? location.startTag?.endOffset : undefined,
    innerEnd: location.endTag?.startOffset
  }

  /** collect matching elements (or their `parent`s) under `node` */
  function visit(node: Parse5Node): void {
    if (node.sourceCodeLocation && node.attrs?.some((attr) => attr.name === "id" && attr.value === id)) {
      const match = parent ? [...ancestors].reverse().find((each) => each.tagName === parent.toLowerCase()) : node
      if (!match?.sourceCodeLocation) throw new SRV.HttpError(404, `#${id} has no <${parent}> around it`)
      found.push(match)
    }
    ancestors.push(node)
    for (const child of node.childNodes ?? []) visit(child)
    if (node.content) visit(node.content)
    ancestors.pop()
  }
}

/**
 * `source` with the element `#id` (or its `parent` ancestor) replaced by `html` (or, `inner`, its content).
 * - every other character is kept as it was
 */
export function replaceById(source: string, id: string, html: string, inner = false, parent?: string): string {
  const range = findById(source, id, parent)
  const [start, end] = inner ? [range.innerStart, range.innerEnd] : [range.start, range.end]
  if (start === undefined || end === undefined) throw new SRV.HttpError(400, `#${id} has no end tag:  edit it whole`)
  return source.slice(0, start) + html + source.slice(end)
}

/** The markup of `range` in `source`:  the whole element, or (`inner`) its content. */
function sliceOf(source: string, range: ElementRange, inner: boolean): string {
  if (!inner) return source.slice(range.start, range.end)
  if (range.innerStart === undefined || range.innerEnd === undefined) return ""
  return source.slice(range.innerStart, range.innerEnd)
}

/** The first value of a query parameter. */
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** The parts of a parse5 node `findById()` reads. */
type Parse5Node = {
  tagName?: string
  attrs?: { name: string; value: string }[]
  childNodes?: Parse5Node[]
  content?: Parse5Node
  sourceCodeLocation?: {
    startOffset: number
    endOffset: number
    startTag?: { endOffset: number }
    endTag?: { startOffset: number }
  }
}
