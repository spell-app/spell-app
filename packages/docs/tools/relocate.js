/**
 * The shared-content move (epic `shared-content`, P2):  where each repo path went, and how to rewrite a file's
 * links and path mentions to match.
 * - `packages/docs` keeps only the package (`package.json`, `AGENTS.md` ...) and `tools/`;  every page, plan doc and
 *   template moved to `packages/docs/content/`
 * - the docs scripts and `_assets` moved to `packages/docs/tools/`, the goals tooling to `packages/docs/tools/goals/`
 * - the three root logs moved to `agents/`
 * - used once on the whole repo, then again by `spell dev shared migrate` on each worktree's old copies
 */
import { posix } from "node:path"

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
