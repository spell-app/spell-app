import { spawnSync } from "child_process"
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs"
import { tmpdir } from "os"
import { dirname, join, relative } from "path"

import { CLI, type FoldReport, type MigrateReport, type SharedConfig } from "$/cli"

/**
 * Move a worktree cut before the cutover (epic `shared-content`, P5) onto the shared content:  `spell dev shared
 * migrate <worktree> [--dry-run]`.  Returns what it did, or would do.
 * 1. Refuses when the branch lacks the new layout (it must have merged `main` after P2:  `packages/docs/content`,
 *    `packages/docs/tools/relocate.js`), a merge or rebase is under way, or a session is busy in the worktree.
 * 2. Folds the worktree's shared files into the shared repo, file by file, 3-way:  base = the branch's merge base
 *    with the cutover's import commit, ours = the shared repo, theirs = the worktree's file (committed, staged,
 *    dirty or untracked).  Changed only in the worktree:  taken;  changed on both sides:  logs (`agents/`) are
 *    union-merged, anything else is a CONFLICT, and nothing at all is written.
 * 3. Commits the shared repo (`Migrate <w>`), then makes ONE commit on the branch that stops tracking the shared
 *    folders and adds main's `.gitignore` block, without touching the index's or the working tree's other changes
 *    (a temp index, `commit-tree`, `update-ref`).  So the branch merges `main` later without conflicts in them.
 * 4. Swaps the worktree's real folders for links (`linkCheckout()`), and checks its other changes are as before.
 */
export function migrateWorktree(
  worktree: string,
  config: SharedConfig,
  { dryRun = false }: { dryRun?: boolean } = {}
): MigrateReport {
  const branch = git(worktree, "branch", "--show-current")
  const report: MigrateReport = { worktree, branch, folds: [], conflicts: [], done: false }
  refuseUnless(worktree, branch, config)
  const importSha = importCommit(config)
  const base = git(worktree, "merge-base", "HEAD", importSha)
  if (!gitOk(worktree, "cat-file", "-e", `${base}:packages/docs/tools/relocate.js`)) {
    throw new CLI.CliError(
      `${branch} branched before the docs moved (P2):  merge ${importSha} into it first (its session, or \`git merge ${importSha}\`), then migrate`
    )
  }

  for (const path of config.links) {
    const files = new Set([...treeFiles(worktree, base, path), ...diskFiles(worktree, path)])
    for (const file of [...files].sort()) report.folds.push(fold(worktree, base, file, config))
  }
  report.conflicts = report.folds.filter((each) => each.action === "conflict").map((each) => each.file)
  if (dryRun || report.conflicts.length) return report

  const before = otherChanges(worktree, config)
  for (const each of report.folds) apply(each, worktree, config)
  if (report.folds.some((each) => each.action === "rebuild")) rebuildDocsIndex(config)
  git(config.dir, "add", "-A")
  if (git(config.dir, "status", "--porcelain")) {
    const message = `Migrate ${relative(config.main, worktree)} (branch ${branch} ${git(worktree, "rev-parse", "--short", "HEAD")})`
    git(config.dir, "-c", "commit.gpgsign=false", "commit", "-q", "-m", message)
  }
  untrackOnBranch(worktree, branch, config)
  for (const path of config.links) rmSync(join(worktree, path), { recursive: true, force: true })
  CLI.linkCheckout(worktree, config)
  const after = otherChanges(worktree, config)
  if (after !== before) {
    throw new CLI.CliError(
      `${worktree}:  its other changes differ after migrating -- check \`git status\` there:\n${after}`
    )
  }
  report.done = true
  return report
}

/** Main's `.gitignore` shared block (`# shared:start` ... `# shared:end`), else one made from the manifest. */
export function sharedBlock(config: SharedConfig): string {
  const main = readOrNull(join(config.main, ".gitignore")) ?? ""
  const found = /# shared:start[\s\S]*?# shared:end\n?/.exec(main)?.[0]
  if (found) return found.endsWith("\n") ? found : `${found}\n`
  const paths = config.links.map((path) => `/${path}`).join("\n")
  return `# shared:start  (epic shared-content:  links into the shared content repo, never tracked)\n${paths}\n# shared:end\n`
}

////////////////
// ## Folding
////////////////

/**
 * What to do with shared file `file` (repo-relative) of `worktree`:  `skip`, `take` (write the worktree's into the
 * shared repo), `delete` (from the shared repo), `union` (logs changed on both sides:  merged), or `conflict`.
 */
function fold(worktree: string, base: string, file: string, config: SharedConfig): FoldReport {
  const baseText = show(worktree, base, file)
  const theirs = readOrNull(join(worktree, file))
  const ours = readOrNull(join(config.dir, file))
  if (theirs === baseText || theirs === ours) return { file, action: "skip" }
  if (theirs === null) return { file, action: ours === baseText ? "delete" : "conflict" }
  if (ours === baseText) return { file, action: "take" }
  if (file.startsWith("agents/") && ours !== null) {
    return { file, action: "union", text: unionMerge(ours, baseText ?? "", theirs) }
  }
  if (BUILT.has(file)) return { file, action: "rebuild" }
  return { file, action: "conflict" }
}

/**
 * Shared files a tool writes:  changed on both sides, the shared copy stays and the tool runs again once the rest
 * is folded in (`rebuildDocsIndex()`).
 */
const BUILT = new Set(["packages/docs/content/index.html"])

/** `yarn docs:index`, from the main checkout:  the docs index lists every epic now in the shared repo. */
function rebuildDocsIndex(config: SharedConfig): void {
  const run = spawnSync(process.execPath, [join(config.main, "packages/docs/tools/index.js")], {
    cwd: join(config.main, "packages/docs"),
    encoding: "utf8"
  })
  if (run.status !== 0) throw new CLI.CliError(`docs:index failed:  ${(run.stderr ?? "").trim()}`)
}

/** Do `each` in the shared repo. */
function apply(each: FoldReport, worktree: string, config: SharedConfig): void {
  const target = join(config.dir, each.file)
  if (each.action === "take" || each.action === "union") {
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, each.action === "union" ? (each.text ?? "") : readFileSync(join(worktree, each.file)))
  } else if (each.action === "delete") rmSync(target, { force: true })
}

/** `ours` and `theirs` merged against `base`, keeping both sides' lines (`git merge-file --union`). */
function unionMerge(ours: string, base: string, theirs: string): string {
  const temp = mkdtempSync(join(tmpdir(), "shared-merge-"))
  try {
    const [a, b, c] = [join(temp, "ours"), join(temp, "base"), join(temp, "theirs")]
    writeFileSync(a, ours)
    writeFileSync(b, base)
    writeFileSync(c, theirs)
    return spawnSync("git", ["merge-file", "--union", "-p", a, b, c], { encoding: "utf8" }).stdout
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

////////////////
// ## The branch
////////////////

/**
 * One commit on `branch` that untracks the shared folders and adds main's `# shared:` `.gitignore` block;  then the
 * worktree's own index and `.gitignore` follow it.  Other staged and unstaged work stays as it was.
 */
function untrackOnBranch(worktree: string, branch: string, config: SharedConfig): void {
  const head = git(worktree, "rev-parse", "HEAD")
  const index = join(mkdtempSync(join(tmpdir(), "shared-index-")), "index")
  const env = { ...process.env, GIT_INDEX_FILE: index }
  try {
    gitWith(env, worktree, "read-tree", "HEAD")
    gitWith(env, worktree, "rm", "-r", "--cached", "-q", "--ignore-unmatch", "--", ...config.links)
    const oldIgnore = show(worktree, "HEAD", ".gitignore") ?? ""
    const newIgnore = withSharedBlock(oldIgnore, config)
    const blob = gitInput(worktree, newIgnore, "hash-object", "-w", "--stdin")
    gitWith(env, worktree, "update-index", "--add", "--cacheinfo", `100644,${blob},.gitignore`)
    const tree = gitWith(env, worktree, "write-tree")
    const message = `Migrate ${branch} to shared content:  untrack ${config.links.join(", ")}`
    const commit = git(worktree, "-c", "commit.gpgsign=false", "commit-tree", tree, "-p", head, "-m", message)
    git(worktree, "update-ref", `refs/heads/${branch}`, commit, head)
    // the worktree's own index and .gitignore follow the new HEAD;  `-f`:  its entries no longer match HEAD, and
    // their content is in the shared repo already
    git(worktree, "rm", "-r", "--cached", "-f", "-q", "--ignore-unmatch", "--", ...config.links)
    git(worktree, "update-index", "--add", "--cacheinfo", `100644,${blob},.gitignore`)
    if (readOrNull(join(worktree, ".gitignore")) === oldIgnore) writeFileSync(join(worktree, ".gitignore"), newIgnore)
  } finally {
    rmSync(dirname(index), { recursive: true, force: true })
  }
}

/** `.gitignore` text `text` with main's shared block in place of its own, or appended. */
function withSharedBlock(text: string, config: SharedConfig): string {
  const block = sharedBlock(config)
  const at = /# shared:start[\s\S]*?# shared:end\n?/
  if (at.test(text)) return text.replace(at, block)
  return `${text.replace(/\n*$/, "\n")}\n${block}`
}

////////////////
// ## Helpers
////////////////

/** Throws unless `worktree` is migratable:  on a branch, not mid-merge or rebase, no session busy in it. */
function refuseUnless(worktree: string, branch: string, config: SharedConfig): void {
  if (!existsSync(join(config.dir, ".git"))) throw new CLI.CliError(`no shared repo at ${config.dir}:  cut over first`)
  if (!branch) throw new CLI.CliError(`${worktree} isn't on a branch`)
  for (const marker of ["MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"]) {
    if (existsSync(git(worktree, "rev-parse", "--path-format=absolute", "--git-path", marker))) {
      throw new CLI.CliError(`${worktree} is mid-${marker.toLowerCase().replace(/_head$/, "")}:  finish it first`)
    }
  }
  const busy = CLI.liveSessions(config.main).find(
    (session) => session.state === "busy" && (session.cwd === worktree || session.cwd.startsWith(`${worktree}/`))
  )
  if (busy) throw new CLI.CliError(`session "${busy.name}" is busy in ${worktree}:  wait until it's idle`)
}

/** The spell-app commit the shared repo was imported from:  its first commit is `Import from spell-app <sha>`. */
function importCommit(config: SharedConfig): string {
  const first = git(config.dir, "log", "--reverse", "--format=%s", "--max-parents=0").split("\n")[0] ?? ""
  const sha = /^Import from spell-app ([0-9a-f]+)/.exec(first)?.[1]
  if (!sha) throw new CLI.CliError(`the shared repo's first commit isn't an import ("${first}")`)
  return sha
}

/** Files under `path` in commit `rev` of `worktree`'s repo, repo-relative. */
function treeFiles(worktree: string, rev: string, path: string): string[] {
  return git(worktree, "ls-tree", "-r", "--name-only", rev, "--", path).split("\n").filter(Boolean)
}

/** Files under `path` on disk in `worktree` (a real folder:  a link is already migrated), repo-relative. */
function diskFiles(worktree: string, path: string, prefix = path): string[] {
  const dir = join(worktree, prefix)
  const stat = statSync(dir, { throwIfNoEntry: false })
  if (!stat?.isDirectory() || (prefix === path && lstatIsLink(dir))) return []
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue
    const child = join(prefix, entry.name)
    if (entry.isDirectory()) found.push(...diskFiles(worktree, path, child))
    else if (entry.isFile()) found.push(child)
  }
  return found
}

/** Whether `path` is a link. */
function lstatIsLink(path: string): boolean {
  return lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink() ?? false
}

/** `rev:file` as text, or `null` when it isn't there. */
function show(worktree: string, rev: string, file: string): string | null {
  const run = spawnSync("git", ["show", `${rev}:${file}`], { cwd: worktree, encoding: "utf8", maxBuffer: 64 << 20 })
  return run.status === 0 ? run.stdout : null
}

/** A file's text, or `null` when it's missing. */
function readOrNull(file: string): string | null {
  return statSync(file, { throwIfNoEntry: false })?.isFile() ? readFileSync(file, "utf8") : null
}

/**
 * `worktree`'s `git status --porcelain`, leaving out the shared folders and `.gitignore`:  what migrating must not
 * change.
 */
function otherChanges(worktree: string, config: SharedConfig): string {
  // untrimmed:  a status line starts with a space when only the working tree changed
  const run = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: worktree, encoding: "utf8" })
  return (run.stdout ?? "")
    .split("\n")
    .filter((line) => {
      const path = line.slice(3).replace(/^.* -> /, "")
      return line && path !== ".gitignore" && !config.links.some((link) => path === link || path.startsWith(`${link}/`))
    })
    .join("\n")
}

/** `git <args>` in `cwd`, trimmed stdout;  throws a `CliError` on failure. */
function git(cwd: string, ...args: string[]): string {
  return gitWith(process.env, cwd, ...args)
}

/** `git()` with environment `env` (`GIT_INDEX_FILE`:  a temp index). */
function gitWith(env: NodeJS.ProcessEnv, cwd: string, ...args: string[]): string {
  const run = spawnSync("git", args, { cwd, encoding: "utf8", env, maxBuffer: 64 << 20 })
  if (run.status !== 0) throw new CLI.CliError(`git ${args.join(" ")} failed in ${cwd}:  ${(run.stderr ?? "").trim()}`)
  return (run.stdout ?? "").trim()
}

/** Whether `git <args>` in `cwd` succeeds. */
function gitOk(cwd: string, ...args: string[]): boolean {
  return spawnSync("git", args, { cwd, stdio: "ignore" }).status === 0
}

/** `git <args>` in `cwd` with `input` on stdin;  trimmed stdout. */
function gitInput(cwd: string, input: string, ...args: string[]): string {
  const run = spawnSync("git", args, { cwd, input, encoding: "utf8" })
  if (run.status !== 0) throw new CLI.CliError(`git ${args.join(" ")} failed in ${cwd}:  ${(run.stderr ?? "").trim()}`)
  return run.stdout.trim()
}
