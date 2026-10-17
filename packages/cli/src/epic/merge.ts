import { realpathSync } from "fs"

import { CLI } from "$/cli"

/**
 * A STANDING epic's phase, onto `main` at once (epic `epic-workflow`, Q8):  `epic merge <epic>`.
 * - Run in the MAIN checkout, by the epic's session after `ExitWorktree` (`keep`);  it goes back with `EnterWorktree`.
 *   A worktree session can't move `main` itself:  its git runs in its own worktree only.
 * - Fast-forward only, after the checks `/isolate done` makes (its "Finish", step 7):
 *   - this is the main checkout, on `main`, with nothing uncommitted (another session may work there)
 *   - branch `<epic>` holds all of `main`:  else `main` moved, and the branch merges it first
 *     (`spell dev worktree merge-main`, in its worktree)
 * - Returns the commits it brought onto `main`, oldest first;  `[]` when there was nothing to merge.
 * - throws a `CliError` saying what to do, for any check that fails
 */
export function mergeEpic(epic: string, cwd = process.cwd()): string[] {
  const main = CLI.mainRoot(cwd)
  const top = CLI.git(["rev-parse", "--show-toplevel"], cwd).out
  if (!top || realpathSync(top) !== realpathSync(main)) {
    throw new CLI.CliError(`merge:  run it in the main checkout (${main}):  ExitWorktree (keep) first`)
  }
  const branch = CLI.git(["branch", "--show-current"], main).out
  if (branch !== "main") throw new CLI.CliError(`merge:  the main checkout is on '${branch}', not main`)
  const dirty = CLI.git(["status", "--short"], main).out
  if (dirty) throw new CLI.CliError(`merge:  the main checkout has uncommitted changes:\n${dirty}`)
  if (!CLI.git(["rev-parse", "--verify", "--quiet", `refs/heads/${epic}`], main).ok) {
    throw new CLI.CliError(`merge:  no branch '${epic}'`)
  }
  if (!CLI.git(["merge-base", "--is-ancestor", "main", epic], main).ok) {
    throw new CLI.CliError(
      `merge:  main has moved since ${epic} last took it:  in its worktree, spell dev worktree merge-main, then again`
    )
  }
  const commits = CLI.git(["log", "--reverse", "--oneline", `main..${epic}`], main)
    .out.split("\n")
    .filter(Boolean)
  if (!commits.length) return []
  const merged = CLI.git(["merge", "--ff-only", epic], main)
  if (!merged.ok) throw new CLI.CliError(`merge:  git merge --ff-only ${epic} failed:\n${merged.err}`)
  return commits
}
