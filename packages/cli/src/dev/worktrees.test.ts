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
    // a worktree cut before plan docs moved into `content/`:  its old folder still counts
    const before = epic(wip, "x.html", '<body class="spell-doc-page plan-doc">', ["packages", "docs", "epics"])
    expect(CLI.planFile("x", wip, MAIN)).toBe(before)
    const old = epic(wip, "x.html", '<body class="spell-doc-page plan-doc">')
    expect(CLI.planFile("x", wip, MAIN)).toBe(old)
    const renamed = epic(wip, "x.plan.html", '<body class="spell-doc-page plan-doc">')
    expect(CLI.planFile("x", wip, MAIN)).toBe(renamed)

    /** Write `html` as `<epics>/x/<file>` in checkout `root`;  returns its path. */
    function epic(root: string, file: string, html: string, epics = ["packages", "docs", "content", "epics"]): string {
      mkdirSync(join(root, ...epics, "x"), { recursive: true })
      writeFileSync(join(root, ...epics, "x", file), html)
      return join(root, ...epics, "x", file)
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

describe("planFollowUps()", () => {
  /** A plan doc file in the throwaway repo holding `html`. */
  function doc(name: string, html: string) {
    const file = join(MAIN, `${name}.plan.html`)
    writeFileSync(file, html)
    return file
  }

  test("the old markup (read no more since epic-components P15):  an empty plan", () => {
    const file = doc(
      "old",
      `<body class="plan-doc" data-future><ui-section id="p1" data-phase="1" data-status="active"></ui-section>
<ui-item id="q1" data-status="open"></ui-item><ui-item id="t3" data-status="open"></ui-item></body>`
    )
    expect(CLI.planFollowUps(file)).toEqual({ future: false, active: false, phases: 0, followUps: 0 })
  })

  test("the <epic-*> markup:  phases, the active one, open follow-ups (no caveats), future", () => {
    const file = doc(
      "new",
      `<body class="plan-doc"><epic-page epic="new" title="New"
  future><epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="done"></epic-phase>
<epic-phase id="p2" title="Two" status="todo"></epic-phase></epic-section>
<epic-section id="decisions" kind="questions"><epic-item id="q1" title="a"
  status="open"></epic-item><epic-item id="q2" title="b" status="decided" answered></epic-item></epic-section>
<epic-section id="caveats" kind="caveats"><epic-item id="c1" title="c" status="open"></epic-item></epic-section>
<epic-section id="tests" kind="tests"><epic-item id="v1" title="d" status="open"></epic-item></epic-section></epic-page></body>`
    )
    expect(CLI.planFollowUps(file)).toEqual({ future: true, active: false, phases: 2, followUps: 2 })
  })
})
