import { spawnSync } from "child_process"
import { dirname } from "path"

/**
 * Run `git <args>` in `cwd`:  `{ ok, out, err, code }`, output trimmed.
 * - never throws:  a missing `git` or a failing command is `ok: false`
 */
export function git(args: string[], cwd = process.cwd()): GitResult {
  const run = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 15_000 })
  return {
    ok: run.status === 0,
    out: (run.stdout ?? "").trim(),
    err: (run.stderr ?? "").trim(),
    code: run.status ?? -1
  }
}

/**
 * The MAIN checkout of the repo holding `cwd`, so a worktree counts as the repo;  else `cwd` itself.
 * - `git rev-parse --git-common-dir` is the main checkout's `.git`, from any worktree
 */
export function mainRoot(cwd = process.cwd()): string {
  const run = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd)
  return run.ok ? dirname(run.out) : cwd
}

/** What `git()` returns. */
export type GitResult = { ok: boolean; out: string; err: string; code: number }
