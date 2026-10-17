import { execFileSync } from "child_process"
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { Requests } from "$/epics/command/Requests"

/** A scratch repo on `main`, with branch `tooling` one commit ahead, and a worktree of it. */
const REPO = realpathSync(mkdtempSync(join(tmpdir(), "merge-repo-")))
const WORKTREE = join(REPO, ".claude", "worktrees", "tooling")
afterAll(() => rmSync(REPO, { recursive: true, force: true }))

git("init", "-q", "-b", "main")
// as the real repo:  worktrees are git-ignored
commit(".gitignore", ".claude/\n", "ignore worktrees")
commit("a.txt", "one", "first")
git("branch", "tooling")
git("worktree", "add", "-q", WORKTREE, "tooling")
commit("b.txt", "two", "P1:  the phase", WORKTREE)

describe("mergeEpic()", () => {
  test("refuses from the worktree:  main moves in the main checkout", () => {
    expect(() => Requests.merge("tooling", WORKTREE)).toThrow(/run it in the main checkout/)
  })

  test("refuses with uncommitted changes in the main checkout", () => {
    writeFileSync(join(REPO, "a.txt"), "changed")
    expect(() => Requests.merge("tooling", REPO)).toThrow(/uncommitted changes/)
    git("checkout", "--", "a.txt")
  })

  test("fast-forwards main, returning the commits;  then nothing to merge", () => {
    expect(Requests.merge("tooling", REPO).map((line) => line.replace(/^\w+ /, ""))).toEqual(["P1:  the phase"])
    expect(git("log", "-1", "--format=%s", "main")).toBe("P1:  the phase")
    expect(Requests.merge("tooling", REPO)).toEqual([])
  })

  test("refuses once main has moved past the branch", () => {
    commit("c.txt", "three", "on main")
    commit("d.txt", "four", "P2", WORKTREE)
    expect(() => Requests.merge("tooling", REPO)).toThrow(/main has moved/)
  })
})

/** `git <args>` in `cwd` (default the repo), its output trimmed. */
function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim()
}

/** Commit `file` holding `text` in `cwd`, with `message`. */
function commit(file: string, text: string, message: string, cwd = REPO): void {
  writeFileSync(join(cwd, file), text)
  const run = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8" })
  run("add", file)
  run("-c", "user.name=test", "-c", "user.email=test@example.com", "commit", "-q", "-m", message)
}
