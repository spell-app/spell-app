/**
 * The browser side of a `WebServer` with live reload:  runs in every page it serves, from `/_server/live.js`.
 * - MUST stay self-contained:  it's served as `(${liveClient})()`, so it can't use imports or module helpers
 */

/**
 * What a served page knows about its server:  `window.SPELL_SERVER`, injected before `</head>`.
 * - `token`:  this run's write token (see `Guard`)
 * - `file`:  URL path of the FILE served, e.g. `/packages/docs/index.html` for `/packages/docs/`
 * - `etag`:  the file's `ETag` when served, for `If-Match` on edits
 * - `root`:  absolute folder served;  `branch` / `worktree`:  of that checkout, when known
 * - `editPage`, `saveFile`:  added by `liveClient()`
 */
export type ServerConfig = {
  port: number
  token: string
  events: string
  file: string
  etag?: string
  root?: string
  branch?: string
  worktree?: string
  edit?: string
  editPage?: (edit: PageEdit) => Promise<PageEditResult>
  saveFile?: (save: FileSave) => Promise<PageEditResult>
}

/**
 * One save of a whole file (`PUT /_server/page`), or of one element of a page (`fragment`:  its `id`, `PATCH`).
 * - `path`:  URL path of the file, e.g. `/packages/docs/notes.md`
 * - `etag`:  the version it was edited from (the `ETag` it was fetched with);  REQUIRED by the server
 * - what `<ui-include>` / `<ui-code>` / `<ui-markdown>` save through (`UI.sources.saver`, set by the docs runtime)
 */
export type FileSave = { path: string; text: string; etag?: string; fragment?: string }

/**
 * One edit of the page's own file, through `PATCH /_server/page`.
 * - `id`:  the element to replace;  `html`:  its new markup;  `inner`:  replace its content only
 * - `parent`:  a tag name:  replace `#id`'s nearest such ancestor instead (a section, through its heading)
 * - `etag`:  the version edited (default:  the page's, as loaded)
 */
export type PageEdit = { id: string; html: string; inner?: boolean; parent?: string; etag?: string }

/** What an edit answered:  `ok`, or the status and error;  `etag` is the file's new one. */
export type PageEditResult = { ok: boolean; status: number; etag?: string; error?: string }

/**
 * Start live reload in this page, and add `SPELL_SERVER.editPage()`.
 * - reloads when the page's own file changes, or any `.css` / `.js` (the page may load it)
 * - keeps the scroll position across the reload (`sessionStorage`, when it works)
 * - in a frame (VS Code's "Spell Docs" view, `packages/vscode/src/DocView.ts`):  posts its place to the parent on
 *   every load and hash change, runs `history.go()` when the parent posts `{ spell: "history", go: -1 | 1 }`, and
 *   routes link clicks (`followInFrame()`):  a frame can't open the tabs docs links ask for.
 *   Why here:  the view's frame is cross-origin, so the view can't read or move its history itself
 * - runs once per page
 */
export function liveClient(): void {
  const holder = window as unknown as { SPELL_SERVER?: ServerConfig; __spellLive?: boolean }
  const config = holder.SPELL_SERVER
  if (!config || holder.__spellLive) return
  holder.__spellLive = true
  // `sessionStorage` key for the scroll position kept across a reload
  const scrollKey = "spell-server:scroll"

  restoreScroll()
  // in a frame (VS Code's "Spell Docs" view):  say where we are, and step back / forward when the frame's parent asks
  if (window.parent !== window) {
    reportPlace()
    addEventListener("pageshow", reportPlace)
    addEventListener("hashchange", reportPlace)
    addEventListener("message", (event) => {
      const data = event.data as { spell?: string; go?: number } | null
      if (event.source === window.parent && data?.spell === "history" && (data.go === -1 || data.go === 1))
        history.go(data.go)
    })
    addEventListener("click", followInFrame, true)
  }
  const source = new EventSource(config.events)
  source.addEventListener("change", (event) => {
    const { path } = JSON.parse((event as MessageEvent<string>).data) as { path: string }
    if (path === config.file || /\.(css|m?js)$/.test(path)) reload()
  })

  let etag = config.etag
  config.editPage = async ({ id, html, inner, parent, etag: version = etag }) => {
    const url = `${config.edit ?? "/_server/page"}?path=${encodeURIComponent(config.file)}`
    const answer = await fetch(url, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-server-token": config.token,
        ...(version && { "if-match": version })
      },
      body: JSON.stringify({ id, html, inner, parent })
    })
    const body = (await answer.json().catch(() => ({}))) as { etag?: string; error?: string }
    if (answer.ok) etag = body.etag
    return { ok: answer.ok, status: answer.status, etag: body.etag, error: body.error }
  }

  config.saveFile = async ({ path, text, etag: version, fragment }) => {
    const url = `${config.edit ?? "/_server/page"}?path=${encodeURIComponent(path)}`
    const answer = await fetch(url, {
      method: fragment ? "PATCH" : "PUT",
      headers: {
        "content-type": fragment ? "application/json" : "text/plain; charset=utf-8",
        "x-server-token": config.token,
        ...(version && { "if-match": version })
      },
      body: fragment ? JSON.stringify({ id: fragment, html: text }) : text
    })
    const body = (await answer.json().catch(() => ({}))) as { etag?: string; error?: string }
    if (answer.ok && path === config.file) etag = body.etag
    return { ok: answer.ok, status: answer.status, etag: body.etag, error: body.error }
  }

  /** reload, keeping the scroll position */
  function reload() {
    try {
      sessionStorage.setItem(scrollKey, JSON.stringify({ path: location.pathname, y: scrollY }))
    } catch {
      // storage blocked:  reload at the top
    }
    location.reload()
  }

  /**
   * Tell the frame's parent this page's URL, and whether back / forward lead anywhere:
   * `{ spell: "place", url, title, canGoBack, canGoForward }`.
   * - the Navigation API when there is one (Chromium:  VS Code, Chrome);  else a guess from `history.length`
   */
  function reportPlace() {
    const nav = (window as unknown as { navigation?: { canGoBack: boolean; canGoForward: boolean } }).navigation
    const place = {
      spell: "place",
      url: location.href,
      title: document.title,
      canGoBack: nav ? nav.canGoBack : history.length > 1,
      canGoForward: nav ? nav.canGoForward : false
    }
    window.parent.postMessage(place, "*")
  }

  /**
   * A link clicked in the frame:  where it should go, since the frame may not open tabs (docs links all name a
   * `target`, and the view's sandbox blocks popups).
   * - a page on this server (`.html`, or a site page like `/ui/`):  here, in the frame, so back / forward work
   * - a source reference that isn't a page (`target="src-..."`, as `doc-links.py` names them):
   *   `{ spell: "open", url, kind: "file" }` to the parent, which opens it in VS Code (a folder:  in the Explorer)
   * - another site, or a link marked `data-spell-open="browser"` (the header's App):
   *   `{ spell: "open", url, kind: "external" }`, opened in the browser
   * - left alone:  a modified click, a download, a `javascript:` / `mailto:` link, a same-page `#id` link
   */
  function followInFrame(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    // the path, not `target`:  a link inside a shadow root (the site header) is retargeted to its host
    const link = event.composedPath().find((node) => node instanceof HTMLAnchorElement && node.hasAttribute("href")) as
      | HTMLAnchorElement
      | undefined
    if (!link || link.hasAttribute("download") || !/^https?:$/.test(link.protocol)) return
    const url = new URL(link.href)
    const samePage =
      url.origin === location.origin && url.pathname === location.pathname && url.search === location.search
    if (samePage && url.hash) return
    event.preventDefault()
    if (url.origin !== location.origin || link.dataset.spellOpen === "browser")
      return void window.parent.postMessage({ spell: "open", url: url.href, kind: "external" }, "*")
    // a source reference (`doc-links.py` names its targets `src-<path>`) that isn't a page:  the editor
    if (!/\.html?$/.test(url.pathname) && link.target.startsWith("src-"))
      return void window.parent.postMessage({ spell: "open", url: url.href, kind: "file" }, "*")
    location.assign(url.href)
  }

  /** scroll back to where the last live reload left this page */
  function restoreScroll() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(scrollKey) ?? "null") as { path: string; y: number } | null
      sessionStorage.removeItem(scrollKey)
      if (saved?.path === location.pathname) addEventListener("load", () => scrollTo(0, saved.y), { once: true })
    } catch {
      // storage blocked
    }
  }
}

/**
 * `liveClient` as a classic script, for `/_server/live.js`.
 * - HACK: `__name` is a no-op shim:  tsx / esbuild's `keepNames` wraps nested functions in `__name(fn, "fn")`,
 *   a helper that lives in the MODULE, not in the stringified function
 */
export function liveClientScript(): string {
  return [
    "// spell server:  live reload and page edits (packages/server/src/liveClient.ts)",
    "var __name = (fn) => fn;",
    `(${liveClient.toString()})()`,
    ""
  ].join("\n")
}
