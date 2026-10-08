import type { IncomingHttpHeaders, IncomingMessage } from "node:http"

import type { Query, RouteParams } from "$/server"

/**
 * One incoming request:  the part of Express's `req` our handlers read, over node's `IncomingMessage`.
 * - Express-shaped on purpose (`params`, `query`, `body`, `originalUrl`, `baseUrl`),
 *   so the app's `api.ts` handlers moved over unchanged.
 * - `url` / `baseUrl` change as the request passes into a mounted router (`router.use("/api", api)`):
 *   inside it, `url` is relative to the mount and `baseUrl` is the mount
 * - `originalUrl` never changes
 */
export class Request {
  /** node's request, for streaming or anything not wrapped here */
  readonly raw: IncomingMessage

  /** `GET`, `POST` ... upper-case */
  readonly method: string

  /** path + query exactly as received, e.g. `/api/projects/list/x?y=1` */
  readonly originalUrl: string

  /** path + query relative to the current mount, e.g. `/projects/list/x?y=1` inside `/api` */
  url: string

  /** prefix of the router this request is in, e.g. `/api`;  `""` at the top */
  baseUrl = ""

  /** named parts of the matched route, decoded */
  params: RouteParams = {}

  /**
   * parsed body, when a body parser ran (`SRV.parseBodies`):  object (JSON / form), string (text)
   * - `{}` when there's none, as Express's body-parser leaves it
   */
  // oxlint-disable-next-line typescript/no-explicit-any -- what callers send is theirs to check, as in Express
  body: any = {}

  /** scratch space for handlers further down, e.g. a resolved project */
  readonly locals: Record<string, unknown> = {}

  constructor(raw: IncomingMessage) {
    this.raw = raw
    this.method = (raw.method ?? "GET").toUpperCase()
    this.originalUrl = raw.url ?? "/"
    this.url = this.originalUrl
  }

  /** request headers, lower-case names */
  get headers(): IncomingHttpHeaders {
    return this.raw.headers
  }

  /** path part of `url`, still percent-encoded, e.g. `/projects/list/x` */
  get path(): string {
    const query = this.url.indexOf("?")
    return query < 0 ? this.url : this.url.slice(0, query)
  }

  /** query string as `{ key: value }`;  a repeated key gives an array */
  get query(): Query {
    const query: Query = {}
    const start = this.url.indexOf("?")
    if (start < 0) return query
    for (const [key, value] of new URLSearchParams(this.url.slice(start + 1))) {
      const before = query[key]
      query[key] = before === undefined ? value : Array.isArray(before) ? [...before, value] : [before, value]
    }
    return query
  }

  /** header `name` (any case);  a repeated header is joined with `, ` */
  get(name: string): string | undefined {
    const value = this.raw.headers[name.toLowerCase()]
    return Array.isArray(value) ? value.join(", ") : value
  }

  /** content type without parameters, lower-case, e.g. `application/json`;  `""` if none */
  get contentType(): string {
    return (this.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase()
  }
}
