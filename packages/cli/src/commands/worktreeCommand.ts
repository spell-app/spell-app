import { CLI } from "$/cli"

/**
 * `spell dev worktree <verb> ...`:  git worktrees and the sessions in them.  `/worktrees`, `/isolate`, `/park` and
 * `/wtf` use it.
 * - `list [--json]`:  every live Claude Code session on this machine, with the worktree, branch and folder it
 *   works in (`<- this` marks the one that ran it), then each repo's worktrees no session is in (was
 *   `worktrees.py`)
 * - `status <name>`:  JSON:  where worktree / branch / plan / session `<name>` stands, `CLI.nameStatus()` (was
 *   `status.py <name>`)
 * - The logic:  `src/dev/worktrees.ts`.
 */
export async function worktreeCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.WorktreeOptions
): Promise<number> {
  const [verb = "list", name] = args
  switch (verb) {
    case "list":
      return listPlaces(session, options)
    case "status":
      if (!name) throw new CLI.CliError("status:  which name?")
      session.out(JSON.stringify(CLI.nameStatus(name), null, 2))
      return CLI.EXIT.OK
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  list or status`)
  }
}

/** `list`:  a table of live sessions and where they work, then the worktrees no session is in. */
function listPlaces(session: CLI.CliSession, options: CLI.WorktreeOptions): number {
  const places = CLI.sessionPlaces()
  if (options.json) {
    session.out(JSON.stringify(places, null, 2))
    return CLI.EXIT.OK
  }
  const head = ["session", "id", "status", "where", "worktree", "branch", "folder"]
  const rows = places.sessions.map((it) => [
    `${it.name}${it.this ? "  <- this" : ""}`,
    it.id,
    it.status,
    it.where,
    it.worktree,
    it.branch,
    it.folder
  ])
  const widths = head.map((_, column) => Math.max(...[head, ...rows].map((row) => row[column].length)))
  for (const row of [head, widths.map((width) => "-".repeat(width)), ...rows]) {
    session.out(
      row
        .map((cell, column) => cell.padEnd(widths[column]))
        .join("  ")
        .trimEnd()
    )
  }
  for (const { repo, worktrees } of places.idle) {
    session.out(`\nNo session in (repo ${repo}):`)
    for (const { path, branch } of worktrees) session.out(`  ${path}  [${branch}]`)
  }
  return CLI.EXIT.OK
}
