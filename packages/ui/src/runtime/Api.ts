import { ApiError, type ApiRequest, type ApiUrlData } from "./runtime.types"

/**
 * `fetch()` with Fomantic's API-behaviour conveniences, as `UI.api`:  URL templates, throttling, abort.
 * - URL templates (`url()`):
 *   - `{name}` is REQUIRED -- a missing value throws, so a half-built URL never goes out
 *   - `{/name}` is an OPTIONAL path segment (RFC 6570 style):  `/value` when present, nothing when missing.
 *     A `/` just before it is absorbed, so Fomantic's `/users/{/id}` and RFC-style `/users{/id}` both give
 *     `/users/5` or `/users`
 *   - values are URI-encoded
 * - Throttling (`throttle` ms, Fomantic's search-as-you-type debounce):  the request waits;  a newer request
 *   with the same `key` supersedes it -- still waiting, or already in flight -- and the older one rejects with
 *   an `AbortError`.  Callers typically ignore `AbortError`s.
 * - Abort:  the caller's `signal`, the throttle's and `timeout` are combined with `AbortSignal.any`.
 * - Errors:  a non-2xx response rejects with `ApiError` (`cause.response`, body unread).
 * - TODO: loading / error state on a context element (Fomantic's `stateContext`) lands with the first
 *   component that needs it.
 */
export class Api {
  /** throttle key -> newest request's controller;  aborting it supersedes that request */
  private readonly latest = new Map<string, AbortController>()

  /**
   * Fill URL template `template` from `data` -- see class docs.
   * - Throws `Error("Missing a required URL parameter: <name>")` for a missing `{name}`.
   */
  url(template: string, data: ApiUrlData = {}): string {
    let url = template.replace(REQUIRED_SLOT, (_slot, name: string) => {
      const value = data[name]
      if (value === undefined || value === null) {
        throw new Error(`Missing a required URL parameter: ${name} (in ${template})`)
      }
      return encodeURIComponent(String(value))
    })
    url = url.replace(OPTIONAL_SLOT, (_slot, name: string) => {
      const value = data[name]
      return value === undefined || value === null ? "" : `/${encodeURIComponent(String(value))}`
    })
    return url
  }

  /**
   * Send a request;  resolves with the parsed body -- see `ApiRequest` and class docs.
   * - `T` is what the caller expects the body to be;  NOT validated.
   */
  async request<T = unknown>(options: ApiRequest): Promise<T> {
    const { method = "GET", throttle = 0, timeout, headers, responseType = "auto" } = options
    let url = this.url(options.url, options.urlData)
    const controller = new AbortController()
    const key = options.key ?? options.url
    if (throttle > 0) {
      this.latest.get(key)?.abort(new DOMException("Superseded by a newer request", "AbortError"))
      this.latest.set(key, controller)
    }
    const signals = [controller.signal, options.signal, timeout ? AbortSignal.timeout(timeout) : undefined]
    const signal = AbortSignal.any(signals.filter((each): each is AbortSignal => !!each))
    try {
      if (throttle > 0) await this.delay(throttle, signal)
      const init: RequestInit = { method, headers: new Headers(headers), signal }
      if (method === "GET" || method === "HEAD") url = this.withQuery(url, options.data)
      else this.setBody(init, options.data)
      const response = await fetch(url, init)
      if (!response.ok) {
        const answer = `${response.status} ${response.statusText}`.trim()
        throw new ApiError(`Api.request():  ${method} ${url} answered ${answer}`, { cause: { response } })
      }
      return (await this.read(response, method, responseType)) as T
    } finally {
      if (this.latest.get(key) === controller) this.latest.delete(key)
    }
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Wait `ms`, rejecting early with the signal's reason if it aborts. */
  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(signal.reason)
      const timer = setTimeout(resolve, ms)
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer)
          reject(signal.reason)
        },
        { once: true }
      )
    })
  }

  /** Append plain-object `data` to `url` as query parameters;  arrays repeat the key, `null` / `undefined` skip. */
  private withQuery(url: string, data: unknown): string {
    if (!this.isPlainObject(data)) return url
    const params = new URLSearchParams()
    for (const [name, value] of Object.entries(data)) {
      for (const each of Array.isArray(value) ? value : [value]) {
        if (each !== undefined && each !== null) params.append(name, String(each))
      }
    }
    const query = params.toString()
    if (!query) return url
    return url + (url.includes("?") ? "&" : "?") + query
  }

  /** Body for non-GET requests:  plain objects / arrays as JSON, anything `fetch` understands as-is. */
  private setBody(init: RequestInit, data: unknown) {
    if (data === undefined) return
    if (this.isPlainObject(data) || Array.isArray(data)) {
      init.body = JSON.stringify(data)
      const headers = init.headers as Headers
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
    } else {
      init.body = data as BodyInit
    }
  }

  /** Parse the body per `responseType`;  `undefined` for `HEAD` / `204`. */
  private async read(response: Response, method: string, type: ApiRequest["responseType"]): Promise<unknown> {
    if (type === "response") return response
    if (method === "HEAD" || response.status === 204) return undefined
    if (type === "json") return response.json()
    if (type === "text") return response.text()
    const contentType = response.headers.get("Content-Type") ?? ""
    return /[/+]json\b/.test(contentType) ? response.json() : response.text()
  }

  /** Is `value` a `{...}` object (not a class instance like `FormData` / `Blob`)? */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== "object") return false
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
  }
}

/** `{name}` template slot. */
const REQUIRED_SLOT = /\{([\w-]+)\}/g

/** `{/name}` template slot, including the `/` just before it (if any), which the replacement re-supplies. */
const OPTIONAL_SLOT = /\/?\{\/([\w-]+)\}/g
