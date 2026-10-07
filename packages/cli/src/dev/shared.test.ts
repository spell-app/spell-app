import { execFileSync } from "child_process"
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync
} from "fs"
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
put(".gitignore", "/epics\n/guides\n/pages\n/templates\n/brand\n/ui\n/goals\n/agents\n/.claude/worktrees\n")
git(MAIN, "add", "-A")
commit(MAIN, "first")
put("pages/index.html", "<h1>Docs</h1>\n")
put("epics/x/x.plan.html", "<h1>X</h1>\n")
put("guides/a.html", "<h1>A</h1>\n")
put("templates/t.html", "<h1>T</h1>\n")
put("brand/pony.html", "<h1>Pony</h1>\n")
put("ui/index.html", "<h1>Spell UI</h1>\n")
put("goals/index.html", "<h1>Goals</h1>\n")
put("agents/PAPERCUTS.md", "# Papercuts\n")
git(MAIN, "worktree", "add", "-q", "-b", "wt", WT)

const config = CLI.sharedConfig(MAIN)

describe("sharedConfig()", () => {
  test("the shared repo beside the main checkout, from any checkout;  the default links", () => {
    expect(config).toEqual({
      main: MAIN,
      dir: PEER,
      links: ["epics", "guides", "pages", "templates", "brand", "ui", "goals", "agents"]
    })
    expect(CLI.sharedConfig(WT)).toEqual(config)
  })

  test("links are the checkout's OWN manifest's:  a branch from before the reorg keeps its old content link", () => {
    const older = join(TEMP, "older")
    mkdirSync(older)
    writeFileSync(
      join(older, "package.json"),
      JSON.stringify({ shared: { links: ["packages/docs/content", "goals", "agents"] } })
    )
    expect(CLI.sharedConfig(older).links).toEqual(["packages/docs/content", "goals", "agents"])
  })
})

describe("before init", () => {
  test("status:  no shared repo;  main's folders are real, the worktree has none", () => {
    const status = CLI.sharedStatus(config)
    expect(status).toMatchObject({ exists: false, isRepo: false })
    expect(status.checkouts.map(({ checkout, links }) => [checkout, links.map((link) => link.state)])).toEqual([
      [".", Array(8).fill("real")],
      [".claude/worktrees/wt", Array(8).fill("missing")]
    ])
  })
})

describe("init --import, then link", () => {
  test("copies main's folders into a new repo, one commit", () => {
    expect(CLI.initShared(config, { importFrom: MAIN })).toBe("imported")
    expect(readFileSync(join(PEER, "epics/x/x.plan.html"), "utf8")).toBe("<h1>X</h1>\n")
    expect(git(PEER, "log", "--format=%s")).toMatch(/^Import from spell-app [0-9a-f]+$/)
    expect(readFileSync(join(PEER, ".gitignore"), "utf8")).toContain("pages/details/")
    expect(CLI.initShared(config, { importFrom: MAIN })).toBe("exists")
  })

  test("main:  identical real folders become links;  the worktree:  missing ones are made", () => {
    expect(CLI.linkCheckout(MAIN, config).map((report) => report.action)).toEqual(Array(8).fill("replaced"))
    expect(CLI.linkCheckout(WT, config).map((report) => report.action)).toEqual(Array(8).fill("linked"))
    expect(lstatSync(join(WT, "goals")).isSymbolicLink()).toBe(true)
    expect(readFileSync(join(WT, "goals/index.html"), "utf8")).toBe("<h1>Goals</h1>\n")
    expect(CLI.sharedStatus(config).checkouts.flatMap(({ links }) => links.map((link) => link.state))).toEqual(
      Array(16).fill("ok")
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
    expect(existsSync(join(PEER, "epics/x/x.plan.html"))).toBe(true)
  })
})

describe("sharedGroup()", () => {
  test.each([
    ["epics/seo/seo.plan.html", "epic seo"],
    ["epics/seo/parts/p1.htm", "epic seo"],
    ["epics/README.md", "epics"],
    ["guides/solid/solid-2.md", "guides/solid"],
    ["guides/changelog.html", "guides/changelog.html"],
    ["goals/spell/motivation.html", "goals/spell"],
    ["goals/index.html", "goals"],
    ["agents/wwod/WWOD.md", "agents"],
    ["pages/index.html", "pages"],
    ["templates/t.html", "templates"],
    ["ui/index.html", "ui"],
    ["brand/pony.html", "brand"],
    ["README.md", "other"],
    ["packages/docs/content/epics", "other"]
  ])("%s:  %s", (path, group) => expect(CLI.sharedGroup(path)).toBe(group))
})

describe("commitShared()", () => {
  test("one commit per group, each with only its own files;  trailers name the turn's checkout and session", () => {
    put("epics/x/x.plan.html", "<h1>X, edited</h1>\n", WT)
    put("epics/x/parts/p1.htm", "<p>P1</p>\n", WT)
    put("epics/y/y.plan.html", "<h1>Y</h1>\n", WT)
    put("guides/a.html", "<h1>A, edited</h1>\n", WT)
    const shas = CLI.commitShared(config, { session: "abc123", checkout: WT })
    expect(shas).toHaveLength(3)
    expect(commits(3)).toEqual([
      ["auto: epic x", "epics/x/parts/p1.htm epics/x/x.plan.html"],
      ["auto: epic y", "epics/y/y.plan.html"],
      ["auto: guides/a.html", "guides/a.html"]
    ])
    expect(git(PEER, "log", "-1", "--format=%B")).toBe("auto: guides/a.html\n\nTurn-end: wt\nSession: abc123")
    expect(git(PEER, "status", "--porcelain")).toBe("")
    expect(existsSync(join(PEER, ".git", "spell-shared-commit.lock"))).toBe(false)
  })

  test("nothing pending:  no commit", () => {
    const head = git(PEER, "rev-parse", "HEAD")
    expect(CLI.commitShared(config, { checkout: MAIN })).toEqual([])
    expect(git(PEER, "rev-parse", "HEAD")).toBe(head)
  })

  test("a deletion lands in its group;  a rename across groups:  the new path in its group, the deletion in the old", () => {
    rmSync(join(PEER, "epics/y/y.plan.html"))
    renameSync(join(PEER, "guides/a.html"), join(PEER, "agents/a.html"))
    CLI.commitShared(config, { checkout: MAIN })
    expect(commits(3)).toEqual([
      ["auto: agents", "agents/a.html"],
      ["auto: epic y", "epics/y/y.plan.html"],
      ["auto: guides/a.html", "guides/a.html"]
    ])
    expect(git(PEER, "show", "--format=", "--name-status", "HEAD")).toBe("D\tguides/a.html")
    expect(git(PEER, "log", "-1", "--format=%B")).toBe("auto: guides/a.html\n\nTurn-end: main")
  })

  test("something staged by hand, even a rename:  still each path in its own group", () => {
    renameSync(join(PEER, "agents/a.html"), join(PEER, "guides/b.html"))
    git(PEER, "add", "-A")
    CLI.commitShared(config, { checkout: MAIN })
    expect(commits(2)).toEqual([
      ["auto: agents", "agents/a.html"],
      ["auto: guides/b.html", "guides/b.html"]
    ])
  })
})

/** The shared repo's last `count` commits, oldest first:  `[subject, files changed]`. */
function commits(count: number): string[][] {
  return git(PEER, "log", `-${count}`, "--reverse", "--format=%H")
    .split("\n")
    .map((sha) => [
      git(PEER, "log", "-1", "--format=%s", sha),
      git(PEER, "show", "--format=", "--name-only", sha).split("\n").join(" ")
    ])
}

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
