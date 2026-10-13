/**
 * The docs' three moves:  where each repo path went, and how to rewrite a file's links and path mentions to match.
 * - the CONTENT move (epic `shared-content`, P2, 2026-10-04):  `packages/docs` kept only the package and `tools/`;
 *   every page, plan doc and template moved to `packages/docs/content/`, the docs scripts and `_assets` to
 *   `packages/docs/tools/` (now `packages/epics/tools/`), the goals tooling to `tools/goals/`, the three root logs
 *   to `agents/` (`CONTENT_MOVE`, `repairCheckout()`)
 * - the REORG (epic `claude-design`, P4, 2026-10-05):  the shared repo's `packages/docs/content/` split into root
 *   folders, each linked at the root of every checkout:  `epics/`, `templates/`, `guides/` (every other page) and
 *   `pages/` (the docs home and the scratch details pages).  Old-path links stay behind in the shared repo's
 *   `packages/docs/content/`, for checkouts on older code (`REORG_MOVE`, `reorgShared()`)
 * - the DOCS PACKAGE'S END (epic `people-and-orgs`, P16, 2026-10-13):  `packages/docs` went;  its tools and their
 *   `_assets` moved to `packages/epics/tools/`, its `AGENTS.md` merged into epics', its package files went with them
 *   (`DOCS_END_MOVE`, `relinkDocsPackage()`)
 * - each ran once on everything;  since then by `spell dev shared repair`:  after a branch from before a move merges
 *   `main`, or when older code wrote pages the old way
 * - `node tools/relocate.js repair [--root <checkout>] [--shared <dir>] [--dry-run] [--json]`:  `repairCheckout()`,
 *   then, with `--shared`, `reorgShared()` and `relinkDocsPackage()`
 * - `reorg --shared <dir>`:  `reorgShared()` alone (`spell dev shared commit`, every turn)
 * - `relink --shared <dir> [--root <checkout>] [--dry-run] [--json]`:  `relinkDocsPackage()` alone (once, when
 *   `people-and-orgs` merges into `main`)
 * - the COMPONENT SETS' layout (epic `people-and-orgs`, P18, 2026-10-13):  every set's pages in its package's `docs/`,
 *   served at `/components/<set>/`;  Spell UI's elements in `components/`, its notes in `notes/`;  the packs in
 *   `components/__pack/`;  the brand's tags `brand-` (`SETS_LINKS`, `relinkSets()`)
 * - `relink-sets --shared <dir> [--dry-run] [--json]`:  `relinkSets()` (ONCE, when `people-and-orgs` merges into
 *   `main`, after `relink`;  never by `repair`:  a later page's `packages/ui/docs/` means the new pages, not the notes)
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
 * - where each one is NOW:  the docs tools' later move into `packages/epics/tools/` included
 * - the docs package's end (`docsEndPath()`) and the generic `packages/docs/<entry>` ->
 *   `packages/docs/content/<entry>` rule are in `movedPath()`
 */
const PREFIXES = [
  ["packages/docs/scripts", "packages/epics/tools"],
  ["packages/docs/_assets", "packages/epics/tools/_assets"],
  ["goals/_tools", "packages/epics/tools/goals"],
  ["goals/_skills", "packages/epics/tools/goals/skills"],
  ["goals/tsconfig.json", "packages/epics/tsconfig.json"],
  ["PAPERCUTS.md", "agents/PAPERCUTS.md"],
  ["SUSPECTED-BUGS.md", "agents/SUSPECTED-BUGS.md"],
  ["CODE-DEBT.md", "agents/CODE-DEBT.md"]
]

/**
 * Where repo path `path` went in the CONTENT move (posix, repo-relative, no leading `/`), or `undefined` when it
 * didn't move.
 * - `packages/docs` itself (a link to the docs folder) means its pages:  `packages/docs/content`
 * - what the docs package kept, its tools and its own files, is where the docs package's end put it (`docsEndPath()`)
 */
export function movedPath(path) {
  const trimmed = path.replace(/\/$/, "")
  const end = docsEndPath(trimmed)
  if (end) return end
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
    // a plan doc, or one of its parts (`parts/<id>.html`, plan fragments):  under the doc's lock
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
  // links into the docs package's tools, which left `packages/docs/` for `packages/epics/` (people-and-orgs P16)
  out = relocateLinks(out, file, file, DOCS_END_MOVE)
  if (mentions) out = reorgMentions(out, guides)
  // a plan doc's part (`parts/<id>.html`, `.htm` before Q12 of `epic-components`):  never a page, so only the tab
  // names of the links the moves changed
  if (isPart(file)) return retarget(out, file, MOVED_TARGET)
  if (file.endsWith(".html")) {
    // a file that moved just now was relocated whole;  one already in place may hold links older code wrote
    if (before === file && reorgOldPlace(file)) out = repairLinks(out, file, exists, reorgOldPlace, REORG_MOVE)
    if (reorgOldPlace(file)) out = headerRoot(out, file)
    out = reorgOldPlace(file) ? retarget(out, file) : retarget(out, file, MOVED_TARGET)
  }
  return out
}

/** The tab names of links into a place that moved:  `retarget()` renames them for where they point now. */
const MOVED_TARGET =
  /^src-packages-(?:docs-content|ui-site|docs-tools)-|^src-packages-docs-(?:tools|agents-md|claude-md|readme-md|package-json|tsconfig-json|vitest-config-ts)$/

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

/** The plan doc `file` (repo-relative) is, or is a part of (`epics/<n>/parts/<id>.html`, or `.htm`);  else `undefined`. */
function planDocOf(file) {
  if (/\.plan\.html$/.test(file)) return file
  const part = /^((?:.*\/)?epics\/([^/]+))\/parts\/[^/]+\.html?$/.exec(file)
  return part ? `${part[1]}/${part[2]}.plan.html` : undefined
}

/**
 * Is `file` (repo-relative) a plan doc's part:  a `.html` / `.htm` in a `parts/` folder?  Never a page, whatever its
 * extension (`pages.js` `SKIP_DIRS` skips the folder too).
 */
function isPart(file) {
  return /(?:^|\/)parts\/[^/]+\.html?$/.test(file)
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
export function withLocks(files, fn) {
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
// ## The docs package's end
////////////////

/**
 * What the docs package left when it went (epic `people-and-orgs`, P16, 2026-10-13), each to the same place in
 * `packages/epics/`:  its tools (`tools/`, with the `_assets` every page loads) and its own files.
 * - `AGENTS.md` was merged into epics' (Q23), whose sections keep their names;  the package files went with the tools
 */
const DOCS_END =
  /^packages\/docs\/(tools(?:\/.*)?|AGENTS\.md|CLAUDE\.md|README\.md|package\.json|tsconfig\.json|vitest\.config\.ts)$/

/**
 * Where repo path `path` went when the docs package went, or `undefined` when it didn't move.
 * - a tool's test (`tools/x.test.js`):  to the repo's `tests/` folder, at the same path (people-and-orgs P10)
 */
export function docsEndPath(path) {
  const m = DOCS_END.exec(path.replace(/\/$/, ""))
  if (!m) return undefined
  return /\.test\.[jt]s$/.test(m[1]) ? `tests/epics/${m[1]}` : `packages/epics/${m[1]}`
}

/** The docs package's end, for `relocateLink()`:  nothing is settled. */
export const DOCS_END_MOVE = { moved: docsEndPath, settled: () => false }

/**
 * A path into what the docs package left, written out in prose or code (`packages/docs/tools/pages.js`,
 * `<code title="packages/docs/AGENTS.md">`):  `[1]` what follows `packages/docs/`.
 * - never the tail of a longer path or a URL (`../packages/docs/tools/x`, `/packages/docs/tools/_assets/x`):  a link
 *   is `relocateLinks()`'s, and a server path names the old URL
 */
const DOCS_END_MENTION =
  /(?<![\w./-])packages\/docs\/(tools(?:\/[\w.*{},<>-]+)*\/?|(?:AGENTS|CLAUDE|README)\.md|package\.json|tsconfig\.json|vitest\.config\.ts)(?![\w-])/g

/**
 * A line telling the move's story:  it names the new places too ("from `packages/docs/tools/` to
 * `packages/epics/tools/`"), so its old paths stay.
 */
const DOCS_END_HISTORY = /packages\/epics\/(?:tools\b|AGENTS\.md)/

/**
 * `text` with every path it mentions into what the docs package left updated to its place in `packages/epics/`
 * (`packages/docs/tools/pages.js` -> `packages/epics/tools/pages.js`).
 * - a line that names the new places too is the move's story, and stays (`DOCS_END_HISTORY`)
 */
export function docsEndMentions(text) {
  return text.replace(/^.*$/gm, (line) =>
    DOCS_END_HISTORY.test(line)
      ? line
      : line.replace(DOCS_END_MENTION, (all, rest) => docsEndPath(all) + (rest.endsWith("/") ? "/" : ""))
  )
}

/** A link into what the docs package left:  an attribute (`href`, `src`, the site header's `root`) or markdown's. */
const DOCS_END_LINK =
  /(?:\b(?:href|src|root)="|\]\()[^")\s]*packages\/docs\/(?:tools\b|(?:AGENTS|CLAUDE|README)\.md|package\.json|tsconfig\.json|vitest\.config\.ts)/g

/** A tab name for one of them, as `doc-links.js` writes it. */
const DOCS_END_TARGET =
  /target="src-packages-docs-(?:tools-[^"]*|tools|agents-md|claude-md|readme-md|package-json|tsconfig-json|vitest-config-ts)"/g

/** Shared pages that keep their mentions of the old paths:  `people-and-orgs`, which tells the move's story. */
const DOCS_END_KEEP = /^epics\/people-and-orgs\//

/**
 * The docs package's end, in shared repo `dir`:  ONCE, when `people-and-orgs` merges into `main`;  idempotent, so
 * `spell dev shared repair` runs it too.  Returns what it did (or, `dryRun`, would do):  `rewritten`, the files
 * (repo-relative), and how many `links`, `targets` and `mentions` changed.
 * - every `.html` / `.htm` / `.md`:  links into `packages/docs/tools/` (and the package's own files) point into
 *   `packages/epics/` (`DOCS_END_MOVE`), and their tab names follow (`retarget()`, as `doc-links.js` names them);
 *   path mentions in prose and code too (`docsEndMentions()`);  a `.json`:  its mentions only
 * - `people-and-orgs`' own pages keep their mentions:  they tell the move's story (`DOCS_END_KEEP`)
 * - plan docs, and their parts, are rewritten under the doc's lock, as `reorgShared()` does
 * - `reorgShared()`, every turn, fixes the links (not the mentions) in pages older code writes since
 */
export function relinkDocsPackage(dir, { dryRun = false } = {}) {
  const report = { rewritten: [], links: 0, targets: 0, mentions: 0 }
  const count = (text, pattern) => (text.match(pattern) ?? []).length
  for (const file of textFiles(dir)) {
    const fix = (text) => {
      // mentions first:  a line telling the move's story is told by the text as written, not by its fixed links
      let out = DOCS_END_KEEP.test(file) ? text : docsEndMentions(text)
      if (!file.endsWith(".json")) out = relocateLinks(out, file, file, DOCS_END_MOVE)
      if (/\.html?$/.test(file)) out = retarget(out, file, MOVED_TARGET)
      if (out !== text) {
        report.links += count(text, DOCS_END_LINK) - count(out, DOCS_END_LINK)
        report.targets += count(text, DOCS_END_TARGET) - count(out, DOCS_END_TARGET)
        report.mentions += count(text, DOCS_END_MENTION) - count(out, DOCS_END_MENTION)
      }
      return out
    }
    const full = join(dir, file)
    const doc = planDocOf(file)
    const changed = doc && !dryRun ? withLocks([join(dir, doc)], () => apply(full, fix)) : apply(full, fix, dryRun)
    if (changed) report.rewritten.push(file)
  }
  return report
}

////////////////
// ## The component sets' layout
////////////////

/**
 * Where a link's target went in the component sets' layout (epic `people-and-orgs` P18, 2026-10-13):  `[pattern,
 * replacement]` on the repo-relative path a link points at, first match wins.
 * - a set's PAGES are linked at their SERVED address, `components/<set>/<page>` (the page server's `COMPONENT_SETS`):
 *   a set's folder doesn't draw its pages at its own address, only there
 *   - Spell UI's, from the shared `ui/` (its component index is `components.html` now, its pages flat);  Epic UI's,
 *     from `packages/epic-components/` or `epic-ui/`;  App UI's, from `packages/app/components/` or `app-ui/`;  the
 *     brand elements', from the shared `brand/components/`, their tags `brand-` now (Q26)
 * - CODE moved too:  Spell UI's elements (`src/components/` -> `components/`, their tests likewise), its design notes
 *   (`docs/` -> `notes/`), the sets' data (`_data/` -> `docs/__data/`), the epics pack (`pack/` ->
 *   `components/__pack/`), the brand's families (`ui-brand-x/UIBrandX.tsx` -> `brand-x/BrandX.tsx`)
 */
const SETS_LINKS = [
  [/^ui\/components(?:\/index\.html)?$/, "components/ui/components.html"],
  [/^ui\/components\/(.+)$/, "components/ui/$1"],
  [/^ui\/_parts(\/.*)?$/, "components/ui/__parts$1"],
  [/^ui\/_data(\/.*)?$/, "components/ui/__data$1"],
  [/^ui(\/.*)?$/, "components/ui$1"],
  [/^(?:packages\/epic-components|epic-ui)\/elements(\/.*)?$/, "components/epics$1"],
  [/^(?:packages\/epic-components|epic-ui)\/_parts(\/.*)?$/, "components/epics/__parts$1"],
  [/^(?:packages\/epic-components|epic-ui)\/_data(\/.*)?$/, "components/epics/__data$1"],
  [/^packages\/epic-components\/README\.md$/, "packages/epics/AGENTS.md"],
  [/^(?:packages\/epic-components|epic-ui)(\/.*)?$/, "components/epics$1"],
  [/^(?:packages\/app\/components|app-ui)\/_(parts|data)(\/.*)?$/, "components/app/__$1$2"],
  [/^(?:packages\/app\/components|app-ui)\/(_images|_examples|[^/]+\.html)(\/.*)?$/, "components/app/$1$2"],
  [/^app-ui(\/.*)?$/, "components/app$1"],
  [/^brand\/components\/components\.spell\.html$/, "components/brand/index.html"],
  [/^brand\/components\/ui-(brand-[\w-]+\.html)$/, "components/brand/$1"],
  [/^brand\/components$/, "components/brand"],
  ...codeMoves()
]

/** The CODE moves, for links and mentions alike:  `[pattern, replacement]` on a repo-relative path. */
function codeMoves() {
  return [
    [/^packages\/ui\/src\/components(\/.*)?$/, "packages/ui/components$1"],
    [/^tests\/ui\/src\/components(\/.*)?$/, "tests/ui/components$1"],
    // its design notes (`*.md`) and the folder itself:  never a page (`packages/ui/docs/x.html` is one, since P18)
    [/^packages\/ui\/docs(\/(?:[\w.-]+\.md)?)?$/, "packages/ui/notes$1"],
    [/^packages\/ui\/site\/_data(\/.*)?$/, "packages/ui/docs/__data$1"],
    [/^packages\/brand\/_data(\/.*)?$/, "packages/brand/docs/__data$1"],
    [/^packages\/epics\/pack(\/.*)?$/, "packages/epics/components/__pack$1"],
    [
      /^((?:packages|tests)\/brand\/components\/)ui-(brand-[\w-]+)(\/.*)?$/,
      (all, base, family, rest = "") => `${base}${family}${rest.replace(/\/UIBrand(?=\w)/g, "/Brand")}`
    ]
  ]
}

/**
 * Where a MENTION of a moved path went (prose, code spans, `title`s):  the FILE, never a served address.
 * - a set's page:  its file in its package's `docs/`;  the rest as `codeMoves()`
 */
const SETS_MENTIONS = [
  [/^packages\/epic-components\/elements(\/.*)?$/, "packages/epics/docs$1"],
  [/^packages\/epic-components\/_(parts|data)(\/.*)?$/, "packages/epics/docs/__$1$2"],
  [/^packages\/epic-components\/README\.md$/, "packages/epics/AGENTS.md"],
  [/^packages\/epic-components(\/.*)?$/, "packages/epics/docs$1"],
  [/^packages\/app\/components\/_(parts|data)(\/.*)?$/, "packages/app/docs/__$1$2"],
  [/^packages\/app\/components\/(_images|_examples|[^/]+\.html)(\/.*)?$/, "packages/app/docs/$1$2"],
  [/^ui\/components\/index\.html$/, "packages/ui/docs/components.html"],
  [/^ui\/components\/([^/]+\.html)$/, "packages/ui/docs/$1"],
  [/^ui\/_(parts|data)(\/.*)?$/, "packages/ui/docs/__$1$2"],
  [/^ui\/([^/]+\.html|examples(?:\/.*)?|images(?:\/.*)?)$/, "packages/ui/docs/$1"],
  [/^brand\/components\/components\.spell\.html$/, "packages/brand/docs/index.html"],
  [/^brand\/components\/ui-(brand-[\w-]+\.html)$/, "packages/brand/docs/$1"],
  ...codeMoves()
]

/** `path` (repo-relative) after the first of `moves` that matches;  `undefined` when none does. */
function setsMoved(path, moves) {
  for (const [pattern, to] of moves) {
    if (pattern.test(path)) return path.replace(pattern, to)
  }
  return undefined
}

/** Where repo path (or served address) `path` is linked now, in the sets' layout;  `undefined` when it didn't move. */
export function setsLinkPath(path) {
  return setsMoved(path.replace(/\/$/, ""), SETS_LINKS)
}

/** Where the file repo path `path` names is now, in the sets' layout;  `undefined` when it didn't move. */
export function setsMentionPath(path) {
  return setsMoved(path.replace(/\/$/, ""), SETS_MENTIONS)
}

/**
 * `link`, in page `file` (repo-relative), pointing where its target is linked now in the sets' layout;  unchanged
 * when its target didn't move.
 * - relative links, and server-absolute ones (`/ui/x.html`, `/worktrees/<w>/epic-ui/`)
 * - a folder link stays a folder link;  one whose folder became a page (`ui/components/`) links the page
 */
export function setsLink(link, file) {
  const [, path = "", rest = ""] = /^([^?#]*)(.*)$/.exec(link)
  if (!path) return link
  const absolute = /^(\/(?:worktrees\/[^/]+\/)?)(.*)$/.exec(path)
  if (path.startsWith("/")) {
    const movedTo = setsLinkPath(absolute[2])
    if (!movedTo) return link
    return `${absolute[1]}${movedTo}${path.endsWith("/") && !movedTo.endsWith(".html") ? "/" : ""}${rest}`
  }
  if (!isRelative(link)) return link
  const target = posix.normalize(posix.join(posix.dirname(file), path))
  if (target.startsWith("..") || target === ".") return link
  const movedTo = setsLinkPath(target)
  if (!movedTo) return link
  let out = posix.relative(posix.dirname(file), movedTo) || "."
  if (path.endsWith("/") && !movedTo.endsWith(".html")) out += "/"
  return out === path ? link : out + rest
}

/**
 * A path mentioned in prose or code that the sets' layout moved, whole from the repo root (or the shared `ui/` or
 * `brand/`), never the tail of a longer path or a URL:  `[0]` the path.
 */
const SETS_MENTION =
  /(?<![\w./$@-])(?:packages\/(?:ui\/src\/components|ui\/docs|ui\/site\/_data|brand\/_data|epics\/pack|epic-components|app\/components\/(?:_parts|_data|_images|_examples|[\w-]+\.html)|brand\/components\/ui-brand-[\w-]+)|tests\/(?:ui\/src\/components|brand\/components\/ui-brand-[\w-]+)|ui\/(?:components\/[\w.-]+\.html|_parts|_data|[\w.-]+\.html|examples|images)|brand\/components\/(?:ui-brand-[\w-]+|components\.spell)\.html)(?:\/[\w.*{},-]+)*\/?(?![\w-])/g

/** A server address of a set's old home, written in prose or code (`/ui/`, `/epic-ui/x`, `/app-ui/`). */
const SETS_ADDRESS = /(?<![\w.$*"'-])\/(ui|epic-ui|app-ui)(?=\/)/g

/** The sets' new addresses for `SETS_ADDRESS`'s homes. */
const SETS_HOMES = { ui: "/components/ui", "epic-ui": "/components/epics", "app-ui": "/components/app" }

/**
 * `text` with every path it mentions that the sets' layout moved updated (`setsMentionPath()`), and the old
 * addresses (`/ui/`, `/epic-ui/`, `/app-ui/`) the new ones.
 * - a line naming the new places too is the move's story, and stays (`SETS_HISTORY`)
 *   - `original`:  the text as it was before its links were moved, line for line, to tell it by:  a moved link is no
 *     story
 * - `addresses:  false`:  paths only, the old addresses stay (a plan doc:  what was served then, its record)
 */
export function setsMentions(text, { addresses = true, original = text } = {}) {
  const story = original.split("\n").map((line) => SETS_HISTORY.test(line))
  let index = -1
  return text.replace(/^.*$/gm, (line) =>
    story[++index]
      ? line
      : line
          .replace(SETS_MENTION, (all) => {
            const slash = all.endsWith("/") ? "/" : ""
            const moved = setsMentionPath(all)
            return moved ? moved + (moved.endsWith(".html") ? "" : slash) : all
          })
          .replace(SETS_ADDRESS, (all, home) => (addresses ? SETS_HOMES[home] : all))
  )
}

/** A line telling the move's story:  it names the new places too, so its old paths stay. */
const SETS_HISTORY = /\/components\/(?:ui|epics|app|brand)\/|packages\/(?:epics|app|brand)\/docs\/|components\/__pack/

/** A link the sets' layout moved, for counting:  an attribute's or markdown's. */
const SETS_LINK =
  /(?:\b(?:href|src|source)="|\]\()(?:[^")\s]*\/)?(?:\.\.\/)*(?:ui\/|epic-ui\/|app-ui\/|packages\/(?:epic-components|ui\/src\/components|ui\/docs|ui\/site\/_data|brand\/_data|epics\/pack)\b|brand\/components\/)/g

/** The tab names of links into a place that moved:  `setsRetarget()` renames them for where they point now. */
const SETS_TARGET =
  /^src-(?:ui(?:-|$)|epic-ui|app-ui|packages-epic-components|packages-ui-src-components|tests-ui-src-components|packages-ui-docs|packages-ui-site-data|packages-brand-data|packages-epics-pack|brand-components|packages-app-components-[^-]+-html|packages-brand-components-ui-brand|tests-brand-components-ui-brand)/

/** Served set addresses => their folders, for naming a link's tab after the FILE it opens (`doc-links.js`'s way). */
const SET_FOLDERS = [
  ["components/ui", "packages/ui/docs"],
  ["components/epics", "packages/epics/docs"],
  ["components/app", "packages/app/docs"],
  ["components/brand", "packages/brand/docs"]
]

/**
 * `text` of page `file` with the tab name (`target`) of each link it points into a moved place named for the file it
 * opens now, as `doc-links.js` names it (a set's page:  its file in the set's `docs/`).
 */
export function setsRetarget(text, file) {
  return text.replace(
    /<a\b([^>]*?)\bhref="([^"]*)"([^>]*?)\btarget="(src-[^"]*)"/g,
    (all, before, link, between, old) => {
      if (!SETS_TARGET.test(old) || !isRelative(link)) return all
      let dest = posix.normalize(posix.join(posix.dirname(file), link.replace(/[?#].*$/, "")))
      if (dest.startsWith("..")) return all
      for (const [address, folder] of SET_FOLDERS) {
        if (dest === address || dest.startsWith(`${address}/`)) dest = folder + dest.slice(address.length)
      }
      const name = `src-${dest
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 80)}`
      return `<a${before}href="${link}"${between}target="${name}"`
    }
  )
}

/**
 * Shared pages that keep their old paths in prose:  `people-and-orgs`, which tells the move's story;  the changelog and
 * the papercuts log, which are history.  Their LINKS are fixed all the same.
 */
const SETS_KEEP = /^(?:epics\/people-and-orgs\/|guides\/changelog\.html$|agents\/PAPERCUTS\.md$)/

/**
 * The component sets' layout, in shared repo `dir`:  ONCE, when `people-and-orgs` merges into `main`;  a second run
 * changes nothing.
 * Returns what it did (or, `dryRun`, would do):  `rewritten`, the files (repo-relative), and how many `links` and
 * `mentions` changed.
 * - every `.html` / `.htm` / `.md`:  links into a moved place point where it is now (`setsLink()`):  a set's page at
 *   its address, `/components/<set>/`;  their tab names follow (`setsRetarget()`);  path mentions and old addresses
 *   in prose and code too (`setsMentions()`), but a plan doc's addresses:  its record of what was served then;  a
 *   `.json`:  its mentions only
 * - the folders that moved OUT of the shared repo are skipped:  `ui/`, and `brand/components/` (delete them after,
 *   T3);  Claude Design's export (`brand/spell-design-system/`, but its `.spell.html` copies) is never edited
 * - `people-and-orgs`' own pages keep theirs:  they tell the move's story (`SETS_KEEP`)
 * - plan docs, and their parts, are rewritten under the doc's lock, as `relinkDocsPackage()` does
 * - the brand's TAGS (`<ui-brand-logo>` -> `<brand-logo>`) are the brand package's own script's
 *   (`packages/brand/scripts/rename-shared.ts`)
 */
export function relinkSets(dir, { dryRun = false } = {}) {
  const report = { rewritten: [], links: 0, mentions: 0 }
  const count = (text, pattern) => (text.match(pattern) ?? []).length
  for (const file of textFiles(dir)) {
    if (SETS_SKIP.test(file)) continue
    const fix = (text) => {
      // links first:  a mention's rewrite must never reach into an old link before it's moved
      let out = file.endsWith(".json")
        ? text
        : text
            // `source`:  a `<ui-components>` naming a pack (every plan doc's), a `<ui-include>` ...
            .replace(/\b(href|src|root|source)="([^"]*)"/g, (all, attr, link) => `${attr}="${setsLink(link, file)}"`)
            .replace(/\]\(([^)\s]+)\)/g, (all, link) => `](${setsLink(link, file)})`)
      if (!SETS_KEEP.test(file)) out = setsMentions(out, { addresses: !file.startsWith("epics/"), original: text })
      if (/\.html?$/.test(file)) out = setsRetarget(out, file)
      if (out !== text) {
        report.links += Math.max(0, count(text, SETS_LINK) - count(out, SETS_LINK))
        report.mentions += Math.max(0, count(text, SETS_MENTION) - count(out, SETS_MENTION))
      }
      return out
    }
    const full = join(dir, file)
    const doc = planDocOf(file)
    const changed = doc && !dryRun ? withLocks([join(dir, doc)], () => apply(full, fix)) : apply(full, fix, dryRun)
    if (changed) report.rewritten.push(file)
  }
  return report
}

/**
 * Shared files `relinkSets()` leaves alone:  the folders that moved out (`ui/`, `brand/components/`), the old content
 * links, and Claude Design's export (everything under `brand/spell-design-system/` but the `.spell.html` copies).
 */
const SETS_SKIP =
  /^(?:ui\/|brand\/components\/|packages\/docs\/content\/|brand\/spell-design-system\/(?!.*\.spell\.html$))/

////////////////
// ## Repair
////////////////

/**
 * Old tooling folders a merge may bring back at the top of `packages/docs`:  reported, never moved into content.
 * - `tools`:  since the docs package's end, in `packages/epics/tools/`
 */
const OLD_TOOLING = new Set(["scripts", "_assets", "templates", "epics-tools", "tools"])

/**
 * Put checkout `root` right after a branch from before the CONTENT move merged `main`:  `spell dev shared repair`.
 * Returns what it did (or, `dryRun`, would do):  `{ moved, same, conflicts, linked, leftovers }`, repo-relative paths.
 * 1. pages left at the top of `packages/docs` (`packages/docs/<x>`, not the package's own files):  each file goes
 *    to `packages/docs/content/<x>` with its links relocated (`moved`), unless content has it already:  identical
 *    (`same`) or different (`conflicts`:  left in place, for a person);  then git forgets the old path
 * 2. every page in a REAL `content/` folder (not the shared repo's link):  links written for the old layout are
 *    repaired (`repairLinks()`), and a local link's tab name follows where it points now (`retarget()`):  `linked`
 * - `leftovers`:  old tooling folders (`packages/docs/scripts`, `packages/docs/tools` ...) and root logs
 *   (`PAPERCUTS.md` ...):  only reported
 * - NOTE:  pages that land in a linked `content/` (the shared repo, on older code) are the reorg's to move on:
 *   `reorgShared()`
 * - a checkout with no `packages/docs` at all (the docs package's end):  step 1 has nothing to do
 */
export function repairCheckout(root, { dryRun = false } = {}) {
  const docs = join(root, "packages", "docs")
  const report = { moved: [], same: [], conflicts: [], linked: [], leftovers: [] }
  for (const entry of existsSync(docs) ? readdirSync(docs, { withFileTypes: true }) : []) {
    if (OLD_TOOLING.has(entry.name)) {
      report.leftovers.push(`packages/docs/${entry.name}`)
      continue
    }
    if (DOCS_KEEP.has(entry.name) || entry.name.startsWith(".")) continue
    for (const file of filesUnder(root, `packages/docs/${entry.name}`)) moveFile(root, file, report, dryRun)
  }
  for (const log of ["PAPERCUTS.md", "SUSPECTED-BUGS.md", "CODE-DEBT.md"]) {
    if (existsSync(join(root, log))) report.leftovers.push(log)
  }
  // a LINKED content folder is the shared repo:  never merged, so nothing in it was written for the old layout
  const content = join(root, "packages", "docs", "content")
  const linked = lstatSync(content, { throwIfNoEntry: false })?.isSymbolicLink()
  // pages only:  a plan doc's part (`parts/<id>.html`) is a fragment
  const pages = linked
    ? []
    : filesUnder(root, "packages/docs/content").filter((path) => path.endsWith(".html") && !isPart(path))
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
  if (args[0] === "relink" && shared) {
    // the docs package's end (people-and-orgs P16), once at its merge into `main`:  what it changed, then the counts
    const report = relinkDocsPackage(resolve(shared), { dryRun })
    if (args.includes("--json")) console.log(JSON.stringify(report, null, 2))
    else {
      for (const path of report.rewritten) console.log(`relink:  ${path}`)
      console.log(
        `${dryRun ? "dry run:  would change" : "changed"} ${report.rewritten.length} file(s):  ` +
          `${report.links} link(s), ${report.targets} tab name(s), ${report.mentions} mention(s)`
      )
    }
    process.exit(0)
  }
  if (args[0] === "relink-sets" && shared) {
    // the component sets' layout (people-and-orgs P18), once at its merge into `main`:  what it changed, the counts
    const report = relinkSets(resolve(shared), { dryRun })
    if (args.includes("--json")) console.log(JSON.stringify(report, null, 2))
    else {
      for (const path of report.rewritten) console.log(`relink-sets:  ${path}`)
      console.log(
        `${dryRun ? "dry run:  would change" : "changed"} ${report.rewritten.length} file(s):  ` +
          `${report.links} link(s), ${report.mentions} mention(s)`
      )
    }
    process.exit(0)
  }
  if (args[0] !== "repair") {
    console.error(
      "usage:  node tools/relocate.js repair [--root <checkout>] [--shared <dir>] [--dry-run] [--json]\n" +
        "        node tools/relocate.js reorg --shared <dir> [--root <checkout>] [--dry-run]\n" +
        "        node tools/relocate.js relink --shared <dir> [--dry-run] [--json]\n" +
        "        node tools/relocate.js relink-sets --shared <dir> [--dry-run] [--json]"
    )
    process.exit(2)
  }
  const report = repairCheckout(root, { dryRun })
  const reorg = shared ? reorgShared(resolve(shared), root, { dryRun }) : undefined
  // after the reorg, which moves what older code wrote at the old paths:  the docs package's end
  const relink = shared ? relinkDocsPackage(resolve(shared), { dryRun }) : undefined
  if (args.includes("--json"))
    console.log(JSON.stringify({ ...report, ...(reorg && { reorg }), ...(relink && { relink }) }, null, 2))
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
    for (const path of relink?.rewritten ?? [])
      console.log(`${"docs package's end:  links / mentions".padEnd(40)} ${path}`)
    const total =
      report.moved.length +
      report.same.length +
      report.linked.length +
      (reorg ? reorg.moved.length + reorg.merged.length + reorg.rewritten.length : 0) +
      (relink?.rewritten.length ?? 0)
    console.log(`${dryRun ? "dry run:  would change" : "changed"} ${total} file(s)`)
  }
  process.exit(report.conflicts.length || reorg?.conflicts.length ? 1 : 0)
}
