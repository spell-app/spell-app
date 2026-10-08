import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import type { OutgoingHttpHeader, ServerResponse } from "node:http"
import { basename, isAbsolute } from "node:path"

import { SRV } from "$/server"

/**
 * The answer to one request:  the part of Express's `res` our handlers use, over node's `ServerResponse`.
 * - Express-shaped on purpose (`status().send()`, `set`, `type`, `json`, `sendFile`, `headersSent`),
 *   so the app's `api.ts` handlers moved over unchanged.
 * - `send()` picks a content type only when none is set:  set one first (`type()` / `set()`) to override,
 *   e.g. `sendTextFile()` serves a `.spell` file as `text/plain`.
 */
export class Reply {
  /** node's response, for streaming or anything not wrapped here */
  readonly raw: ServerResponse

  constructor(raw: ServerResponse) {
    this.raw = raw
  }

  /** status code so far (default 200) */
  get statusCode(): number {
    return this.raw.statusCode
  }

  /** whether headers went out already:  too late to change status or send an error */
  get headersSent(): boolean {
    return this.raw.headersSent
  }

  /** set the status code;  chainable */
  status(code: number): this {
    this.raw.statusCode = code
    return this
  }

  /**
   * Set header `name` to `value`, or every header in `headers`;  chainable.
   * - a text `Content-Type` without a charset gets `; charset=utf-8`, as Express's `res.set()` does:
   *   `text/*`, `application/json`, `application/javascript`
   */
  set(name: string, value: OutgoingHttpHeader): this
  set(headers: Record<string, OutgoingHttpHeader>): this
  set(name: string | Record<string, OutgoingHttpHeader>, value?: OutgoingHttpHeader): this {
    if (typeof name !== "string") {
      for (const [key, each] of Object.entries(name)) this.set(key, each)
      return this
    }
    if (name.toLowerCase() === "content-type" && typeof value === "string") value = withCharset(value)
    this.raw.setHeader(name, value!)
    return this
  }

  /** header `name` as set so far */
  get(name: string): OutgoingHttpHeader | undefined {
    return this.raw.getHeader(name)
  }

  /** set the content type:  a type (`text/javascript`) or a short name (`json`, `.html`);  chainable */
  type(type: string): this {
    return this.set("Content-Type", SRV.typeNamed(type))
  }

  /**
   * Send `body` and end the response.
   * - string:  `text/html` unless a type is set (as Express)
   * - `Uint8Array` / `Buffer`:  `application/octet-stream` unless set
   * - anything else (object, array, number, boolean):  JSON, via `json()`
   * - `undefined` / `null`:  an empty body
   * - HEAD requests get the headers only
   */
  send(body?: unknown): this {
    if (body === undefined || body === null) return this.finish("")
    if (typeof body === "string") {
      if (!this.get("Content-Type")) this.type("text/html; charset=utf-8")
      return this.finish(body)
    }
    if (body instanceof Uint8Array) {
      if (!this.get("Content-Type")) this.type("application/octet-stream")
      return this.finish(body)
    }
    return this.json(body)
  }

  /** send `value` as JSON;  keeps a content type already set */
  json(value: unknown): this {
    if (!this.get("Content-Type")) this.type("application/json; charset=utf-8")
    return this.finish(JSON.stringify(value) ?? "null")
  }

  /** redirect to `location` (default 302) */
  redirect(location: string, status = 302): this {
    this.status(status).set("Location", location)
    return this.finish("")
  }

  /**
   * Stream the file at absolute `path`;  resolves when it's sent (or answered with an error).
   * - content type from the extension, unless one is set
   * - `dotfiles`:  what a name starting with `.` gets (only the file's own name counts, not its folders)
   *   - `"ignore"` (default, as Express's `send` without the option):  404
   *   - `"deny"`:  403
   *   - `"allow"`:  served
   * - missing file:  404 `Not found`, unless headers already went
   */
  async sendFile(path: string, { dotfiles = "ignore" }: SendFileOptions = {}): Promise<void> {
    if (!isAbsolute(path)) throw new TypeError(`sendFile():  path must be absolute:  ${path}`)
    if (basename(path).startsWith(".") && dotfiles !== "allow") {
      this.status(dotfiles === "deny" ? 403 : 404).type("text/plain; charset=utf-8")
      this.finish(dotfiles === "deny" ? "Forbidden" : "Not found")
      return
    }
    const stats = await stat(path).catch(() => undefined)
    if (!stats?.isFile()) {
      if (!this.headersSent) this.status(404).type("text/plain; charset=utf-8").finish("Not found")
      return
    }
    if (!this.get("Content-Type")) this.type(SRV.typeFor(path))
    this.set("Content-Length", stats.size)
    if (this.raw.req?.method === "HEAD") return void this.raw.end()
    await new Promise<void>((done) => {
      const stream = createReadStream(path)
      stream.on("error", () => {
        if (!this.headersSent) this.status(500).type("text/plain; charset=utf-8").finish("Read failed")
        else this.raw.destroy()
        done()
      })
      stream.on("end", () => done())
      stream.pipe(this.raw)
    })
  }

  /** end the response with nothing more */
  end(): this {
    this.raw.end()
    return this
  }

  /** write `body` with its length and end;  HEAD gets the headers only */
  private finish(body: string | Uint8Array): this {
    if (this.raw.writableEnded) return this
    this.set("Content-Length", typeof body === "string" ? Buffer.byteLength(body) : body.byteLength)
    if (this.raw.req?.method === "HEAD") this.raw.end()
    else this.raw.end(body)
    return this
  }
}

/** `type` with `; charset=utf-8` added when it's text and has none. */
function withCharset(type: string): string {
  if (/;\s*charset=/i.test(type) || !/^(text\/|application\/(json|javascript)\b)/i.test(type)) return type
  return `${type}; charset=utf-8`
}

/** How `Reply.sendFile()` treats a file whose name starts with `.`. */
export type SendFileOptions = { dotfiles?: "allow" | "deny" | "ignore" }
