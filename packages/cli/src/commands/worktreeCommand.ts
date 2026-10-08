import { CLI } from "$/cli"

/**
 * `spell dev worktree <verb> ...`:  git worktrees and the sessions in them.  `/worktrees`, `/isolate`, `/park` and
 * `/wtf` use it.
 * - `list [--json]`:  every live Claude Code session on this machine, with the worktree, branch and folder it
 *   works in (`<- this` marks the one that ran it), then this repo's worktrees no session is in.  Quick:  the
 *   whole report is `spell dev stock`.  (Was `worktrees.py --sessions`.)
 * - `status <name>`:  JSON:  where worktree / branch / plan / session `<name>` stands, `CLI.nameStatus()` (was
 *   `status.py <name>`)
 * - `merge-main [--continue] [--json]`:  merge `main` into this checkout's branch, regenerating generated files
 *   (bundles, snapshots) both sides changed;  exits 1 when other files conflict (`CLI.mergeMain()`)
 * - The logic:  `src/dev/worktrees.ts`, `src/dev/stock.ts`, `src/dev/mergeMain.ts`.
 */
export async function worktreeCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.WorktreeOptions
): Promise<number> {
  const [verb = "list", name] = args
  switch (verb) {
    case "list": {
      const sessions = CLI.liveSessions()
      const idle = CLI.idleWorktrees(sessions)
      if (options.json) session.out(JSON.stringify({ sessions, idle }, null, 2))
      else for (const line of CLI.sessionTable(sessions, idle)) session.out(line)
      return CLI.EXIT.OK
    }
    case "status":
      if (!name) throw new CLI.CliError("status:  which name?")
      session.out(JSON.stringify(CLI.nameStatus(name), null, 2))
      return CLI.EXIT.OK
    case "merge-main": {
      const checkout = CLI.findCheckout("packages/cli/package.json")
      const report = CLI.mergeMain(checkout, { mode: options.continue ? "continue" : "start" })
      if (options.json) session.out(JSON.stringify(report, null, 2))
      else for (const line of mergeMainLines(report)) session.out(line)
      return report.result === "conflicts" ? CLI.EXIT.ERRORS : CLI.EXIT.OK
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  list, status or merge-main`)
  }
}

/** `merge-main`'s report, for a person. */
function mergeMainLines(report: CLI.MergeMainReport): string[] {
  const { branch, result, conflicts, untracked, regenerated, review, unstaged } = report
  if (result === "up-to-date") return [`${branch}:  main is already in it`]
  if (result === "fast-forward") return [`${branch}:  fast-forwarded to main`]
  if (result === "conflicts") {
    return [
      `${branch}:  stopped mid-merge;  resolve these, \`git add\` them, then \`spell dev worktree merge-main --continue\`:`,
      ...conflicts.map((file) => `  ${file}`)
    ]
  }
  return [
    `${branch}:  merged main`,
    ...(untracked.length ? [`  untracked ${untracked.length} file(s) now git-ignored (kept on disk)`] : []),
    ...regenerated.map(({ name, files }) => `  regenerated ${name}:  ${files.length} file(s)`),
    ...review.flatMap(({ file, keys }) => [
      `  REVIEW ${file}:  neither side had these values`,
      ...keys.map((key) => `    ${key}`)
    ]),
    ...(unstaged.length ? ["  changed by regenerating, NOT committed:", ...unstaged.map((file) => `    ${file}`)] : [])
  ]
}
