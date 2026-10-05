import { execFileSync } from "child_process"
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/**
 * A worktree cut before the cutover, migrated:  `spell-app` with the docs tracked in the new layout, worktree `feat`
 * branched from it with edits to shared AND other files, then main cuts over (`init --import`, untrack, link).
 */
const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "migrate-")))
const MAIN = join(TEMP, "spell-app")
const PEER = join(TEMP, "spell-app-dev")
const FEAT = join(MAIN, ".claude", "worktrees", "feat")
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

// main, tracking everything in the new layout (P2:  `relocate.js` marks it)
mkdirSync(MAIN)
git(MAIN, "init", "-q", "-b", "main")
put(MAIN, "package.json", JSON.stringify({ shared: { dir: "../spell-app-dev" } }))
put(MAIN, ".gitignore", "/.claude/worktrees\n")
put(MAIN, "packages/docs/tools/relocate.js", "// the move\n")
put(MAIN, "packages/docs/content/index.html", "<h1>Docs</h1>\n")
put(MAIN, "packages/docs/content/guide.html", "<p>guide</p>\n")
put(MAIN, "packages/docs/content/old.html", "<p>old</p>\n")
put(MAIN, "goals/index.html", "<h1>Goals</h1>\n")
put(MAIN, "agents/PAPERCUTS.md", "# Papercuts\n\n- one\n")
put(MAIN, "src/app.ts", "export const app = 1\n")
commitAll(MAIN, "first")

// the worktree:  a committed edit, a new page, a deleted page, a dirty log line;  and unrelated staged + dirty work
git(MAIN, "worktree", "add", "-q", "-b", "feat", FEAT)
put(FEAT, "packages/docs/content/guide.html", "<p>guide, edited on feat</p>\n")
put(FEAT, "packages/docs/content/epics/feat/feat.plan.html", "<h1>Feat</h1>\n")
git(FEAT, "rm", "-q", "packages/docs/content/old.html")
commitAll(FEAT, "feat:  docs")
put(FEAT, "agents/PAPERCUTS.md", "# Papercuts\n\n- one\n- from feat\n")
put(FEAT, "src/app.ts", "export const app = 2\n")
git(FEAT, "add", "src/app.ts")
put(FEAT, "src/scratch.ts", "// untracked\n")

// the cutover on main, as P5 does it
const config = CLI.sharedConfig(MAIN)
CLI.initShared(config, { importFrom: MAIN })
git(MAIN, "rm", "-r", "--cached", "-q", "--", ...config.links)
put(MAIN, ".gitignore", `/.claude/worktrees\n\n${CLI.sharedBlock(config)}`)
commitAll(MAIN, "Cut over to shared content")
CLI.linkCheckout(MAIN, config)
// meanwhile main's sessions edit the shared copy:  another log line, and the index
put(MAIN, "agents/PAPERCUTS.md", "# Papercuts\n\n- one\n- from main\n")
put(MAIN, "packages/docs/content/index.html", "<h1>Docs, edited on main</h1>\n")
CLI.commitShared(config, { checkout: MAIN })

describe("migrateWorktree()", () => {
  test("--dry-run:  what each changed shared file would do;  nothing written", () => {
    const report = CLI.migrateWorktree(FEAT, config, { dryRun: true })
    expect(report.folds.filter((each) => each.action !== "skip").map(({ file, action }) => [action, file])).toEqual([
      ["take", "packages/docs/content/epics/feat/feat.plan.html"],
      ["take", "packages/docs/content/guide.html"],
      ["delete", "packages/docs/content/old.html"],
      ["union", "agents/PAPERCUTS.md"]
    ])
    expect(report).toMatchObject({ conflicts: [], done: false })
    expect(existsSync(join(PEER, "packages/docs/content/epics/feat"))).toBe(false)
  })

  test("folds the worktree's changes into the shared repo, keeping main's", () => {
    expect(CLI.migrateWorktree(FEAT, config).done).toBe(true)
    expect(read(PEER, "agents/PAPERCUTS.md")).toBe("# Papercuts\n\n- one\n- from main\n- from feat\n")
    expect(read(PEER, "packages/docs/content/guide.html")).toBe("<p>guide, edited on feat</p>\n")
    expect(read(PEER, "packages/docs/content/index.html")).toBe("<h1>Docs, edited on main</h1>\n")
    expect(existsSync(join(PEER, "packages/docs/content/old.html"))).toBe(false)
    expect(git(PEER, "log", "-1", "--format=%s")).toMatch(
      /^Migrate \.claude\/worktrees\/feat \(branch feat [0-9a-f]+\)$/
    )
  })

  test("the worktree:  links in place, its other work untouched, the branch untracks the shared folders", () => {
    for (const path of config.links) expect(lstatSync(join(FEAT, path)).isSymbolicLink()).toBe(true)
    expect(read(FEAT, "packages/docs/content/epics/feat/feat.plan.html")).toBe("<h1>Feat</h1>\n")
    expect(git(FEAT, "status", "--porcelain", "--untracked-files=all")).toBe("M  src/app.ts\n?? src/scratch.ts".trim())
    expect(git(FEAT, "log", "-1", "--format=%s")).toBe(
      "Migrate feat to shared content:  untrack packages/docs/content, goals, agents"
    )
    expect(git(FEAT, "ls-tree", "-r", "--name-only", "HEAD")).toBe(
      ".gitignore\npackage.json\npackages/docs/tools/relocate.js\nsrc/app.ts"
    )
  })

  test("then the branch merges main with no conflicts", () => {
    git(FEAT, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "feat:  app 2")
    git(FEAT, "-c", "user.name=t", "-c", "user.email=t@t", "merge", "-q", "--no-edit", "main")
    expect(git(FEAT, "status", "--porcelain")).toBe("?? src/scratch.ts")
  })

  test("a page changed on both sides is a conflict:  nothing written, the worktree as it was", () => {
    const clash = join(MAIN, ".claude", "worktrees", "clash")
    git(MAIN, "worktree", "add", "-q", "-b", "clash", clash, git(MAIN, "rev-list", "--max-parents=0", "HEAD"))
    put(clash, "packages/docs/content/guide.html", "<p>guide, edited on clash</p>\n")
    put(clash, "packages/docs/content/index.html", "<h1>Docs, edited on clash</h1>\n")
    const shared = git(PEER, "rev-parse", "HEAD")
    const report = CLI.migrateWorktree(clash, config)
    expect(report).toMatchObject({ conflicts: ["packages/docs/content/guide.html"], done: false })
    // the docs index is built:  changed on both sides, it's rebuilt, not a conflict
    expect(report.folds.find((each) => each.file === "packages/docs/content/index.html")?.action).toBe("rebuild")
    expect(git(PEER, "rev-parse", "HEAD")).toBe(shared)
    expect(read(PEER, "packages/docs/content/guide.html")).toBe("<p>guide, edited on feat</p>\n")
    expect(lstatSync(join(clash, "packages/docs/content")).isSymbolicLink()).toBe(false)
    expect(git(clash, "log", "-1", "--format=%s")).toBe("first")
  })

  test("refuses a worktree whose history lacks the docs move (no `relocate.js` at its merge base)", () => {
    const fresh = join(MAIN, ".claude", "worktrees", "pre")
    git(MAIN, "worktree", "add", "-q", "--orphan", "-b", "pre", fresh)
    put(fresh, "README.md", "pre\n")
    commitAll(fresh, "unrelated history")
    expect(() => CLI.migrateWorktree(fresh, config)).toThrow()
  })
})

/** Write `text` at `path` under `root`, making folders. */
function put(root: string, path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** `path` under `root`, as text. */
function read(root: string, path: string): string {
  return readFileSync(join(root, path), "utf8")
}

/** `git <args>` in `cwd`, trimmed output. */
function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim()
}

/** Stage everything in `cwd` and commit it as `subject`, with a throwaway identity. */
function commitAll(cwd: string, subject: string): void {
  git(cwd, "add", "-A")
  git(cwd, "-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", subject)
}
