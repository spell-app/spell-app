import { spawn as nodeSpawn, type ChildProcess, type SpawnOptions } from "node:child_process"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline"

import type { Handler } from "spell-kit/server"
import {
  componentSetPath,
  componentSets,
  folderUrl,
  pageServerSettings,
  type ComponentSet
} from "spell-kit/server/page"
import { BUNDLE_WAIT_MS } from "spell-app/page-server"

/**
 * Builds the bundles spell-app's page server serves, when the server starts (`pageRoutes`, its route module).
 * - the bundles:  the Spell UI docs site's, the brand pages';  built on demand, never committed
 *   - `folders`:  the root `package.json`'s `"pageServer": { "bundles": [...] }`
 * - `start()`:  runs `spell bundle --stale` in the background, with the checkout's OWN `spell` (the kit's, as its
 *   install resolves it)
 *   - it builds only the bundles whose sources changed since their last build (the logic:  `spell-kit/server` `Bundle`)
 *   - so a start with nothing changed builds nothing
 * - its output goes to the server's log, each line prefixed `bundles:  `
 * - `wait`:  while it runs, a request for a MISSING file in a bundle's folder waits for it to end,
 *   at most `timeout` ms, then is served as usual;  a file that's there is served at once
 * - when it ends, live reload reloads the open pages that load a bundle:  the page server watches both folders
 * - It runs spell's CLI as a child process, never imports it.
 * - Moved out of the server package (epic `repo-split` P4):  the server is generic, and this runs spell's own CLI.
 */
export class BundleBuild {
  /** the checkout served */
  readonly root: string

  /** ms a request waits for the build */
  readonly timeout: number

  /** the bundles' folders, relative to `root`:  its settings' `bundles` (`pageServerSettings()`), read once */
  readonly folders: readonly string[]

  /** the component sets, whose `_assets/` are a bundle's folder:  its settings' `componentSets`, read once */
  readonly sets: readonly ComponentSet[]

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
    const settings = pageServerSettings(root)
    this.folders = settings.bundles ?? []
    this.sets = componentSets(settings)
  }

  /** Is the build running? */
  get isBuilding(): boolean {
    return this.child !== undefined
  }

  /** the checkout's own `spell`:  the kit's `bin/spell.mjs`, as `root`'s install resolves it (`kitSpell()`) */
  get cli(): string | undefined {
    return kitSpell(this.root)
  }

  /**
   * Start the build in the background;  a checkout without the CLI (a test's temp folder) builds nothing.
   * - its own process group (`detached`), so `stop()` ends yarn and vite under it too
   * - NEVER throws:  a failed build is logged, and leaves its bundle stale for the next start
   */
  start(): this {
    const cli = this.cli
    if (this.child || !cli || !existsSync(cli)) return this
    const args = [cli, "bundle", "--stale"]
    console.log(`bundles:  checking (spell bundle --stale)`)
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
   * - this checkout's own bundles only, not `/worktrees/<w>/...`, at the URL path each folder is served at
   *   (`folderUrl()`;  beside the checkout, `/_beside/...`):
   *   - `/_beside/spell-brand/_assets/ui/...`
   *   - `/_beside/spell-ui/site/_assets/...`, and the same laid over a component set's pages at
   *     `/components/<set>/_assets/...` (`componentSetPath()`)
   */
  wait: Handler = async (request, _reply, next) => {
    if (!this.child || (request.method !== "GET" && request.method !== "HEAD")) return next()
    const file = this.bundleFileFor(request.path)
    if (file && !existsSync(file)) await this.untilBuilt()
    next()
  }

  /** The file in a bundle's folder URL path `path` names, through the sets' overlay;  else `undefined`. */
  bundleFileFor(path: string): string | undefined {
    let served: string
    try {
      served = decodeURIComponent(componentSetPath(path, this.sets) ?? path)
    } catch {
      return undefined
    }
    const folder = this.folders.find((each) => served.startsWith(`${folderUrl(each)}/`))
    if (!folder || served.split("/").includes("..")) return undefined
    return join(this.root, folder, served.slice(folderUrl(folder).length))
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

/**
 * The kit's `spell` command (`spell-kit`'s `bin/spell.mjs`), as checkout `root`'s install resolves the kit:
 * the checkout's OWN, never the `spell` on `PATH` (maybe main's);  `undefined` when its install has no kit.
 * - By package, never a path into the kit (the root `AGENTS.md`, "Imports across repos").
 * - NOTE: spaces' `ProjectBuild` keeps a twin of this:  page-server may not import spaces (the one-way rule, `tsconfig.base.json`)
 */
function kitSpell(root: string): string | undefined {
  try {
    const kit = dirname(createRequire(join(root, "package.json")).resolve("spell-kit/package.json"))
    return join(kit, "bin", "spell.mjs")
  } catch {
    return undefined
  }
}
