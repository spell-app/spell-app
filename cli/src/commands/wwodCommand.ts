import { CLI } from "$/cli"

/**
 * `spell dev wwod <verb> ...`:  WWOD, the agents' rules (epic `wwod`).  The logic:  `src/dev/wwod.ts`.
 * - `check [files...] [--json]` (default):  every `WWOD §N › "title"` citation and backticked repo path in WWOD,
 *   `AGENTS.md`, `CLAUDE.md` and the skills;  exits 1 on a broken one
 * - Was `spell dev agents check` until epic `skillz` gave `agents` to the running-agents list
 */
export async function wwodCommand(session: CLI.CliSession, args: string[], options: CLI.WwodOptions): Promise<number> {
  const [verb = "check", ...files] = args
  if (verb !== "check") throw new CLI.CliError(`unknown verb '${verb}':  check`)
  const report = CLI.checkAgentRules(CLI.findCheckout("tsconfig.base.json"), files)
  if (options.json) session.out(JSON.stringify(report, null, 2))
  else for (const line of CLI.agentRulesLines(report)) session.out(line)
  return report.problems.length ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}
