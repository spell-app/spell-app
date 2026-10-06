import {
  SourceError,
  type SourceLoadOptions,
  type SourceSaveRequest,
  type SourceSaveResult,
  type SourceSaver,
  type SourceText
} from "./runtime.types"

/****************
 * ### `Sources`
 * Text files elements show and save, as `UI.sources`:  `<ui-include>`, `<ui-code>` and `<ui-markdown>` load their
 * `source` here, and `save()` goes back through here.
 * - In the runtime's lazy chunk;  imports only `./runtime.types`.  `SourceElement` (the elements' base) calls it.
 * - Same origin ONLY:  a URL on another origin is refused before any fetch (`SourceError` `cross-origin`), and so
 *   is everything on a `file://` page (`file-protocol`), whose fetches the browser blocks anyway.  Why:  included
 *   markup runs in this page, and a save must go to the server that served it.
 * - Cached per absolute URL, as the in-flight PROMISE, so elements asking for the same file share one fetch;
 *   `load(url, { fresh: true })` fetches again, `forget()` drops entries.  A failed fetch isn't cached.
 * - A caller's `signal` aborts only ITS wait:  the shared fetch carries on for the others.
 * - Saving:  `save()` hands the text to `saver`, which a host page registers (`ui` can't know the server);  none
 *   registered rejects with `no-saver`.  A successful save updates the cache, so the next `load()` sees it.
 * - NOTE: `ETag`s come from the response headers;  a server that sends none still loads, but its saver gets
 *   `etag: undefined` and can't detect a conflict.
 ****************/
export class Sources {
  /** writes text back;  set by the host page, e.g. the docs runtime on the page server */
  saver?: SourceSaver

  /** absolute URL -> its load, in flight or done */
  private readonly cache = new Map<string, Promise<SourceText>>()

  ////////////////
  // ## URLs
  ////////////////

  /**
   * Absolute URL of `source`, against `base` (default the document's), if this page may load it.
   * - Throws `SourceError`:  `file-protocol` on a `file://` page;  `cross-origin` for another origin.
   */
  resolve(source: string, base: string = document.baseURI): URL {
    if (location.protocol === "file:") {
      throw new SourceError(`Sources.resolve():  can't reach ${source} from a page opened from disk;  serve the page`, {
        cause: { kind: "file-protocol" }
      })
    }
    const url = new URL(source, base)
    if (url.origin !== location.origin) {
      throw new SourceError(`Sources.resolve():  ${url.href} is on another origin;  serve it from ${location.origin}`, {
        cause: { kind: "cross-origin" }
      })
    }
    return url
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * Fetch `source` (relative to the document), cached;  resolves with its text, `ETag` and type.
   * - Rejects with `SourceError` (`cross-origin`, `file-protocol`, `load`), or an `AbortError` when `signal`
   *   aborts first.
   */
  load(source: string, { fresh, signal }: SourceLoadOptions = {}): Promise<SourceText> {
    let url: URL
    try {
      url = this.resolve(source)
    } catch (error) {
      return Promise.reject(error)
    }
    const key = url.href
    let pending = fresh ? undefined : this.cache.get(key)
    if (!pending) {
      pending = this.fetch(key)
      this.cache.set(key, pending)
      // a failure isn't cached:  the next caller tries again
      pending.catch(() => {
        if (this.cache.get(key) === pending) this.cache.delete(key)
      })
    }
    return signal ? Sources.abortable(pending, signal) : pending
  }

  /** Drop `source`'s cache entry, or every entry. */
  forget(source?: string) {
    if (source === undefined) this.cache.clear()
    else this.cache.delete(new URL(source, document.baseURI).href)
  }

  /**
   * GET `url` (no cache, no credentials beyond same-origin) as `SourceText`.
   * - Throws a `load` `SourceError`, the network error (if any) as `cause.error`;  messages say `Sources.load()`,
   *   the method its callers called.
   */
  private async fetch(url: string): Promise<SourceText> {
    let response: Response
    try {
      response = await fetch(url, { cache: "no-cache" })
    } catch (error) {
      const said = error instanceof Error ? error.message : String(error)
      throw new SourceError(`Sources.load():  ${url} didn't answer (${said});  is its server up?`, {
        cause: { kind: "load", error }
      })
    }
    if (!response.ok) {
      const answer = `${response.status} ${response.statusText}`.trim()
      throw new SourceError(`Sources.load():  ${url} answered ${answer};  check the path`, {
        cause: { kind: "load", status: response.status }
      })
    }
    return {
      url,
      text: await response.text(),
      etag: response.headers.get("etag") ?? undefined,
      type: response.headers.get("content-type") ?? undefined
    }
  }

  ////////////////
  // ## Saving
  ////////////////

  /**
   * Save `request.text` to `request.url` through `saver`;  resolves with the new version.
   * - Rejects with `SourceError`:  `no-saver`, `cross-origin` / `file-protocol` (checked again), or whatever the
   *   saver threw (`conflict`, `save`);  any other error from a saver becomes `save`, kept as `cause.error`.
   * - SIDE EFFECT:  a whole-file save replaces the cache entry with the saved text;  a `fragment` save drops it.
   */
  async save(request: SourceSaveRequest): Promise<SourceSaveResult> {
    const url = this.resolve(request.url).href
    if (!this.saver) {
      throw new SourceError(`Sources.save():  this page has no saver for ${url};  set \`UI.sources.saver\``, {
        cause: { kind: "no-saver" }
      })
    }
    let result: SourceSaveResult
    try {
      result = await this.saver({ ...request, url })
    } catch (error) {
      if (error instanceof SourceError) throw error
      const { kind, message, status } = (error ?? {}) as { kind?: unknown; message?: unknown; status?: unknown }
      const said = typeof message === "string" ? message : String(error)
      throw new SourceError(`Sources.save():  the saver failed for ${url}:  ${said}`, {
        cause: {
          kind: SourceError.isKind(kind) ? kind : "save",
          status: typeof status === "number" ? status : undefined,
          error
        }
      })
    }
    if (request.fragment) this.cache.delete(url)
    else this.cache.set(url, Promise.resolve({ url, text: request.text, etag: result.etag }))
    return result
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * `promise`, or an `AbortError` as soon as `signal` aborts.
   * - STATIC:  pure, no cache of its own.
   */
  private static abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    if (signal.aborted) return Promise.reject(signal.reason)
    return new Promise<T>((resolve, reject) => {
      const onAbort = () => reject(signal.reason)
      signal.addEventListener("abort", onAbort, { once: true })
      promise.then(
        (value) => {
          signal.removeEventListener("abort", onAbort)
          resolve(value)
        },
        (error: unknown) => {
          signal.removeEventListener("abort", onAbort)
          reject(error)
        }
      )
    })
  }
}
