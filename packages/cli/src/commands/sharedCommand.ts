import { CLI } from "$/cli"

/**
 * `spell dev shared <verb> ...`:  shared content (epic `shared-content`) -- docs pages, goal sets and the agents' logs,
 * in one content repo beside the main checkout, linked into every checkout.  The logic:  `src/dev/shared.ts`.
 * - `status [--json]` (default):  each checkout's links, and the shared repo's uncommitted files and last commit
 * - `init [--import]`:  create the shared repo;  `--import` copies THIS checkout's folders in (the cutover, once)
 * - `link [--all]`:  link this checkout's folders (`--all`:  every checkout);  a real folder is replaced only when it
 *   matches the shared one exactly
 * - `commit [--session <id>]`:  commit whatever changed in the shared repo (the `Stop` hook, every turn)
 * - NOTE:  `SPELL_SHARED_DIR` points every verb at another shared repo (a scratch one, in tests)
 */
export async function sharedCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.SharedOptions
): Promise<number> {
  const [verb = "status"] = args
  const checkout = CLI.findCheckout("packages/docs/package.json")
  const config = CLI.sharedConfig(checkout)
  switch (verb) {
    case "status": {
      const status = CLI.sharedStatus(config)
      if (options.json) session.out(JSON.stringify(status, null, 2))
      else for (const line of statusLines(status)) session.out(line)
      return status.checkouts.every((each) => each.links.every((link) => link.state === "ok"))
        ? CLI.EXIT.OK
        : CLI.EXIT.ERRORS
    }
    case "init": {
      const done = CLI.initShared(config, { importFrom: options.import ? checkout : undefined })
      session.out(`${config.dir}:  ${done}`)
      if (done !== "exists") linkAll(session, config, [checkout])
      return CLI.EXIT.OK
    }
    case "link": {
      const reports = linkAll(session, config, options.all ? CLI.sharedCheckouts(config.main) : [checkout])
      return reports.some((report) => report.action === "diverged") ? CLI.EXIT.ERRORS : CLI.EXIT.OK
    }
    case "commit": {
      const sha = CLI.commitShared(config, { session: options.session, checkout })
      if (!options.quiet) session.out(sha ? `committed ${sha}` : "nothing to commit")
      return CLI.EXIT.OK
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  status, init, link or commit`)
  }
}

/** Link each of `checkouts`, printing a line per link that wasn't already right;  every report. */
function linkAll(session: CLI.CliSession, config: CLI.SharedConfig, checkouts: string[]): CLI.LinkReport[] {
  const all: CLI.LinkReport[] = []
  for (const checkout of checkouts) {
    for (const report of CLI.linkCheckout(checkout, config)) {
      all.push(report)
      if (report.action !== "ok") session.out(`${checkout}/${report.path}:  ${report.action}`)
    }
  }
  return all
}

/** `status`'s table:  the shared repo, then a line per checkout with each link's state. */
function statusLines(status: CLI.SharedStatus): string[] {
  const repo = !status.exists
    ? "missing:  `spell dev shared init`"
    : !status.isRepo
      ? "not a git repo"
      : `${status.dirty} uncommitted, last ${status.last || "(none)"}`
  return [
    `shared repo  ${status.dir}  (${repo})`,
    ...status.checkouts.map(
      ({ checkout, links }) => `${checkout.padEnd(40)} ${links.map((link) => `${link.path} ${link.state}`).join(" · ")}`
    )
  ]
}
