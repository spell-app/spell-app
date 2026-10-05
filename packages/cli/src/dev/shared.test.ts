import { execFileSync } from "child_process"
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/**
 * A throwaway repo `spell-app` with a shared repo beside it, `spell-app-dev`:  the main checkout's content folders
 * start as real (ignored) folders, as right after the cutover;  worktree `wt` starts with none.
 */
const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "shared-")))
const MAIN = join(TEMP, "spell-app")
const PEER = join(TEMP, "spell-app-dev")
const WT = join(MAIN, ".claude", "worktrees", "wt")
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

mkdirSync(MAIN)
git(MAIN, "init", "-q", "-b", "main")
put("package.json", JSON.stringify({ shared: { dir: "../spell-app-dev" } }))
put(".gitignore", "/packages/docs/content\n/goals\n/agents\n/.claude/worktrees\n")
git(MAIN, "add", "-A")
commit(MAIN, "first")
put("packages/docs/content/index.html", "<h1>Docs</h1>\n")
put("packages/docs/content/epics/x/x.plan.html", "<h1>X</h1>\n")
put("goals/index.html", "<h1>Goals</h1>\n")
put("agents/PAPERCUTS.md", "# Papercuts\n")
git(MAIN, "worktree", "add", "-q", "-b", "wt", WT)

const config = CLI.sharedConfig(MAIN)

describe("sharedConfig()", () => {
  test("the shared repo beside the main checkout, from any checkout;  the three default links", () => {
    expect(config).toEqual({ main: MAIN, dir: PEER, links: ["packages/docs/content", "goals", "agents"] })
    expect(CLI.sharedConfig(WT)).toEqual(config)
  })
})

describe("before init", () => {
  test("status:  no shared repo;  main's folders are real, the worktree has none", () => {
    const status = CLI.sharedStatus(config)
    expect(status).toMatchObject({ exists: false, isRepo: false })
    expect(status.checkouts.map(({ checkout, links }) => [checkout, links.map((link) => link.state)])).toEqual([
      [".", ["real", "real", "real"]],
      [".claude/worktrees/wt", ["missing", "missing", "missing"]]
    ])
  })
})

describe("init --import, then link", () => {
  test("copies main's folders into a new repo, one commit", () => {
    expect(CLI.initShared(config, { importFrom: MAIN })).toBe("imported")
    expect(readFileSync(join(PEER, "packages/docs/content/epics/x/x.plan.html"), "utf8")).toBe("<h1>X</h1>\n")
    expect(git(PEER, "log", "--format=%s")).toMatch(/^Import from spell-app [0-9a-f]+$/)
    expect(readFileSync(join(PEER, ".gitignore"), "utf8")).toContain("packages/docs/content/details/")
    expect(CLI.initShared(config, { importFrom: MAIN })).toBe("exists")
  })

  test("main:  identical real folders become links;  the worktree:  missing ones are made", () => {
    expect(CLI.linkCheckout(MAIN, config).map((report) => report.action)).toEqual(["replaced", "replaced", "replaced"])
    expect(CLI.linkCheckout(WT, config).map((report) => report.action)).toEqual(["linked", "linked", "linked"])
    expect(lstatSync(join(WT, "goals")).isSymbolicLink()).toBe(true)
    expect(readFileSync(join(WT, "goals/index.html"), "utf8")).toBe("<h1>Goals</h1>\n")
    expect(CLI.sharedStatus(config).checkouts.flatMap(({ links }) => links.map((link) => link.state))).toEqual(
      Array(6).fill("ok")
    )
    expect(git(MAIN, "status", "--porcelain")).toBe("")
  })

  test("a real folder that differs is left alone, and the shared copy untouched", () => {
    rmSync(join(WT, "agents"))
    put("agents/PAPERCUTS.md", "# Papercuts\n\n- the worktree's own\n", WT)
    const report = CLI.linkCheckout(WT, config).find((each) => each.path === "agents")
    expect(report).toEqual({ path: "agents", state: "real", action: "diverged" })
    expect(readFileSync(join(PEER, "agents/PAPERCUTS.md"), "utf8")).toBe("# Papercuts\n")
    rmSync(join(WT, "agents"), { recursive: true })
    expect(CLI.linkCheckout(WT, config).find((each) => each.path === "agents")?.action).toBe("linked")
  })

  test("a folder a branch still tracks:  `tracked`, left for migrate", () => {
    const old = join(MAIN, ".claude", "worktrees", "old")
    git(MAIN, "worktree", "add", "-q", "-b", "old", old)
    put("goals/index.html", "<h1>Old goals</h1>\n", old)
    git(old, "add", "-f", "goals/index.html")
    commit(old, "goals, tracked")
    expect(CLI.linkCheckout(old, config).find((each) => each.path === "goals")).toEqual({
      path: "goals",
      state: "tracked",
      action: "tracked"
    })
  })
})

describe("removing a linked worktree", () => {
  test("`git worktree remove` deletes the links, never the shared folders behind them", () => {
    const gone = join(MAIN, ".claude", "worktrees", "gone")
    git(MAIN, "worktree", "add", "-q", "-b", "gone", gone)
    CLI.linkCheckout(gone, config)
    git(MAIN, "worktree", "remove", gone)
    expect(existsSync(gone)).toBe(false)
    expect(readFileSync(join(PEER, "goals/index.html"), "utf8")).toBe("<h1>Goals</h1>\n")
    expect(existsSync(join(PEER, "packages/docs/content/epics/x/x.plan.html"))).toBe(true)
  })
})

describe("commitShared()", () => {
  test("commits a change made through any checkout's link, once", () => {
    writeFileSync(join(WT, "agents/PAPERCUTS.md"), "# Papercuts\n\n- from the worktree\n")
    const sha = CLI.commitShared(config, { session: "abc123", checkout: WT })
    expect(sha).toMatch(/^[0-9a-f]+$/)
    expect(git(PEER, "log", "-1", "--format=%B")).toBe(`auto: .claude/worktrees/wt\n\nSession: abc123\nCheckout: ${WT}`)
    expect(CLI.commitShared(config, { checkout: MAIN })).toBe("")
    expect(existsSync(join(PEER, ".git", "spell-shared-commit.lock"))).toBe(false)
  })
})

/** Write `text` at `path` under `root` (default the main checkout), making folders. */
function put(path: string, text: string, root = MAIN): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** `git <args>` in `cwd`, trimmed output. */
function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim()
}

/** Commit everything staged in `cwd` as `subject`, with a throwaway identity. */
function commit(cwd: string, subject: string): void {
  git(cwd, "-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", subject)
}
