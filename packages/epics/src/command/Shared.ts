import { spawnSync } from "node:child_process"
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
} from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { EpicConfig } from "$/epics/config/EpicConfig"

import {
  EXIT,
  EpicCommandError,
  parseVerbArgs,
  type LinkReport,
  type MigrateReport,
  type SharedConfig,
  type SharedStatus
} from "./command.types"
import { Git } from "./Git"
import { SharedMigration } from "./SharedMigration"

/****************
 * ### `Shared`
 * `epic shared <verb> ...`:  SHARED CONTENT (epic `shared-content`) -- docs pages, saga sets and the agents' logs live
 * ONCE, in a content repo beside the main checkout (`../spell-app-dev`), and every checkout links to them at its root:
 * `epics`, `guides`, `pages`, `templates`, `brand`, `ui`, `goals`, `agents` (`DEFAULT_LINKS`).  So every worktree
 * sees every edit at once, and none of it is merged.
 * - The verbs (`run()`):
 *   - `status [--json]` (default):  each checkout's links, and the shared repo's uncommitted files and last commit
 *   - `init [--import]`:  create the shared repo;  `--import` copies THIS checkout's folders in (the cutover, once)
 *   - `link [--all]`:  link this checkout's folders (`--all`:  every checkout);  a real folder is replaced only when
 *     it matches the shared one exactly
 *   - `commit [--session <id>] [--quiet]`:  commit whatever changed in the shared repo (the `Stop` hook, every turn),
 *     one commit per epic / guide / folder (`commit()`);  first the reorg's repair, for pages older checkouts still
 *     write the old way (`relocate.js reorg`)
 *   - `migrate <worktree> [--dry-run]`:  move a worktree cut before the cutover onto the shared content
 *     (`SharedMigration`);  stops, writing nothing, on a conflict
 *   - `repair [--dry-run] [--json]`:  the docs tools' own logic (`packages/epics/tools/relocate.js`), then `link`
 * - `ui`:  Spell UI's hand-written docs pages (claude-design P6);  their bundle and data stay in each branch's
 *   `packages/ui/site/`
 * - before 2026-10-05 (epic `claude-design` P4) the docs were ONE link, `packages/docs/content`:  the shared repo
 *   keeps old-path links there for checkouts on older code (`packages/epics/tools/relocate.js` `reorgShared()`)
 * - the manifest:  the root `package.json`'s `"shared"` (`configOf()`);  where the shared repo and the worktrees
 *   are:  the repo's `.epic/config.json5` (`EpicConfig`:  `contentFolder`, `worktreesFolder`)
 * - only FOLDERS are linked:  Claude's Edit refuses to write through a link to a file
 * - the relocate tool is THIS code's copy (`RELOCATE_TOOL`), run on the caller's checkout (`--root`):
 *   one copy of the epic code, whichever checkout calls it
 * - NOTE:  `SPELL_SHARED_DIR` points every verb at another shared repo (a scratch one, in tests)
 ****************/
export class Shared {
  /** the manifest:  STATIC for the object's life */
  readonly config: SharedConfig

  /** the checkout the verbs act on (`link`, `init --import`, `repair`):  the caller's */
  readonly checkout: string

  /**
   * - `checkout`:  default the nearest checkout from the current folder (one with the docs tools)
   * - `config`:  default `checkout`'s manifest (`configOf()`)
   */
  constructor({ checkout = Git.nearestCheckout(CHECKOUT_MARKER), config }: SharedProps = {}) {
    this.checkout = checkout
    this.config = config ?? Shared.configOf(checkout)
  }

  ////////////////
  // ## The verbs
  ////////////////

  /** Run `epic shared <args>`;  resolves to the exit code.  Throws `EpicCommandError` for a bad command line. */
  async run(args: string[]): Promise<number> {
    const { positional, flags } = parseVerbArgs(args, SWITCHES)
    const [verb = "status", name] = positional
    const { config, checkout } = this
    switch (verb) {
      case "status": {
        const status = this.status()
        if (flags.json) out(JSON.stringify(status, null, 2))
        else for (const line of statusLines(status)) out(line)
        return status.checkouts.every((each) => each.links.every((link) => link.state === "ok")) ? EXIT.OK : EXIT.ERRORS
      }
      case "init": {
        const done = this.init({ importFrom: flags.import ? checkout : undefined })
        out(`${config.dir}:  ${done}`)
        if (done !== "exists") this.linkAll([checkout])
        return EXIT.OK
      }
      case "link": {
        const reports = this.linkAll(flags.all ? this.checkouts() : [checkout])
        return reports.some((report) => report.action === "diverged") ? EXIT.ERRORS : EXIT.OK
      }
      case "commit": {
        // first the reorg's repair (claude-design P4):  anything older code wrote at `packages/docs/content/...` since
        // goes to its root folder, old-style links are fixed.  Until every checkout has merged the reorg:
        // claude-design T1 removes this with the old-path links
        if (existsSync(config.dir)) {
          const run = spawnSync(
            process.execPath,
            [RELOCATE_TOOL, "reorg", "--shared", config.dir, "--root", Git.CODE_ROOT],
            { encoding: "utf8" }
          )
          if (!flags.quiet && run.stdout) out(run.stdout.trimEnd())
        }
        const session = typeof flags.session === "string" ? flags.session : undefined
        const shas = this.commit({ session, checkout })
        if (!flags.quiet) out(shas.length ? `committed ${shas.join(", ")}` : "nothing to commit")
        return EXIT.OK
      }
      case "migrate": {
        if (!name) throw new EpicCommandError("migrate:  which worktree?")
        const worktree = join(config.worktrees, name)
        if (!existsSync(join(worktree, ".git"))) throw new EpicCommandError(`no worktree ${worktree}`)
        const dryRun = Boolean(flags.dryRun)
        const report = new SharedMigration({ worktree, config }).run({ dryRun })
        if (flags.json)
          out(JSON.stringify({ ...report, folds: report.folds.map(({ text: _text, ...each }) => each) }, null, 2))
        else for (const line of migrateLines(report, dryRun)) out(line)
        return report.conflicts.length ? EXIT.ERRORS : EXIT.OK
      }
      case "repair": {
        // the docs tools' own logic:  run, never imported (`relocate.js` is a plain node script)
        const shown = [...(flags.dryRun ? ["--dry-run"] : []), ...(flags.json ? ["--json"] : [])]
        const run = spawnSync(
          process.execPath,
          [RELOCATE_TOOL, "repair", "--root", checkout, "--shared", config.dir, ...shown],
          { stdio: "inherit" }
        )
        if (!flags.dryRun && !flags.json) this.linkAll([checkout])
        return run.status ?? EXIT.ERRORS
      }
      default:
        throw new EpicCommandError(`unknown verb '${verb}':  status, init, link, commit, migrate or repair`)
    }
  }

  /** Link each of `checkouts`, printing a line per link that wasn't already right;  every report. */
  private linkAll(checkouts: string[]): LinkReport[] {
    const all: LinkReport[] = []
    for (const checkout of checkouts) {
      // each checkout's OWN links:  a branch from before the reorg (claude-design P4) still links `packages/docs/content`
      for (const report of this.link(checkout, Shared.configOf(checkout).links)) {
        all.push(report)
        if (report.action !== "ok") out(`${checkout}/${report.path}:  ${report.action}`)
      }
    }
    return all
  }

  ////////////////
  // ## Checkouts and their links
  ////////////////

  /** The main checkout, then every worktree in `config.worktrees` (a folder with a `.git` file). */
  checkouts(): string[] {
    const { main, worktrees: trees } = this.config
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
   * - `tracked`:  still in this checkout's git (a branch before the cutover:  `epic shared migrate`)
   * - `missing`:  nothing there
   * - `real`:  a real folder (a fresh clone, or git wrote one over the link)
   * - `dangling`:  a link to nothing;  `elsewhere`:  a link to some other folder
   */
  linkState(checkout: string, path: string): LinkReport["state"] {
    if (Git.run(["ls-files", "--", path], checkout).out) return "tracked"
    const at = join(checkout, path)
    const stat = lstatSync(at, { throwIfNoEntry: false })
    if (!stat) return "missing"
    if (!stat.isSymbolicLink()) return "real"
    if (!existsSync(at)) return "dangling"
    return realOrSelf(at) === realOrSelf(join(this.config.dir, path)) ? "ok" : "elsewhere"
  }

  /**
   * Every checkout's links and the shared repo's state:  `epic shared status`.
   * - each checkout's links from its OWN manifest (`configOf()`):  a branch from before the reorg links
   *   `packages/docs/content`, a newer one the root folders
   * - `peer.dirty`:  changed files not committed yet;  `peer.last`:  `<sha> <when> <subject>`
   */
  status(): SharedStatus {
    const { config } = this
    const isRepo = existsSync(join(config.dir, ".git"))
    return {
      dir: config.dir,
      exists: existsSync(config.dir),
      isRepo,
      dirty: isRepo ? Git.run(["status", "--porcelain"], config.dir).out.split("\n").filter(Boolean).length : 0,
      last: isRepo ? Git.run(["log", "-1", "--format=%h %cr %s"], config.dir).out : "",
      checkouts: this.checkouts().map((checkout) => ({
        checkout: relative(config.main, checkout) || ".",
        links: (manifest(checkout).links ?? config.links).map((path) => ({
          path,
          state: this.linkState(checkout, path)
        }))
      }))
    }
  }

  /**
   * Make checkout `checkout`'s links point at the shared folders;  what it did, per link.
   * - `links`:  which ones;  default the manifest's
   * - `ok`:  already;  `linked`:  made (missing, dangling or pointing elsewhere);  `replaced`:  a real folder
   *   identical to the shared one, swapped for the link
   * - left alone, with the reason:  `tracked` (migrate first), `diverged` (a real folder that differs:  NEVER
   *   overwrites the shared copy), `no-shared` (the shared repo has no such folder)
   * - SIDE EFFECT:  removes old links and identical real folders, writes links (relative targets)
   */
  link(checkout: string, links = this.config.links): LinkReport[] {
    return links.map((path) => {
      const state = this.linkState(checkout, path)
      const at = join(checkout, path)
      const target = join(this.config.dir, path)
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

  ////////////////
  // ## The shared repo
  ////////////////

  /**
   * Create the shared repo at `config.dir`:  `epic shared init`.  Returns what it did.
   * - already a git repo:  `exists`, nothing done
   * - `importFrom` (a checkout):  copies its folders for every link in, and commits `Import from spell-app <sha>`
   * - else an empty repo with the link folders, so a fresh clone can link and start
   * - always:  `.gitignore` (locks, temp files, scratch details pages) and a `README.md`
   */
  init({ importFrom }: { importFrom?: string } = {}): string {
    const { config } = this
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
    const sha = importFrom ? Git.run(["rev-parse", "--short", "HEAD"], importFrom).out : ""
    const message = importFrom ? `Import from spell-app ${sha}`.trim() : "Shared content:  empty"
    gitOrThrow(["-c", "commit.gpgsign=false", "commit", "-q", "--allow-empty", "-m", message], config.dir)
    return importFrom ? "imported" : "created"
  }

  /**
   * Commit whatever changed in the shared repo:  `epic shared commit`, run by the `Stop` hook after every turn.
   * ONE commit per group of files (`Shared.group()`):  any session's turn sweeps up every session's pending edits,
   * so the message says WHAT changed (`auto: epic seo`), never whose turn it was.  Returns the new commits' short
   * shas, in order;  `[]` when nothing changed.
   * - one at a time:  `<dir>/.git/spell-shared-commit.lock`, waited for up to 30s (never skipped:  the other
   *   session's changes would sit uncommitted until someone's next turn)
   * - a git `index.lock` older than 2 minutes is a crashed git's:  removed
   * - the index is reset first (nobody stages here by hand;  a crashed run may have left some), then ONE
   *   `git status` pass;  a rename is two paths:  the new one in its group, the deletion in the old one's
   * - message `auto: <group>`, trailers `Turn-end:` (the checkout whose turn ended, `main` or the worktree's name:
   *   NOT the author) and `Session:`
   * - SIDE EFFECT:  `git add` / `git commit` in the shared repo, by pathspec (never `-A`)
   */
  commit({ session, checkout }: { session?: string; checkout?: string } = {}): string[] {
    const { config } = this
    if (!existsSync(join(config.dir, ".git"))) return []
    return withLock(join(config.dir, ".git", "spell-shared-commit.lock"), () => {
      const indexLock = join(config.dir, ".git", "index.lock")
      if (existsSync(indexLock) && Date.now() - statSync(indexLock).mtimeMs > STALE) rmSync(indexLock, { force: true })
      gitOrThrow(["reset", "-q"], config.dir)
      // `Object.groupBy()` needs lib `es2024`;  ours is older
      const groups: Record<string, string[]> = {}
      for (const path of pendingPaths(config.dir)) (groups[Shared.group(path)] ??= []).push(path)
      const trailers = [checkout && `Turn-end: ${checkoutName(config, checkout)}`, session && `Session: ${session}`]
      const footer = trailers.filter(Boolean).join("\n")
      return Object.keys(groups)
        .sort()
        .map((group) => {
          gitOrThrow(["--literal-pathspecs", "add", "--pathspec-from-file=-", "--pathspec-file-nul"], config.dir, {
            input: groups[group]!.join("\0")
          })
          const message = `auto: ${group}${footer ? `\n\n${footer}` : ""}`
          gitOrThrow(["-c", "commit.gpgsign=false", "commit", "-q", "-m", message], config.dir)
          return Git.run(["rev-parse", "--short", "HEAD"], config.dir).out
        })
    })
  }

  ////////////////
  // ## Statics:  the manifest, commit groups
  ////////////////

  /**
   * The shared-content manifest of checkout `root` (any checkout).
   * - `dir`:  `contentFolder` in the repo's `.epic/config.json5` (the MAIN checkout's);  `SPELL_SHARED_DIR` overrides
   *   it (tests, a scratch repo)
   *   - it was `"shared": { "dir" }` in the main checkout's `package.json` until epic `epic-eject` P4
   * - `worktrees`:  `worktreesFolder` in the same file:  where `checkouts()` finds the worktrees
   * - `links`:  `"shared": { "links" }` in `root`'s OWN `package.json` (else the main one's), else `DEFAULT_LINKS`:
   *   which folders a checkout links is its branch's business (the reorg changed them, claude-design P4)
   * - static:  made before there's a `Shared` to hold it
   */
  static configOf(root = Git.mainRoot()): SharedConfig {
    const main = Git.mainRoot(root)
    const epic = new EpicConfig(main)
    const mine = manifest(root)
    const theirs = manifest(main)
    const dir = process.env.SPELL_SHARED_DIR ?? epic.contentFolder
    return {
      main,
      dir: resolve(dir),
      worktrees: epic.worktreesFolder,
      links: mine.links ?? theirs.links ?? DEFAULT_LINKS
    }
  }

  /**
   * The commit group of shared-repo path `path` (`commit()`):  what the commit's message names.
   * - `epics/<name>/...`:  `epic <name>`;  `sagas/<id>/...`:  `saga <id>`;  `goals/<set>/...`:  `goals/<set>`;
   *   a file right under any of them (`sagas/sagas.json5`):  the folder (`sagas`)
   * - `guides/<x>`, `<x>` a folder or a file:  `guides/<x>`
   * - the other shared folders (`pages`, `templates`, `ui`, `brand`, `agents`):  the folder
   * - anything else (the repo's own files, old-path links):  `other`
   * - static:  pure
   */
  static group(path: string): string {
    const [top = "", next, ...rest] = path.split("/")
    const inFolder = rest.length > 0
    if (top === "epics") return inFolder ? `epic ${next}` : top
    if (top === "sagas") return inFolder ? `saga ${next}` : top
    if (top === "goals") return inFolder ? `goals/${next}` : top
    if (top === "guides") return next ? `guides/${next}` : top
    return next && WHOLE_FOLDERS.has(top) ? top : "other"
  }
}

/** What `new Shared()` takes:  see its constructor. */
export type SharedProps = { checkout?: string; config?: SharedConfig }

/** The flags of `epic shared` that take no value. */
const SWITCHES = ["json", "import", "all", "quiet", "dryRun"]

/** What marks a checkout the verbs act on (`Git.nearestCheckout()`):  the docs tools' relocate script. */
const CHECKOUT_MARKER = "packages/epics/tools/relocate.js"

/** The docs tools' `relocate.js`, beside THIS code:  the reorg's repair (`commit`) and `repair`. */
const RELOCATE_TOOL = fileURLToPath(new URL("../../tools/relocate.js", import.meta.url))

/** The links when the manifest names none:  the docs' areas, then the goal sets and the logs. */
const DEFAULT_LINKS = ["epics", "guides", "pages", "templates", "brand", "ui", "goals", "agents"]

/** Never compared or copied:  OS litter. */
const LITTER = new Set([".DS_Store"])

/** How long `commit()` waits for another session's commit, ms. */
const LOCK_WAIT = 30_000

/** A lock or git index lock older than this is a crashed holder's, ms. */
const STALE = 120_000

/** How long one git command may take in the shared repo, ms. */
const GIT_WAIT = 30_000

/** Shared folders committed as one group each (`Shared.group()`). */
const WHOLE_FOLDERS = new Set(["pages", "templates", "ui", "brand", "agents"])

/** The shared repo's `.gitignore`. */
const GITIGNORE = `# written by \`epic shared init\`
*.lock
*.tmp
.DS_Store
.server.json
.server.log
# /details scratch pages and their answers:  never committed
pages/details/
# /epic review inboxes:  a review's pending marks, never committed
epics/*/*.inbox.json*
# comments on docs pages (\`<page>.inbox.json5\`, epic airplane P11):  waiting work, never committed
guides/**/*.inbox.json*
pages/**/*.inbox.json*
epics/**/*.inbox.json*
# a saga page's review inbox (\`sagas/<id>/<id>.inbox.json5\`, epic epic-workflow P15)
sagas/**/*.inbox.json*
# an epic's running agents (\`epic agents\`):  what's running now, never committed;  \`.json\` before P21
epics/*/agents.json
epics/*/agents.json5
`

/** Write `text` to stdout, on its own line. */
function out(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
}

/** The `"shared"` field of checkout `root`'s `package.json`;  `{}` without one. */
function manifest(root: string): Partial<{ links: string[] }> {
  try {
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).shared ?? {}
  } catch {
    return {}
  }
}

/** `migrate`'s lines:  each file that isn't skipped, then the verdict. */
function migrateLines(report: MigrateReport, dryRun = false): string[] {
  const changed = report.folds.filter((each) => each.action !== "skip")
  const verdict = report.conflicts.length
    ? `${report.conflicts.length} conflict(s):  nothing written;  resolve them in the shared repo or the worktree, then again`
    : report.done
      ? `migrated:  ${changed.length} file(s) into the shared repo, branch ${report.branch} untracks the shared folders`
      : dryRun
        ? `dry run:  ${changed.length} file(s) would go into the shared repo`
        : "nothing done"
  return [...changed.map((each) => `${each.action.padEnd(8)} ${each.file}`), verdict]
}

/** `status`'s table:  the shared repo, then a line per checkout with each link's state. */
function statusLines(status: SharedStatus): string[] {
  const repo = !status.exists
    ? "missing:  `epic shared init`"
    : !status.isRepo
      ? "not a git repo"
      : `${status.dirty} uncommitted, last ${status.last || "(none)"}`
  return [
    `shared repo  ${status.dir}  (${repo})`,
    ...status.checkouts.map(
      ({ checkout, links }) => `${checkout.padEnd(40)} ${links.map((link) => `${link.path} ${link.state}`).join(" · ")}`
    )
  ]
}

/**
 * Every path with a change in repo `dir`, untracked files one by one:  `git status --porcelain -z`.
 * - a rename or copy (`R` / `C`, staged only) gives both paths
 */
function pendingPaths(dir: string): string[] {
  const entries = gitOrThrow(["status", "--porcelain", "-z", "--untracked-files=all"], dir).split("\0").filter(Boolean)
  const paths: string[] = []
  for (let i = 0; i < entries.length; i++) {
    const [code, path] = [entries[i]!.slice(0, 2), entries[i]!.slice(3)]
    paths.push(path)
    if (/[RC]/.test(code)) paths.push(entries[++i]!)
  }
  return paths
}

/** `checkout`'s short name:  `main` (the main checkout), a worktree's name, else its path relative to the main one. */
function checkoutName({ main, worktrees }: SharedConfig, checkout: string): string {
  const where = relative(main, checkout)
  const inWorktrees = relative(worktrees, checkout)
  if (inWorktrees && !inWorktrees.startsWith("..")) return inWorktrees
  return where || "main"
}

/** The shared repo's `README.md`:  named for its folder and the repo's (`spell-app-dev`, `spell-app`). */
function readme(config: SharedConfig): string {
  const repo = basename(config.main)
  return `# ${basename(config.dir)}

Shared content for \`${repo}\` (epic \`shared-content\`):  ${config.links.map((path) => `\`${path}\``).join(", ")}.

- Content only:  the tools that read and write it live in \`${repo}\`.
- Every checkout of \`${repo}\` (main and each worktree) links these folders in, so edits show everywhere at once.
- Edit through the links in \`${repo}\`;  every Claude Code turn commits here by itself (\`epic shared commit\`).
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
 * - throws an `EpicCommandError` with git's message when it fails
 */
function gitOrThrow(args: string[], cwd: string, { input }: { input?: string } = {}): string {
  const run = spawnSync("git", args, { cwd, input, encoding: "utf8", timeout: GIT_WAIT })
  if (run.status !== 0) {
    const why = (run.stderr || run.stdout || String(run.error ?? "")).trim()
    throw new EpicCommandError(`git ${args.join(" ")} failed in ${cwd}:  ${why}`)
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
      else if (Date.now() > deadline) throw new EpicCommandError(`${lockFile} held for ${LOCK_WAIT / 1000}s:  stuck?`)
      else Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
    }
  }
  try {
    return fn()
  } finally {
    rmSync(lockFile, { force: true })
  }
}
