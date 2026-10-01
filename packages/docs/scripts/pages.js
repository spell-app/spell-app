/**
 * Where the docs are, how scripts find, tidy and open pages -- shared by `update.js`, `index.js`, `open.js` and
 * `plan-doc.js`.
 */
import { spawnSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/** `packages/docs`. */
export const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** Folders that hold no pages. */
const SKIP_DIRS = new Set(["_assets", "scripts", "node_modules", "experiments"])

/** Every `.html` page under `dir` (default:  all of them), sorted, skipping tooling folders. */
export function findPages(dir = DOCS) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...findPages(path))
    } else if (entry.name.endsWith(".html")) found.push(path)
  }
  return found
}

/**
 * Tidy `files` (paths relative to `DOCS`) the way a page must be committed:  link targets, then oxfmt.
 * - `doc-links.py` first:  it may add attributes oxfmt then wraps
 * - returns whether both succeeded;  their output is echoed
 */
export function tidy(files) {
  for (const [command, args] of [
    ["python3", ["scripts/doc-links.py", ...files]],
    ["yarn", ["oxfmt", ...files]]
  ]) {
    const run = spawnSync(command, args, { cwd: DOCS, encoding: "utf8" })
    if (run.status !== 0) {
      process.stderr.write(`${run.stdout ?? ""}${run.stderr ?? ""}`)
      return false
    }
  }
  return true
}

/**
 * Show `file` in Chrome, in ONE tab per page, IN THE BACKGROUND:  `yarn docs:open <page>`, `yarn plan-doc open <name>`.
 * - The tab is keyed by the page's path inside `packages/docs` (`plans/<name>/<name>.html`), not its full URL, so
 *   the same page from another checkout (a worktree) reuses it:  re-pointed if the URL differs, else reloaded.
 *   The page names its tab the same way (`spell-doc-runtime.js` `window.name`;  links use that `target`).
 * - Never brings Chrome or its window forward:  the tab is made active in ITS window only;  a new tab goes in the
 *   front window.
 * - Chrome not running, or AppleScript refused:  `open -g -a "Google Chrome"`, which can't reuse a tab, and Chrome
 *   may still raise itself for a URL it's handed (seen 2026-10-01).
 * - NOTE: `key` is an AppleScript keyword:  the variable is `pageKey`.
 */
export function openInChrome(file) {
  const url = pathToFileURL(resolve(file)).href
  const key = `/packages/docs/${relative(DOCS, resolve(file))}`
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
        return "reused"
      end if
    end repeat
  end repeat
  if (count of windows) is 0 then make new window
  tell front window to make new tab with properties {URL:target}
  return "new tab"
end tell`
  const run = spawnSync("osascript", ["-e", script], { encoding: "utf8" })
  const how = run.stdout.trim()
  if (run.status === 0 && how !== "launch") return console.log(`opened ${url} (${how}, in the background)`)
  if (run.status !== 0) console.error(`Chrome via AppleScript failed (${run.stderr.trim()}):  falling back to \`open\``)
  spawnSync("open", ["-g", "-a", "Google Chrome", url])
  console.log(`opened ${url} (Chrome launched in the background)`)
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
