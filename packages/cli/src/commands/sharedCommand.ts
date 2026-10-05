import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * `spell dev shared <verb> ...`:  shared content (epic `shared-content`) -- docs pages, goal sets and the agents' logs,
 * in one content repo beside the main checkout, linked into every checkout.  The logic:  `src/dev/shared.ts`.
 * - `status [--json]` (default):  each checkout's links, and the shared repo's uncommitted files and last commit
 * - `init [--import]`:  create the shared repo;  `--import` copies THIS checkout's folders in (the cutover, once)
 * - `link [--all]`:  link this checkout's folders (`--all`:  every checkout);  a real folder is replaced only when it
 *   matches the shared one exactly
 * - `commit [--session <id>]`:  commit whatever changed in the shared repo (the `Stop` hook, every turn)
 * - `migrate <worktree> [--dry-run]`:  move a worktree cut before the cutover onto the shared content
 *   (`migrateWorktree()`):  its changes to the shared folders go into the shared repo, its branch stops tracking
 *   them, its folders become links;  stops, writing nothing, on a conflict
 * - `repair [--dry-run] [--json]`:  after a branch from before the docs move merges `main`:  pages it left at
 *   `packages/docs/<x>` go into `content/`, and links written for the old layout are fixed
 *   (`packages/docs/tools/relocate.js` `repairCheckout()`)
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
    case "migrate": {
      const name = args[1]
      if (!name) throw new CLI.CliError("migrate:  which worktree?")
      const worktree = join(config.main, ".claude", "worktrees", name)
      if (!existsSync(join(worktree, ".git"))) throw new CLI.CliError(`no worktree ${worktree}`)
      const report = CLI.migrateWorktree(worktree, config, { dryRun: options.dryRun })
      if (options.json)
        session.out(JSON.stringify({ ...report, folds: report.folds.map(({ text, ...each }) => each) }, null, 2))
      else for (const line of migrateLines(report, options.dryRun)) session.out(line)
      return report.conflicts.length ? CLI.EXIT.ERRORS : CLI.EXIT.OK
    }
    case "repair": {
      // the docs tools' own logic (`packages/docs/tools/relocate.js`):  run, never imported (nothing imports docs)
      const tool = join(checkout, "packages", "docs", "tools", "relocate.js")
      const flags = [...(options.dryRun ? ["--dry-run"] : []), ...(options.json ? ["--json"] : [])]
      const run = spawnSync(process.execPath, [tool, "repair", "--root", checkout, ...flags], { stdio: "inherit" })
      return run.status ?? CLI.EXIT.ERRORS
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  status, init, link, commit, migrate or repair`)
  }
}

/** `migrate`'s lines:  each file that isn't skipped, then the verdict. */
function migrateLines(report: CLI.MigrateReport, dryRun = false): string[] {
  const changed = report.folds.filter((each) => each.action !== "skip")
  const verdict = report.conflicts.length
    ? `${report.conflicts.length} conflict(s):  nothing written;  resolve them in the shared repo or the worktree, then again`
    : report.done
      ? `migrated:  ${changed.length} file(s) into the shared repo, branch ${report.branch} untracks the shared folders`
      : dryRun
        ? `dry run:  ${changed.length} file(s) would go into the shared repo`
        : "nothing done"
  return [...changed.map((each) => `${each.action.padEnd(8)} ${each.file}`), verdict]
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
