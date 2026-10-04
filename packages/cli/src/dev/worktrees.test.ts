import { execFileSync } from "child_process"
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/** A throwaway repo:  `main` with one commit, branch `done` merged, branch `wip` one commit ahead in a worktree. */
const MAIN = realpathSync(mkdtempSync(join(tmpdir(), "repo-")))
const HOME = mkdtempSync(join(tmpdir(), "claude-home-"))
process.env.SPELL_CLAUDE_HOME = HOME
afterAll(() => {
  delete process.env.SPELL_CLAUDE_HOME
  rmSync(MAIN, { recursive: true, force: true })
  rmSync(HOME, { recursive: true, force: true })
})

git("init", "-q", "-b", "main")
commit("first")
git("branch", "done")
git("worktree", "add", "-q", "-b", "wip", join(MAIN, ".claude", "worktrees", "wip"))
git("-C", join(MAIN, ".claude", "worktrees", "wip"), "commit", "-q", "--allow-empty", "-m", "wip work")
git("switch", "-q", "done")
commit("done work")
git("switch", "-q", "main")
git("merge", "-q", "--ff-only", "done")
writeFileSync(
  join(MAIN, ".claude", "worktrees", "wip", "PARKED-wip.md"),
  "<!-- park: parked -->\n# wip\n\n## Where it stopped\n\n- halfway through P2\n"
)

describe("worktreesOf() / checkoutOf()", () => {
  test("every worktree with its branch;  where a folder sits", () => {
    expect(CLI.worktreesOf(MAIN)).toEqual([
      { path: MAIN, branch: "main" },
      { path: join(MAIN, ".claude", "worktrees", "wip"), branch: "wip" }
    ])
    expect(CLI.checkoutOf(join(MAIN, ".claude", "worktrees", "wip"))).toMatchObject({
      label: "worktree wip",
      branch: "wip",
      inside: ""
    })
    expect(CLI.checkoutOf(MAIN)).toMatchObject({ label: "main checkout", branch: "main" })
    expect(CLI.checkoutOf(tmpdir()).label).toBe("(not in git)")
  })
})

describe("nameStatus()", () => {
  test("a branch with work of its own, in a worktree", () => {
    expect(CLI.nameStatus("wip", [], MAIN)).toMatchObject({ branch: "wip", ahead: 1, merged: false, finished: false })
  })
  test("merged:  had commits, all in main now", () => {
    expect(CLI.nameStatus("done", [], MAIN)).toMatchObject({
      ahead: 0,
      merged: true,
      finished: true,
      why: "merged into main"
    })
  })
  test("nothing by that name", () => {
    expect(CLI.nameStatus("nope", [], MAIN)).toMatchObject({
      worktree: null,
      branch: null,
      plan: null,
      finished: false
    })
  })
})

describe("parkedNotes()", () => {
  test("state from line 1, where it stopped", () => {
    expect(CLI.parkedNotes(MAIN)).toEqual([
      {
        name: "wip",
        file: join(MAIN, ".claude", "worktrees", "wip", "PARKED-wip.md"),
        state: "parked",
        stopped: "halfway through P2"
      }
    ])
  })
})

describe("takeStock()", () => {
  const report = CLI.takeStock(MAIN)
  const byKey = new Map(report.items.map((item) => [item.key, item]))

  test("a parked worktree is stalled;  a merged branch is dead, with clean-up commands", () => {
    expect(byKey.get("worktree:wip")).toMatchObject({ group: "stalled", ahead: 1 })
    expect(byKey.get("worktree:wip")!.why).toEqual(["parked (parked):  halfway through P2"])
    const done = byKey.get("branch:done")!
    expect(done.group).toBe("dead")
    expect(done.actions![0]).toEqual({ id: "remove", label: "delete the branch", commands: ["git branch -d done"] })
  })
  test("groups list every item once, in report order", () => {
    expect([...report.groups.active, ...report.groups.stalled, ...report.groups.dead].sort()).toEqual(
      [...byKey.keys()].sort()
    )
  })
})

describe("planFile()", () => {
  test("the worktree's plan doc, else main's;  <name>.plan.html, else an old <name>.html that is a plan doc", () => {
    const wip = join(MAIN, ".claude", "worktrees", "wip")
    expect(CLI.planFile("x", wip, MAIN)).toBeNull()
    epic(MAIN, "x.html", "<body>not a plan doc</body>")
    expect(CLI.planFile("x", wip, MAIN)).toBeNull()
    const old = epic(wip, "x.html", '<body class="spell-doc-page plan-doc">')
    expect(CLI.planFile("x", wip, MAIN)).toBe(old)
    const renamed = epic(wip, "x.plan.html", '<body class="spell-doc-page plan-doc">')
    expect(CLI.planFile("x", wip, MAIN)).toBe(renamed)

    /** Write `html` as `epics/x/<file>` in checkout `root`;  returns its path. */
    function epic(root: string, file: string, html: string): string {
      mkdirSync(join(root, "packages", "docs", "epics", "x"), { recursive: true })
      writeFileSync(join(root, "packages", "docs", "epics", "x", file), html)
      return join(root, "packages", "docs", "epics", "x", file)
    }
  })
})

describe("iso()", () => {
  test("local time to the minute, with its offset", () => {
    expect(CLI.iso(Date.now())).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d[+-]\d\d:\d\d$/)
  })
})

/** `git <args>` in the throwaway repo. */
function git(...args: string[]) {
  execFileSync("git", ["-C", MAIN, "-c", "user.name=t", "-c", "user.email=t@t", ...args], {
    stdio: "ignore"
  })
}

/** An empty commit on the current branch. */
function commit(message: string) {
  git("commit", "-q", "--allow-empty", "-m", message)
}
