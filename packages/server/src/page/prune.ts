import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"

/**
 * `spell dev server prune`:  find the web servers left running by checkouts that are gone, and stop them.
 * - Why:  removing a worktree leaves its page server (and the editor's vite server, its child) running,
 *   and nothing else ever stops them:  their `.spell-server.json` went with the folder.
 * - So they're found by PROCESS, not by pid file:
 *   - `ps` lists the page servers (`.../packages/server/src/page/cli.ts serve`)
 *     and the vite dev servers (`.../node_modules/vite.../ dev`)
 *   - `lsof` gives each one's working folder, and the port it listens on
 * - A server is an orphan when its checkout AND its working folder are both gone:
 *   one whose checkout exists is NEVER stopped (`orphanServers()`).
 */

/** What runs a page server:  its entry point, run with `serve`. */
const PAGE_SERVER = /\/packages\/server\/src\/page\/cli\.ts\s+serve\b/

/** What runs a vite dev server, through Vite+ or vite itself. */
const VITE_SERVER =
  /(?:^|[\s/])node_modules\/(?:vite-plus\/bin\/vp|vite\/bin\/vite\.js|vite\/dist\/vite\/node\/cli\.js|\.bin\/vite|\.bin\/vp)\s+dev\b/

/** What `lsof` adds to a folder that's been deleted, on some systems. */
const DELETED = / \(deleted\)$/

/** A web server, as `ps` and `lsof` show it. */
export type ServerProcess = {
  pid: number
  command: string
  /** its working folder;  missing when `lsof` couldn't say */
  cwd?: string
  /** the port it listens on;  missing when it listens on none (yet) */
  port?: number
}

/** The kinds of server `prune` looks for. */
export const SERVER_KINDS = ["page", "vite"] as const

/** One of `SERVER_KINDS`. */
export type ServerKind = (typeof SERVER_KINDS)[number]

/** A server whose checkout is gone. */
export type OrphanServer = ServerProcess & {
  kind: ServerKind
  /** the checkout it served, which no longer exists */
  checkout: string
}

/**
 * The servers among `processes` whose checkout is gone, page servers first.
 * - its checkout:  a page server's `--root`, else the folder holding `/packages/` or `/node_modules/`
 *   in its command, else its working folder
 * - an orphan:  neither its checkout nor its working folder `exists()`
 * - a process that's neither kind, or with no folder to judge by, is never an orphan
 * - Pure:  `exists` is the only look at the disk.
 */
export function orphanServers(processes: ServerProcess[], exists: (path: string) => boolean): OrphanServer[] {
  const orphans: OrphanServer[] = []
  for (const server of processes) {
    const kind = kindOf(server.command)
    if (!kind) continue
    const checkout = checkoutOf(server)
    if (!checkout || exists(checkout)) continue
    if (server.cwd && exists(server.cwd)) continue
    orphans.push({ ...server, kind, checkout })
  }
  return orphans.sort((a, b) => SERVER_KINDS.indexOf(a.kind) - SERVER_KINDS.indexOf(b.kind))
}

/** `command`'s kind of server, or `undefined` for anything else. */
function kindOf(command: string): ServerKind | undefined {
  if (PAGE_SERVER.test(command)) return "page"
  if (VITE_SERVER.test(command)) return "vite"
  return undefined
}

/** The checkout `process` serves, from its command line, else its working folder. */
function checkoutOf({ command, cwd }: ServerProcess): string | undefined {
  const root = /\s--root\s+(\S+)/.exec(command)?.[1]
  if (root) return root
  const script = /(\/\S+?)\/(?:packages|node_modules)\//.exec(command)?.[1]
  return script ?? cwd
}

/**
 * Every page server and vite dev server running on this machine, with its folder and port.
 * - SIDE EFFECT:  runs `ps`, and `lsof` twice
 * - NEVER throws:  a tool that's missing or fails gives what it could
 */
export function serverProcesses(): ServerProcess[] {
  const servers = parsePs(run("ps", ["-axo", "pid=,command="])).filter(
    (it) => it.pid !== process.pid && kindOf(it.command)
  )
  if (!servers.length) return []
  const pids = servers.map((it) => it.pid).join(",")
  const cwds = parseLsof(run("lsof", ["-a", "-p", pids, "-d", "cwd", "-Fn"]))
  const listens = parseLsof(run("lsof", ["-a", "-p", pids, "-iTCP", "-sTCP:LISTEN", "-P", "-n", "-Fn"]))
  return servers.map((server) => {
    const cwd = cwds.get(server.pid)?.[0]?.replace(DELETED, "")
    const port = Number(listens.get(server.pid)?.[0]?.split(":").pop())
    return { ...server, ...(cwd && { cwd }), ...(port && { port }) }
  })
}

/** `ps -o pid=,command=` output, as `{ pid, command }`s. */
export function parsePs(text: string): ServerProcess[] {
  const processes: ServerProcess[] = []
  for (const line of text.split("\n")) {
    const match = /^\s*(\d+)\s+(.+)$/.exec(line)
    if (match) processes.push({ pid: Number(match[1]), command: match[2]! })
  }
  return processes
}

/** `lsof -F n` output (`p<pid>`, then `n<name>` lines):  each pid's names, in order. */
export function parseLsof(text: string): Map<number, string[]> {
  const names = new Map<number, string[]>()
  let pid = 0
  for (const line of text.split("\n")) {
    if (line.startsWith("p")) pid = Number(line.slice(1))
    else if (line.startsWith("n") && pid) names.set(pid, [...(names.get(pid) ?? []), line.slice(1)])
  }
  return names
}

/**
 * Stop the servers whose checkout is gone (`orphanServers()`), with `SIGTERM`;  returns them.
 * - `dryRun`:  stop nothing, only say which
 * - a server already gone by the time it's signalled counts as stopped
 */
export function pruneServers({ dryRun = false } = {}): OrphanServer[] {
  const orphans = orphanServers(serverProcesses(), existsSync)
  if (dryRun) return orphans
  for (const orphan of orphans) {
    try {
      process.kill(orphan.pid, "SIGTERM")
    } catch (error) {
      // ESRCH:  it went with its parent page server, as the editor's vite does
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error
    }
  }
  return orphans
}

/**
 * `orphans` as lines for the terminal, grouped by checkout:  `would stop` with `dryRun`, else `stopped`.
 * - none:  one line saying so
 */
export function pruneReport(orphans: OrphanServer[], { dryRun = false } = {}): string {
  if (!orphans.length) return "no servers left by removed checkouts"
  const byCheckout = new Map<string, OrphanServer[]>()
  for (const orphan of orphans) byCheckout.set(orphan.checkout, [...(byCheckout.get(orphan.checkout) ?? []), orphan])
  const lines = [
    `${dryRun ? "would stop" : "stopped"} ${plural(orphans.length, "server")} of ${plural(byCheckout.size, "removed checkout")}:`
  ]
  for (const [checkout, servers] of byCheckout) {
    lines.push(`  ${checkout}`)
    for (const { kind, pid, port } of servers) lines.push(`    ${kind}  pid ${pid}${port ? `  port ${port}` : ""}`)
  }
  return lines.join("\n")
}

/** `count` and `noun`, plural unless it's 1:  `1 server`, `3 servers`. */
function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

/** `program`'s output, or "" if it fails to start;  a non-zero exit still gives what it printed (`lsof`). */
function run(program: string, args: string[]): string {
  return spawnSync(program, args, { encoding: "utf8", timeout: 15_000 }).stdout ?? ""
}
