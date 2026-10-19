import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve as resolvePath } from "node:path"

import { parseHTML } from "linkedom"

import type { AS } from "$/assembler"

/**
 * Links source references in a page of the spell-app checkout at `root`:
 * one named target per destination, so re-clicks reuse a tab.
 * - Rules:  spell-epic's `src/AGENTS.md`, "Links".
 * - `link()`:  `<code>path</code>` outside `<pre>` / `<a>` / `<head>` becomes a link,
 *   when the path resolves to a real file or folder
 *   - an existing `<a href>` without a target gets one (external:  per URL;  sibling docs:  per file)
 *   - a name with its path as its tooltip, `<code title="path">name</code>`, links to that path the same way
 * - `check()`:
 *   - every local href resolves INSIDE the repo
 *   - every non-anchor link has a target
 *   - one target per destination (`target="_self"`, a same-tab link, is exempt)
 *   - a SHORT ADDRESS (`href="SAGA:/drawable-spell/python-target#T1"`, epic `epic-workflow` P15) is neither linked
 *     nor checked here:  the docs runtime turns it into the page, and the epics tool, which knows the sagas, checks it
 *     (`EpicTargets.problemsIn()`, run beside this by `doc-links.js --check` and `epic check`)
 *   - a missing target version control IGNORES is fine:
 *     runtime files and local clones exist only on some machines, or while a server runs (`isGitIgnored()`)
 * - Works on the page's TEXT with regexes, never a parsed DOM:  the edits touch only what they link, byte for byte.
 * - Knows the checkout's LAYOUT as folder names only:
 *   `packages/*`, and the shared areas `pages/`, `guides/`, `epics/`, `templates/`.
 *   It imports no other package, so spell-epic's docs tools and its `epic` tool both import it.
 * - SERVED folders (`served`, epic `epic-workflow` P10):  a folder the page server serves at another address.
 *   - E.g. a component set:  `packages/ui/docs/` at `/components/ui/`.
 *   - Its pages' links are written as from that address, so they hold under `/worktrees/<w>/` too.
 *   - Give such a page `servedDir()` of its folder as its `pageDir`:  links then resolve, and are written, from there.
 * - From the docs tools' `doc-links.js` (epic `epic-components`, P7;  spell-epic's `src/tools/` now), which runs its
 *   command line on this.
 */
export class Linker {
  /** the checkout's root:  links resolve inside it, and a target is a slug of the path relative to it */
  readonly root: string

  /** `packages/` */
  readonly packages: string

  /** `packages/ui` */
  readonly ui: string

  /** the home page's folder, `pages/`:  what `resolve()` resolves against when no page folder is given */
  readonly home: string

  /** where `solid-js/...` references are looked up */
  readonly nodeModules: string[]

  /** code spans that aren't paths but still have a home:  text -> path or URL */
  readonly special: Map<string, string>

  /**
   * the served folders, absolute, each `[address folder, the folder it serves]`
   * - e.g. `[<root>/components/ui, <root>/packages/ui/docs]`
   */
  readonly served: readonly (readonly [string, string])[]

  /** basename -> paths under `indexRoots`, built on first use (`fileIndex`) */
  private index?: Map<string, string[]>

  /**
   * - `served`:  the address folder => the folder it serves, both relative to `root`,
   *   e.g. `{ "components/ui": "packages/ui/docs" }`
   *   (`COMPONENT_SETS` in `$/server/page`, which this package can't import)
   */
  constructor(root: string, { served = {} }: { served?: Readonly<Record<string, string>> } = {}) {
    this.root = root
    this.served = Object.entries(served).map(([address, dir]) => [join(root, address), join(root, dir)] as const)
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
      // `|| "."`:  the page's own folder;  a served page's links are written from where it's served
      let href = URL_START.test(dest) ? dest : relative(pageDir, this.virtual(dest)) || "."
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
   * - an epic page:  its `<name>`, since the page sets `window.name` to it,
   *   and `spell dev plan-doc open <name>` reuses it
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
   * - in-page anchors (`#id`) and short addresses (`SAGA:/...`) are left alone
   * - a tag with a target keeps it, except an epic page's:  renamed to its `<name>` (pre-2026-10-01 targets)
   */
  private addTarget(tag: string, href: string, pageDir: string): string {
    if (href.startsWith("#") || SAGA_ADDRESS.test(href)) return tag
    const dest = URL_START.test(href) ? href : this.real(resolvePath(pageDir, href.split("#")[0]))
    if (tag.includes("target=")) {
      if (URL_START.test(dest) || !PLAN_DOC.test(relative(this.root, dest))) return tag
      return tag.replace(/target="[^"]*"/g, () => `target="${this.targetFor(dest)}"`)
    }
    return `${tag.slice(0, -1)} target="${this.targetFor(dest)}">`
  }

  ////////////////
  // ## Served folders
  ////////////////

  /**
   * The folder a page in `dir` is SERVED from:  in a served folder, its place under the address folder
   * (`<root>/packages/ui/docs` => `<root>/components/ui`);  else `dir`.
   * - What to pass `link()` / `check()` as a page's folder.
   */
  servedDir(dir: string): string {
    return this.swap(resolvePath(dir), 1, 0)
  }

  /** `path`, resolved from a served place, as the file it is:  `<root>/components/ui/x` => `<root>/packages/ui/docs/x`. */
  private real(path: string): string {
    return this.swap(path, 0, 1)
  }

  /** `path`, a file, as the place it's served at:  `real()` turned round. */
  private virtual(path: string): string {
    return this.swap(path, 1, 0)
  }

  /** `path` with the first served pair's side `from` at its start swapped for side `to`;  else `path`. */
  private swap(path: string, from: 0 | 1, to: 0 | 1): string {
    for (const pair of this.served) {
      if (path === pair[from]) return pair[to]
      if (path.startsWith(`${pair[from]}/`)) return pair[to] + path.slice(pair[from].length)
    }
    return path
  }

  ////////////////
  // ## Resolving
  ////////////////

  /**
   * A code span's text -> an existing absolute path or `https://` URL, else `undefined`.
   * - tries, in order:
   *   - `special`
   *   - `solid-js/...` in `nodeModules`
   *   - `solidjs.com` pages
   *   - the path against the page's folder, its `experiments/`, the repo root, `packages/`,
   *     the home page's folder (`pages/`) and UI
   *   - a bare file name last, when ONE file outside a `test/` folder has it
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
    const candidates = [pageDir, join(pageDir, "experiments"), ...bases].map((base) =>
      this.real(resolvePath(base, path))
    )
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
   * - every package's `src/`, and its `components/` (a component set's elements:  `UIButton.tsx`)
   *   - none in a repo without `packages/`:  a plain one, spell-epic's own (epic `epic-engine` I14)
   * - a plain repo's own `src/`, when it has one (spell-epic's:  `PlanDocFiles.ts`)
   * - the repo's `tests/`, where every package's tests live (`List.test.ts`)
   * - the docs' pages (every area:  `pages/`, `guides/`, `epics/`, `templates/`)
   * - the epic engine's code, its docs tools included:  spell-epic's `src/`, through the checkout's `spell-epic` link
   *   (epic `epic-eject` I5), when the checkout has it
   * - UI's design notes, `notes/`
   */
  private get indexRoots(): string[] {
    return [
      ...(isDir(this.packages) ? readdirSync(this.packages) : [])
        .flatMap((name) => [join(this.packages, name, "src"), join(this.packages, name, "components")])
        .filter(isDir),
      ...[join(this.root, "src"), join(this.root, "tests")].filter(isDir),
      ...AREAS.map((area) => join(this.root, area)),
      ...[join(this.root, "spell-epic", "src")].filter(isDir),
      join(this.ui, "notes")
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
   * - `problems`:
   *   - nested links
   *   - missing or outside-the-repo files
   *   - links with no target
   *   - a destination with several targets, or a target shared by several destinations
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
      if (!hrefMatch || hrefMatch[1].startsWith("#") || SAGA_ADDRESS.test(hrefMatch[1])) continue
      const href = decodeEntities(hrefMatch[1])
      const local = !URL_START.test(href)
      const dest = local ? this.real(resolvePath(pageDir, href.split("#")[0])) : href
      if (local && !existsSync(dest)) {
        if (!this.isGitIgnored(dest + (href.split("#")[0].endsWith("/") ? "/" : ""))) problems.push(`missing:  ${href}`)
      } else if (local && !this.isInside(dest)) problems.push(`outside repo:  ${href}`)
      if (!target) {
        problems.push(`no target:  ${href}`)
        continue
      }
      // `_self`:  a page that reads like a site (the master plan) navigates in place, on purpose.
      // `github`:  an epic page's commit links (`<epic-commit>`) share ONE GitHub tab,
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
   * Whether version control ignores `path`:  a local-only or runtime file, fine to be missing here.
   * - e.g. `.spell-server.json`, a local clone in `packages/ui/reference/`
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
 * An epic page, `epics/<name>/<name>.plan.html`, relative to the repo root:  `[1]` is its name.
 * - and its old places:  `<name>.html` before 2026-10-04;
 *   under `packages/docs/content/` or `packages/docs/` before 2026-10-05
 * - same as the docs tools' `relocate.js` `PLAN_DOC` (spell-epic's `src/tools/`)
 */
const PLAN_DOC = /(?:^|\/)(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/** The one target several destinations may share:  an epic page's commits, each opened in the same GitHub tab. */
const SHARED_TAB = "github"

/** An absolute URL. */
const URL_START = /^https?:\/\//

/**
 * A short address, `SAGA:/<saga>[/<epic>][#<id>]`:  the epics tool's (spell-epic's `$/epics/links` `SAGA_SCHEME`),
 * which this package can't import.
 */
const SAGA_ADDRESS = /^saga:\//i

/**
 * A code span:  `[2]` its text;
 * `[1]` its `title`, when that's its only attribute:
 * a name with its path as its tooltip (WWOD §6 › "Plain text, plain paths")
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
