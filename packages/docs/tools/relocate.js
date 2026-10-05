/**
 * The docs' two moves:  where each repo path went, and how to rewrite a file's links and path mentions to match.
 * - the CONTENT move (epic `shared-content`, P2, 2026-10-04):  `packages/docs` kept only the package and `tools/`;
 *   every page, plan doc and template moved to `packages/docs/content/`, the docs scripts and `_assets` to
 *   `packages/docs/tools/`, the goals tooling to `packages/docs/tools/goals/`, the three root logs to `agents/`
 *   (`CONTENT_MOVE`, `repairCheckout()`)
 * - the REORG (epic `claude-design`, P4, 2026-10-05):  the shared repo's `packages/docs/content/` split into root
 *   folders, each linked at the root of every checkout:  `epics/`, `templates/`, `guides/` (every other page) and
 *   `pages/` (the docs home and the scratch details pages).  Old-path links stay behind in the shared repo's
 *   `packages/docs/content/`, for checkouts on older code (`REORG_MOVE`, `reorgShared()`)
 * - each ran once on everything;  since then by `spell dev shared repair`:  after a branch from before a move merges
 *   `main`, or when older code wrote pages the old way
 * - `node tools/relocate.js repair [--root <checkout>] [--shared <dir>] [--dry-run] [--json]`:  `repairCheckout()`,
 *   then, with `--shared`, `reorgShared()`;  `reorg --shared <dir>`:  `reorgShared()` alone (`spell dev shared commit`)
 */
import { spawnSync } from "node:child_process"
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from "node:fs"
import { dirname, join, posix, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/** What stayed at the top of `packages/docs`:  everything else there is content. */
const DOCS_KEEP = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "tsconfig.json",
  "vitest.config.ts",
  "node_modules",
  "tools",
  "content"
])

/**
 * Moved prefixes, first match wins:  `[old, new]`, repo-relative.
 * - the generic `packages/docs/<entry>` -> `packages/docs/content/<entry>` rule is in `movedPath()`
 */
const PREFIXES = [
  ["packages/docs/scripts", "packages/docs/tools"],
  ["packages/docs/_assets", "packages/docs/tools/_assets"],
  ["goals/_tools", "packages/docs/tools/goals"],
  ["goals/_skills", "packages/docs/tools/goals/skills"],
  ["goals/tsconfig.json", "packages/docs/tsconfig.json"],
  ["PAPERCUTS.md", "agents/PAPERCUTS.md"],
  ["SUSPECTED-BUGS.md", "agents/SUSPECTED-BUGS.md"],
  ["CODE-DEBT.md", "agents/CODE-DEBT.md"]
]

/**
 * Where repo path `path` went in the CONTENT move (posix, repo-relative, no leading `/`), or `undefined` when it
 * didn't move.
 * - `packages/docs` itself (a link to the docs folder) means its pages:  `packages/docs/content`
 */
export function movedPath(path) {
  const trimmed = path.replace(/\/$/, "")
  for (const [from, to] of PREFIXES) {
    if (trimmed === from || trimmed.startsWith(`${from}/`)) return to + trimmed.slice(from.length)
  }
  if (trimmed === "packages/docs") return "packages/docs/content"
  const m = /^packages\/docs\/([^/]+)(\/.*)?$/.exec(trimmed)
  if (m && !DOCS_KEEP.has(m[1])) return `packages/docs/content/${m[1]}${m[2] ?? ""}`
  return undefined
}

/**
 * One move, as `relocateLink()` and friends need it.
 * - `moved(path)`:  where repo path `path` went, or `undefined`
 * - `settled(file)`:  a file that didn't move but already links the new way:  left alone
 */
export const CONTENT_MOVE = {
  moved: movedPath,
  // a page already in `content/` that didn't move links the new way:  re-mapping would send `../app/` into content
  settled: (file) => file.startsWith("packages/docs/content/")
}

/** A link worth relocating:  relative, not an anchor, a URL, a template placeholder or a variable. */
function isRelative(link) {
  return link !== "" && !/^(?:[a-z][a-z0-9+.-]*:|\/|#|\{\{|\$|`)/i.test(link)
}

/**
 * `link`, written in a file that was at `oldFile` and is now at `newFile` (both repo-relative), pointing where its
 * target is now after `move` (default:  the content move).  Unchanged when it isn't relative.
 * - a target outside the repo (`../outstanding/x.md`) keeps pointing there:  re-relativized when the file moved
 */
export function relocateLink(link, oldFile, newFile, move = CONTENT_MOVE) {
  if (!isRelative(link)) return link
  if (oldFile === newFile && move.settled(newFile)) return link
  const [, path, rest = ""] = /^([^?#]*)(.*)$/.exec(link)
  if (!path) return link
  const target = posix.normalize(posix.join(posix.dirname(oldFile), path))
  if (target.startsWith("..")) {
    if (oldFile === newFile) return link
    const out = posix.relative(posix.dirname(newFile), target) + (path.endsWith("/") ? "/" : "")
    return out === path ? link : out + rest
  }
  const movedTo = target === "." ? undefined : move.moved(target)
  if (!movedTo && oldFile === newFile) return link
  const moved = movedTo ?? (target === "." ? "" : target)
  let rel = posix.relative(posix.dirname(newFile), moved) || "."
  if (path.endsWith("/") && !rel.endsWith("/")) rel += "/"
  if (rel === "./" && !path.startsWith(".")) rel = "./"
  return rel === path ? link : rel + rest
}

/**
 * `text` of a file moved from `oldFile` to `newFile` (or not moved:  the same path), with every relative link
 * relocated after `move`:  HTML `href` / `src` / the site header's `root`, and markdown `](...)` links.
 */
export function relocateLinks(text, oldFile, newFile, move = CONTENT_MOVE) {
  return text
    .replace(
      /\b(href|src|root)="([^"]*)"/g,
      (all, attr, link) => `${attr}="${relocateLink(link, oldFile, newFile, move)}"`
    )
    .replace(/\]\(([^)\s]+)\)/g, (all, link) => `](${relocateLink(link, oldFile, newFile, move)})`)
}

/**
 * `text` of page `file` (repo-relative) with each relative link that points nowhere re-read as if written at the
 * page's old place, when that finds a file.
 * - for edits made against an old layout and merged in afterwards (a worktree, `main` before the cutover), or
 *   written by older code through an old-path link:  their links are relative to the old place, the rest of the
 *   page's to the new
 * - `exists(repoPath)` -- whether a repo-relative path exists
 * - `oldPlace(file)` -- where `file` was before `move`, or `undefined`;  default the content move's
 *   (`packages/docs/content/<x>` was `packages/docs/<x>`)
 */
export function repairLinks(
  text,
  file,
  exists,
  oldPlace = (path) => path.replace(/^packages\/docs\/content\//, "packages/docs/"),
  move = CONTENT_MOVE
) {
  const oldFile = oldPlace(file)
  if (!oldFile || oldFile === file) return text
  return text.replace(/\b(href|src)="([^"]*)"/g, (all, attr, link) => {
    if (!isRelative(link)) return all
    const path = link.replace(/[?#].*$/, "")
    const current = path && posix.normalize(posix.join(posix.dirname(file), path))
    if (!path || exists(current)) return all
    const fixed = relocateLink(link, oldFile, file, move)
    const target = posix.normalize(posix.join(posix.dirname(file), fixed.replace(/[?#].*$/, "")))
    // a target that isn't there yet (code on another branch) still counts when the link as it stands leaves the repo
    // and the old reading stays inside:  an old-depth link, three folders too deep for its new place
    const escapes = current.startsWith("..") && !target.startsWith("..")
    return fixed !== link && (exists(target) || escapes) ? `${attr}="${fixed}"` : all
  })
}

/** Repo paths written out in prose or code, longest first, so `packages/docs/scripts/x` beats `packages/docs`. */
const MENTION =
  /(?<![\w./-])(packages\/docs\/[\w.-]+(?:\/[\w.*-]+)*|goals\/(?:_tools|_skills|tsconfig\.json)(?:\/[\w.*-]+)*|(?:PAPERCUTS|SUSPECTED-BUGS|CODE-DEBT)\.md)/g

/**
 * `text` with every repo path it mentions (`packages/docs/solid/solid-2.md`, `goals/_tools/goals.js`,
 * `PAPERCUTS.md`) updated to where the CONTENT move put it.
 * - only whole paths from the repo root:  `../_assets/x.css` is a link, for `relocateLinks()`
 */
export function relocateMentions(text) {
  return text.replace(MENTION, (path) => movedPath(path) ?? path)
}

////////////////
// ## The reorg
////////////////

/** The folder the reorg emptied:  in the shared repo, and in every checkout on older code (a link to it). */
export const OLD_CONTENT = "packages/docs/content"

/** Entries of the old content folder that didn't become guides:  `[old entry, new path]`. */
const REORG = new Map([
  ["epics", "epics"],
  ["templates", "templates"],
  ["details", "pages/details"],
  ["index.html", "pages/index.html"]
])

/** The root folders the reorg filled, each linked at the root of every checkout. */
export const REORG_ROOTS = ["epics", "templates", "guides", "pages"]

/**
 * Where top-level entry `name` of the old content folder went:  `epics` and `templates` to the root,
 * `details` and `index.html` into `pages/`, anything else into `guides/`.
 */
export function reorgEntry(name) {
  return REORG.get(name) ?? `guides/${name}`
}

/** Where repo path `path` went in the REORG, or `undefined` when it isn't inside the old content folder. */
export function reorgPath(path) {
  const m = /^packages\/docs\/content\/([^/]+)(\/.*)?$/.exec(path.replace(/\/$/, ""))
  return m ? reorgEntry(m[1]) + (m[2] ?? "") : undefined
}

/** Where `file`, now in a reorg folder, was before (`reorgPath()` backwards);  `undefined` outside them. */
export function reorgOldPlace(file) {
  for (const [from, to] of REORG) {
    if (file === to || file.startsWith(`${to}/`)) return `${OLD_CONTENT}/${from}${file.slice(to.length)}`
  }
  return file.startsWith("guides/") ? `${OLD_CONTENT}/${file.slice("guides/".length)}` : undefined
}

/** The reorg, for `relocateLink()`:  nothing is "settled", every file maps its links into the new folders. */
export const REORG_MOVE = { moved: reorgPath, settled: () => false }

/**
 * A path written out in prose or code under the old content folder:  `[1]` its first entry, `[2]` the rest.
 * - a leading `/` only from a server root (`"/packages/docs/content/index.html"`):  `x/packages/docs/content/...` is
 *   some other folder's copy (a worktree, `shared-pending/`), and stays
 */
const REORG_MENTION = /(?<![\w.-]|[\w.-]\/)packages\/docs\/content\/([\w.-]+)((?:\/[\w.*<>{}-]+)*\/?)/g

/**
 * `text` with every path under the old content folder it mentions updated to where the reorg put it.
 * - only entries that really moved:  `epics`, `templates`, `details`, `index.html`, and the guides in `guides`
 *   (a placeholder like `packages/docs/content/<x>` stays as it is)
 * - the bare folder (`packages/docs/content/`) stays:  it's history, or an old-path link
 */
export function reorgMentions(text, guides) {
  return text.replace(REORG_MENTION, (all, entry, rest) =>
    REORG.has(entry) || guides.has(entry) ? `${reorgEntry(entry)}${rest}` : all
  )
}

/**
 * `text` of page `file` (repo-relative, in a reorg folder) with its site header's `root` (the path up to the
 * checkout's root) right for its depth.
 */
export function headerRoot(text, file) {
  const root = "../".repeat(file.split("/").length - 1).replace(/\/$/, "") || "."
  return text.replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${root}"`)
}

/**
 * The reorg, run in shared repo `dir` (`spell dev shared repair --shared`;  once for real on 2026-10-05).  Idempotent:
 * re-run, it moves only what older code wrote at the old paths since.  Returns what it did (or, `dryRun`, would do),
 * repo-relative:  `{ moved, merged, conflicts, links, rewritten }`.
 * 1. every REAL entry in `packages/docs/content/` (not one of the old-path links) goes to its new place
 *    (`reorgEntry()`):  renamed whole when the place is free (`moved`), else merged file by file (`merged`;  a file
 *    already there and different stays put:  `conflicts`, for a person)
 * 2. an old-path link takes its place (`links`):  `packages/docs/content/epics -> ../../../epics`, so older code
 *    still finds it
 * 3. every `.html` / `.md` in the shared repo (links not followed):  links relocated (a moved file's from its old
 *    place;  anyone's into the moved ones), links that point nowhere re-read as written at the old place
 *    (`repairLinks()`), tab names (`retarget()`), the site header's `root`, path mentions;  `.json` mentions only
 *    (`rewritten`).  Links into Spell UI's pages too, which left `packages/ui/site/` for `ui/` (`uiSitePath()`,
 *    claude-design P6)
 * - `checkout`:  where repo paths outside the shared folders resolve (`exists`), e.g. `packages/ui/...`
 * - path MENTIONS in prose (`reorgMentions()`) only in files that moved just now, unless `allMentions` (the first run,
 *   2026-10-05):  a page in place may name an old path on purpose (history, the old-path links)
 * - plan docs are rewritten under their lock (`<file>.lock`, as `spell dev plan-doc` takes it);  the moves wait for
 *   every plan doc's lock, so no edit lands mid-move
 */
export function reorgShared(dir, checkout, { dryRun = false, allMentions = false } = {}) {
  const report = { moved: [], merged: [], conflicts: [], links: [], rewritten: [] }
  const old = join(dir, OLD_CONTENT)
  const movedFrom = new Map()
  const entries = existsSync(old)
    ? readdirSync(old, { withFileTypes: true }).filter(
        (entry) => !entry.isSymbolicLink() && entry.name !== ".DS_Store" && !entry.name.endsWith(".lock")
      )
    : []
  withLocks(entries.length && !dryRun ? planDocsIn(dir) : [], () => {
    for (const entry of entries) moveEntry(dir, entry.name, report, movedFrom, dryRun)
  })
  if (!dryRun) ensureIgnores(dir)
  const guides = new Set(existsSync(join(dir, "guides")) ? readdirSync(join(dir, "guides")) : [])
  const exists = (path) => existsSync(join(SHARED_ROOTS.has(path.split("/")[0]) ? dir : checkout, path))
  for (const file of textFiles(dir)) {
    const before = movedFrom.get(file) ?? file
    const full = join(dir, dryRun ? before : file)
    if (!existsSync(full)) continue
    const mentions = allMentions || before !== file
    const fix = (text) => rewrite(text, before, file, { guides, exists, mentions })
    // a plan doc, or one of its parts (`parts/<id>.htm`, plan fragments):  under the doc's lock
    const doc = planDocOf(file)
    const changed = doc && !dryRun ? withLocks([join(dir, doc)], () => apply(full, fix)) : apply(full, fix, dryRun)
    if (changed) report.rewritten.push(file)
  }
  return report
}

/** Folders a repo path is looked up in the shared repo for (the rest:  in the checkout). */
const SHARED_ROOTS = new Set([...REORG_ROOTS, "goals", "agents", "brand", "ui"])

/**
 * Where repo path `path` went when Spell UI's pages left `packages/ui/site/` for the shared `ui/` (claude-design P6,
 * 2026-10-05), or `undefined`:  every entry but the built half, `_src/`, `_assets/` and `_data/`, which stayed
 * (`_data/search.json` moved too:  it's built from the pages).
 * - the folder itself stays:  it still holds the build
 * - SAME split as `packages/server`'s `UI_SITE` and `packages/ui`'s `SITE_PAGES` / `SITE_BUILD`
 */
export function uiSitePath(path) {
  const m = /^packages\/ui\/site\/([^/]+)(\/.*)?$/.exec(path.replace(/\/$/, ""))
  if (!m) return undefined
  const [, entry, rest = ""] = m
  if (entry === "_data" && rest === "/search.json") return "ui/_data/search.json"
  return UI_SITE_KEPT.has(entry) ? undefined : `ui/${entry}${rest}`
}

/** Entries of `packages/ui/site/` that stayed when the pages left:  the built half. */
const UI_SITE_KEPT = new Set(["_src", "_assets", "_data"])

/** Spell UI's pages' move, for `relocateLink()`:  every file maps its links to them into `ui/`. */
export const UI_SITE_MOVE = { moved: uiSitePath, settled: () => false }

/**
 * `text` of a file at `file` (repo-relative;  it was at `before`) with everything `reorgShared()` step 3 fixes.
 * - `guides`:  the top-level entries of `guides/`;  `exists(repoPath)`:  whether a path exists
 */
function rewrite(text, before, file, { guides, exists, mentions }) {
  if (file.endsWith(".json")) return mentions ? reorgMentions(text, guides) : text
  let out = relocateLinks(text, before, file, REORG_MOVE)
  // links into Spell UI's pages, which left `packages/ui/site/` for `ui/` (claude-design P6)
  out = relocateLinks(out, file, file, UI_SITE_MOVE)
  if (mentions) out = reorgMentions(out, guides)
  if (file.endsWith(".html")) {
    // a file that moved just now was relocated whole;  one already in place may hold links older code wrote
    if (before === file && reorgOldPlace(file)) out = repairLinks(out, file, exists, reorgOldPlace, REORG_MOVE)
    if (reorgOldPlace(file)) out = headerRoot(out, file)
    out = reorgOldPlace(file) ? retarget(out, file) : retarget(out, file, /^src-packages-(docs-content|ui-site)-/)
  }
  // a plan doc's part (`parts/<id>.htm`):  the tab names of the links the moves changed
  if (file.endsWith(".htm")) out = retarget(out, file, /^src-packages-(docs-content|ui-site)-/)
  return out
}

/** `fix` applied to the file at `full`, written back when it changed (unless `dryRun`);  whether it changed. */
function apply(full, fix, dryRun = false) {
  const text = readFileSync(full, "utf8")
  const fixed = fix(text)
  if (fixed === text) return false
  if (!dryRun) writeFileSync(full, fixed)
  return true
}

/** `reorgShared()` steps 1 and 2 for entry `name` of the old content folder. */
function moveEntry(dir, name, report, movedFrom, dryRun) {
  const from = `${OLD_CONTENT}/${name}`
  const to = reorgEntry(name)
  const files = filesUnder(dir, from)
  if (!existsSync(join(dir, to))) {
    for (const file of files) movedFrom.set(reorgPath(file), file)
    report.moved.push(`${from} -> ${to}`)
    if (!dryRun) {
      mkdirSync(dirname(join(dir, to)), { recursive: true })
      renameSync(join(dir, from), join(dir, to))
    }
  } else {
    let clash = false
    for (const file of files) {
      const target = reorgPath(file)
      if (existsSync(join(dir, target))) {
        if (readFileSync(join(dir, file)).equals(readFileSync(join(dir, target)))) {
          if (!dryRun) rmSync(join(dir, file))
        } else {
          clash = true
          report.conflicts.push(file)
        }
        continue
      }
      movedFrom.set(target, file)
      report.merged.push(`${file} -> ${target}`)
      if (!dryRun) {
        mkdirSync(dirname(join(dir, target)), { recursive: true })
        renameSync(join(dir, file), join(dir, target))
      }
    }
    if (clash) return
    if (!dryRun) rmSync(join(dir, from), { recursive: true, force: true })
  }
  report.links.push(from)
  if (!dryRun) symlinkSync(posix.relative(posix.dirname(from), to), join(dir, from))
}

/**
 * The shared repo's `.gitignore` lines for the new places:  scratch details pages, review inboxes.
 * - the old ones stay:  harmless, and an older `spell dev shared init` writes them
 */
function ensureIgnores(dir) {
  const file = join(dir, ".gitignore")
  const text = existsSync(file) ? readFileSync(file, "utf8") : ""
  const missing = ["pages/details/", "epics/*/*.inbox.json*"].filter((line) => !text.split("\n").includes(line))
  if (missing.length)
    writeFileSync(file, `${text.replace(/\n?$/, "\n")}# the reorg's places (claude-design P4)\n${missing.join("\n")}\n`)
}

/**
 * Every `.html`, `.htm` (a plan doc's parts), `.md` and `.json` file in shared repo `dir`, repo-relative, sorted.
 * - never follows a link (the old-path links would list every moved file twice), nor walks `.git` or `node_modules`
 */
function textFiles(dir, prefix = "") {
  const found = []
  for (const entry of readdirSync(join(dir, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      if (entry.name !== ".git" && entry.name !== "node_modules") found.push(...textFiles(dir, path))
    } else if (entry.isFile() && /\.(html?|md|json)$/.test(entry.name)) found.push(path)
  }
  return found.sort((a, b) => a.localeCompare(b))
}

/** The plan doc `file` (repo-relative) is, or is a part of (`epics/<n>/parts/<id>.htm`);  else `undefined`. */
function planDocOf(file) {
  if (/\.plan\.html$/.test(file)) return file
  const part = /^((?:.*\/)?epics\/([^/]+))\/parts\/[^/]+\.htm$/.exec(file)
  return part ? `${part[1]}/${part[2]}.plan.html` : undefined
}

/** Every plan doc in shared repo `dir`, old place or new:  `epics/<name>/<name>.plan.html`. */
function planDocsIn(dir) {
  return [join(dir, "epics"), join(dir, OLD_CONTENT, "epics")]
    .filter((epics) => existsSync(epics) && !lstatSync(epics).isSymbolicLink())
    .flatMap((epics) =>
      readdirSync(epics)
        .map((name) => join(epics, name, `${name}.plan.html`))
        .filter((file) => existsSync(file))
    )
}

/**
 * Run `fn` holding every `<file>.lock` of `files`, as `SRV.FileLock` takes them (`open(wx)`);  waits up to 30s for
 * each, takes over one older than a minute (a crashed holder's).
 * - plain node:  this script runs without the alias table, so it can't import `$/server`
 */
function withLocks(files, fn) {
  const held = []
  try {
    for (const file of files) {
      const lock = `${file}.lock`
      const deadline = Date.now() + 30_000
      for (;;) {
        try {
          closeSync(openSync(lock, "wx"))
          held.push(lock)
          break
        } catch (error) {
          if (error.code !== "EEXIST") throw error
          const age = Date.now() - (statSync(lock, { throwIfNoEntry: false })?.mtimeMs ?? Date.now())
          if (age > 60_000) rmSync(lock, { force: true })
          else if (Date.now() > deadline) throw new Error(`${lock} held for 30s:  stuck?`)
          else Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
        }
      }
    }
    return fn()
  } finally {
    for (const lock of held) rmSync(lock, { force: true })
  }
}

////////////////
// ## The brand move
////////////////

/**
 * The brand's hand-written pages, moved from `packages/brand/` into the shared `brand/` folder (epic `claude-design`,
 * P11, 2026-10-05), as Spell UI's site pages moved into `ui/` (Q4:  pages move, code and build outputs stay tracked).
 * - moved:  the Brand index (`index.html`, merged into P5's `brand/index.html`), `compare.html`, Claude Design's
 *   export (`spell-design-system/`, its `.spell.html` copies included), `leonardo/`, and the element docs pages
 *   (`components/*.html`)
 * - stayed:  the elements' code (`components/<tag>/`), `src/`, `scripts/`, `_assets/`, `_data/`, configs
 * - git moved them once;  `relocateLinks(text, old, new, BRAND_MOVE)` rewrote their links (and the shared pages'
 *   links into them)
 */
const BRAND_PAGES =
  /^packages\/brand\/(index\.html|compare\.html|(?:spell-design-system|leonardo)(?:\/.*)?|components\/[^/]+\.html)$/

/** Where repo path `path` went in the brand move, or `undefined` when it didn't move. */
export function brandPath(path) {
  const m = BRAND_PAGES.exec(path.replace(/\/$/, ""))
  return m ? `brand/${m[1]}` : undefined
}

/** The brand move, for `relocateLink()`:  nothing is settled. */
export const BRAND_MOVE = { moved: brandPath, settled: () => false }

////////////////
// ## Repair
////////////////

/** Old tooling folders a merge may bring back at the top of `packages/docs`:  reported, never moved into content. */
const OLD_TOOLING = new Set(["scripts", "_assets", "templates", "epics-tools"])

/**
 * Put checkout `root` right after a branch from before the CONTENT move merged `main`:  `spell dev shared repair`.
 * Returns what it did (or, `dryRun`, would do):  `{ moved, same, conflicts, linked, leftovers }`, repo-relative paths.
 * 1. pages left at the top of `packages/docs` (`packages/docs/<x>`, not the package's own files):  each file goes
 *    to `packages/docs/content/<x>` with its links relocated (`moved`), unless content has it already:  identical
 *    (`same`) or different (`conflicts`:  left in place, for a person);  then git forgets the old path
 * 2. every page in a REAL `content/` folder (not the shared repo's link):  links written for the old layout are
 *    repaired (`repairLinks()`), and a local link's tab name follows where it points now (`retarget()`):  `linked`
 * - `leftovers`:  old tooling folders (`packages/docs/scripts` ...) and root logs (`PAPERCUTS.md` ...):  only reported
 * - NOTE:  pages that land in a linked `content/` (the shared repo, on older code) are the reorg's to move on:
 *   `reorgShared()`
 */
export function repairCheckout(root, { dryRun = false } = {}) {
  const docs = join(root, "packages", "docs")
  const report = { moved: [], same: [], conflicts: [], linked: [], leftovers: [] }
  for (const entry of readdirSync(docs, { withFileTypes: true })) {
    if (DOCS_KEEP.has(entry.name) || entry.name.startsWith(".")) continue
    if (OLD_TOOLING.has(entry.name)) {
      report.leftovers.push(`packages/docs/${entry.name}`)
      continue
    }
    for (const file of filesUnder(root, `packages/docs/${entry.name}`)) moveFile(root, file, report, dryRun)
  }
  for (const log of ["PAPERCUTS.md", "SUSPECTED-BUGS.md", "CODE-DEBT.md"]) {
    if (existsSync(join(root, log))) report.leftovers.push(log)
  }
  // a LINKED content folder is the shared repo:  never merged, so nothing in it was written for the old layout
  const content = join(root, "packages", "docs", "content")
  const linked = lstatSync(content, { throwIfNoEntry: false })?.isSymbolicLink()
  const pages = linked ? [] : filesUnder(root, "packages/docs/content").filter((path) => path.endsWith(".html"))
  for (const file of pages) {
    const text = readFileSync(join(root, file), "utf8")
    const fixed = retarget(
      repairLinks(text, file, (path) => existsSync(join(root, path))),
      file
    )
    if (fixed === text) continue
    report.linked.push(file)
    if (!dryRun) writeFileSync(join(root, file), fixed)
  }
  return report
}

/**
 * A plan doc, repo-relative:  `epics/<name>/<name>.plan.html` (or `<name>.html`), at the root or under either old
 * place (`packages/docs/epics/`, `packages/docs/content/epics/`);  `[1]` its name.  Same as `doc-links.js` `PLAN_DOC`.
 */
const PLAN_DOC = /(?:^|\/)(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/**
 * `text` of page `file` (repo-relative) with each local link's `target="src-..."` (its tab, `doc-links.js`
 * `targetFor()`) named for where the link points NOW:  a moved file kept its old name, so one file had two tabs.
 * - a link to a plan doc gets the epic's name, as `targetFor()` gives it;  external targets (`ext-...`) and links
 *   already named otherwise are left alone
 * - `only`:  rename just the targets it matches (the reorg, in a page that stayed:  only `src-packages-docs-content-...`)
 */
export function retarget(text, file, only = /^src-/) {
  return text.replace(
    /<a\b([^>]*?)\bhref="([^"]*)"([^>]*?)\btarget="(src-[^"]*)"/g,
    (all, before, link, between, old) => {
      if (!only.test(old)) return all
      if (!isRelative(link)) return all
      const dest = posix.normalize(posix.join(posix.dirname(file), link.replace(/[?#].*$/, "")))
      if (dest.startsWith("..")) return all
      const plan = PLAN_DOC.exec(dest)
      const name = plan
        ? plan[1]
        : `src-${dest
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase()
            .slice(0, 80)}`
      return `<a${before}href="${link}"${between}target="${name}"`
    }
  )
}

/** `repairCheckout()`'s step 1 for one stray file:  into content, links relocated;  git forgets the old path. */
function moveFile(root, file, report, dryRun) {
  const target = movedPath(file)
  const from = join(root, file)
  const to = join(root, target)
  const text = /\.(html|md)$/.test(file) ? relocateLinks(readFileSync(from, "utf8"), file, target) : undefined
  if (existsSync(to)) {
    const same = text === undefined ? readFileSync(from).equals(readFileSync(to)) : text === readFileSync(to, "utf8")
    if (!same) return report.conflicts.push(file)
    report.same.push(file)
  } else report.moved.push(file)
  if (dryRun) return
  if (!existsSync(to)) {
    mkdirSync(dirname(to), { recursive: true })
    writeFileSync(to, text ?? readFileSync(from))
  }
  spawnSync("git", ["rm", "-q", "--cached", "--ignore-unmatch", "--", file], { cwd: root })
  rmSync(from, { force: true })
  removeEmptyFolders(root, dirname(file))
}

/** Every file under repo path `path` of `root` (links followed), repo-relative, sorted. */
function filesUnder(root, path) {
  const dir = join(root, path)
  if (!existsSync(dir)) return []
  if (!statSync(dir).isDirectory()) return [path]
  return readdirSync(dir)
    .filter((name) => name !== ".DS_Store")
    .sort()
    .flatMap((name) => filesUnder(root, `${path}/${name}`))
}

/** Remove repo folder `path` of `root`, and its parents, while empty;  stops at `packages/docs`. */
function removeEmptyFolders(root, path) {
  for (let dir = path; dir.startsWith("packages/docs/"); dir = posix.dirname(dir)) {
    const full = join(root, dir)
    if (!existsSync(full) || readdirSync(full).length) return
    rmSync(full, { recursive: true })
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2)
  const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
  const root = resolve(flag("--root") ?? join(dirname(fileURLToPath(import.meta.url)), "../../.."))
  const shared = flag("--shared")
  const dryRun = args.includes("--dry-run")
  if (args[0] === "reorg" && shared) {
    // the reorg alone, quietly:  `spell dev shared commit` runs it before every commit (while older checkouts may
    // still write the old way:  claude-design T1 ends it), printing only what it changed
    const report = reorgShared(resolve(shared), root, { dryRun })
    for (const path of [...report.moved, ...report.merged, ...report.conflicts, ...report.rewritten])
      console.log(`reorg:  ${path}`)
    process.exit(report.conflicts.length ? 1 : 0)
  }
  if (args[0] !== "repair") {
    console.error(
      "usage:  node tools/relocate.js repair [--root <checkout>] [--shared <dir>] [--dry-run] [--json]\n" +
        "        node tools/relocate.js reorg --shared <dir> [--root <checkout>] [--dry-run]"
    )
    process.exit(2)
  }
  const report = repairCheckout(root, { dryRun })
  const reorg = shared ? reorgShared(resolve(shared), root, { dryRun }) : undefined
  if (args.includes("--json")) console.log(JSON.stringify({ ...report, ...(reorg && { reorg }) }, null, 2))
  else {
    for (const [key, label] of [
      ["moved", "moved into content"],
      ["same", "already in content (old copy dropped)"],
      ["conflicts", "CONFLICT:  content has a different copy;  left in place"],
      ["linked", "links repaired"],
      ["leftovers", "left alone (old tooling or root logs):  look by hand"]
    ]) {
      for (const path of report[key]) console.log(`${label.padEnd(40)} ${path}`)
    }
    for (const [key, label] of [
      ["moved", "reorg:  moved"],
      ["merged", "reorg:  merged into its new place"],
      ["conflicts", "reorg CONFLICT:  new place differs;  left"],
      ["links", "reorg:  old-path link"],
      ["rewritten", "reorg:  links / mentions fixed"]
    ]) {
      for (const path of reorg?.[key] ?? []) console.log(`${label.padEnd(40)} ${path}`)
    }
    const total =
      report.moved.length +
      report.same.length +
      report.linked.length +
      (reorg ? reorg.moved.length + reorg.merged.length + reorg.rewritten.length : 0)
    console.log(`${dryRun ? "dry run:  would change" : "changed"} ${total} file(s)`)
  }
  process.exit(report.conflicts.length || reorg?.conflicts.length ? 1 : 0)
}
