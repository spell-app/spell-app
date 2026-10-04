import { SRV, type Handler, type Next, type RouteParams } from "$/server"

/**
 * Routes requests by method and path to handlers:  the part of Express's `Router` the app's `api.ts` uses.
 * - `get / post / put / patch / delete / all(pattern, ...handlers)`;  `use([prefix], ...handlers)` for middleware
 *   and mounted routers
 * - patterns:
 *   - `/projects/list/:domainId` -- `:name` matches one segment
 *   - `/projects/file/:projectId/:filePath*` -- `:name*` matches the REST of the path, `/`s included
 *   - `*` (alone, or as the last segment) -- anything;  lands in `params["0"]`
 *   - case-insensitive, and a trailing `/` is optional, as in Express
 * - layers run in the order added;  the first that answers wins, the rest are skipped
 * - a handler that throws or rejects ~== `next(error)`:  every layer after it is skipped
 * - NOTE: unlike Express 4, `:name*` holds the WHOLE rest.  Express put only the first segment in `name` and the
 *   rest in `params["0"]`, which broke nested project files (`agents/SUSPECTED-BUGS.md`, `## app`).
 */
export class Router {
  /** every route and middleware, in order */
  private layers: Layer[] = []

  ////////////////
  // ## Adding routes
  ////////////////

  /** run `handlers` for every request under `prefix` (default:  all);  a `Router` among them is mounted there */
  use(...args: [string, ...Routable[]] | Routable[]): this {
    const prefix = typeof args[0] === "string" ? trimSlash(args.shift() as string) : ""
    const handlers = (args as Routable[]).map(asHandler)
    this.layers.push({ prefix, handlers, match: (path) => matchPrefix(prefix, path) })
    return this
  }

  /** answer `GET` (and `HEAD`) requests matching `pattern` */
  get(pattern: string, ...handlers: Routable[]): this {
    return this.route("GET", pattern, handlers)
  }

  /** answer `POST` requests matching `pattern` */
  post(pattern: string, ...handlers: Routable[]): this {
    return this.route("POST", pattern, handlers)
  }

  /** answer `PUT` requests matching `pattern` */
  put(pattern: string, ...handlers: Routable[]): this {
    return this.route("PUT", pattern, handlers)
  }

  /** answer `PATCH` requests matching `pattern` */
  patch(pattern: string, ...handlers: Routable[]): this {
    return this.route("PATCH", pattern, handlers)
  }

  /** answer `DELETE` requests matching `pattern` */
  delete(pattern: string, ...handlers: Routable[]): this {
    return this.route("DELETE", pattern, handlers)
  }

  /** answer requests of any method matching `pattern` */
  all(pattern: string, ...handlers: Routable[]): this {
    return this.route(undefined, pattern, handlers)
  }

  /** add a route layer */
  private route(method: string | undefined, pattern: string, handlers: Routable[]): this {
    this.layers.push({ method, handlers: handlers.map(asHandler), match: compilePattern(pattern) })
    return this
  }

  ////////////////
  // ## Handling
  ////////////////

  /**
   * Handle a request:  this router as a `Handler`, so routers nest.
   * - `out()`:  nothing here answered;  `out(error)`:  a handler failed
   * - SIDE EFFECT:  sets `request.params` per route;  inside a `use(prefix)` layer, `request.url` / `baseUrl` are
   *   relative to the prefix, and restored when it passes the request on
   */
  handle: Handler = (request, reply, out) => {
    let index = 0
    const layers = this.layers
    step()

    /** try the next layer, or leave through `out` */
    function step(error?: unknown): void {
      if (error !== undefined) return out(error)
      const layer = layers[index++]
      if (!layer) return out()
      if (layer.method && layer.method !== request.method && !(layer.method === "GET" && request.method === "HEAD"))
        return step()
      let params: RouteParams | undefined
      try {
        params = layer.match(request.path)
      } catch (failure) {
        return step(failure)
      }
      if (!params) return step()
      if (layer.prefix === undefined) {
        request.params = params
        return runAll(layer.handlers, request, reply, step)
      }
      const { url, baseUrl } = request
      if (layer.prefix) {
        request.baseUrl = baseUrl + layer.prefix
        request.url = url.slice(layer.prefix.length) || "/"
        if (request.url.startsWith("?")) request.url = `/${request.url}`
      }
      runAll(layer.handlers, request, reply, (failure) => {
        request.url = url
        request.baseUrl = baseUrl
        step(failure)
      })
    }
  }
}

/** Something `use()` / a route accepts:  a handler, or a router to mount. */
export type Routable = Handler | Router

/**
 * One route or middleware.
 * - `method`:  `undefined` for any;  `prefix`:  set for `use()` layers (`""` for all paths)
 * - `match`:  the params if the path matches, else `undefined`;  throws an `HttpError` on bad encoding
 */
type Layer = {
  method?: string
  prefix?: string
  handlers: Handler[]
  match: (path: string) => RouteParams | undefined
}

/** `routable` as a plain handler. */
function asHandler(routable: Routable): Handler {
  return routable instanceof Router ? routable.handle : routable
}

/**
 * Run `handlers` in turn, each passing on through `next()`;  after the last, `done()`.
 * - a throw or rejection ~== `next(error)`
 */
export function runAll(handlers: Handler[], request: SRV.Request, reply: SRV.Reply, done: Next): void {
  let index = 0
  next()

  /** run the next handler, or finish */
  function next(error?: unknown): void {
    if (error !== undefined) return done(error)
    const handler = handlers[index++]
    if (!handler) return done()
    try {
      const result = handler(request, reply, next)
      if (result && typeof (result as Promise<unknown>).then === "function")
        (result as Promise<unknown>).then(undefined, (failure) => next(failure ?? new Error("rejected")))
    } catch (failure) {
      next(failure ?? new Error("threw"))
    }
  }
}

/**
 * A matcher for route `pattern`, e.g. `/projects/file/:projectId/:filePath*`.
 * - each param is percent-decoded;  bad encoding throws `HttpError(400)`
 */
export function compilePattern(pattern: string): (path: string) => RouteParams | undefined {
  const names: string[] = []
  let source = ""
  if (pattern === "*") {
    source = "(.*)"
    names.push("0")
  } else {
    for (const segment of trimSlash(pattern).split("/").slice(1)) {
      const param = /^:(\w+)(\*)?$/.exec(segment)
      if (param) {
        names.push(param[1]!)
        source += param[2] ? "/(.+)" : "/([^/]+)"
      } else if (segment === "*") {
        names.push("0")
        source += "(?:/(.*))?"
      } else source += `/${segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
    }
  }
  const regex = new RegExp(`^${source}/?$`, "i")
  return (path) => {
    const match = regex.exec(path)
    if (!match) return undefined
    const params: RouteParams = {}
    names.forEach((name, i) => (params[name] = decodeParam(match[i + 1] ?? "")))
    return params
  }
}

/** Params `{}` if `path` is `prefix` or under it (segment-wise), else `undefined`. */
function matchPrefix(prefix: string, path: string): RouteParams | undefined {
  if (!prefix) return {}
  const lower = path.toLowerCase()
  const want = prefix.toLowerCase()
  return lower === want || lower.startsWith(`${want}/`) ? {} : undefined
}

/** `path` without a trailing `/` (but `/` stays `""` for prefixes). */
function trimSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : path
}

/** `value` percent-decoded;  `HttpError(400)` if it can't be. */
function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new SRV.HttpError(400, `bad encoding in:  ${value}`)
  }
}
