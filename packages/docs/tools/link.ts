/**
 * `spell dev docs link <page> [--hash <id>] [--text "..."] [--review] [--show]`:  the markdown link Claude gives Owen for a
 * page:  a SIDE BAR link, then a `(_browser_)` one.
 *
 *     [Details Pages](http://127.0.0.1:4747/api/docs/show?path=...&window=123) (_[browser](http://127.0.0.1:4747/...)_)
 *
 * - Both go through the page server's `GET /api/docs/show` (`scripts/showRoutes.ts`):  the Claude panel follows only
 *   http(s) links (a `vscode://` one does nothing), and opens a plain `localhost` link in a VS Code tab, not Chrome.  `window` is THIS session's VS Code
 *   window, so the page shows beside the session that named it.
 * - Which server:  a worktree's page on the MAIN checkout's server (one port for every link), else this checkout's
 *   (started if need be).  Each must have the route (a server started before it existed doesn't):  else the next;
 *   none:  the browser link alone, and a note on stderr.
 * - `--review`:  the side bar link (and `--show`) uses the side bar's "Review" tab, not its "Spell Docs" tab.
 * - `--show`:  also show it in this session's side bar now (`Window.show()`), so Owen needn't click at all.
 * - `<page>`:  absolute, from the checkout's root, or from an area (`pages.js` `pageFile()`:  `solid/solid-2.html` is a
 *   guide).
 * - `--text`:  the link's text (`P2 · Page Template`);  default:  the page's `<title>`.
 */
import { existsSync, readFileSync } from "node:fs"

import { SRV } from "$/server"

import { Window } from "../../../scripts/window.mjs"
import { ensurePageServer, pageFile, parseArgs, serverUrl } from "./pages.js"

const { positional, flags } = parseArgs(process.argv.slice(2))
const file = positional[0] ? pageFile(positional[0]) : ""
if (!positional[0] || !file.endsWith(".html") || !existsSync(file)) {
  console.error('usage:  spell dev docs link <page.html> [--hash <id>] [--text "..."] [--review] [--show]')
  process.exit(1)
}
const hash = typeof flags.hash === "string" ? flags.hash : undefined
const text = typeof flags.text === "string" ? flags.text : undefined
const view = flags.review ? "review" : undefined
console.log(await markdownLink(file, { hash, text, view, window: Window.current()?.pid }))
if (flags.show) {
  try {
    // `window.mjs` is plain JS:  TS infers its options from the destructuring defaults alone, missing `hash`
    const show = Window.show as (file: string, options: { hash?: string; view?: string }) => Promise<unknown>
    await show(file, { hash, view })
  } catch (error) {
    console.error(`couldn't show it:  ${(error as Error).message}`)
  }
}

/**
 * The side bar link and the browser link for `file`, as markdown.
 * - `hash`:  an id on the page to land on;  `text`:  the link's text (default:  the page's title);  `window`:  the
 *   VS Code window's pid;  `view`:  `"review"` for the side bar's "Review" tab
 */
export async function markdownLink(
  file: string,
  { hash, text, window, view }: { hash?: string; text?: string; window?: number; view?: "review" } = {}
) {
  const title = (text ?? titleOf(file)).replace(/[[\]]/g, "")
  const pages = [await SRV.mainServerUrl(file), ownUrl(file)].filter((url): url is string => !!url)
  const anchor = hash ? `#${hash}` : ""
  for (const page of pages) {
    const url = new URL(page)
    if (!(await hasShowRoute(url.origin))) continue
    const query = new URLSearchParams({
      path: url.pathname,
      ...(window && { window: String(window) }),
      ...(hash && { hash }),
      ...(view && { view })
    })
    const browser = new URLSearchParams({ path: url.pathname, ...(hash && { hash }), in: "browser" })
    return `[${title}](${url.origin}/api/docs/show?${query}) (_[browser](${url.origin}/api/docs/show?${browser})_)`
  }
  console.error(
    "no page server here can show pages in the side bar yet (restart it:  spell dev server stop && spell dev server ensure)"
  )
  return `[${title}](${pages[0] ?? `file://${file}`}${anchor})`
}

/** `file`'s URL on this checkout's page server, started if need be;  `undefined` if it won't start. */
function ownUrl(file: string): string | undefined {
  const served = ensurePageServer()
  return served && serverUrl(served.base, file)
}

/** Whether the page server at `origin` has `/api/docs/show`:  asked with no path, it answers 400, not 404. */
async function hasShowRoute(origin: string): Promise<boolean> {
  try {
    const answer = await fetch(`${origin}/api/docs/show`, { signal: AbortSignal.timeout(1000) })
    return answer.status === 400
  } catch {
    return false
  }
}

/** The page's `<title>`, else its file name;  `[` / `]` dropped, as they'd end the link text. */
function titleOf(file: string): string {
  const title = readFileSync(file, "utf8")
    .match(/<title>([^<]*)<\/title>/)?.[1]
    ?.trim()
  return (title || file.split("/").at(-1)!).replace(/[[\]]/g, "")
}
