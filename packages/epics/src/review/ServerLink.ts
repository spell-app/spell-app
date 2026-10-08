import {
  PLAN_DOC_PAGE,
  REVIEW_POLL_MS,
  SERVER_INFO,
  ServerWriteError,
  type ServerInfo,
  type ServerLinkOptions
} from "./review.types"

/****************
 * ### `ServerLink`
 * A plan doc's LINK to the page server, as its clients use it:  the review inbox's (`ReviewClient`) and the running
 * agents' (`AgentsClient`), one link each.
 * - writes:  `post()`, with the server's write token (`x-server-token`, `SRV.Guard`);  a 403 on the token (the page
 *   server restarted since the page loaded) takes the server's new token from the page as it's served now, and
 *   tries once more, so nothing typed is refused for a restart
 * - reads stay the clients' own:  a GET needs no token
 * - keeping fresh:  `watch()`, the poll, the page becoming visible, and the page server's word that a file changed
 * - Node-safe at import, and without `watch()` / `pageOptions()`:  no `window` / `document` touched;  `fetch` comes
 *   in through `ServerLinkOptions`, so tests stub it
 * - Position in the import graph:  its peer types file only.  NEVER imports Solid, Spell UI or the `$/epics` barrel.
 ****************/
export class ServerLink {
  /** The page server's info, a copy:  its token is replaced when the server restarts (`refreshToken()`). */
  readonly info: ServerInfo | undefined

  constructor(private readonly options: ServerLinkOptions) {
    this.info = options.server ? { ...options.server } : undefined
  }

  /** The page's facts and `fetch`, as the browser has them (browser only):  `window.SPELL_SERVER`'s info. */
  static pageOptions(): ServerLinkOptions {
    return {
      page: location.pathname,
      server: (window as { SPELL_SERVER?: ServerInfo }).SPELL_SERVER,
      protocol: location.protocol,
      fetch: window.fetch.bind(window)
    }
  }

  /**
   * Do the page server's plan-doc routes answer this page?  A plan doc's own path (`PLAN_DOC_PAGE`:  any other page
   * gets a 403), served with a token, never from `file://`.  Else a client never asks.
   */
  get servesPlanDoc(): boolean {
    return !!this.info?.token && this.options.protocol !== "file:" && PLAN_DOC_PAGE.test(this.options.page)
  }

  /** The page's file, as the page server announces changes (`spell-server:file`'s `path`). */
  get file(): string {
    return this.info?.file ?? this.options.page
  }

  /**
   * POST `body` as JSON to route `url`, with the write token;  returns the reply.
   * - a 403 on the token:  takes the server's new token (`refreshToken()`) and tries once more
   * - throws a `ServerWriteError` saying why, for people:  the route's `error`, a stale token, no server
   */
  async post(url: string, body: object, { keepalive = false }: { keepalive?: boolean } = {}): Promise<unknown> {
    for (let attempt = 0; ; attempt++) {
      let response: Response
      try {
        response = await this.options.fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-server-token": this.info?.token ?? "" },
          body: JSON.stringify(body),
          keepalive
        })
      } catch (failure) {
        throw new ServerWriteError(`couldn't reach the page server (${(failure as Error).message})`)
      }
      const reply = (await response.json().catch(() => ({}))) as { error?: string }
      if (response.ok) return reply
      const stale = response.status === 403 && /token/i.test(reply.error ?? "")
      if (stale && attempt === 0 && (await this.refreshToken())) continue
      throw new ServerWriteError(
        stale
          ? "the page server restarted since this page loaded:  reload the page"
          : (reply.error ?? `couldn't save (${response.status})`)
      )
    }
  }

  /**
   * Keep a client fresh on `window`'s page:  `refresh()` every `REVIEW_POLL_MS` while visible, when the page becomes
   * visible, and when the page server says `file` changed (`spell-server:file`, the page's live client:  never a
   * connection of our own, each holds one of Chrome's 6 per host).  Returns the undo.
   */
  watch(window: Window, file: string, refresh: () => void): () => void {
    const { document } = window
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, REVIEW_POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }
    const onFile = (event: Event) => {
      if ((event as CustomEvent<{ path?: string }>).detail?.path === file) refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("spell-server:file", onFile)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("spell-server:file", onFile)
    }
  }

  /**
   * Take the page server's CURRENT write token from the page as it serves it now (its `window.SPELL_SERVER`):  a
   * restarted server has a new one.  True when it changed.
   * - NEVER throws
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const html = await (await this.options.fetch(this.options.page, { cache: "no-store" })).text()
      const fresh = (JSON.parse(SERVER_INFO.exec(html)?.[1] ?? "null") as ServerInfo | null)?.token
      if (!fresh || !this.info || fresh === this.info.token) return false
      this.info.token = fresh
      return true
    } catch {
      return false
    }
  }
}
