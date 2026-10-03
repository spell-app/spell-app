import { CLI } from "$/cli"

/**
 * `spell dev stock [--json]`:  take stock of everything open in this repo -- worktrees, branches, running sessions,
 * parked and `/bedtime` work, plans with phases left, stashes and window files left behind -- sorted into "in
 * process", "hung or parked" and "dead, still hanging on", each with what `/whassup` can do about it.  Read-only.
 * - text:  one section per group, an item per line with its reasons, then its actions (`> id:  label`)
 * - `--json`:  `{ generated, main, groups, items }`, each action with the shell lines it runs
 * - The logic, and the thresholds:  `src/dev/stock.ts`.  Was `whassup.py`.
 */
export async function stockCommand(
  session: CLI.CliSession,
  _args: string[],
  options: CLI.StockOptions
): Promise<number> {
  const report = CLI.takeStock()
  if (options.json) {
    session.out(JSON.stringify(report, null, 2))
    return CLI.EXIT.OK
  }
  const items = new Map(report.items.map((item) => [item.key, item]))
  for (const group of ["active", "stalled", "dead"] as const) {
    const keys = report.groups[group]
    session.out(`## ${CLI.STOCK_TITLES[group]} (${keys.length})\n\n`)
    for (const key of keys) {
      const item = items.get(key)!
      session.out(`- ${key}  ${(item.why ?? []).join(";  ")}`)
      for (const action of item.actions ?? []) session.out(`    > ${action.id}:  ${action.label}`)
    }
    session.out("")
  }
  return CLI.EXIT.OK
}
