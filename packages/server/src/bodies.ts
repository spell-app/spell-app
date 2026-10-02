/**
 * Request bodies:  read them with a size limit, and parse them by content type.
 * - Replaces Express's `body-parser` (`json` / `text` / `urlencoded`) plus `express-json5`.
 */
import type { IncomingMessage } from "node:http"

import { SRV, type Handler } from "$/server"

/**
 * How `parseBodies()` reads bodies.
 * - `limit`:  biggest body in bytes (default 1mb);  bigger is 413
 * - `parseJson`:  parses JSON bodies (default `JSON.parse`);  pass `JSON5.parse` for the app's forgiving syntax
 * - `jsonTypes`:  content types parsed as JSON (default `application/json`, `application/json5`, `*+json`)
 */
export type BodyOptions = {
  limit?: number
  parseJson?: (text: string) => unknown
  jsonTypes?: (type: string) => boolean
}

/** Default biggest body. */
export const DEFAULT_BODY_LIMIT = 1024 * 1024

/**
 * Middleware that sets `request.body` from the request's body, for ANY method (DELETE with a JSON body too).
 * - JSON types:  `parseJson(text)`;  unparseable is 400
 * - `text/*`:  the string
 * - `application/x-www-form-urlencoded`:  `{ key: value }`, a repeated key an array
 * - no body, or another type:  left as `{}`, and the body unread
 */
export function parseBodies(options: BodyOptions = {}): Handler {
  const { limit = DEFAULT_BODY_LIMIT, parseJson = JSON.parse, jsonTypes = isJsonType } = options
  return async (request, _reply, next) => {
    if (!hasBody(request.raw)) return next()
    const type = request.contentType
    const json = jsonTypes(type)
    const form = type === "application/x-www-form-urlencoded"
    if (!json && !form && !type.startsWith("text/")) return next()
    const text = (await readBody(request.raw, limit)).toString("utf8")
    if (json) {
      if (text.trim() === "") return next()
      try {
        request.body = parseJson(text)
      } catch (error) {
        throw new SRV.HttpError(400, `bad JSON body:  ${(error as Error).message}`)
      }
    } else if (form) {
      const body: Record<string, string | string[]> = {}
      for (const [key, value] of new URLSearchParams(text)) {
        const before = body[key]
        body[key] = before === undefined ? value : Array.isArray(before) ? [...before, value] : [before, value]
      }
      request.body = body
    } else request.body = text
    next()
  }
}

/**
 * The whole body of `raw`;  rejects with `HttpError(413)` once it passes `limit` bytes.
 * - SIDE EFFECT:  consumes the stream;  read it once
 */
export function readBody(raw: IncomingMessage, limit = DEFAULT_BODY_LIMIT): Promise<Buffer> {
  return new Promise((done, fail) => {
    const declared = Number(raw.headers["content-length"])
    if (declared > limit) return fail(new SRV.HttpError(413, `body over ${limit} bytes`))
    let size = 0
    const chunks: Buffer[] = []
    raw.on("data", (chunk: Buffer) => {
      size += chunk.length
      if (size > limit) {
        fail(new SRV.HttpError(413, `body over ${limit} bytes`))
        raw.removeAllListeners("data")
        raw.resume()
      } else chunks.push(chunk)
    })
    raw.on("end", () => done(Buffer.concat(chunks)))
    raw.on("error", fail)
  })
}

/** Whether a request carries a body:  a `transfer-encoding`, or a `content-length` (even `0`), as `type-is`. */
export function hasBody(raw: IncomingMessage): boolean {
  return raw.headers["transfer-encoding"] !== undefined || !Number.isNaN(Number(raw.headers["content-length"] ?? NaN))
}

/** Whether content type `type` is JSON:  `application/json`, `application/json5`, or `*+json`. */
export function isJsonType(type: string): boolean {
  return type === "application/json" || type === "application/json5" || type.endsWith("+json")
}
