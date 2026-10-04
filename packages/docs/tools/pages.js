/**
 * Where the docs are, how scripts find, tidy and open pages -- shared by `update.js`, `index.js`, `open.js` and
 * `plan-doc.js`.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { Window } from "../../../scripts/window.mjs"

/** `packages/docs/tools`:  the docs scripts, `_assets`, the goals tooling. */
export const TOOLS = dirname(fileURLToPath(import.meta.url))

/** `packages/docs`:  the package (`package.json`, where `yarn` runs the docs' own scripts). */
export const PACKAGE = dirname(TOOLS)

/**
 * `packages/docs/content`:  every page, plan doc and template.  Page paths are relative to it.
 * - becomes a link into the shared content repo, `../spell-app-dev` (epic `shared-content`)
 */
export const DOCS = join(PACKAGE, "content")

/** `packages/docs/tools/_assets`:  what every page loads. */
export const ASSETS = join(TOOLS, "_assets")

/** The checkout this file is in:  the repo, or a worktree of it. */
export const ROOT = resolve(PACKAGE, "../..")

/**
 * Folders that hold no pages.
 * - `examples`:  fragments a page includes (`ui-import/examples/part.html`), not pages:  no sections, no contents
 * - `details`:  details pages (`yarn details`), questions for one session:  not in the index, not checked with the
 *   docs (scratch `details/`, and an epic's `epics/<name>/details/`);  NOT the `details` epic's own folder,
 *   `epics/details/` (`findPages()`)
 */
const SKIP_DIRS = new Set(["node_modules", "experiments", "examples", "details"])

/**
 * Epic `name`'s plan doc in folder `dir` (`epics/<name>/`):  `<name>.plan.html`, else `<name>.html` when that is a
 * plan doc (`<body class="... plan-doc">`);  `undefined` when there's neither.
 * - why both:  plan docs were renamed `<name>.plan.html` on 2026-10-04 (`review-review` P4), and a worktree cut
 *   before then still has `<name>.html` until it merges `main`
 */
export function planDocIn(dir, name) {
  const file = join(dir, `${name}.plan.html`)
  if (existsSync(file)) return file
  const old = join(dir, `${name}.html`)
  if (!existsSync(old)) return undefined
  return /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(readFileSync(old, "utf8")) ? old : undefined
}

/** Every `.html` page under `dir` (default:  all of them), sorted, skipping tooling folders. */
export function findPages(dir = DOCS) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      // the `details` EPIC's folder (`epics/details/`) holds a plan doc:  only details PAGES' folders are skipped
      const epic = entry.name === "details" && basename(dir) === "epics"
      if (!SKIP_DIRS.has(entry.name) || epic) found.push(...findPages(path))
    } else if (entry.name.endsWith(".html")) found.push(path)
  }
  return found
}

/**
 * Tidy `files` (paths relative to `DOCS`) the way a page must be committed:  link targets, then oxfmt (`vp fmt`).
 * - `doc-links.js` first:  it may add attributes oxfmt then wraps
 * - returns whether both succeeded;  their output is echoed
 * - run from `PACKAGE`, never `DOCS`:  once `content` is a link, a process started in it is in the shared repo,
 *   outside this yarn workspace
 */
export function tidy(files) {
  const paths = files.map((file) => (isAbsolute(file) ? file : join("content", file)))
  for (const [command, args] of [
    [process.execPath, [join(TOOLS, "doc-links.js"), ...paths]],
    ["yarn", ["vp", "fmt", ...paths]]
  ]) {
    const run = spawnSync(command, args, { cwd: PACKAGE, encoding: "utf8" })
    if (run.status !== 0) {
      process.stderr.write(`${run.stdout ?? ""}${run.stderr ?? ""}`)
      return false
    }
  }
  return true
}

/** Opens a doc in VS Code's doc preview:  the spell extension's URI handler (`packages/vscode/src/DocPreview.ts`). */
const VSCODE_PREVIEW = "vscode://spell-app.spell-language/doc-preview"

/**
 * This checkout's page server (`yarn server`), started in the background if it isn't running:  `{ base, port }`,
 * or `undefined` if it can't start (the caller falls back to `file://`).
 * - runs `packages/server/src/page/cli.ts ensure` under `tsx`, with that package's `tsconfig.json` for its aliases;
 *   ~1s when it has to start, ~0.3s when it runs
 * - `SPELL_NO_SERVER=1`:  never starts it
 */
export function ensurePageServer() {
  if (process.env.SPELL_NO_SERVER) return undefined
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", join(ROOT, "packages/server/src/page/cli.ts"), "ensure", "--root", ROOT],
    {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, TSX_TSCONFIG_PATH: join(ROOT, "packages/server/tsconfig.json") }
    }
  )
  if (run.status !== 0) {
    console.error(`page server didn't start (${(run.stderr ?? String(run.error)).trim().split("\n").at(-1)})`)
    return undefined
  }
  try {
    return JSON.parse(run.stdout)
  } catch {
    return undefined
  }
}

/**
 * A template's `html` fixed for a page `depth` folders below `DOCS` (`glossary.html` is 0, `a/a.html` 1).
 * - rewrites whatever depth the template assumed:  `_assets` paths (`<up>../tools/_assets/`), `index.html` paths,
 *   and the site header's `root` (the path up to the repo root:  `packages/docs/content` is three more)
 * - drops the template's `TEMPLATE:` how-to comment
 * - `docs:new`, `details new`
 */
export function atDepth(html, depth) {
  const up = "../".repeat(depth)
  return html
    .replace(/((?:href|src)=")(?:\.\.\/)*(?:tools\/)?_assets\//g, `$1${up}../tools/_assets/`)
    .replace(/((?:href|src)=")(?:\.\.\/)*index\.html/g, `$1${up}index.html`)
    .replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${up}../../.."`)
    .replace(/\n\s*<!--\s*TEMPLATE:[\s\S]*?-->/, "")
}

/** URL of `file` on the page server at `base`, e.g. `http://127.0.0.1:4747/packages/docs/index.html`. */
export function serverUrl(base, file) {
  return `${base}/${relative(ROOT, resolve(file)).split(sep).map(encodeURIComponent).join("/")}`
}

/**
 * Show `file` rendered in VS Code's doc preview:  `yarn plan-doc open <name>`, `yarn plan-doc phase`, `/spell-docs`.
 * - starts this checkout's page server first (`ensurePageServer()`), so the page live-reloads;  the spell extension
 *   (`yarn vscode`) finds it by its pid file and shows the page in a tab of the right side bar (or Simple Browser,
 *   `spell.docPreview.location`).  The page already in that tab isn't reloaded:  it updates itself.
 * - first asks THIS session's window, through the extension's window bridge (the repo root's
 *   `scripts/window.mjs`);  a `vscode://` URI goes to whichever window is focused
 * - NOT run from VS Code (`Window.inVSCode`:  a CLI session in another terminal):  `openInChrome()` instead, and
 *   `hash` and `view` are dropped
 * - `hash`:  an id on the page to land on, e.g. a goal `g1`
 * - `view`:  which side bar tab, `"docs"` ("Spell Docs", the default) or `"review"` ("Review":  `/epic review`,
 *   `yarn docs:open <page> --review`);  each keeps its own page
 * - the session is moving to a worktree's window (`/isolate`, `/epic`:  a pending handoff):  shown THERE once it
 *   has moved, not in the window it's leaving
 * - no bridge (extension not reloaded, or not run from a VS Code window), or it failed:  the `vscode://` URI
 * - `open` can't fail (macOS):  without the extension, VS Code says it can't handle the URI
 * - `open` itself failed (not macOS):  falls back to Chrome
 * - async for the bridge's http request;  never rejects
 */
export async function openInVSCode(file, { hash, view = "docs" } = {}) {
  if (!Window.inVSCode) return openInChrome(file)
  const path = resolve(file)
  const served = ensurePageServer()
  const review = view === "review"
  try {
    const { window, later } = await Window.show(path, { hash, view: review ? "review" : undefined })
    if (later) return console.log(`${path} shows in ${later} once this session moves there`)
    return console.log(`opened ${path} in VS Code (window ${window.pid})`)
  } catch (error) {
    if (!/^no window/.test(error.message)) console.error(`${error.message}:  falling back to the vscode:// URI`)
  }
  const url = served && `${serverUrl(served.base, path)}${hash ? `#${hash}` : ""}`
  const query = new URLSearchParams({ ...(url && { url }), file: path, ...(review && { view: "review" }) })
  const run = spawnSync("open", [`${VSCODE_PREVIEW}?${query}`], { encoding: "utf8" })
  if (run.status === 0) return console.log(`opened ${path} in VS Code`)
  console.error(`VS Code via \`open\` failed (${(run.stderr ?? String(run.error)).trim()}):  falling back to Chrome`)
  openInChrome(file)
}

/**
 * Show `file` in Chrome, in ONE tab per page, IN THE BACKGROUND:  `yarn docs:open <page>`;  `openInVSCode()`'s fallback.
 * - from this checkout's page server (live reload), started if need be;  `file://` if it can't start
 * - The tab is keyed by the page's path inside `packages/docs` (`epics/<name>/<name>.html`), not its full URL, so
 *   the same page from another checkout (a worktree) reuses it:  re-pointed if the URL differs, else reloaded.
 *   The page names its tab the same way (`spell-doc-runtime.js` `window.name`;  links use that `target`).
 * - Never brings Chrome or its window forward:  the tab is made active in ITS window only;  a new tab goes in the
 *   front window.  (`openUrlInChrome()` with `front` does, for a link Owen clicked.)
 * - Chrome not running, or AppleScript refused:  `open -g -a "Google Chrome"`, which can't reuse a tab, and Chrome
 *   may still raise itself for a URL it's handed (seen 2026-10-01).
 * - NOTE: `key` is an AppleScript keyword:  the variable is `pageKey`.
 */
export function openInChrome(file) {
  const served = ensurePageServer()
  const url = served ? serverUrl(served.base, file) : pathToFileURL(resolve(file)).href
  openUrlInChrome(url, `/${relative(ROOT, resolve(file)).split(sep).join("/")}`)
}

/**
 * Show `url` in Chrome, reusing the tab whose URL contains `key` (see `openInChrome()`).
 * - `front`:  bring Chrome and that tab's window forward -- a link Owen clicked (`showRoutes.ts`);  else in the
 *   background
 */
export function openUrlInChrome(url, key, { front = false } = {}) {
  const script = `
set target to ${JSON.stringify(url)}
set pageKey to ${JSON.stringify(key)}
if application "Google Chrome" is not running then return "launch"
tell application "Google Chrome"
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if (URL of t) contains pageKey then
        if (URL of t) starts with target then
          tell t to reload
        else
          set URL of t to target
        end if
        set active tab index of w to i
        ${front ? "set index of w to 1\n        activate" : ""}
        return "reused"
      end if
    end repeat
  end repeat
  if (count of windows) is 0 then make new window
  tell front window to make new tab with properties {URL:target}
  ${front ? "activate" : ""}
  return "new tab"
end tell`
  const where = front ? "in front" : "in the background"
  const run = spawnSync("osascript", ["-e", script], { encoding: "utf8" })
  const how = run.stdout.trim()
  if (run.status === 0 && how !== "launch") return console.log(`opened ${url} (${how}, ${where})`)
  if (run.status !== 0) console.error(`Chrome via AppleScript failed (${run.stderr.trim()}):  falling back to \`open\``)
  spawnSync("open", [...(front ? [] : ["-g"]), "-a", "Google Chrome", url])
  console.log(`opened ${url} (Chrome launched ${where})`)
}

/**
 * A parsed (linkedom) document as page HTML, ready to write.
 * - `<!doctype html>` lowercase, and boolean attributes bare (`styled`, not `styled=""`), as written by hand and by
 *   oxfmt.  Repeated until stable:  one pass fixes one attribute per tag, and `ui-table` has four.
 */
export function serialize(document) {
  let html = document.toString().replace(/^<!DOCTYPE html>/i, "<!doctype html>")
  for (let before; before !== html;) {
    before = html
    html = html.replace(/(<[a-z][\w-]*\b[^<>]*?) ([a-z][\w-]*)=""(?=[\s/>])/g, "$1 $2")
  }
  return html
}
