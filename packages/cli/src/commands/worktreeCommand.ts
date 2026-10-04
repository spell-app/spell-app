import { CLI } from "$/cli"

/**
 * `spell dev worktree <verb> ...`:  git worktrees and the sessions in them.  `/worktrees`, `/isolate`, `/park` and
 * `/wtf` use it.
 * - `list [--json]`:  every live Claude Code session on this machine, with the worktree, branch and folder it
 *   works in (`<- this` marks the one that ran it), then this repo's worktrees no session is in.  Quick:  the
 *   whole report is `spell dev stock`.  (Was `worktrees.py --sessions`.)
 * - `status <name>`:  JSON:  where worktree / branch / plan / session `<name>` stands, `CLI.nameStatus()` (was
 *   `status.py <name>`)
 * - The logic:  `src/dev/worktrees.ts`, `src/dev/stock.ts`.
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
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  list or status`)
  }
}
