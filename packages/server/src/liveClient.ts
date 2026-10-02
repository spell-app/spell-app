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
 * - `editPage`:  added by `liveClient()`
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
}

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

  /** reload, keeping the scroll position */
  function reload() {
    try {
      sessionStorage.setItem(scrollKey, JSON.stringify({ path: location.pathname, y: scrollY }))
    } catch {
      // storage blocked:  reload at the top
    }
    location.reload()
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
