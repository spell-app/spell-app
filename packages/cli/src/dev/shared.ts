import { spawnSync } from "child_process"
import {
  closeSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from "fs"
import { basename, dirname, join, relative, resolve } from "path"

import { CLI, type LinkReport, type SharedConfig, type SharedStatus } from "$/cli"

/**
 * Shared content (epic `shared-content`):  docs pages, goal sets and the agents' logs live ONCE, in a content repo
 * beside the main checkout (`../spell-app-dev`), and every checkout links to them at its root:  `epics`, `guides`,
 * `pages`, `templates`, `brand`, `ui`, `goals`, `agents` (`DEFAULT_LINKS`).  So every worktree sees every edit at
 * once, and none of it is merged.
 * - `ui`:  Spell UI's hand-written docs pages (claude-design P6);  their bundle and data stay in each branch's
 *   `packages/ui/site/`
 * - before 2026-10-05 (epic `claude-design` P4) the docs were ONE link, `packages/docs/content`:  the shared repo keeps
 *   old-path links there for checkouts on older code (`packages/docs/tools/relocate.js` `reorgShared()`)
 * - the manifest:  the root `package.json`'s `"shared"` (`sharedConfig()`)
 * - only FOLDERS are linked:  Claude's Edit refuses to write through a link to a file
 * - the shared repo is committed by itself, after every turn (`commitShared()`, the `Stop` hook
 *   `.claude/hooks/shared-commit.mjs`)
 */

/** The links when the manifest names none:  the docs' areas, then the goal sets and the logs. */
const DEFAULT_LINKS = ["epics", "guides", "pages", "templates", "brand", "ui", "goals", "agents"]

/** Never compared or copied:  OS litter. */
const LITTER = new Set([".DS_Store"])

/** How long `commitShared()` waits for another session's commit, ms. */
const LOCK_WAIT = 30_000

/** A lock or git index lock older than this is a crashed holder's, ms. */
const STALE = 120_000

/** How long one git command may take in the shared repo, ms. */
const GIT_WAIT = 30_000

/**
 * The shared-content manifest of checkout `root` (any checkout).
 * - `dir`:  `"shared": { "dir" }` in the MAIN checkout's `package.json`, relative to it;  `SPELL_SHARED_DIR`
 *   overrides it (tests, a scratch repo)
 * - `links`:  `"shared": { "links" }` in `root`'s OWN `package.json` (else the main one's), else `DEFAULT_LINKS`:
 *   which folders a checkout links is its branch's business (the reorg changed them, claude-design P4)
 */
export function sharedConfig(root = CLI.mainRoot()): SharedConfig {
  const main = CLI.mainRoot(root)
  const mine = manifest(root)
  const theirs = manifest(main)
  const dir = process.env.SPELL_SHARED_DIR ?? resolve(main, theirs.dir ?? mine.dir ?? "../spell-app-dev")
  return { main, dir: resolve(dir), links: mine.links ?? theirs.links ?? DEFAULT_LINKS }
}

/** The `"shared"` field of checkout `root`'s `package.json`;  `{}` without one. */
function manifest(root: string): Partial<{ dir: string; links: string[] }> {
  try {
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).shared ?? {}
  } catch {
    return {}
  }
}

/** The main checkout, then every worktree under `.claude/worktrees` (a folder with a `.git` file). */
export function sharedCheckouts(main: string): string[] {
  const trees = join(main, ".claude", "worktrees")
  const worktrees = existsSync(trees)
    ? readdirSync(trees, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(trees, entry.name, ".git")))
        .map((entry) => join(trees, entry.name))
    : []
  return [main, ...worktrees.sort()]
}

/**
 * What `path` (a manifest link) is in `checkout`:
 * - `ok`:  a link to the shared folder
 * - `tracked`:  still in this checkout's git (a branch before the cutover:  `spell dev shared migrate`)
 * - `missing`:  nothing there
 * - `real`:  a real folder (a fresh clone, or git wrote one over the link)
 * - `dangling`:  a link to nothing;  `elsewhere`:  a link to some other folder
 */
export function linkState(checkout: string, path: string, config: SharedConfig): LinkReport["state"] {
  if (CLI.git(["ls-files", "--", path], checkout).out) return "tracked"
  const at = join(checkout, path)
  const stat = lstatSync(at, { throwIfNoEntry: false })
  if (!stat) return "missing"
  if (!stat.isSymbolicLink()) return "real"
  if (!existsSync(at)) return "dangling"
  return realOrSelf(at) === realOrSelf(join(config.dir, path)) ? "ok" : "elsewhere"
}

/**
 * Every checkout's links and the shared repo's state:  `spell dev shared status`.
 * - each checkout's links from its OWN manifest (`sharedConfig()`):  a branch from before the reorg links
 *   `packages/docs/content`, a newer one the root folders
 * - `peer.dirty`:  changed files not committed yet;  `peer.last`:  `<sha> <when> <subject>`
 */
export function sharedStatus(config = sharedConfig()): SharedStatus {
  const isRepo = existsSync(join(config.dir, ".git"))
  return {
    dir: config.dir,
    exists: existsSync(config.dir),
    isRepo,
    dirty: isRepo ? CLI.git(["status", "--porcelain"], config.dir).out.split("\n").filter(Boolean).length : 0,
    last: isRepo ? CLI.git(["log", "-1", "--format=%h %cr %s"], config.dir).out : "",
    checkouts: sharedCheckouts(config.main).map((checkout) => ({
      checkout: relative(config.main, checkout) || ".",
      links: linksOf(checkout, config).map((path) => ({ path, state: linkState(checkout, path, config) }))
    }))
  }
}

/** The links checkout `checkout` should have:  its own manifest's, `config`'s when it can't be read. */
function linksOf(checkout: string, config: SharedConfig): string[] {
  return manifest(checkout).links ?? config.links
}

/**
 * Make checkout `checkout`'s links point at the shared folders;  what it did, per link.
 * - `ok`:  already;  `linked`:  made (missing, dangling or pointing elsewhere);  `replaced`:  a real folder identical
 *   to the shared one, swapped for the link
 * - left alone, with the reason:  `tracked` (migrate first), `diverged` (a real folder that differs:  NEVER
 *   overwrites the shared copy), `no-shared` (the shared repo has no such folder)
 * - SIDE EFFECT:  removes old links and identical real folders, writes links (relative targets)
 */
export function linkCheckout(checkout: string, config = sharedConfig(checkout)): LinkReport[] {
  return config.links.map((path) => {
    const state = linkState(checkout, path, config)
    const at = join(checkout, path)
    const target = join(config.dir, path)
    if (state === "ok" || state === "tracked") return { path, state, action: state }
    if (!existsSync(target)) return { path, state, action: "no-shared" }
    if (state === "real") {
      if (!sameTree(at, target)) return { path, state, action: "diverged" }
      rmSync(at, { recursive: true, force: true })
    } else if (state !== "missing") rmSync(at, { force: true })
    mkdirSync(dirname(at), { recursive: true })
    symlinkSync(relative(dirname(at), target), at)
    return { path, state, action: state === "real" ? "replaced" : "linked" }
  })
}

/**
 * Create the shared repo at `config.dir`:  `spell dev shared init`.  Returns what it did.
 * - already a git repo:  `exists`, nothing done
 * - `importFrom` (a checkout):  copies its folders for every link in, and commits `Import from spell-app <sha>`
 * - else an empty repo with the link folders, so a fresh clone can link and start
 * - always:  `.gitignore` (locks, temp files, scratch details pages) and a `README.md`
 */
export function initShared(config: SharedConfig, { importFrom }: { importFrom?: string } = {}): string {
  if (existsSync(join(config.dir, ".git"))) return "exists"
  mkdirSync(config.dir, { recursive: true })
  gitOrThrow(["init", "-q"], config.dir)
  writeFileSync(join(config.dir, ".gitignore"), GITIGNORE)
  writeFileSync(join(config.dir, "README.md"), readme(config))
  for (const path of config.links) {
    const from = importFrom && join(importFrom, path)
    if (from && existsSync(from)) {
      cpSync(realOrSelf(from), join(config.dir, path), {
        recursive: true,
        filter: (source) => !LITTER.has(basename(source))
      })
    } else mkdirSync(join(config.dir, path), { recursive: true })
  }
  gitOrThrow(["add", "-A"], config.dir)
  const sha = importFrom ? CLI.git(["rev-parse", "--short", "HEAD"], importFrom).out : ""
  const message = importFrom ? `Import from spell-app ${sha}`.trim() : "Shared content:  empty"
  gitOrThrow(["-c", "commit.gpgsign=false", "commit", "-q", "--allow-empty", "-m", message], config.dir)
  return importFrom ? "imported" : "created"
}

/**
 * Commit whatever changed in the shared repo:  `spell dev shared commit`, run by the `Stop` hook after every turn.
 * ONE commit per group of files (`sharedGroup()`):  any session's turn sweeps up every session's pending edits, so the
 * message says WHAT changed (`auto: epic seo`), never whose turn it was.  Returns the new commits' short shas, in
 * order;  `[]` when nothing changed.
 * - one at a time:  `<dir>/.git/spell-shared-commit.lock`, waited for up to 30s (never skipped:  the other
 *   session's changes would sit uncommitted until someone's next turn)
 * - a git `index.lock` older than 2 minutes is a crashed git's:  removed
 * - the index is reset first (nobody stages here by hand;  a crashed run may have left some), then ONE
 *   `git status` pass;  a rename is two paths:  the new one in its group, the deletion in the old one's
 * - message `auto: <group>`, trailers `Turn-end:` (the checkout whose turn ended, `main` or the worktree's name:
 *   NOT the author) and `Session:`
 * - SIDE EFFECT:  `git add` / `git commit` in the shared repo, by pathspec (never `-A`)
 */
export function commitShared(
  config: SharedConfig,
  { session, checkout }: { session?: string; checkout?: string } = {}
): string[] {
  if (!existsSync(join(config.dir, ".git"))) return []
  return withLock(join(config.dir, ".git", "spell-shared-commit.lock"), () => {
    const indexLock = join(config.dir, ".git", "index.lock")
    if (existsSync(indexLock) && Date.now() - statSync(indexLock).mtimeMs > STALE) rmSync(indexLock, { force: true })
    gitOrThrow(["reset", "-q"], config.dir)
    // `Object.groupBy()` needs lib `es2024`;  ours is older
    const groups: Record<string, string[]> = {}
    for (const path of pendingPaths(config.dir)) (groups[sharedGroup(path)] ??= []).push(path)
    const trailers = [checkout && `Turn-end: ${checkoutName(config.main, checkout)}`, session && `Session: ${session}`]
    const footer = trailers.filter(Boolean).join("\n")
    return Object.keys(groups)
      .sort()
      .map((group) => {
        gitOrThrow(["--literal-pathspecs", "add", "--pathspec-from-file=-", "--pathspec-file-nul"], config.dir, {
          input: groups[group].join("\0")
        })
        const message = `auto: ${group}${footer ? `\n\n${footer}` : ""}`
        gitOrThrow(["-c", "commit.gpgsign=false", "commit", "-q", "-m", message], config.dir)
        return CLI.git(["rev-parse", "--short", "HEAD"], config.dir).out
      })
  })
}

/**
 * The commit group of shared-repo path `path` (`commitShared()`):  what the commit's message names.
 * - `epics/<name>/...`:  `epic <name>`;  `goals/<set>/...`:  `goals/<set>`;  a file right under either:  the folder
 * - `guides/<x>`, `<x>` a folder or a file:  `guides/<x>`
 * - the other shared folders (`pages`, `templates`, `ui`, `brand`, `agents`):  the folder
 * - anything else (the repo's own files, old-path links):  `other`
 */
export function sharedGroup(path: string): string {
  const [top, next, ...rest] = path.split("/")
  const inFolder = rest.length > 0
  if (top === "epics") return inFolder ? `epic ${next}` : top
  if (top === "goals") return inFolder ? `goals/${next}` : top
  if (top === "guides") return next ? `guides/${next}` : top
  return next && WHOLE_FOLDERS.has(top) ? top : "other"
}

/** Shared folders committed as one group each (`sharedGroup()`). */
const WHOLE_FOLDERS = new Set(["pages", "templates", "ui", "brand", "agents"])

/**
 * Every path with a change in repo `dir`, untracked files one by one:  `git status --porcelain -z`.
 * - a rename or copy (`R` / `C`, staged only) gives both paths
 */
function pendingPaths(dir: string): string[] {
  const entries = gitOrThrow(["status", "--porcelain", "-z", "--untracked-files=all"], dir).split("\0").filter(Boolean)
  const paths: string[] = []
  for (let i = 0; i < entries.length; i++) {
    const [code, path] = [entries[i].slice(0, 2), entries[i].slice(3)]
    paths.push(path)
    if (/[RC]/.test(code)) paths.push(entries[++i])
  }
  return paths
}

/** `checkout`'s short name:  `main`, a worktree's name, else its path relative to `main`. */
function checkoutName(main: string, checkout: string): string {
  const where = relative(main, checkout)
  return where ? where.replace(/^\.claude[\\/]worktrees[\\/]/, "") : "main"
}

/** The shared repo's `.gitignore`. */
const GITIGNORE = `# written by \`spell dev shared init\`
*.lock
*.tmp
.DS_Store
.server.json
.server.log
# /details scratch pages and their answers:  never committed
pages/details/
# /epic review inboxes:  a review's pending marks, never committed
epics/*/*.inbox.json*
# an epic's running agents (\`spell dev agents\`):  what's running now, never committed
epics/*/agents.json
`

/** The shared repo's `README.md`. */
function readme(config: SharedConfig): string {
  return `# spell-app-dev

Shared content for \`spell-app\` (epic \`shared-content\`):  ${config.links.map((path) => `\`${path}\``).join(", ")}.

- Content only:  the tools that read and write it live in \`spell-app\`.
- Every checkout of \`spell-app\` (main and each worktree) links these folders in, so edits show everywhere at once.
- Edit through the links in \`spell-app\`;  every Claude Code turn commits here by itself (\`spell dev shared commit\`).
`
}

/** `path` with every link resolved, or `path` itself when it doesn't exist. */
function realOrSelf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

/** Whether folders `a` and `b` hold the same files with the same bytes (OS litter aside). */
function sameTree(a: string, b: string): boolean {
  const left = files(a)
  const right = files(b)
  if (left.length !== right.length || left.some((path, i) => path !== right[i])) return false
  return left.every((path) => readFileSync(join(a, path)).equals(readFileSync(join(b, path))))
}

/** Every file under `dir`, relative, sorted;  links followed. */
function files(dir: string, prefix = ""): string[] {
  const found: string[] = []
  for (const entry of readdirSync(join(dir, prefix), { withFileTypes: true })) {
    if (LITTER.has(entry.name)) continue
    const path = join(prefix, entry.name)
    if (statSync(join(dir, path)).isDirectory()) found.push(...files(dir, path))
    else found.push(path)
  }
  return found.sort()
}

/**
 * `git <args>` in `cwd`, `input` on its stdin;  its output UNTRIMMED (`git status --porcelain` starts with a space).
 * - throws a `CliError` with git's message when it fails
 */
function gitOrThrow(args: string[], cwd: string, { input }: { input?: string } = {}): string {
  const run = spawnSync("git", args, { cwd, input, encoding: "utf8", timeout: GIT_WAIT })
  if (run.status !== 0) {
    const why = (run.stderr || run.stdout || String(run.error ?? "")).trim()
    throw new CLI.CliError(`git ${args.join(" ")} failed in ${cwd}:  ${why}`)
  }
  return run.stdout
}

/** Run `fn` holding lock file `lockFile` (`open(wx)`), waiting up to `LOCK_WAIT`;  a stale lock is taken over. */
function withLock<T>(lockFile: string, fn: () => T): T {
  const deadline = Date.now() + LOCK_WAIT
  for (;;) {
    try {
      closeSync(openSync(lockFile, "wx"))
      break
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
      const age = Date.now() - (statSync(lockFile, { throwIfNoEntry: false })?.mtimeMs ?? Date.now())
      if (age > STALE) rmSync(lockFile, { force: true })
      else if (Date.now() > deadline) throw new CLI.CliError(`${lockFile} held for ${LOCK_WAIT / 1000}s:  stuck?`)
      else Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
    }
  }
  try {
    return fn()
  } finally {
    rmSync(lockFile, { force: true })
  }
}
