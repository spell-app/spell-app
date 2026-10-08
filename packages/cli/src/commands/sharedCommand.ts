import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"
import { fileURLToPath } from "url"

import { CLI } from "$/cli"

/**
 * `spell dev shared <verb> ...`:  shared content (epic `shared-content`) -- docs pages, goal sets and the agents' logs,
 * in one content repo beside the main checkout, linked into every checkout.  The logic:  `src/dev/shared.ts`.
 * - `status [--json]` (default):  each checkout's links, and the shared repo's uncommitted files and last commit
 * - `init [--import]`:  create the shared repo;  `--import` copies THIS checkout's folders in (the cutover, once)
 * - `link [--all]`:  link this checkout's folders (`--all`:  every checkout);  a real folder is replaced only when it
 *   matches the shared one exactly
 * - `commit [--session <id>]`:  commit whatever changed in the shared repo (the `Stop` hook, every turn), one commit
 *   per epic / guide / folder (`commitShared()`);  first the reorg's repair, for pages older checkouts still write
 *   the old way (`relocate.js reorg`)
 * - `migrate <worktree> [--dry-run]`:  move a worktree cut before the cutover onto the shared content
 *   (`migrateWorktree()`):  its changes to the shared folders go into the shared repo, its branch stops tracking
 *   them, its folders become links;  stops, writing nothing, on a conflict
 * - `repair [--dry-run] [--json]`:  the docs tools' own logic (`packages/docs/tools/relocate.js`), in two steps:
 *   - after a branch from before the content move merges `main`:  pages it left at `packages/docs/<x>` go into
 *     `content/`, and links written for that layout are fixed (`repairCheckout()`)
 *   - the reorg (claude-design P4), in the shared repo:  anything older code wrote at the old paths
 *     (`packages/docs/content/<x>`, a real file or folder there, not an old-path link) moves to its root folder
 *     (`epics/`, `guides/`, `pages/`, `templates/`), and links older code wrote the old way are fixed
 *     (`reorgShared()`);  then `link` gives this checkout the root folders
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
      // first the reorg's repair (claude-design P4):  anything older code wrote at `packages/docs/content/...` since
      // goes to its root folder, old-style links are fixed;  THIS code's copy of the tool, whatever the session's
      // checkout runs.  Until every checkout has merged the reorg:  claude-design T1 removes this with the old-path links
      if (existsSync(config.dir)) {
        const run = spawnSync(process.execPath, [REORG_TOOL, "reorg", "--shared", config.dir, "--root", OWN_ROOT], {
          encoding: "utf8"
        })
        if (!options.quiet && run.stdout) session.out(run.stdout.trimEnd())
      }
      const shas = CLI.commitShared(config, { session: options.session, checkout })
      if (!options.quiet) session.out(shas.length ? `committed ${shas.join(", ")}` : "nothing to commit")
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
      const run = spawnSync(process.execPath, [tool, "repair", "--root", checkout, "--shared", config.dir, ...flags], {
        stdio: "inherit"
      })
      if (!options.dryRun && !options.json) linkAll(session, config, [checkout])
      return run.status ?? CLI.EXIT.ERRORS
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  status, init, link, commit, migrate or repair`)
  }
}

/** The docs tools' `relocate.js`, beside this package:  the reorg's repair (`commit`). */
const REORG_TOOL = fileURLToPath(new URL("../../../docs/tools/relocate.js", import.meta.url))

/** The checkout this code is in:  where the reorg looks up repo paths outside the shared folders. */
const OWN_ROOT = fileURLToPath(new URL("../../../..", import.meta.url))

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
    // each checkout's OWN links:  a branch from before the reorg (claude-design P4) still links `packages/docs/content`
    for (const report of CLI.linkCheckout(checkout, { ...config, links: CLI.sharedConfig(checkout).links })) {
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
