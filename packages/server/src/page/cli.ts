/**
 * `yarn server <command>`:  the page server of this checkout.
 * - `serve [--port N]` -- run it in the foreground, until `Ctrl-C`
 * - `start` / `ensure` -- start it in the background if it isn't running;  prints JSON `{ base, port, pid, root,
 *   launched }`
 * - `stop` -- stop it;  `status` -- JSON, or exit 1 when not running
 * - `url <file>` -- `ensure`, then print the URL that serves `file`
 * - `--root <dir>`:  the checkout (default:  the one holding the folder `yarn` ran in, `INIT_CWD`)
 * - Runs under `tsx` with THIS package's `tsconfig.json`, so `$/...` aliases resolve:  a background server is
 *   started the same way (`TSX_TSCONFIG_PATH`), whatever folder it's started from.
 */
import { relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { SRV } from "$/server"
import { DEFAULT_PORT, PageServer, findRoot } from "$/server/page"

/** This package's `tsconfig.json`:  the alias table a background server needs. */
const TSCONFIG = fileURLToPath(new URL("../../tsconfig.json", import.meta.url))

/** This file, to start again as `serve`. */
const CLI = fileURLToPath(import.meta.url)

await main(process.argv.slice(2))

/** Run `args`. */
async function main(args: string[]): Promise<void> {
  const [command = "help", ...rest] = args
  const root = resolve(flag(rest, "--root") ?? findRoot(process.env.INIT_CWD ?? process.cwd()) ?? process.cwd())
  const port = Number(flag(rest, "--port") ?? DEFAULT_PORT)
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
      return print(await ensure(pidFile, root, port))
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
      if (!file) throw new Error("usage:  yarn server url <file>")
      const { base } = await ensure(pidFile, root, port)
      const path = relative(root, resolve(process.env.INIT_CWD ?? process.cwd(), file))
      return console.log(`${base}/${path.split(sep).map(encodeURIComponent).join("/")}`)
    }
    default:
      console.log(`usage:  yarn server serve|start|ensure|stop|status|url <file>  [--root <dir>] [--port <n>]`)
  }
}

/** The running server, started in the background if needed. */
function ensure(pidFile: SRV.PidFile, root: string, port: number) {
  return pidFile.ensure({
    command: [process.execPath, ...process.execArgv, CLI, "serve", "--root", root, "--port", String(port)],
    env: { TSX_TSCONFIG_PATH: TSCONFIG }
  })
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
