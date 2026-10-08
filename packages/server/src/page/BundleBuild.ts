import { spawn as nodeSpawn, type ChildProcess, type SpawnOptions } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"

import type { Handler } from "$/server"
import { BUNDLE_FOLDERS, BUNDLE_WAIT_MS, uiBuildPath } from "$/server/page"

/**
 * Builds the bundles the page server serves, when the server starts.
 * - the bundles (`BUNDLE_FOLDERS`):  the Spell UI docs site's, the brand pages';  built on demand, never committed
 * - `start()`:  runs `spell dev bundles build --stale` in the background, with the checkout's OWN CLI
 *   - it builds only the bundles whose sources changed since their last build (the logic:  `$/assembler` `Bundle`)
 *   - so a start with nothing changed builds nothing
 * - its output goes to the server's log, each line prefixed `bundles:  `
 * - `wait`:  while it runs, a request for a MISSING file in a bundle's folder waits for it to end,
 *   at most `timeout` ms, then is served as usual;  a file that's there is served at once
 * - when it ends, live reload reloads the open pages that load a bundle:  the page server watches both folders
 * - A leaf like the rest of the server:  it runs the CLI as a child process, never imports it.
 */
export class BundleBuild {
  /** the checkout served */
  readonly root: string

  /** ms a request waits for the build */
  readonly timeout: number

  /** starts the child:  `node:child_process`'s `spawn`, or a test's stub */
  private spawn: SpawnBuild

  /** the build, while it runs */
  private child?: ChildProcess

  /** resolves when the build ends, however it ends */
  private ended: Promise<void> = Promise.resolve()

  constructor({ root, timeout = BUNDLE_WAIT_MS, spawn = nodeSpawn }: BundleBuildProps) {
    this.root = root
    this.timeout = timeout
    this.spawn = spawn
  }

  /** Is the build running? */
  get isBuilding(): boolean {
    return this.child !== undefined
  }

  /** `<root>/packages/cli/bin/spell.mjs`:  the checkout's own CLI, never the `spell` on `PATH` (maybe main's) */
  get cli(): string {
    return join(this.root, "packages", "cli", "bin", "spell.mjs")
  }

  /**
   * Start the build in the background;  a checkout without the CLI (a test's temp folder) builds nothing.
   * - its own process group (`detached`), so `stop()` ends yarn and vite under it too
   * - NEVER throws:  a failed build is logged, and leaves its bundle stale for the next start
   */
  start(): this {
    if (this.child || !existsSync(this.cli)) return this
    const args = [this.cli, "dev", "bundles", "build", "--stale"]
    console.log(`bundles:  checking (spell dev bundles build --stale)`)
    let child: ChildProcess
    try {
      child = this.spawn(process.execPath, args, {
        cwd: this.root,
        // not the server's `TSX_TSCONFIG_PATH`:  the CLI registers its own `tsconfig.json`
        env: { ...process.env, INIT_CWD: this.root, TSX_TSCONFIG_PATH: undefined },
        stdio: ["ignore", "pipe", "pipe"],
        detached: true
      })
    } catch (error) {
      console.error("bundles:  couldn't start the build:", error)
      return this
    }
    this.child = child
    for (const stream of [child.stdout, child.stderr]) {
      if (stream) createInterface({ input: stream }).on("line", (line) => console.log(`bundles:  ${line}`))
    }
    this.ended = new Promise((done) => {
      child.once("error", (error) => {
        console.error("bundles:  the build failed to run:", error)
        this.child = undefined
        done()
      })
      child.once("exit", (code, signal) => {
        if (code !== 0) console.error(`bundles:  the build failed (${signal ?? `exit ${code}`});  see above`)
        this.child = undefined
        done()
      })
    })
    return this
  }

  /** Stop the build, if it runs:  its whole process group.  NEVER throws. */
  stop(): void {
    const pid = this.child?.pid
    if (pid === undefined) return
    try {
      process.kill(-pid, "SIGTERM")
    } catch {
      this.child?.kill("SIGTERM")
    }
  }

  /**
   * Resolve when the build ends, or after `timeout` ms, whichever comes first;  at once when none runs.
   * - `true`:  it ended (or none ran);  `false`:  timed out
   */
  async untilBuilt(timeout = this.timeout): Promise<boolean> {
    if (!this.child) return true
    let timer: NodeJS.Timeout | undefined
    const timedOut = new Promise<false>((done) => (timer = setTimeout(() => done(false), timeout)))
    const built = await Promise.race([this.ended.then(() => true as const), timedOut])
    clearTimeout(timer)
    return built
  }

  /**
   * The router handler:  while the build runs, a request for a missing file in a bundle's folder waits for it.
   * - this checkout's own bundles only, not `/worktrees/<w>/...`:
   *   - `/packages/brand/_assets/ui/...`
   *   - `/packages/ui/site/_assets/...`, and the same laid over the pages at `/ui/_assets/...` (`uiBuildPath()`)
   */
  wait: Handler = async (request, _reply, next) => {
    if (!this.child || (request.method !== "GET" && request.method !== "HEAD")) return next()
    const file = this.bundleFileFor(request.path)
    if (file && !existsSync(file)) await this.untilBuilt()
    next()
  }

  /** The file in a bundle's folder URL path `path` names, through the `/ui/` overlay;  else `undefined`. */
  bundleFileFor(path: string): string | undefined {
    let served: string
    try {
      served = decodeURIComponent(uiBuildPath(path) ?? path)
    } catch {
      return undefined
    }
    const folder = BUNDLE_FOLDERS.find((each) => served.startsWith(`/${each}/`))
    if (!folder || served.split("/").includes("..")) return undefined
    return join(this.root, served)
  }
}

/** Starts the build's child process:  `node:child_process`'s `spawn`, or a test's stub. */
export type SpawnBuild = (command: string, args: string[], options: SpawnOptions) => ChildProcess

/**
 * `new BundleBuild()` props.
 * - `root`:  the checkout served
 * - `timeout`:  ms a request waits (default `BUNDLE_WAIT_MS`)
 * - `spawn`:  starts the child (default `node:child_process`'s);  tests pass a stub
 */
export type BundleBuildProps = { root: string; timeout?: number; spawn?: SpawnBuild }
