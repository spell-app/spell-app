/**
 * The shared-content move (epic `shared-content`, P2):  where each repo path went, and how to rewrite a file's
 * links and path mentions to match.
 * - `packages/docs` keeps only the package (`package.json`, `AGENTS.md` ...) and `tools/`;  every page, plan doc and
 *   template moved to `packages/docs/content/`
 * - the docs scripts and `_assets` moved to `packages/docs/tools/`, the goals tooling to `packages/docs/tools/goals/`
 * - the three root logs moved to `agents/`
 * - used once on the whole repo;  since then by `repairCheckout()` (`spell dev shared repair`), after a branch from
 *   before the move merges `main`
 * - `node tools/relocate.js repair [--root <checkout>] [--dry-run] [--json]`:  `repairCheckout()`
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
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
 * Where repo path `path` is now (posix, repo-relative, no leading `/`), or `undefined` when it didn't move.
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

/** A link worth relocating:  relative, not an anchor, a URL, a template placeholder or a variable. */
function isRelative(link) {
  return link !== "" && !/^(?:[a-z][a-z0-9+.-]*:|\/|#|\{\{|\$|`)/i.test(link)
}

/**
 * `link`, written in a file that was at `oldFile` and is now at `newFile` (both repo-relative), pointing where its
 * target is now.  Unchanged when it isn't relative or leaves the repo.
 */
export function relocateLink(link, oldFile, newFile) {
  if (!isRelative(link)) return link
  // a page already in `content/` that didn't move links the new way:  re-mapping would send `../app/` into content
  if (oldFile === newFile && newFile.startsWith("packages/docs/content/")) return link
  const [, path, rest = ""] = /^([^?#]*)(.*)$/.exec(link)
  if (!path) return link
  const target = posix.normalize(posix.join(posix.dirname(oldFile), path))
  if (target.startsWith("..")) return link
  const movedTo = target === "." ? undefined : movedPath(target)
  if (!movedTo && oldFile === newFile) return link
  const moved = movedTo ?? (target === "." ? "" : target)
  let rel = posix.relative(posix.dirname(newFile), moved) || "."
  if (path.endsWith("/") && !rel.endsWith("/")) rel += "/"
  if (rel === "./" && !path.startsWith(".")) rel = "./"
  return rel === path ? link : rel + rest
}

/**
 * `text` of a file moved from `oldFile` to `newFile` (or not moved:  the same path), with every relative link
 * relocated:  HTML `href` / `src` / the site header's `root`, and markdown `](...)` links.
 */
export function relocateLinks(text, oldFile, newFile) {
  return text
    .replace(/\b(href|src|root)="([^"]*)"/g, (all, attr, link) => `${attr}="${relocateLink(link, oldFile, newFile)}"`)
    .replace(/\]\(([^)\s]+)\)/g, (all, link) => `](${relocateLink(link, oldFile, newFile)})`)
}

/**
 * `text` of page `file` (repo-relative, under `packages/docs/content/`) with each relative link that points nowhere
 * re-read as if written at the page's old place (`packages/docs/<path>`), when that finds a file.
 * - for edits made against the old layout and merged in afterwards (a worktree, `main` before the cutover):  their
 *   links are relative to the old place, the rest of the page's to the new
 * - `exists(repoPath)` -- whether a repo-relative path exists
 */
export function repairLinks(text, file, exists) {
  const oldFile = file.replace(/^packages\/docs\/content\//, "packages/docs/")
  if (oldFile === file) return text
  return text.replace(/\b(href|src)="([^"]*)"/g, (all, attr, link) => {
    if (!isRelative(link)) return all
    const path = link.replace(/[?#].*$/, "")
    if (!path || exists(posix.normalize(posix.join(posix.dirname(file), path)))) return all
    const fixed = relocateLink(link, oldFile, file)
    const target = posix.normalize(posix.join(posix.dirname(file), fixed.replace(/[?#].*$/, "")))
    return fixed !== link && exists(target) ? `${attr}="${fixed}"` : all
  })
}

/** Repo paths written out in prose or code, longest first, so `packages/docs/scripts/x` beats `packages/docs`. */
const MENTION =
  /(?<![\w./-])(packages\/docs\/[\w.-]+(?:\/[\w.*-]+)*|goals\/(?:_tools|_skills|tsconfig\.json)(?:\/[\w.*-]+)*|(?:PAPERCUTS|SUSPECTED-BUGS|CODE-DEBT)\.md)/g

/**
 * `text` with every repo path it mentions (`packages/docs/solid/solid-2.md`, `goals/_tools/goals.js`,
 * `PAPERCUTS.md`) updated to where it is now.
 * - only whole paths from the repo root:  `../_assets/x.css` is a link, for `relocateLinks()`
 */
export function relocateMentions(text) {
  return text.replace(MENTION, (path) => movedPath(path) ?? path)
}

////////////////
// ## Repair
////////////////

/** Old tooling folders a merge may bring back at the top of `packages/docs`:  reported, never moved into content. */
const OLD_TOOLING = new Set(["scripts", "_assets", "templates", "epics-tools"])

/**
 * Put checkout `root` right after a branch from before the move merged `main`:  `spell dev shared repair`.  Returns
 * what it did (or, `dryRun`, would do):  `{ moved, same, conflicts, linked, leftovers }`, repo-relative paths.
 * 1. pages left at the top of `packages/docs` (`packages/docs/<x>`, not the package's own files):  each file goes
 *    to `packages/docs/content/<x>` with its links relocated (`moved`), unless content has it already:  identical
 *    (`same`) or different (`conflicts`:  left in place, for a person);  then git forgets the old path
 * 2. every page in `content/`:  links written for the old layout are repaired (`repairLinks()`), and a local link's
 *    tab name follows where it points now (`retarget()`):  `linked`
 * - `leftovers`:  old tooling folders (`packages/docs/scripts` ...) and root logs (`PAPERCUTS.md` ...):  only reported
 * - writes through the `content` link (node can;  Claude's Edit can't, in a worktree)
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
  for (const file of filesUnder(root, "packages/docs/content").filter((path) => path.endsWith(".html"))) {
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
 * `text` of page `file` (repo-relative) with each local link's `target="src-..."` (its tab, `doc-links.js`
 * `targetFor()`) named for where the link points NOW:  a moved file kept its old name, so one file had two tabs.
 * - plan docs' targets (the epic's name) and external ones (`ext-...`) are left alone
 */
export function retarget(text, file) {
  return text.replace(/<a\b([^>]*?)\bhref="([^"]*)"([^>]*?)\btarget="src-[^"]*"/g, (all, before, link, between) => {
    if (!isRelative(link)) return all
    const dest = posix.normalize(posix.join(posix.dirname(file), link.replace(/[?#].*$/, "")))
    if (dest.startsWith("..")) return all
    const name = `src-${dest
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80)}`
    return `<a${before}href="${link}"${between}target="${name}"`
  })
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
  const at = args.indexOf("--root")
  const root = resolve(at >= 0 ? args[at + 1] : join(dirname(fileURLToPath(import.meta.url)), "../../.."))
  if (args[0] !== "repair") {
    console.error("usage:  node tools/relocate.js repair [--root <checkout>] [--dry-run] [--json]")
    process.exit(2)
  }
  const report = repairCheckout(root, { dryRun: args.includes("--dry-run") })
  if (args.includes("--json")) console.log(JSON.stringify(report, null, 2))
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
    const total = report.moved.length + report.same.length + report.linked.length
    console.log(`${args.includes("--dry-run") ? "dry run:  would change" : "changed"} ${total} file(s)`)
  }
  process.exit(report.conflicts.length ? 1 : 0)
}
