/**
 * `spell dev server <command>`:  the page server of this checkout.
 * - `serve [--port N]` -- run it in the foreground, until `Ctrl-C`
 * - `start` / `ensure` -- start it in the background if it isn't running;
 *   prints JSON `{ base, port, pid, root, launched }`
 * - `stop` -- stop it
 * - `status` -- JSON, or exit 1 when not running
 * - `url <file>` -- `ensure`, then print the URL that serves `file`
 *   - a worktree's file:  on the MAIN checkout's server (`/worktrees/<w>/...`),
 *     when that one runs and serves worktrees (`SRV.mainServerUrl()`)
 *   - a file of the shared content folder:  its path there (`/epics/...`), on the main checkout's server if it runs,
 *     else this checkout's (`SRV.contentPathOf()`)
 * - `prune [--dry-run]` -- stop the page and vite servers whose checkout is gone (`pruneServers()`), on any checkout;
 *   `--dry-run` only says which
 * - `--root <dir>`:  the checkout (default:  the one holding the folder `yarn` ran in, `INIT_CWD`)
 * - `--spaces <dir>`:  where people's and orgs' spaces are kept (default:  spell-spaces, beside the main checkout):
 *   it sets `SPELL_SPACES_DIR`, which spaces' route modules read, and a background server inherits
 *   (epic `people-and-orgs` P8)
 * - Runs under `tsx` with THIS package's `tsconfig.json`, so `$/...` aliases resolve.
 *   A background server is started the same way (`TSX_TSCONFIG_PATH`), whatever folder it's started from.
 */
import { relative, resolve, sep } from "node:path"

import { SRV } from "$/server"
import { DEFAULT_PORT, PageServer, findRoot, pruneReport, pruneServers } from "$/server/page"

await main(process.argv.slice(2))

/** Run `args`. */
async function main(args: string[]): Promise<void> {
  const [command = "help", ...rest] = args
  const root = resolve(flag(rest, "--root") ?? findRoot(process.env.INIT_CWD ?? process.cwd()) ?? process.cwd())
  const port = Number(flag(rest, "--port") ?? DEFAULT_PORT)
  const spaces = flag(rest, "--spaces")
  if (spaces) process.env.SPELL_SPACES_DIR = resolve(spaces)
  const pidFile = new SRV.PidFile(root)

  switch (command) {
    case "serve": {
      const server = await new PageServer({ root }).start({ port })
      console.log(`page server:  ${server.web.url}/  (root ${root})`)
      await SRV.untilInterrupted(server.web.server, () => server.stop())
      return
    }
    case "start":
    case "ensure":
      return print(await PageServer.ensure(root, port))
    case "stop":
      return console.log((await pidFile.stop()) ? "stopped" : "not running")
    case "status": {
      const running = await pidFile.status()
      if (!running) {
        console.log("not running")
        process.exitCode = 1
        return
      }
      return print(running)
    }
    case "url": {
      const file = rest.find((arg) => !arg.startsWith("--") && arg !== flag(rest, "--root"))
      if (!file) throw new Error("usage:  spell dev server url <file>")
      const absolute = resolve(process.env.INIT_CWD ?? process.cwd(), file)
      // a worktree's file:  the MAIN checkout's server, when it serves worktrees, so every link is on one port
      const main = await SRV.mainServerUrl(absolute, root)
      if (main) return console.log(main)
      const running = await PageServer.ensure(root, port)
      const path = relative(root, absolute)
      const served = SRV.contentPathOf(absolute, running) ?? `/${path.split(sep).map(encodeURIComponent).join("/")}`
      return console.log(`${running.base}${served}`)
    }
    case "prune": {
      const dryRun = rest.includes("--dry-run")
      return console.log(pruneReport(pruneServers({ dryRun }), { dryRun }))
    }
    default:
      console.log(
        `usage:  spell dev server serve|start|ensure|stop|status|url <file>|prune [--dry-run]  [--root <dir>] [--port <n>] [--spaces <dir>]`
      )
  }
}

/** Value after `name` in `args`. */
function flag(args: string[], name: string): string | undefined {
  const at = args.indexOf(name)
  return at < 0 ? undefined : args[at + 1]
}

/** Print `value` as indented JSON. */
function print(value: unknown): void {
  console.log(JSON.stringify(value, null, 2))
}
