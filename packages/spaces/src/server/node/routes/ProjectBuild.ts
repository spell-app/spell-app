import { spawn as nodeSpawn, type ChildProcess, type SpawnOptions } from "child_process"
import { existsSync } from "fs"
import { join, resolve } from "path"
import { createInterface } from "readline"

import type { SRV } from "@spell-app/server"
import environment from "$/spaces/server/node/environment"
import * as projectUtils from "$/spaces/server/node/projects/project-utils"
import { SP } from "@spell-app/spell"
import { hasProjectFile } from "@spell-app/spell/node/projectFile"

/**
 * Builds spell projects when the API needs what they build:  their compiled output and scope packs are in `build/`
 * (epic `people-and-orgs` P11), never committed, so a fresh checkout or worktree has none.
 * - `start()`:  when the page server starts, compiles the built-in projects that are out of date, in the background:
 *   `spell compile --stale --all @spell/examples @spell/library` (`STARTUP_PROJECTS`), as page-server's `BundleBuild` builds the bundles
 * - `builtFirst()`:  a route's handler.
 *   A request for a built file that isn't there (`/spaces/<project>/<file>`) compiles its project first,
 *   `spell compile <projectId>`, then goes on to be served:
 *   - while the startup build runs, it waits for that instead
 *   - one compile per project at a time:  a second request for it waits on the first's
 *   - at most `timeout` ms in all;  then it's served as it is (a 404), while the compile carries on
 *   - only a project that's there (it has a project file):  an unknown one 404s at once
 *   - a file that's there is served at once, even if its sources changed since:
 *     `start()` and `spell compile --stale` catch those
 * - A child process, the checkout's OWN `spell` CLI, never this one:
 *   - it compiles exactly as `spell compile` does:  every target, the scope pack, the checks
 *   - the page server runs the API in its own process, and keeps serving pages while it compiles
 * - Its output goes to the server's log, each line prefixed `projects:  `.
 * - NEVER throws.
 */
export class ProjectBuild {
  /** the checkout whose CLI compiles */
  readonly root: string

  /** ms a request waits for its project to compile */
  readonly timeout: number

  /** starts a child:  `child_process`'s `spawn`, or a test's stub */
  private spawn: SpawnBuild

  /** the startup build, while it runs */
  private startup?: Promise<void>

  /** each project's compile, by project id, while it runs */
  private compiles = new Map<string, Promise<void>>()

  /** every child still running, for `stop()` */
  private children = new Set<ChildProcess>()

  constructor({ root = CHECKOUT_ROOT, timeout = COMPILE_WAIT_MS, spawn = nodeSpawn }: ProjectBuildProps = {}) {
    this.root = root
    this.timeout = timeout
    this.spawn = spawn
  }

  /** `<root>/packages/cli/bin/spell.mjs`:  the checkout's own CLI, never the `spell` on `PATH` (maybe main's) */
  get cli(): string {
    return join(this.root, "packages", "cli", "bin", "spell.mjs")
  }

  /** Is the startup build running? */
  get isStarting(): boolean {
    return this.startup !== undefined
  }

  /**
   * Compile `projects` that are out of date, in the background:  `spell compile --stale --all <projects...>`.
   * - Once:  a second call while it runs does nothing.
   */
  start(projects: string[] = STARTUP_PROJECTS): this {
    if (this.startup) return this
    const startup = this.run(["compile", "--stale", "--all", ...projects])
    this.startup = startup
    void startup.then(() => {
      if (this.startup === startup) this.startup = undefined
    })
    return this
  }

  /** Stop every compile still running:  each one's whole process group.  NEVER throws. */
  stop(): void {
    for (const child of this.children) {
      try {
        process.kill(-child.pid!, "SIGTERM")
      } catch {
        child.kill("SIGTERM")
      }
    }
  }

  /**
   * Make sure built file `location` is there, compiling its project if it isn't -- see the class.
   * - `true`:  it's there;  `false`:  it isn't, e.g. its project has errors, isn't there, or took too long
   */
  async untilBuilt(location: SP.SpellLocation): Promise<boolean> {
    const file = location.serverPath
    if (existsSync(file)) return true
    const { projectId } = location
    if (!hasProjectFile(SP.SpellLocation.getProjectLocation(projectId).serverPath)) return false
    const deadline = Date.now() + this.timeout
    if (this.startup) {
      await within(this.startup, deadline)
      if (existsSync(file)) return true
    }
    let compile = this.compiles.get(projectId)
    if (!compile) {
      compile = this.run(["compile", projectId])
      this.compiles.set(projectId, compile)
      void compile.then(() => this.compiles.delete(projectId))
    }
    await within(compile, deadline)
    return existsSync(file)
  }

  /**
   * A route's handler, ahead of the one that serves the file:  makes sure the built file it names is there.
   * - The file is the request's URL's, `/spaces/<project>/<file>` (`projectUtils.locationForUrl()`),
   *   when that's a file spell builds (`projectUtils.isBuiltFile()`), e.g. `Solitaire.spell.js`.
   * - A bad URL goes on to the next handler, which says what's wrong.
   */
  builtFirst(): SRV.Handler {
    return async (request, _reply, next) => {
      let location: SP.SpellLocation
      try {
        location = projectUtils.locationForUrl(request.originalUrl)
      } catch {
        return next()
      }
      if (projectUtils.isBuiltFile(location)) await this.untilBuilt(location)
      next()
    }
  }

  /**
   * Run the CLI with `args`, in the checkout, logging its output;  resolves when it ends, however it ends.
   * - a checkout without the CLI (a test's temp folder) runs nothing
   * - its own process group (`detached`), so `stop()` ends what it starts too
   */
  private run(args: string[]): Promise<void> {
    if (!existsSync(this.cli)) return Promise.resolve()
    console.log(`projects:  spell ${args.join(" ")}`)
    let child: ChildProcess
    try {
      child = this.spawn(process.execPath, [this.cli, ...args], {
        cwd: this.root,
        // not this server's `TSX_TSCONFIG_PATH`:  the CLI registers its own `tsconfig.json`
        env: { ...process.env, INIT_CWD: this.root, TSX_TSCONFIG_PATH: undefined },
        stdio: ["ignore", "pipe", "pipe"],
        detached: true
      })
    } catch (error) {
      console.error("projects:  couldn't start the compile:", error)
      return Promise.resolve()
    }
    this.children.add(child)
    for (const stream of [child.stdout, child.stderr]) {
      if (stream) createInterface({ input: stream }).on("line", (line) => console.log(`projects:  ${line}`))
    }
    return new Promise((done) => {
      child.once("error", (error) => {
        console.error("projects:  the compile failed to run:", error)
        this.children.delete(child)
        done()
      })
      child.once("exit", (code, signal) => {
        // 1:  a project had errors, listed above;  its files are written all the same
        if (code !== 0 && code !== 1) console.error(`projects:  the compile failed (${signal ?? `exit ${code}`})`)
        this.children.delete(child)
        done()
      })
    })
  }
}

/** The built-in projects `start()` compiles:  what the demo pages and App UI's component pages run. */
export const STARTUP_PROJECTS = ["@spell/examples", "@spell/library"]

/** ms a request waits for its project to compile, startup build included. */
export const COMPILE_WAIT_MS = 60_000

/** This checkout's root:  where its `build/` is (`environment.buildDir`), and its CLI. */
const CHECKOUT_ROOT = resolve(environment.packagesDir, "..")

/** Starts a compile's child process:  `child_process`'s `spawn`, or a test's stub. */
export type SpawnBuild = (command: string, args: string[], options: SpawnOptions) => ChildProcess

/**
 * `new ProjectBuild()` props.
 * - `root`:  the checkout whose CLI compiles (default:  this one)
 * - `timeout`:  ms a request waits (default `COMPILE_WAIT_MS`)
 * - `spawn`:  starts a child (default `child_process`'s);  tests pass a stub
 */
export type ProjectBuildProps = { root?: string; timeout?: number; spawn?: SpawnBuild }

/** Wait for `work`, or until `deadline` (ms since the epoch), whichever comes first. */
async function within(work: Promise<void>, deadline: number): Promise<void> {
  let timer: NodeJS.Timeout | undefined
  const timedOut = new Promise<void>((done) => (timer = setTimeout(done, Math.max(0, deadline - Date.now()))))
  await Promise.race([work, timedOut])
  clearTimeout(timer)
}
