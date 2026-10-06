/**
 * The browser side of a `WebServer` with live reload:  runs in every page it serves, from `/_server/live.js`.
 * - MUST stay self-contained:  it's served as `(${liveClient})()`, so it can't use imports or module helpers
 */

/**
 * What a served page knows about its server:  `window.SPELL_SERVER`, injected before `</head>`.
 * - `token`:  this run's write token (see `Guard`)
 * - `events`:  URL path of the live-reload websocket (`LiveReload.events`)
 * - `file`:  URL path of the FILE served, e.g. `/guides/solid/index.html` for `/guides/solid/`
 * - `etag`:  the file's `ETag` when served, for `If-Match` on edits
 * - `root`:  absolute folder served;  `branch` / `worktree`:  of that checkout, when known
 * - `editPage`, `saveFile`, `readPage`, `takeScroll`:  added by `liveClient()`
 *   - `readPage()`:  the page's file as served NOW (`PageSource`):  the docs runtime's baseline for in-place updates
 *   - `takeScroll()`:  the scroll position a live reload saved, once:  the docs runtime restores it itself, after its
 *     folds and definitions settle (else the client does, on `load`)
 * - `etag` follows the page:  an in-place update (`PageChange`) moves it to the new version's
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
  readPage?: () => Promise<PageSource>
  takeScroll?: () => number | undefined
}

/** The page's file as served now:  its HTML (with what the server injects) and `ETag`. */
export type PageSource = { html: string; etag?: string }

/**
 * `detail` of `spell-server:change`, the event `liveClient()` fires on `window` when the page's OWN file changed.
 * - `html` / `etag`:  the new version, already fetched (`readPage()`)
 * - `reload()`:  reload, keeping the scroll position:  for a taker that finds it can't patch after all
 * - the event is cancelable:  `preventDefault()` takes it (the page updates itself, e.g. `spell-doc-runtime.js`
 *   `wireLiveUpdate()`);  nobody took it:  the client reloads
 */
export type PageChange = { path: string; html: string; etag?: string; reload: () => void }

/**
 * `detail` of `spell-server:file`, the event `liveClient()` fires on `window` when ANOTHER file changed:  not the
 * page's own, not a stylesheet or a script.  Nothing reloads:  the page decides.
 * - `path`:  its URL path, each segment URI-encoded, e.g. `/epics/x/parts/q2.htm`
 * - e.g. a body the page loaded from a file (`<ui-section source>`):  the docs runtime re-fetches it in place
 *   (`spell-doc-runtime.js` `wireSourceBodies()`:  a split plan doc's parts)
 */
export type FileChange = { path: string }

/**
 * One save of a whole file (`PUT /_server/page`), or of one element of a page (`fragment`:  its `id`, `PATCH`).
 * - `path`:  URL path of the file, e.g. `/guides/notes.md`
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
 * - the page's own file changed:  fetches the new version and offers it to the page (`spell-server:change`,
 *   `PageChange`);  a page that takes it updates itself in place, else it reloads
 * - a stylesheet the page uses (linked, or `@import`ed by one it links) changed:  swapped in place, no reload
 * - a script changed in the folder of one the page loads (`_assets/`:  the bundle and its lazy chunks):  reloads.
 *   Any other `.js` (a repo tool) is none of the page's business
 * - any other file changed:  says so (`spell-server:file`, `FileChange`), and does nothing else:  a page that loads
 *   it (a body from a file) re-fetches it
 * - keeps the scroll position across a reload (`sessionStorage`, when it works)
 * - in a frame (VS Code's "Spell Docs" view, `packages/vscode/src/DocView.ts`):  posts its place to the parent on
 *   every load and hash change, and on `spell-doc:place` (the docs runtime moved the address with
 *   `history.replaceState()`, which fires no `hashchange`);  runs `history.go()` when the parent posts
 *   `{ spell: "history", go: -1 | 1 }`, and routes link clicks (`followInFrame()`):  a frame can't open the tabs
 *   docs links ask for.  Why here:  the view's frame is cross-origin, so the view can't read or move its history itself
 *   - `{ spell: "go", hash }` from the parent is the docs runtime's (`spell-doc-runtime.js` `wireAnchors()`)
 * - in a same-origin frame of a live page (the brand index's thumbnails, the Compare view's panes):  opens no
 *   connection, and takes changes from the parent (`__spellLiveChange`), which hands each one down before acting on it
 * - runs once per page
 */
export function liveClient(): void {
  const holder = window as unknown as LiveWindow
  const config = holder.SPELL_SERVER
  if (!config || holder.__spellLive) return
  holder.__spellLive = true
  // `sessionStorage` key for the scroll position kept across a reload
  const scrollKey = "spell-server:scroll"
  // the scroll position a live reload left, until restored (`takeScroll()`, or `load`)
  let savedScroll: number | undefined
  // updates of the page's file, one at a time and in order
  let updating = Promise.resolve()

  restoreScroll()
  config.takeScroll = () => {
    const y = savedScroll
    savedScroll = undefined
    return y
  }
  config.readPage = readPage
  // in a frame (VS Code's "Spell Docs" view):  say where we are, and step back / forward when the frame's parent asks
  if (window.parent !== window) {
    reportPlace()
    addEventListener("pageshow", reportPlace)
    addEventListener("hashchange", reportPlace)
    addEventListener("spell-doc:place", reportPlace)
    addEventListener("message", (event) => {
      const data = event.data as { spell?: string; go?: number; command?: string; text?: string } | null
      if (event.source !== window.parent) return
      if (data?.spell === "history" && (data.go === -1 || data.go === 1)) history.go(data.go)
      if (data?.spell === "edit" && typeof data.command === "string") edit(data.command, data.text)
    })
    addEventListener("click", followInFrame, true)
  }
  holder.__spellLiveChange = onChange
  // in a same-origin frame of a live page, the parent hands changes down:  no connection of our own
  if (!liveParent()) connect()

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

  /** A file changed:  hand it to our same-origin frames first (a reload here drops them anyway), then act on it. */
  function onChange(path: string) {
    for (const frame of document.querySelectorAll("iframe")) {
      try {
        ;(frame.contentWindow as LiveWindow | null)?.__spellLiveChange?.(path)
      } catch {
        // cross-origin:  it has its own connection
      }
    }
    if (path === config!.file) updating = updating.then(updatePage).catch(reload)
    else if (/\.css$/.test(path)) swapStyles(path)
    else if (/\.m?js$/.test(path)) {
      if (loadsFrom(path)) reload()
    } else dispatchEvent(new CustomEvent("spell-server:file", { detail: { path } satisfies FileChange }))
  }

  /**
   * Open the live-reload websocket (`config.events`), and act on each change it reports.
   * - a websocket, not an `EventSource`:  an event stream holds one of Chrome's 6 connections per host for good,
   *   and every VS Code window shares them:  6 docs pages open anywhere, and every other page's requests waited
   *   forever (`webSocket.ts`).  Websockets don't count toward those 6.
   * - closed (the server restarted or stopped):  tries again, as `EventSource` did:  0.5s after an open socket
   *   closes, then `wait` ms after each try that failed, doubling up to 10s
   */
  function connect(wait = 1000) {
    const url = new URL(config!.events, location.href)
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
    const socket = new WebSocket(url)
    let opened = false
    socket.addEventListener("open", () => (opened = true))
    socket.addEventListener("message", (message: MessageEvent<string>) => {
      const { event, data } = JSON.parse(message.data) as { event: string; data: { path: string } }
      if (event === "change") onChange(data.path)
    })
    socket.addEventListener("close", () => {
      const retry = opened ? 500 : wait
      setTimeout(() => connect(Math.min(retry * 2, 10_000)), retry)
    })
  }

  /**
   * Is this page in a same-origin frame whose page runs live reload?  Then the parent hands us its changes.
   * - Why:  one connection per page is enough.  (Before live reload moved to websockets, every connection took one
   *   of Chrome's 6 per host:  a page framing 6 served pages, the brand index's thumbnails, used them all.)
   * - a cross-origin parent (VS Code's view) throws or has no `frameElement`:  we keep our own connection
   */
  function liveParent(): boolean {
    try {
      return !!window.frameElement && !!(window.parent as LiveWindow).__spellLive
    } catch {
      return false
    }
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
   * The page's file changed:  fetch it and offer it to the page (`spell-server:change`);  reload unless taken.
   * - taken:  `etag` (and `SPELL_SERVER.etag`) move to the new version, so the next edit isn't refused as stale
   */
  async function updatePage() {
    const server = config as ServerConfig
    const page = await readPage()
    const detail: PageChange = { path: server.file, html: page.html, etag: page.etag, reload }
    const change = new CustomEvent("spell-server:change", { cancelable: true, detail })
    if (dispatchEvent(change)) return reload()
    etag = page.etag
    server.etag = page.etag
  }

  /** The page as served now, by its own URL (so a worktree's page too), never from a cache. */
  async function readPage(): Promise<PageSource> {
    const answer = await fetch(location.pathname + location.search, { cache: "no-store" })
    if (!answer.ok) throw new Error(`${answer.status} reading the page`)
    return { html: await answer.text(), etag: answer.headers.get("etag") ?? undefined }
  }

  /**
   * Stylesheet `path` changed:  re-link every `<link rel="stylesheet">` that uses it, with a cache-buster.
   * - the new link goes in beside the old one, which goes once the new one has loaded:  no unstyled flash
   * - "uses":  links it, or `@import`s it (at any depth, when the sheet can be read)
   */
  function swapStyles(path: string) {
    for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]')) {
      if (!usesSheet(link.sheet, link.href, path)) continue
      const fresh = link.cloneNode() as HTMLLinkElement
      const url = new URL(link.href)
      url.searchParams.set("spell-live", String(Date.now()))
      fresh.href = url.href
      fresh.addEventListener("load", () => link.remove(), { once: true })
      fresh.addEventListener("error", () => link.remove(), { once: true })
      link.after(fresh)
    }
  }

  /** Does stylesheet `sheet` (at `href`) come from `path`, or `@import` it? */
  function usesSheet(sheet: CSSStyleSheet | null, href: string | null, path: string): boolean {
    if (href && new URL(href, location.href).pathname === path) return true
    try {
      for (const rule of Array.from(sheet?.cssRules ?? []))
        if (rule instanceof CSSImportRule && usesSheet(rule.styleSheet, rule.styleSheet?.href ?? rule.href, path))
          return true
    } catch {
      // another origin's sheet:  its rules can't be read
    }
    return false
  }

  /** Is `path` in the folder (or below) of a script this page loads from this server? */
  function loadsFrom(path: string): boolean {
    for (const script of document.querySelectorAll<HTMLScriptElement>("script[src]")) {
      const url = new URL(script.src, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith("/_server/")) continue
      if (path.startsWith(url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1))) return true
    }
    return false
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
      return window.parent.postMessage({ spell: "open", url: url.href, kind: "external" }, "*")
    // a source reference (`doc-links.py` names its targets `src-<path>`) that isn't a page:  the editor
    if (!/\.html?$/.test(url.pathname) && link.target.startsWith("src-"))
      return window.parent.postMessage({ spell: "open", url: url.href, kind: "file" }, "*")
    location.assign(url.href)
  }

  /**
   * An edit key, sent in by VS Code's docs view (`{ spell: "edit", command, text? }`, `packages/vscode/src/DocView.ts`
   * `edit()`;  epic `windows-and-review` I2).  Why:  VS Code takes Cmd / Ctrl + C, X, V, A, Z as its own keys before
   * a page in a frame sees them, so copy, paste and select all did nothing in the side bar.
   * - copy / cut:  the selection (a field's, else the page's) goes back to the view, which puts it on the clipboard;
   *   cut then deletes it here
   * - paste:  `text` (the clipboard, read by the view), typed in where the caret is (the field's own undo keeps it)
   * - selectAll, undo, redo:  `document.execCommand()`, on the focused field or the page
   */
  function edit(command: string, text?: string) {
    if (command === "paste") {
      if (text) document.execCommand("insertText", false, text)
      return
    }
    if (command === "copy" || command === "cut") {
      window.parent.postMessage({ spell: "clipboard", text: selectedText() }, "*")
      if (command === "cut") document.execCommand("delete")
      return
    }
    if (["selectAll", "undo", "redo"].includes(command)) document.execCommand(command)
  }

  /** What's selected:  in the focused field (through shadow roots:  `ui-textarea`'s own), else on the page. */
  function selectedText(): string {
    let focused = document.activeElement
    while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement
    if (focused instanceof HTMLTextAreaElement || focused instanceof HTMLInputElement) {
      const { selectionStart: start, selectionEnd: end, value } = focused
      if (start !== null && end !== null && end > start) return value.slice(start, end)
    }
    return getSelection()?.toString() ?? ""
  }

  /**
   * Scroll back to where the last live reload left this page, on `load`;  unless the page took the position
   * first (`takeScroll()`:  the docs runtime restores it once its sections have drawn).
   */
  function restoreScroll() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(scrollKey) ?? "null") as { path: string; y: number } | null
      sessionStorage.removeItem(scrollKey)
      if (saved?.path !== location.pathname) return
      savedScroll = saved.y
      addEventListener(
        "load",
        () => {
          if (savedScroll !== undefined) scrollTo(0, savedScroll)
          savedScroll = undefined
        },
        { once: true }
      )
    } catch {
      // storage blocked
    }
  }
}

/**
 * What `liveClient()` keeps on `window`.
 * - `SPELL_SERVER`:  injected by the server (`ServerConfig`)
 * - `__spellLive`:  the client has run (once per page)
 * - `__spellLiveChange`:  hand this page a changed file's path:  how a parent passes changes to its same-origin frames
 */
type LiveWindow = Window & {
  SPELL_SERVER?: ServerConfig
  __spellLive?: boolean
  __spellLiveChange?: (path: string) => void
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
