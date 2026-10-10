import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve as resolvePath } from "node:path"

import { parseHTML } from "linkedom"

import type { AS } from "$/assembler"

/**
 * Links source references in a page of the spell-app checkout at `root`:  one named target per destination, so
 * re-clicks reuse a tab.  Rules:  `packages/docs/AGENTS.md`, "Links".
 * - `link()`:  `<code>path</code>` outside `<pre>` / `<a>` / `<head>` becomes a link when the path resolves to a real
 *   file or folder;  an existing `<a href>` without a target gets one (external:  per URL;  sibling docs:  per file)
 *   - a name with its path as its tooltip, `<code title="path">name</code>`, links to that path the same way
 * - `check()`:  every local href resolves INSIDE the repo, every non-anchor link has a target, one target per
 *   destination (`target="_self"`, a same-tab link, is exempt from the last)
 *   - a missing target version control IGNORES is fine:  runtime files and local clones exist only on some
 *     machines, or while a server runs (`isGitIgnored()`)
 * - Works on the page's TEXT with regexes, never a parsed DOM:  the edits touch only what they link, byte for byte.
 * - Knows the checkout's LAYOUT (`packages/*`, the shared areas `pages/`, `guides/`, `epics/`, `templates/`) as
 *   folder names only:  imports no other package, so `docs` and `epics` both import it.
 * - From `packages/docs/tools/doc-links.js` (epic `epic-components`, P7), which now runs its command line on this.
 */
export class Linker {
  /** the checkout's root:  links resolve inside it, and a target is a slug of the path relative to it */
  readonly root: string

  /** `packages/` */
  readonly packages: string

  /** `packages/ui` */
  readonly ui: string

  /** the docs home's folder, `pages/`:  what `resolve()` resolves against when no page folder is given */
  readonly home: string

  /** where `solid-js/...` references are looked up */
  readonly nodeModules: string[]

  /** code spans that aren't paths but still have a home:  text -> path or URL */
  readonly special: Map<string, string>

  /** basename -> paths under `indexRoots`, built on first use (`fileIndex`) */
  private index?: Map<string, string[]>

  constructor(root: string) {
    this.root = root
    this.packages = join(root, "packages")
    this.ui = join(this.packages, "ui")
    this.home = join(root, "pages")
    this.nodeModules = [join(this.ui, "node_modules"), join(root, "node_modules")]
    this.special = new Map([
      ["solidjs/solid", "https://github.com/solidjs/solid/tree/next"],
      ["solidjs/solid-docs", "https://github.com/solidjs/solid-docs/tree/v2-rebuild"],
      ["documentation/solid-2.0/", "https://github.com/solidjs/solid/tree/next/documentation/solid-2.0"],
      ["@spell-app/ui", join(this.ui, "README.md")]
    ])
  }

  ////////////////
  // ## Linking
  ////////////////

  /**
   * `text` (a page in `pageDir`) with its code spans linked and every link given a target.
   * - idempotent:  a second run changes nothing
   */
  link(text: string, pageDir: string): AS.LinkResult {
    const spans = PROTECTED.flatMap((pattern) =>
      Array.from(text.matchAll(pattern), (m) => [m.index, m.index + m[0].length])
    )
    const out: string[] = []
    let last = 0
    let linked = 0
    const unresolved = new Set<string>()
    for (const m of text.matchAll(CODE_SPAN)) {
      if (spans.some(([start, end]) => start <= m.index && m.index < end)) continue
      // a name with its path as its tooltip (`<code title="path">name</code>`) links to that path, never its text
      const path = m[1] ?? m[2]
      let dest = this.resolve(path, pageDir)
      // a path outside the repo (a handoff in a sibling folder) works only on this machine:  leave it as text
      if (dest && !URL_START.test(dest) && !this.isInside(dest)) dest = undefined
      if (!dest) {
        if (path.includes("/") || PATH_LIKE.test(path.trim())) unresolved.add(path)
        continue
      }
      // `|| "."`:  the page's own folder
      let href = URL_START.test(dest) ? dest : relative(pageDir, dest) || "."
      if (isDir(dest) && !href.endsWith("/")) href += "/"
      out.push(text.slice(last, m.index))
      out.push(`<a href="${escapeAttribute(href)}" target="${this.targetFor(dest)}">${m[0]}</a>`)
      last = m.index + m[0].length
      linked++
    }
    out.push(text.slice(last))
    const result = out.join("").replace(A_HREF, (tag, href: string) => this.addTarget(tag, href, pageDir))
    return { text: result, linked, unresolved: [...unresolved].sort((a, b) => a.localeCompare(b)) }
  }

  /**
   * The tab name for `dest`, an absolute path or URL:  re-clicks reuse that tab.
   * - URLs:  `ext-<slug>`
   * - a plan doc:  its `<name>`, since the page sets `window.name` to it and `spell dev plan-doc open <name>` reuses it
   * - anything else:  `src-<slug of the repo-relative path>`
   * - at most 80 characters after the prefix
   */
  targetFor(dest: string): string {
    if (URL_START.test(dest)) return `ext-${slug(dest.replace(/^https?:\/\/(www\.)?/, "")).slice(0, 80)}`
    const rel = relative(this.root, dest)
    const plan = PLAN_DOC.exec(rel)
    if (plan) return plan[1]
    return `src-${slug(rel).slice(0, 80)}`
  }

  /**
   * `tag`, an `<a href>` in a page in `pageDir`, with a target:
   * - in-page anchors (`#id`) are left alone
   * - a tag with a target keeps it, except a plan doc's:  renamed to its `<name>` (pre-2026-10-01 targets)
   */
  private addTarget(tag: string, href: string, pageDir: string): string {
    if (href.startsWith("#")) return tag
    const dest = URL_START.test(href) ? href : resolvePath(pageDir, href.split("#")[0])
    if (tag.includes("target=")) {
      if (URL_START.test(dest) || !PLAN_DOC.test(relative(this.root, dest))) return tag
      return tag.replace(/target="[^"]*"/g, () => `target="${this.targetFor(dest)}"`)
    }
    return `${tag.slice(0, -1)} target="${this.targetFor(dest)}">`
  }

  ////////////////
  // ## Resolving
  ////////////////

  /**
   * A code span's text -> an existing absolute path or `https://` URL, else `undefined`.
   * - tries, in order:  `special`, `solid-js/...` in `nodeModules`, `solidjs.com` pages,
   *   then the path against the page's folder, its `experiments/`, the repo root, `packages/`,
   *   the docs home's folder (`pages/`) and UI;  a bare file name last, when ONE file outside a `test/` folder has it
   * - `file.ts:75` drops its line number
   * - NOTE:  the alias form is `#name/...`, from before the `$/` aliases:  a `$/name/...` span never resolves
   */
  resolve(raw: string, pageDir = this.home): string | undefined {
    const text = decodeEntities(raw).trim()
    const special = this.special.get(text)
    if (special) return special
    if (SOLID_FILE.test(text)) {
      for (const folder of this.nodeModules) if (existsSync(join(folder, text))) return join(folder, text)
    }
    if (SOLID_SITE.test(text)) return `https://${text}`
    let path = text.replace(/:\d+$/, "")
    // `/`, `./`, `..`:  operators and punctuation, not paths (`/` resolved to the filesystem root)
    if (!/[A-Za-z0-9]/.test(path)) return undefined
    if (!PATH_CHARS.test(path) || (!path.includes("/") && !path.includes("."))) return undefined
    const alias = ALIAS.exec(path)
    if (alias) path = join(this.packages, alias[1], "src", alias[2])
    // `resolvePath`, not `join`:  an absolute `path` stands on its own
    const bases = path.startsWith("node_modules/")
      ? [this.root, this.ui]
      : [this.root, this.packages, this.home, this.ui]
    const candidates = [pageDir, join(pageDir, "experiments"), ...bases].map((base) => resolvePath(base, path))
    const found = candidates.find((candidate) => existsSync(candidate))
    if (found) return found
    if (!path.replace(/\/+$/, "").includes("/")) {
      const hits = (this.fileIndex.get(path) ?? []).filter((hit) => !hit.includes("/test/"))
      if (hits.length === 1) return hits[0]
    }
    return undefined
  }

  /**
   * Where bare file names (`withSolid.ts`) are looked up:
   * - every package's `src/`
   * - the docs' pages (every area:  `pages/`, `guides/`, `epics/`, `templates/`) and tools, and UI's `docs/`
   */
  private get indexRoots(): string[] {
    return [
      ...readdirSync(this.packages)
        .map((name) => join(this.packages, name, "src"))
        .filter(isDir),
      ...AREAS.map((area) => join(this.root, area)),
      join(this.packages, "docs", "tools"),
      join(this.ui, "docs")
    ]
  }

  /** Basename -> paths, for bare file names like `withSolid.ts`;  walks `indexRoots` once, on first use. */
  private get fileIndex(): Map<string, string[]> {
    if (!this.index) {
      this.index = new Map()
      for (const root of this.indexRoots) walk(root, this.index)
    }
    return this.index
  }

  ////////////////
  // ## Checking
  ////////////////

  /**
   * The links of `text` (a page in `pageDir`), outside `<pre>`:
   * - `destinations`:  how many distinct destinations the targeted links have
   * - `problems`:  nested links, missing or outside-the-repo files, links with no target, a destination with several
   *   targets, a target shared by several destinations
   * - SIDE EFFECT:  runs `git check-ignore` once per missing local file
   */
  check(text: string, pageDir: string): AS.LinkCheck {
    const byDest = new Map<string, Set<string>>()
    const byTarget = new Map<string, Set<string>>()
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
      const dest = local ? resolvePath(pageDir, href.split("#")[0]) : href
      if (local && !existsSync(dest)) {
        if (!this.isGitIgnored(dest + (href.split("#")[0].endsWith("/") ? "/" : ""))) problems.push(`missing:  ${href}`)
      } else if (local && !this.isInside(dest)) problems.push(`outside repo:  ${href}`)
      if (!target) {
        problems.push(`no target:  ${href}`)
        continue
      }
      // `_self`:  a page that reads like a site (the master plan) navigates in place, on purpose.
      // `github`:  a plan doc's commit links (`<epic-commit>`) share ONE GitHub tab,
      // on purpose (P3 of `review-review`)
      if (target === "_self" || target === SHARED_TAB) continue
      if (!byDest.has(dest)) byDest.set(dest, new Set())
      byDest.get(dest)!.add(target)
      if (!byTarget.has(target)) byTarget.set(target, new Set())
      byTarget.get(target)!.add(dest)
    }
    for (const [dest, targets] of byDest)
      if (targets.size > 1) problems.push(`several targets for ${dest}:  ${[...targets].join(", ")}`)
    for (const [target, dests] of byTarget)
      if (dests.size > 1) problems.push(`target ${target} shared by ${[...dests].join(", ")}`)
    return { destinations: byDest.size, problems }
  }

  /**
   * Whether version control ignores `path`:  a local-only or runtime file (`.spell-server.json`, a local clone in
   * `packages/ui/reference/`), fine to be missing here.
   * - a folder MUST keep its trailing `/`:  a missing path can't match a folder-only rule (`ongoing/`) without it
   */
  private isGitIgnored(path: string): boolean {
    return spawnSync("git", ["-C", this.root, "check-ignore", "-q", path]).status === 0
  }

  /** Whether `path`, absolute and normalised, is the repo root or inside it. */
  private isInside(path: string): boolean {
    return path === this.root || path.startsWith(`${this.root}/`)
  }
}

////////////////
// ## Constants
////////////////

/** The shared content areas, folders at the checkout's root, whose pages the bare-name index walks. */
const AREAS = ["pages", "guides", "epics", "templates"]

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

/**
 * A plan doc, `epics/<name>/<name>.plan.html` (before 2026-10-04 `<name>.html`;
 * before 2026-10-05 under `packages/docs/content/` or `packages/docs/`), relative to the repo root:  `[1]` is its name.
 * - same as `packages/docs/tools/relocate.js` `PLAN_DOC`
 */
const PLAN_DOC = /(?:^|\/)(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/** The one target several destinations may share:  a plan doc's commits, each opened in the same GitHub tab. */
const SHARED_TAB = "github"

/** An absolute URL. */
const URL_START = /^https?:\/\//

/**
 * A code span:  `[2]` its text;
 * `[1]` its `title`, when that's its only attribute:  a name with its path as its tooltip (WWOD §6 › "Plain text,
 * plain paths")
 */
const CODE_SPAN = /<code(?:\s+title="([^"]+)")?\s*>([^<]+)<\/code\s*>/g

/** A `<pre>` block:  `link()` never links inside one, `check()` ignores it. */
const PRE = /<pre\b[\s\S]*?<\/pre\s*>/g

/** Ranges `link()` must not touch:  head, pre, script, style, existing links. */
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

////////////////
// ## Helpers
////////////////

/** `text` lower-cased, every run of non-alphanumerics a single `-`, none at the ends. */
function slug(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

/** `text` safe inside a double-quoted attribute. */
function escapeAttribute(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

/**
 * Add every file under `dir` to `index`:
 * - skips `SKIP_DIRS` and `.folders`
 * - never follows a symlinked folder;  a symlinked file (or a broken link) counts as a file
 * - an unreadable folder adds nothing
 */
function walk(dir: string, index: Map<string, string[]>): void {
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
      index.get(entry.name)!.push(path)
    }
  }
}

/** Whether `path` is a folder (following symlinks);  `false` when it doesn't exist. */
function isDir(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * `text` with its character references (`&amp;`, `&#47;` ...) decoded, by linkedom's HTML parser.
 * - NOTE:  `<` is escaped first, so the text can't open a tag
 */
function decodeEntities(text: string): string {
  if (!text.includes("&")) return text
  const { document } = parseHTML(`<html><body><p>${text.replaceAll("<", "&lt;")}</p></body></html>`)
  return document.querySelector("p")?.textContent ?? text
}
