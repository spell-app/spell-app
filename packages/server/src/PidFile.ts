import { spawn } from "node:child_process"
import { existsSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

import { SRV, type ServerInfo } from "$/server"

/**
 * The file where a background server says where it is, holding its `ServerInfo`:
 * `<root>/<name>` (default `.spell-server.json`).
 * - running means:  the file's server answers `/api/server` (`SERVER_API`) for THIS root
 *   - a pid file left by a crash, or by a server on another checkout's root, is not running
 * - `ensure()` starts one detached if none runs, or restarts one older than its `sources`
 * - `stop()` sends it `SIGTERM`, and waits for its process to end (`SIGKILL` after 10s)
 * - From the goals tools' `launch.js` (`ensureServer`, `serverStatus`, `stopServer`).
 */
export class PidFile {
  /** folder the server serves */
  readonly root: string

  /** the pid file */
  readonly file: string

  constructor(root: string, name = ".spell-server.json") {
    this.root = resolve(root)
    this.file = join(this.root, name)
  }

  /** the file's info, or `undefined` if missing or unreadable */
  read(): ServerInfo | undefined {
    if (!existsSync(this.file)) return undefined
    try {
      return JSON.parse(readFileSync(this.file, "utf8")) as ServerInfo
    } catch {
      return undefined
    }
  }

  /** write `info` */
  write(info: ServerInfo): void {
    writeFileSync(this.file, `${JSON.stringify(info, null, 2)}\n`)
  }

  /** remove the file if it's `pid`'s (default:  this process's) -- a newer server may own it by now */
  removeIfOurs(pid = process.pid): void {
    if (this.read()?.pid === pid) rmSync(this.file, { force: true })
  }

  /** the running server's info and base URL (`http://127.0.0.1:<port>`), or `undefined` */
  async status(): Promise<RunningServer | undefined> {
    const info = this.read()
    if (!info) return undefined
    const base = `http://127.0.0.1:${info.port}`
    try {
      const answer = (await (
        await fetch(`${base}${SRV.SERVER_API}`, { signal: AbortSignal.timeout(1000) })
      ).json()) as ServerInfo
      return answer.root === this.root ? { ...answer, base } : undefined
    } catch {
      return undefined
    }
  }

  /**
   * The running server, started in the background first if none runs.
   * - `command`:  argv that runs it in the foreground, e.g. `[node, --import, tsx, cli.ts, serve]`
   * - `log`:  file for its output (default `<root>/.spell-server.log`)
   * - waits up to `timeout` ms (15s) for it to answer
   * - SIDE EFFECT:  may spawn `command` detached, in `root`
   */
  async ensure({
    command,
    env,
    log,
    sources = [],
    timeout = 15_000
  }: EnsureOptions): Promise<RunningServer & { launched: boolean }> {
    const running = await this.status()
    if (running && newestChange(sources) <= Date.parse(running.started)) return { ...running, launched: false }
    // older than its code (a merge changed it since):  a fresh one, so pages get the new routes (I5 of `skillz`)
    if (running) await this.stop()
    else await this.stopUnanswering()
    const out = openSync(log ?? join(this.root, ".spell-server.log"), "a")
    const [program, ...args] = command
    spawn(program!, args, {
      cwd: this.root,
      detached: true,
      stdio: ["ignore", out, out],
      env: { ...process.env, ...env }
    }).unref()
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, 100))
      const status = await this.status()
      if (status) return { ...status, launched: true }
    }
    throw new SRV.HttpError(503, `the server for ${this.root} didn't start in ${timeout / 1000}s:  see its log`)
  }

  /**
   * Stop the running server, if any, and wait for its PROCESS to end;  returns whether one was stopped.
   * - `SIGTERM`, then `SIGKILL` if it's still there after `wait` ms (`STOP_WAIT_MS`, 10s);  see `endProcess()`
   * - why the process, not its answers:  it stops answering before it lets go of its port
   *   (its route modules stop first, and the bundles' build).
   *   `ensure()` started the new one while the old one still held the port,
   *   so the new one took ANOTHER port, and every open page on the usual one found the server down
   *   (epic `airplane`, 2026-10-10:  the log shows a start on port 54516)
   */
  async stop({ wait = STOP_WAIT_MS }: { wait?: number } = {}): Promise<boolean> {
    const running = await this.status()
    if (!running) return false
    await endProcess(running.pid, wait)
    return true
  }

  /**
   * Stop the pid file's server when it's alive and still holds its port, but doesn't answer `SERVER_API`.
   * - That's this checkout's server on code from before its calls moved under `/api/` (epic `people-and-orgs` P16),
   *   which `status()` can't see.
   *   Left running, it would keep the port, and every page, on the old code.
   * - only the pid the file names, for THIS root, while something answers HTTP on its port
   * - NEVER throws
   */
  private async stopUnanswering(): Promise<void> {
    const info = this.read()
    if (!info || resolve(info.root) !== this.root || !isAlive(info.pid)) return
    try {
      await fetch(`http://127.0.0.1:${info.port}/`, { signal: AbortSignal.timeout(1000), redirect: "manual" })
    } catch {
      // nothing on its port:  no server to stop
      return
    }
    await endProcess(info.pid, STOP_WAIT_MS)
  }
}

/**
 * End process `pid`, and wait until it's gone:  `SIGTERM`, then `SIGKILL` if it's still there after `wait` ms.
 * - gone means `isAlive()` says so, not that it stopped answering:  its port is free then
 * - NEVER throws (it may end between the checks)
 */
async function endProcess(pid: number, wait: number): Promise<void> {
  const signal = (name: NodeJS.Signals) => {
    try {
      process.kill(pid, name)
    } catch {
      // gone already
    }
  }
  signal("SIGTERM")
  const deadline = Date.now() + wait
  while (isAlive(pid) && Date.now() < deadline) await new Promise((done) => setTimeout(done, 100))
  if (!isAlive(pid)) return
  signal("SIGKILL")
  for (let tries = 0; tries < 40 && isAlive(pid); tries++) await new Promise((done) => setTimeout(done, 50))
}

/** How long `stop()` lets a server end by itself before `SIGKILL`, in ms. */
const STOP_WAIT_MS = 10_000

/** Whether process `pid` is alive:  signal 0 checks without sending anything;  `EPERM`:  alive, not ours. */
function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM"
  }
}

/** A server that answered:  its info and base URL, `http://127.0.0.1:<port>`. */
export type RunningServer = ServerInfo & { base: string }

/**
 * `PidFile.ensure()` options.
 * - `command`:  argv to run
 * - `env`:  added to ours
 * - `log`:  output file
 * - `timeout`:  ms to wait
 * - `sources`:  folders of the server's code
 *   - a running server that started before a `.ts` / `.js` file in them last changed is restarted
 */
export type EnsureOptions = {
  command: string[]
  env?: Record<string, string>
  log?: string
  sources?: string[]
  timeout?: number
}

/**
 * The newest modification time (ms) of the code files under `folders`, all the way down;  0 for none.
 * - code:  `.ts`, `.js`, `.mjs`
 * - skips `node_modules`, `_assets` (built pages' assets, not the server's code) and dot folders
 * - a missing folder counts as nothing
 */
export function newestChange(folders: string[]): number {
  let newest = 0
  for (const folder of folders) {
    if (!existsSync(folder)) continue
    for (const path of readdirSync(folder, { recursive: true }) as string[]) {
      if (!CODE.test(path) || SKIPPED.test(path)) continue
      newest = Math.max(newest, statSync(join(folder, path)).mtimeMs)
    }
  }
  return newest
}

/** A code file `newestChange()` counts. */
const CODE = /\.(ts|js|mjs)$/

/** Folders `newestChange()` skips, anywhere in a path. */
const SKIPPED = /(^|[/\\])(node_modules|_assets|\.[^/\\]+)[/\\]/
