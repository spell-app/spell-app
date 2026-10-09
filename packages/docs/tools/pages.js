/**
 * Where the docs are, how scripts find, tidy and open pages -- shared by `update.js`, `index.js`, `open.js` and
 * the other docs tools (the plan-doc tool, `$/epics/tool`, has its own).
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { Window } from "../../../scripts/window.mjs"

/** `packages/docs/tools`:  the docs scripts, `_assets`, the goals tooling. */
export const TOOLS = dirname(fileURLToPath(import.meta.url))

/** `packages/docs`:  the package (`package.json`, where `yarn` runs the docs' own scripts). */
export const PACKAGE = dirname(TOOLS)

/** `packages/docs/tools/_assets`:  what every page loads. */
export const ASSETS = join(TOOLS, "_assets")

/** The checkout this file is in:  the repo, or a worktree of it.  Page paths are relative to it. */
export const ROOT = resolve(PACKAGE, "../..")

/*
 * The content folders, one per area, each a link at the checkout's root into the shared content repo,
 * `../spell-app-dev` (epics `shared-content` and `claude-design` P4;  before 2026-10-05 all of them were
 * `packages/docs/content/`, where old-path links stay for older checkouts:  `relocate.js` `reorgShared()`).
 */

/** `epics/`:  plan docs, `epics/<name>/<name>.plan.html`, their inboxes and details pages. */
export const EPICS = join(ROOT, "epics")

/** `templates/`:  one starting point per kind of page. */
export const TEMPLATES = join(ROOT, "templates")

/** `guides/`:  every other docs page, with its `.md`, `.json`, `experiments/` and `examples/` beside it. */
export const GUIDES = join(ROOT, "guides")

/** `pages/`:  the docs home (`HOME`) and the scratch details pages (`DETAILS`). */
export const PAGES = join(ROOT, "pages")

/** `pages/index.html`:  the docs home, a routing page:  a card per area (`index.js`, claude-design P5). */
export const HOME = join(PAGES, "index.html")

/** `pages/details/`:  scratch details pages (`spell dev details new`, no `--epic`). */
export const DETAILS = join(PAGES, "details")

/**
 * `brand/`:  the brand pages (the pony ...) and the design system's push record.
 * - NOT in `AREAS`:  its pages come from Claude Design, not the docs' templates, so `docs update` doesn't check
 *   them;  `index.js` lists them on `brand/index.html`
 */
export const BRAND = join(ROOT, "brand")

/**
 * `ui/`:  Spell UI's hand-written docs pages (claude-design P6), served at `/ui/` with the branch's built
 * `packages/ui/site/_assets/` and `_data/` laid over them.
 * - NOT in `AREAS`:  `packages/ui`'s `site:*` scripts make and check them (`yarn site:check`), not the docs' tools
 */
export const UI_PAGES = join(ROOT, "ui")

/** `goals/`:  the goal sets, `goals/<set>/index.html` (their tooling:  `tools/goals/`). */
export const GOALS = join(ROOT, "goals")

/** Every folder `findPages()` walks:  the home first, then the areas. */
export const AREAS = [PAGES, GUIDES, EPICS, TEMPLATES]

/**
 * Each area's list page, `<area>/index.html`, written by `index.js` (claude-design P5):  every epic, guide,
 * template and brand page.  Never listed themselves.
 */
export const LIST_PAGES = [EPICS, GUIDES, TEMPLATES, BRAND].map((area) => join(area, "index.html"))

/** The old content folder (a link in checkouts cut before 2026-10-05, into the old-path links):  never walked. */
export const OLD_CONTENT = join(PACKAGE, "content")

/**
 * The file a page argument means:  absolute as is, else the first that exists of
 * - from the checkout's root (`guides/solid/solid-2.html`, `epics/seo/seo.plan.html`)
 * - from each area (`solid/solid-2.html` is a guide, `index.html` the home)
 * - an old path (`packages/docs/content/solid/solid-2.html`, `content/...`) moved by the reorg
 * - from `cwd`
 * - none:  from the root
 */
export function pageFile(page, cwd = process.env.INIT_CWD ?? process.cwd()) {
  if (isAbsolute(page)) return page
  const old = page.replace(/^(?:packages\/docs\/)?content\//, "")
  const candidates = [
    resolve(ROOT, page),
    ...AREAS.map((area) => resolve(area, page)),
    ...(old !== page ? [resolve(ROOT, reorgEntry(old.split("/")[0]), ...old.split("/").slice(1))] : []),
    resolve(cwd, page)
  ]
  return candidates.find((each) => existsSync(each)) ?? resolve(ROOT, page)
}

/** Where top-level entry `name` of the old content folder went (`relocate.js` `reorgEntry()`, kept in step). */
function reorgEntry(name) {
  return (
    { epics: "epics", templates: "templates", details: "pages/details", "index.html": "pages/index.html" }[name] ??
    `guides/${name}`
  )
}

/**
 * Folders that hold no pages.
 * - `examples`:  fragments a page includes (`ui-import/examples/part.html`), not pages:  no sections, no contents
 * - `details`:  details pages (`spell dev details`), questions for one session:  not in the index, not checked with the
 *   docs (scratch `details/`, and an epic's `epics/<name>/details/`);  NOT the `details` epic's own folder,
 *   `epics/details/` (`findPages()`)
 * - `parts`:  a split plan doc's bodies (`epics/<name>/parts/<id>.html`, `PlanParts`):  fragments its page loads,
 *   told from pages by this folder alone since they're `.html` (Q12 of `epic-components`;  `.htm` before)
 */
const SKIP_DIRS = new Set(["node_modules", "experiments", "examples", "details", "parts"])

/**
 * Epic `name`'s plan doc in folder `dir` (`epics/<name>/`):  `<name>.plan.html`, else `<name>.html` when that is a
 * plan doc (`<body class="... plan-doc">`, or one in `<epic-*>` markup:  an `<epic-page>`);  `undefined` when
 * there's neither.
 * - why both names:  plan docs were renamed `<name>.plan.html` on 2026-10-04 (`review-review` P4), and a worktree
 *   cut before then still has `<name>.html` until it merges `main`
 * - `packages/epics/src/tool/PlanDocFiles.ts` `planDocIn()` is the same:  change both
 */
export function planDocIn(dir, name) {
  const file = join(dir, `${name}.plan.html`)
  if (existsSync(file)) return file
  const old = join(dir, `${name}.html`)
  if (!existsSync(old)) return undefined
  const html = readFileSync(old, "utf8")
  return /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(html) || /<epic-page\b/.test(html) ? old : undefined
}

/**
 * Every `.html` page under `dir` (a folder, or several;  default:  every area, `AREAS`), sorted, skipping tooling
 * folders.
 * - follows a link to a folder (each area is one, into the shared content repo):  the page keeps the link's path
 * - a missing folder has no pages
 */
export function findPages(dir = AREAS) {
  if (Array.isArray(dir)) return dir.flatMap((each) => findPages(each))
  if (!existsSync(dir)) return []
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory() || (entry.isSymbolicLink() && statSync(path, { throwIfNoEntry: false })?.isDirectory())) {
      // the `details` EPIC's folder (`epics/details/`) holds a plan doc:  only details PAGES' folders are skipped
      const epic = entry.name === "details" && basename(dir) === "epics"
      if (!SKIP_DIRS.has(entry.name) || epic) found.push(...findPages(path))
    } else if (entry.name.endsWith(".html")) found.push(path)
  }
  return found
}

/**
 * The file holding the plan doc at `file`'s log:  its part, `parts/log.html` (`parts/log.htm` before Q12 of
 * `epic-components`), when the doc is split (`PlanParts`), else the doc itself.  For the browser checks, which
 * add a log line and take it out again by hand.
 * - either markup:  the log's host says `source="parts/log.html"` in both (`<ui-section id="log">`, `<epic-section
 *   kind="log">`)
 */
export function planLogFile(file) {
  const source = /\bsource="(parts\/log\.html?)"/.exec(readFileSync(file, "utf8"))?.[1]
  const part = source && join(dirname(file), source)
  return part && existsSync(part) ? part : file
}

/**
 * Tidy `files` (absolute, or relative to the checkout's root) the way a page must be committed:  link targets, then
 * oxfmt (`vp fmt`).
 * - `doc-links.js` first:  it may add attributes oxfmt then wraps
 * - returns whether both succeeded;  their output is echoed
 * - run from `PACKAGE`, never a content folder:  each is a link, and a process started in one is in the shared repo,
 *   outside this yarn workspace
 * - every path goes ABSOLUTE:  from `PACKAGE` a page is `../../guides/...`, and oxfmt refuses `..`
 */
export function tidy(files) {
  const paths = files.map((file) => resolve(ROOT, file))
  for (const { command, args, env } of [docLinksRun(paths), { command: "yarn", args: ["vp", "fmt", ...paths] }]) {
    const run = spawnSync(command, args, { cwd: PACKAGE, encoding: "utf8", env })
    if (run.status !== 0) {
      process.stderr.write(`${run.stdout ?? ""}${run.stderr ?? ""}`)
      return false
    }
  }
  return true
}

/**
 * How to run `doc-links.js` with `args` as a child `node`, for `spawnSync(command, args, { env })`:  under `tsx`,
 * which maps its `$/assembler` import through this package's `tsconfig.json`, from whatever folder it runs in.
 * - the one way the tools run it (`tidy()`, `update.js`, goals' check, its own test)
 */
export function docLinksRun(args) {
  return {
    command: process.execPath,
    args: ["--import", "tsx", join(TOOLS, "doc-links.js"), ...args],
    env: { ...process.env, TSX_TSCONFIG_PATH: join(PACKAGE, "tsconfig.json") }
  }
}

/** Opens a doc in VS Code's doc preview:  the spell extension's URI handler (`packages/vscode/src/DocPreview.ts`). */
const VSCODE_PREVIEW = "vscode://spell-app.spell-language/doc-preview"

/**
 * This checkout's page server (`spell dev server`), started in the background if it isn't running:  `{ base, port }`,
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
 * A template's `html` fixed for a page `depth` folders below the checkout's root (`guides/glossary.html` is 1,
 * `epics/a/a.plan.html` 2).
 * - rewrites whatever depth the template assumed:  `_assets` paths (`<up>packages/docs/tools/_assets/`), the docs
 *   home's paths (`<up>pages/index.html`), the areas' list pages (`<up>epics/index.html` ...), and the site
 *   header's `root` (`<up>`:  the path up to the root)
 * - drops the template's `TEMPLATE:` how-to comment
 * - `docs:new`, `details new`, `plan-doc new`
 */
export function atDepth(html, depth) {
  const up = "../".repeat(depth)
  return html
    .replace(
      /((?:href|src)=")(?:\.\.\/)*(?:packages\/docs\/)?(?:tools\/)?_assets\//g,
      `$1${up}packages/docs/tools/_assets/`
    )
    .replace(/((?:href|src)=")(?:\.\.\/)*(?:pages\/)?index\.html/g, `$1${up}pages/index.html`)
    .replace(/((?:href|src)=")(?:\.\.\/)*(epics|guides|templates|brand)\/index\.html/g, `$1${up}$2/index.html`)
    .replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${up.replace(/\/$/, "") || "."}"`)
    .replace(/\n\s*<!--\s*TEMPLATE:[\s\S]*?-->/, "")
}

/** URL of `file` on the page server at `base`, e.g. `http://127.0.0.1:4747/pages/index.html`. */
export function serverUrl(base, file) {
  return `${base}/${relative(ROOT, resolve(file)).split(sep).map(encodeURIComponent).join("/")}`
}

/**
 * Show `file` rendered in VS Code's doc preview:  `spell dev plan-doc open <name>`, `spell dev plan-doc phase`, `/spell-docs`.
 * - starts this checkout's page server first (`ensurePageServer()`), so the page live-reloads;  the spell extension
 *   (`spell dev vscode`) finds it by its pid file and shows the page in a tab of the right side bar (or Simple Browser,
 *   `spell.docPreview.location`).  The page already in that tab isn't reloaded:  it updates itself.
 * - first asks THIS session's window, through the extension's window bridge (the repo root's
 *   `scripts/window.mjs`);  a `vscode://` URI goes to whichever window is focused
 * - NOT run from VS Code (`Window.inVSCode`:  a CLI session in another terminal):  `openInChrome()` instead, and
 *   `hash` and `view` are dropped
 * - `hash`:  an id on the page to land on, e.g. a goal `g1`
 * - `view`:  which side bar tab, `"docs"` ("Spell Docs", the default) or `"review"` ("Review":  `/epic review`,
 *   `spell dev docs open <page> --review`);  each keeps its own page
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
 * Show `file` in Chrome, in ONE tab per page, IN THE BACKGROUND:  `spell dev docs open <page>`;  `openInVSCode()`'s fallback.
 * - from this checkout's page server (live reload), started if need be;  `file://` if it can't start
 * - The tab is keyed by the page's path from the root (`/epics/<name>/<name>.plan.html`), not its full URL, so
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
  return serializeHTML(document.toString().replace(/^<!DOCTYPE html>/i, "<!doctype html>"))
}

/**
 * Serialized `html` (a document's, or a fragment's `innerHTML`) with boolean attributes bare (`styled`, not
 * `styled=""`), as `serialize()` writes a page;  a plan doc's part files too (`PlanParts`).
 */
export function serializeHTML(html) {
  for (let before; before !== html;) {
    before = html
    html = html.replace(/(<[a-z][\w-]*\b[^<>]*?) ([a-z][\w-]*)=""(?=[\s/>])/g, "$1 $2")
  }
  return html
}

/**
 * A tool's command line:  `--key value` flags (a bare `--show` is `true`), and everything else in order.
 * - `parseArgs(["open", "x.html", "--hash", "p2", "--show"])` -> `{ positional: ["open", "x.html"], flags: { hash:
 *   "p2", show: true } }`
 * @returns {{ positional: string[], flags: Record<string, string | true> }}
 */
export function parseArgs(argv) {
  const positional = []
  /** @type {Record<string, string | true>} */
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[argv[i].slice(2)] = argv[++i]
    else flags[argv[i].slice(2)] = true
  }
  return { positional, flags }
}
