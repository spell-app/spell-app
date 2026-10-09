/**
 * `spell dev docs offline [paths...] [--fix] [--json]`:  lists what docs pages LOAD from the internet,
 * by file and line, so they still work with no network (epic `airplane` P1:  Owen reads and marks docs on a plane).
 *
 *     spell dev docs offline
 *     guides/solid/solid-2.html:893  script  https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
 *     1 remote load in 1 of 412 pages
 *
 * - What counts:  what the browser fetches as the page loads
 *   - `<script src>`, `<img src>`, `<iframe src>`, `<source src>`, `<video src>`, `<audio src>`, `<embed src>`
 *   - `<link href>` that loads (`stylesheet`, `icon`, `preload`, `modulepreload`, `manifest`)
 *   - CSS `url(...)` and `@import`, in a page's `<style>` and in `.css` files
 * - What doesn't:  plain links (`<a href>`), and code shown on a page (`&lt;script ...` is text, not a tag)
 * - `<paths>`:  files and folders, from the current folder;  default:  the docs folders of this checkout
 *   (`DOCS_FOLDERS`), following their links into the shared content repo
 * - `--fix`:  first points the cdnjs highlight.js tag at the repo's copy (`HIGHLIGHT.local`), relative to each page,
 *   the way its `spell-ui.js` tag is;  then lists what's left
 * - `--json`:  `{ files, loads, fixed }`
 * - Exits 1 when a page still loads something remote, 0 when clean, 2 on a usage error.
 */
import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * The checker:  finds a page's remote loads, the pages to check, and the highlight.js fix.
 * - All `static`:  it keeps no state, so a test checks a plain string with `Offline.loadsIn()`.
 */
export class Offline {
  /** The remote loads in `text`, the contents of `file` (`.html` or `.css`), in line order. */
  static loadsIn(file: string, text: string): RemoteLoad[] {
    const patterns = extname(file) === ".css" ? CSS_LOADS : [...TAG_LOADS, ...CSS_LOADS]
    const loads = patterns.flatMap(({ kind, pattern }) =>
      [...text.matchAll(pattern)].map((match) => ({
        file,
        line: lineOf(text, match.index),
        kind,
        url: match.groups!.url!
      }))
    )
    return loads.sort((a, b) => a.line - b.line)
  }

  /**
   * `text`, the page at `file` in checkout `root`, with its cdnjs highlight.js tag pointing at the repo's copy.
   * - the path is relative to the page, as its `spell-ui.js` tag is, so it works from `file://` too
   */
  static fixHighlight(file: string, text: string, root: string): string {
    const local = relative(dirname(file), join(root, HIGHLIGHT.local))
    return text.replaceAll(HIGHLIGHT.cdn, local)
  }

  /**
   * The pages to check under `paths` (files or folders, from `cwd`):  every `.html` and `.css`, once each.
   * - folders are walked following links (the shared folders are links), skipping dot folders and `node_modules`
   * - throws `OfflineError` for a path that doesn't exist
   */
  static filesUnder(paths: string[], { cwd = process.cwd() } = {}): string[] {
    const files: string[] = []
    const seen = new Set<string>()
    for (const path of paths) {
      const full = resolve(cwd, path)
      if (!existsSync(full)) throw new OfflineError(`no such file or folder:  ${path}`)
      if (statSync(full).isDirectory()) walk(full)
      else files.push(full)
    }
    return files

    /** Add `folder`'s pages to `files`, once per real folder. */
    function walk(folder: string) {
      const real = realpathSync(folder)
      if (seen.has(real)) return
      seen.add(real)
      const entries = readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue
        const full = join(folder, entry.name)
        const isFolder =
          entry.isDirectory() || (entry.isSymbolicLink() && statSync(full, { throwIfNoEntry: false })?.isDirectory())
        if (isFolder) walk(full)
        else if (PAGE_EXTENSIONS.has(extname(entry.name))) files.push(full)
      }
    }
  }
}

/** Thrown for a usage error:  a missing path, an unknown flag, no checkout. */
export class OfflineError extends Error {}
OfflineError.prototype.name = "OfflineError"

/** One thing a page fetches from the internet as it loads. */
export type RemoteLoad = { file: string; line: number; kind: string; url: string }

/**
 * highlight.js, the one remote file docs pages loaded (epic `airplane` P1).
 * - SAME as `$/server/page` `HIGHLIGHT_JS`, whose `local` is this path from `/`:  docs imports no package
 */
export const HIGHLIGHT = {
  cdn: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
  local: "packages/docs/tools/_assets/highlight.min.js"
} as const

/** The folders `spell dev docs offline` checks by default, from the checkout's root. */
export const DOCS_FOLDERS = ["epics", "guides", "pages", "templates", "goals"]

/** Files it reads. */
const PAGE_EXTENSIONS = new Set([".html", ".css"])

/** A remote URL, captured as `url`. */
const URL = String.raw`(?<url>(?:https?:)?//[^"'\s)]+)`

/** Tags that fetch as the page loads. */
const TAG_LOADS = [
  { kind: "script", pattern: new RegExp(String.raw`<script\b[^>]*\bsrc=["']?${URL}`, "gi") },
  {
    kind: "media",
    pattern: new RegExp(String.raw`<(?:img|iframe|source|video|audio|embed)\b[^>]*\bsrc=["']?${URL}`, "gi")
  },
  {
    kind: "link",
    pattern: new RegExp(
      String.raw`<link\b(?=[^>]*\brel=["']?(?:stylesheet|icon|preload|modulepreload|manifest)\b)[^>]*\bhref=["']?${URL}`,
      "gi"
    )
  }
]

/** CSS that fetches:  any `url(...)` (an `@import url(...)` too), and an `@import "..."` without one. */
const CSS_LOADS = [
  { kind: "css", pattern: new RegExp(String.raw`url\(\s*["']?${URL}`, "gi") },
  { kind: "css", pattern: new RegExp(String.raw`@import\s+["']${URL}`, "gi") }
]

/** The 1-based line of `offset` in `text`. */
function lineOf(text: string, offset = 0): number {
  return text.slice(0, offset).split("\n").length
}

/** The checkout `start` is in:  the folder holding `.git` at or above it. */
function checkoutOf(start: string): string | undefined {
  for (let dir = resolve(start); ; dir = dirname(dir)) {
    if (existsSync(join(dir, ".git"))) return dir
    if (dirname(dir) === dir) return undefined
  }
}

////////////////
// ## The command
////////////////

/** Run `spell dev docs offline` with `args`:  fixes (`--fix`), prints the loads left, and returns the exit code. */
export function run(args: string[], { cwd = process.cwd() } = {}): number {
  const flags = new Set(args.filter((arg) => arg.startsWith("--")))
  const unknown = [...flags].find((flag) => !FLAGS.includes(flag))
  try {
    if (unknown) throw new OfflineError(`unknown flag ${unknown}:  ${FLAGS.join(", ")}`)
    const root = checkoutOf(cwd)
    if (!root) throw new OfflineError("not in a checkout")
    const named = args.filter((arg) => !arg.startsWith("--"))
    const paths = named.length ? named : DOCS_FOLDERS.filter((folder) => existsSync(join(root, folder)))
    const files = Offline.filesUnder(paths, { cwd: named.length ? cwd : root })
    const fixed: string[] = []
    const loads = files.flatMap((file) => {
      let text = readFileSync(file, "utf8")
      if (flags.has("--fix") && text.includes(HIGHLIGHT.cdn)) {
        writeFileSync(file, (text = Offline.fixHighlight(file, text, root)))
        fixed.push(file)
      }
      return Offline.loadsIn(file, text)
    })
    const shown = (file: string) => relative(cwd, file)
    if (flags.has("--json")) {
      const json = { files: files.length, loads: loads.map((load) => ({ ...load, file: shown(load.file) })) }
      console.log(JSON.stringify({ ...json, fixed: fixed.map(shown) }, null, 2))
    } else {
      if (fixed.length) console.log(`fixed highlight.js in ${fixed.length} pages`)
      for (const load of loads) console.log(`${shown(load.file)}:${load.line}  ${load.kind}  ${load.url}`)
      const pages = new Set(loads.map((load) => load.file)).size
      console.log(
        loads.length
          ? `${loads.length} remote loads in ${pages} of ${files.length} pages`
          : `no remote loads in ${files.length} pages`
      )
    }
    return loads.length ? 1 : 0
  } catch (error) {
    if (!(error instanceof OfflineError)) throw error
    console.error(`spell dev docs offline:  ${error.message}`)
    return 2
  }
}

/** The flags `run()` takes. */
const FLAGS = ["--fix", "--json"]

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2))
}
