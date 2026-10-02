import { spawn } from "node:child_process"
import { existsSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

import { SRV, type ServerInfo } from "$/server"

/**
 * Where a background server says where it is:  `<root>/<name>` (default `.spell-server.json`), its `ServerInfo`.
 * - running means:  the file's server answers `/_server/ping` for THIS root;  a pid file left by a crash, or by a
 *   server on another checkout's root, is not running
 * - `ensure()` starts one detached if none runs;  `stop()` sends it `SIGTERM`
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
        await fetch(`${base}/_server/ping`, { signal: AbortSignal.timeout(1000) })
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
  async ensure({ command, env, log, timeout = 15_000 }: EnsureOptions): Promise<RunningServer & { launched: boolean }> {
    const running = await this.status()
    if (running) return { ...running, launched: false }
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

  /** stop the running server, if any, and wait for it to go;  returns whether one was stopped */
  async stop(): Promise<boolean> {
    const running = await this.status()
    if (!running) return false
    process.kill(running.pid, "SIGTERM")
    for (let tries = 0; tries < 50 && (await this.status()); tries++) await new Promise((done) => setTimeout(done, 100))
    return true
  }
}

/** A server that answered:  its info and base URL, `http://127.0.0.1:<port>`. */
export type RunningServer = ServerInfo & { base: string }

/**
 * `PidFile.ensure()` options.
 * - `command`:  argv to run;  `env`:  added to ours;  `log`:  output file;  `timeout`:  ms to wait
 */
export type EnsureOptions = { command: string[]; env?: Record<string, string>; log?: string; timeout?: number }
