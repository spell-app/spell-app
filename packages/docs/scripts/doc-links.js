/**
 * Link source references in `.html` docs:  one named target per destination, new tab.  See `packages/docs/AGENTS.md`
 * "Links".
 * Usage (from `packages/docs`):
 *   node scripts/doc-links.js <folder>/<doc>.html ...           -- add links (idempotent)
 *   node scripts/doc-links.js --check <folder>/<doc>.html ...   -- verify, exit 1 on problems
 * - `<code>path</code>` outside `<pre>` / `<a>` / `<head>` becomes a link when the path resolves to a real file or
 *   folder
 * - existing `<a href>` without a target gets one (external:  per URL;  sibling docs:  per file)
 * - `--check` verifies:  every local href resolves INSIDE the repo, every non-anchor link has a target, one target per
 *   destination (`target="_self"`, a same-tab link, is exempt from the last)
 *   - a missing target version control IGNORES is fine:  runtime files and local clones exist only on some
 *     machines, or while a server runs (`gitIgnored()`)
 * - Works on the page's TEXT with regexes, never a parsed DOM:  the edits touch only what they link, byte for byte.
 * - NOTE:  ported from `doc-links.py` on 2026-10-03;  makes the same edits to every page.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve as resolvePath } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { DOCS, ROOT } from "./pages.js"

/** `packages/`. */
const PACKAGES = dirname(DOCS)

/** `packages/ui`. */
const UI = join(PACKAGES, "ui")

/** Where `solid-js/...` references are looked up. */
const NODE_MODULES_DIRS = [join(UI, "node_modules"), join(ROOT, "node_modules")]

/**
 * Where bare file names (`withSolid.ts`) are looked up:
 * - every package's `src/`
 * - the docs, and UI's `docs/`
 */
const INDEX_ROOTS = [
  ...readdirSync(PACKAGES)
    .map((name) => join(PACKAGES, name, "src"))
    .filter(isDir),
  DOCS,
  join(UI, "docs")
]

/** Folders the bare-name index never walks into (nor any `.folder`). */
const SKIP_DIRS = new Set([
  "icons",
  "glyphs",
  "node_modules",
  ".git",
  "dist",
  "dist-element",
  "dist-runner",
  "build",
  ".cache",
  "graphify-out",
  "worktrees"
])

/** Code spans that aren't paths but still have a home. */
const SPECIAL = new Map([
  ["solidjs/solid", "https://github.com/solidjs/solid/tree/next"],
  ["solidjs/solid-docs", "https://github.com/solidjs/solid-docs/tree/v2-rebuild"],
  ["documentation/solid-2.0/", "https://github.com/solidjs/solid/tree/next/documentation/solid-2.0"],
  ["@spell-app/ui", join(UI, "README.md")],
  ["@spell-app/solid-element", join(PACKAGES, "solid-element/README.md")]
])

/** A plan doc, `packages/docs/epics/<name>/<name>.html`, relative to the repo root:  `[1]` is its name. */
const PLAN_DOC = /(?:^|\/)packages\/docs\/epics\/([^/]+)\/\1\.html$/

/** An absolute URL. */
const URL_START = /^https?:\/\//

/** A code span, `[1]` its text. */
const CODE_SPAN = /<code>([^<]+)<\/code\s*>/g

/** A `<pre>` block:  `linkText()` never links inside one, `checkText()` ignores it. */
const PRE = /<pre\b[\s\S]*?<\/pre\s*>/g

/** Ranges `linkText()` must not touch:  head, pre, script, style, existing links. */
const PROTECTED = [
  /<head>[\s\S]*?<\/head>/g,
  PRE,
  /<script\b[\s\S]*?<\/script\s*>/g,
  /<style\b[\s\S]*?<\/style\s*>/g,
  /<a\b[\s\S]*?<\/a\s*>/g
]

/** An `<a>` whose first attribute is `href`:  `[1]` the href. */
const A_HREF = /<a\s+href="([^"]+)"[^>]*>/g

/** A link opening right inside another:  nested links. */
const NESTED = /<a\b[^>]*>\s*<a\b/g

/** An `<a>` tag, `[1]` its attributes. */
const A_TAG = /<a\b([^>]*)>/g

/** A code span text that looks like a path, so not resolving it is worth reporting. */
const PATH_LIKE = /\.(ts|tsx|md|mjs|js|html|json)(:\d+)?$/

/** `solid-js/...` or `@solidjs/<pkg>/...` with an extension:  looked up in `node_modules`. */
const SOLID_FILE = /^(solid-js|@solidjs\/[\w-]+)\/.+\.\w+$/

/** A `solidjs.com` page. */
const SOLID_SITE = /^(v2\.)?solidjs\.com\/|^v2\.solidjs\.com/

/** Characters a path may hold, with an optional extension and trailing slash. */
const PATH_CHARS = /^[#~.@\w/-]+(\.\w+)?\/?$/

/** An old-style alias, `#name/rest`:  `[1]` the package, `[2]` the rest. */
const ALIAS = /^#([\w-]+)\/(.+)$/

/** Basename -> paths under `INDEX_ROOTS`, built on first use. */
let fileIndex

////////////////
// ## Linking
////////////////

/**
 * Link the code spans of the page at `path` and target its links, IN PLACE;  prints a summary line, then each
 * unresolved path-like span on its own line (they may hold `, `).
 * - SIDE EFFECT:  always rewrites the file, changed or not
 */
export function linkify(path) {
  const { text, linked, unresolved } = linkText(readFileSync(path, "utf8"), dirname(resolvePath(path)))
  writeFileSync(path, text)
  console.log(`${basename(path)}:  linked ${linked} code spans, ${unresolved.length} unresolved path-like`)
  for (const span of unresolved) console.log(`    ${span}`)
}

/**
 * `text` (a page in `docDir`) with its code spans linked and every link given a target.
 * - `linked`:  how many code spans became links
 * - `unresolved`:  path-like code spans that resolve to nothing, sorted
 */
export function linkText(text, docDir) {
  const spans = PROTECTED.flatMap((pattern) =>
    Array.from(text.matchAll(pattern), (m) => [m.index, m.index + m[0].length])
  )
  const out = []
  let last = 0
  let linked = 0
  const unresolved = new Set()
  for (const m of text.matchAll(CODE_SPAN)) {
    if (spans.some(([start, end]) => start <= m.index && m.index < end)) continue
    let dest = resolve(m[1], docDir)
    // a path outside the repo (a handoff in a sibling folder) works only on this machine:  leave it as text
    if (dest && !URL_START.test(dest) && !insideRepo(dest)) dest = undefined
    if (!dest) {
      if (m[1].includes("/") || PATH_LIKE.test(m[1].trim())) unresolved.add(m[1])
      continue
    }
    // `|| "."`:  the page's own folder
    let href = URL_START.test(dest) ? dest : relative(docDir, dest) || "."
    if (isDir(dest) && !href.endsWith("/")) href += "/"
    out.push(text.slice(last, m.index))
    out.push(`<a href="${escapeAttribute(href)}" target="${targetFor(dest)}">${m[0]}</a>`)
    last = m.index + m[0].length
    linked++
  }
  out.push(text.slice(last))
  const result = out.join("").replace(A_HREF, (tag, href) => addTarget(tag, href, docDir))
  return { text: result, linked, unresolved: [...unresolved].sort((a, b) => a.localeCompare(b)) }
}

/**
 * `tag`, an `<a href>` in a page in `docDir`, with a target:
 * - in-page anchors (`#id`) are left alone
 * - a tag with a target keeps it, except a plan doc's:  renamed to its `<name>` (pre-2026-10-01 targets)
 */
function addTarget(tag, href, docDir) {
  if (href.startsWith("#")) return tag
  const dest = URL_START.test(href) ? href : resolvePath(docDir, href.split("#")[0])
  if (tag.includes("target=")) {
    if (URL_START.test(dest) || !PLAN_DOC.test(relative(ROOT, dest))) return tag
    return tag.replace(/target="[^"]*"/g, () => `target="${targetFor(dest)}"`)
  }
  return `${tag.slice(0, -1)} target="${targetFor(dest)}">`
}

/**
 * The tab name for `dest`, an absolute path or URL:  re-clicks reuse that tab.
 * - URLs:  `ext-<slug>`
 * - a plan doc:  its `<name>`, since the page sets `window.name` to it and `yarn plan-doc open <name>` reuses it
 * - anything else:  `src-<slug of the repo-relative path>`
 */
export function targetFor(dest) {
  if (URL_START.test(dest)) return `ext-${slug(dest.replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80)}`
  const rel = relative(ROOT, dest)
  const plan = PLAN_DOC.exec(rel)
  if (plan) return plan[1]
  return `src-${slug(rel).slice(0, 80)}`
}

/** `text` lower-cased, every run of non-alphanumerics a single `-`, none at the ends. */
function slug(text) {
  return text
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

/** `text` safe inside a double-quoted attribute. */
function escapeAttribute(text) {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

////////////////
// ## Resolving
////////////////

/**
 * A code span's text -> an existing absolute path or `https://` URL, else `undefined`.
 * - tries, in order:  `SPECIAL`, `solid-js/...` in `node_modules`, `solidjs.com` pages, then the path against the
 *   page's folder, its `experiments/`, the repo root, `packages/`, the docs and UI;  a bare file name last, when ONE
 *   file outside a `test/` folder has it
 * - `file.ts:75` drops its line number
 * - NOTE:  the alias form is `#name/...`, from before the `$/` aliases:  a `$/name/...` span never resolves
 */
export function resolve(raw, docDir = DOCS) {
  const text = decodeEntities(raw).trim()
  if (SPECIAL.has(text)) return SPECIAL.get(text)
  if (SOLID_FILE.test(text)) {
    for (const folder of NODE_MODULES_DIRS) if (existsSync(join(folder, text))) return join(folder, text)
  }
  if (SOLID_SITE.test(text)) return `https://${text}`
  let path = text.replace(/:\d+$/, "")
  // `/`, `./`, `..`:  operators and punctuation, not paths (`/` resolved to the filesystem root)
  if (!/[A-Za-z0-9]/.test(path)) return undefined
  if (!PATH_CHARS.test(path) || (!path.includes("/") && !path.includes("."))) return undefined
  const alias = ALIAS.exec(path)
  if (alias) path = join(PACKAGES, alias[1], "src", alias[2])
  // `resolvePath`, not `join`:  an absolute `path` stands on its own
  const bases = path.startsWith("node_modules/") ? [ROOT, UI] : [ROOT, PACKAGES, DOCS, UI]
  const candidates = [docDir, join(docDir, "experiments"), ...bases].map((base) => resolvePath(base, path))
  const found = candidates.find((candidate) => existsSync(candidate))
  if (found) return found
  if (!path.replace(/\/+$/, "").includes("/")) {
    const hits = (getFileIndex().get(path) ?? []).filter((hit) => !hit.includes("/test/"))
    if (hits.length === 1) return hits[0]
  }
  return undefined
}

/** Basename -> paths, for bare file names like `withSolid.ts`;  walks `INDEX_ROOTS` once. */
function getFileIndex() {
  if (!fileIndex) {
    fileIndex = new Map()
    for (const root of INDEX_ROOTS) walk(root, fileIndex)
  }
  return fileIndex
}

/**
 * Add every file under `dir` to `index`:
 * - skips `SKIP_DIRS` and `.folders`
 * - never follows a symlinked folder;  a symlinked file (or a broken link) counts as a file
 * - an unreadable folder adds nothing
 */
function walk(dir, index) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".")) walk(path, index)
    } else if (!entry.isSymbolicLink() || !isDir(path)) {
      if (!index.has(entry.name)) index.set(entry.name, [])
      index.get(entry.name).push(path)
    }
  }
}

/** Whether `path` is a folder (following symlinks);  `false` when it doesn't exist. */
function isDir(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * Whether version control ignores `path`:  a local-only or runtime file (`.spell-server.json`, a local clone in
 * `packages/ui/reference/`), fine to be missing here.
 * - a folder MUST keep its trailing `/`:  a missing path can't match a folder-only rule (`ongoing/`) without it
 */
function gitIgnored(path) {
  return spawnSync("git", ["-C", ROOT, "check-ignore", "-q", path]).status === 0
}

/** Whether `path`, absolute and normalised, is the repo root or inside it. */
function insideRepo(path) {
  return path === ROOT || path.startsWith(`${ROOT}/`)
}

/**
 * `text` with its character references (`&amp;`, `&#47;` ...) decoded, by linkedom's HTML parser.
 * - NOTE:  `<` is escaped first, so the text can't open a tag
 */
function decodeEntities(text) {
  if (!text.includes("&")) return text
  const { document } = parseHTML(`<html><body><p>${text.replaceAll("<", "&lt;")}</p></body></html>`)
  return document.querySelector("p")?.textContent ?? text
}

////////////////
// ## Checking
////////////////

/** Check the page at `path`;  prints a summary line, then each problem.  Returns whether it passed. */
export function check(path) {
  const { destinations, problems } = checkText(readFileSync(path, "utf8"), dirname(resolvePath(path)))
  console.log(`${basename(path)}:  ${destinations} destinations, ${problems.length} problems`)
  for (const problem of problems) console.log(`    ${problem}`)
  return !problems.length
}

/**
 * The links of `text` (a page in `docDir`), outside `<pre>`:
 * - `destinations`:  how many distinct destinations the targeted links have
 * - `problems`:  nested links, missing or outside-the-repo files, links with no target, a destination with several
 *   targets, a target shared by several destinations
 */
export function checkText(text, docDir) {
  const byDest = new Map()
  const byTarget = new Map()
  const body = text.replace(PRE, "")
  const nested = Array.from(body.matchAll(NESTED)).length
  const problems = nested ? [`${nested} nested links`] : []
  for (const m of body.matchAll(A_TAG)) {
    const attrs = m[1]
    const hrefMatch = /href="([^"]+)"/.exec(attrs)
    const target = /target="([^"]+)"/.exec(attrs)?.[1]
    if (!hrefMatch || hrefMatch[1].startsWith("#")) continue
    const href = decodeEntities(hrefMatch[1])
    const local = !URL_START.test(href)
    const dest = local ? resolvePath(docDir, href.split("#")[0]) : href
    if (local && !existsSync(dest)) {
      if (!gitIgnored(dest + (href.split("#")[0].endsWith("/") ? "/" : ""))) problems.push(`missing:  ${href}`)
    }
    else if (local && !insideRepo(dest)) problems.push(`outside repo:  ${href}`)
    if (!target) {
      problems.push(`no target:  ${href}`)
      continue
    }
    // `_self`:  a page that reads like a site (the master plan) navigates in place, on purpose
    if (target === "_self") continue
    if (!byDest.has(dest)) byDest.set(dest, new Set())
    byDest.get(dest).add(target)
    if (!byTarget.has(target)) byTarget.set(target, new Set())
    byTarget.get(target).add(dest)
  }
  for (const [dest, targets] of byDest)
    if (targets.size > 1) problems.push(`several targets for ${dest}:  ${[...targets].join(", ")}`)
  for (const [target, dests] of byTarget)
    if (dests.size > 1) problems.push(`target ${target} shared by ${[...dests].join(", ")}`)
  return { destinations: byDest.size, problems }
}

////////////////
// ## Command line
////////////////

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2)
  const files = args.filter((arg) => !arg.startsWith("--"))
  if (!files.length) {
    console.error(
      [
        "usage (from packages/docs):",
        "  node scripts/doc-links.js <folder>/<doc>.html ...           -- add links (idempotent)",
        "  node scripts/doc-links.js --check <folder>/<doc>.html ...   -- verify, exit 1 on problems"
      ].join("\n")
    )
    process.exit(1)
  }
  if (args.includes("--check")) process.exit(files.map(check).every(Boolean) ? 0 : 1)
  for (const file of files) linkify(file)
}
