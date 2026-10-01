/**
 * Where the docs are, how scripts find, tidy and open pages -- shared by `update.js`, `index.js`, `open.js` and
 * `plan-doc.js`.
 */
import { spawnSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
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

/** Opens a doc in VS Code's Simple Browser:  the spell extension's URI handler (`packages/vscode/src/DocPreview.ts`). */
const VSCODE_PREVIEW = "vscode://spell-app.spell-language/doc-preview"

/**
 * Show `file` rendered in a VS Code tab, beside the editor:  `yarn plan-doc open <name>`, `yarn plan-doc phase`.
 * - the spell extension (`yarn vscode`) serves the repo locally and shows the page in Simple Browser, ONE tab,
 *   reloaded on every open
 * - `open` can't fail (macOS):  without the extension, VS Code says it can't handle the URI
 * - `open` itself failed (not macOS):  falls back to Chrome
 */
export function openInVSCode(file) {
  const path = resolve(file)
  const run = spawnSync("open", [`${VSCODE_PREVIEW}?file=${encodeURIComponent(path)}`], { encoding: "utf8" })
  if (run.status === 0) return console.log(`opened ${path} in VS Code`)
  console.error(`VS Code via \`open\` failed (${(run.stderr ?? String(run.error)).trim()}):  falling back to Chrome`)
  openInChrome(file)
}

/**
 * Show `file` in Chrome, in ONE tab per page:  `yarn docs:open <page>`.
 * - finds a tab whose URL starts with the page's `file://` URL (any `#hash`), reloads it and brings it forward;
 *   else opens a new tab
 * - no Chrome (or AppleScript refused):  falls back to `open`, which can't reuse a tab
 */
export function openInChrome(file) {
  const url = pathToFileURL(resolve(file)).href
  const script = `
set target to ${JSON.stringify(url)}
tell application "Google Chrome"
  set found to false
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if (URL of t) starts with target then
        tell t to reload
        set active tab index of w to i
        set index of w to 1
        set found to true
        exit repeat
      end if
    end repeat
    if found then exit repeat
  end repeat
  if not found then
    if (count of windows) is 0 then make new window
    tell front window to make new tab with properties {URL:target}
  end if
  activate
end tell`
  const run = spawnSync("osascript", ["-e", script], { encoding: "utf8" })
  if (run.status === 0) return console.log(`opened ${url}`)
  console.error(`Chrome via AppleScript failed (${run.stderr.trim()}):  falling back to \`open\``)
  spawnSync("open", [url])
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
