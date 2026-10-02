/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process"
import { existsSync, readdirSync, rmSync } from "node:fs"
import { createServer, type ViteDevServer } from "vite"

import { VisualError, type VisualBrowser, type VisualOs } from "./visual.types.ts"
import { NodePackage } from "../NodePackage.ts"
import { DockerBrowserServer } from "./DockerBrowserServer.ts"
import { ParityReport } from "./ParityReport.ts"
import { StaticPages } from "./StaticPages.ts"
import { VisualExamples } from "./VisualExamples.ts"
import { VisualSettings } from "./VisualSettings.ts"

/**
 * Runs `yarn test:visual`:  ONE Vite dev server on the host, then Playwright once per selected OS.
 * - `local` -- the host's Playwright browsers (`yarn test:browsers`)
 * - `linux` -- a `DockerBrowserServer`;  Playwright connects to it (`playwright.config.ts`, `connectOptions`)
 * - Playwright runs as a child process (`@playwright/test`'s CLI) with `VisualSettings.ENV` set;  its exit code is
 *   the OS's result.
 * - `--static`:  the same server also serves the static pages (`StaticPages`), and Playwright runs only the static
 *   comparisons;  the report is `tools/results/visual/static-parity.md`.
 * - After a FULL `--update` run (no `--grep`) the baselines no example makes any more are deleted:  a renamed or
 *   removed example leaves nothing behind.
 * - SIDE EFFECT: Ctrl-C / SIGTERM stop the child, remove the container and close the server before exiting.
 */
export class VisualRunner {
  /** preferred dev server port (the next free one is taken if busy) */
  static readonly PORT = 5391

  readonly options: VisualRunnerOptions
  /** the dev server, once started */
  private server?: ViteDevServer
  /** the Docker browser server of the `linux` run in progress */
  private docker?: DockerBrowserServer
  /** the Playwright child in progress */
  private child?: ChildProcess

  constructor(options: VisualRunnerOptions) {
    this.options = options
  }

  ////////////////
  // ## Run
  ////////////////

  /** Run every selected OS;  resolves with the exit code (0 = every OS passed). */
  async run(): Promise<number> {
    this.trapSignals()
    let code = 0
    try {
      const baseUrl = await this.startServer()
      for (const os of this.options.oses) {
        const result = await this.runOs(os, baseUrl)
        console.log(`[visual] ${os}: ${result === 0 ? "PASSED" : "FAILED"}`)
        console.log(`[visual] report:  yarn playwright show-report ${this.reportFolder(os)}`)
        if (result !== 0) code = result
      }
      if (this.options.parity)
        console.log(`[visual] parity report:  ${ParityReport.write(this.options.oses, "parity")}`)
      if (this.options.static) {
        console.log(`[visual] static parity report:  ${ParityReport.write(this.options.oses, "static")}`)
      }
    } finally {
      await this.cleanup()
    }
    return code
  }

  /** One OS:  start its browsers, run Playwright, prune after a full update. */
  private async runOs(os: VisualOs, baseUrl: string): Promise<number> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      [VisualSettings.ENV.os]: os,
      [VisualSettings.ENV.baseUrl]: baseUrl,
      [VisualSettings.ENV.parity]: this.options.parity ? "1" : "",
      [VisualSettings.ENV.static]: this.options.static ? "1" : ""
    }
    if (this.options.workers) env[VisualSettings.ENV.workers] = this.options.workers
    if (this.options.parity) ParityReport.clear(os, "parity")
    if (this.options.static) ParityReport.clear(os, "static")
    try {
      if (os === "linux") {
        this.docker = new DockerBrowserServer()
        console.log(`[visual] linux:  starting ${this.docker.image} ...`)
        env[VisualSettings.ENV.ws] = await this.docker.start()
      }
      console.log(`[visual] ${os}:  ${this.options.browsers.join(", ")}`)
      const code = await this.playwright(env)
      if (this.options.update && !this.options.grep?.length) await this.prune(os)
      return code
    } finally {
      this.docker?.stop()
      this.docker = undefined
    }
  }

  /** Run `playwright test` with `env`;  resolves with its exit code. */
  private playwright(env: NodeJS.ProcessEnv): Promise<number> {
    const args = [
      `${NodePackage.need("@playwright/test")}/cli.js`,
      "test",
      "--config",
      `${VisualSettings.ROOT}tools/visual/playwright.config.ts`,
      ...this.options.browsers.flatMap((browser) => ["--project", browser])
    ]
    if (this.options.update) args.push("--update-snapshots=changed")
    if (this.options.grep?.length) args.push("--grep", VisualRunner.grep(this.options.grep))
    return new Promise((resolve) => {
      const child = spawn(process.execPath, args, { cwd: VisualSettings.ROOT, env, stdio: "inherit" })
      this.child = child
      child.on("exit", (code, signal) => {
        this.child = undefined
        resolve(code ?? (signal ? 130 : 1))
      })
    })
  }

  /**
   * Delete the baselines of `os` (for the browsers run) that no example makes any more.
   * - Only after a full `--update` run:  a `--grep` run doesn't know about the other families.
   */
  private async prune(os: VisualOs) {
    const expected = VisualExamples.baselines(await VisualExamples.load())
    let removed = 0
    for (const browser of this.options.browsers) {
      const folder = VisualExamples.folder(VisualSettings.osFolder(os), browser)
      if (!existsSync(folder)) continue
      for (const file of readdirSync(folder, { recursive: true, encoding: "utf8" })) {
        if (!file.endsWith(".png") || expected.has(file.split("\\").join("/"))) continue
        rmSync(`${folder}/${file}`)
        removed++
      }
    }
    if (removed) console.log(`[visual] ${os}:  removed ${removed} baseline(s) no example makes any more`)
  }

  ////////////////
  // ## Server
  ////////////////

  /**
   * Start the Vite dev server (the repo's `vite.config.ts`) and warm the fixture up;  resolves with its origin.
   * - No HMR, no WebSocket:  a page must never reload itself mid-capture, and a remote (Docker) browser can't reach
   *   a socket anyway.
   * - `optimizeDeps.entries` = the fixture, so the dependency scan covers what the pages import and Vite doesn't
   *   re-optimize (and reload) on a first request.
   * - `StaticPages` serves `/static/...`;  with `--static` its stylesheet is fetched once up front:  that starts its
   *   SSR renderer before parallel workers ask, and a render setup that fails stops the run with its error.
   */
  private async startServer(): Promise<string> {
    this.server = await createServer({
      root: VisualSettings.ROOT,
      configFile: `${VisualSettings.ROOT}vite.config.ts`,
      logLevel: "warn",
      server: { port: VisualRunner.PORT, strictPort: false, hmr: false, ws: false, open: false },
      optimizeDeps: { entries: [VisualSettings.FIXTURE.slice(1)] },
      plugins: [new StaticPages().plugin()]
    })
    await this.server.listen()
    const origin = (this.server.resolvedUrls?.local[0] ?? `http://localhost:${VisualRunner.PORT}/`).replace(/\/$/, "")
    // warm-up:  transform the page and its module graph once, before a browser asks
    await fetch(`${origin}${VisualSettings.FIXTURE}`)
    await this.server.warmupRequest("/tools/visual/fixture.ts")
    if (this.options.static) {
      const response = await fetch(`${origin}${VisualSettings.STATIC_PAGES}ui.css`)
      if (!response.ok) throw new VisualError(`static pages:  ${await response.text()}`)
    }
    console.log(`[visual] dev server:  ${origin}`)
    return origin
  }

  ////////////////
  // ## Cleanup
  ////////////////

  /** Stop the child, the container and the server;  safe to call twice. */
  private async cleanup() {
    this.child?.kill("SIGINT")
    this.docker?.stop()
    this.docker = undefined
    await this.server?.close()
    this.server = undefined
  }

  /**
   * Ctrl-C / SIGTERM:  clean up, then exit 130;  plain `exit` still removes the container.
   * - The child is in our process group, so a terminal Ctrl-C reaches it too;  `kill` covers a signal sent to us
   *   alone.
   */
  private trapSignals() {
    const onSignal = () => {
      console.log("\n[visual] interrupted:  cleaning up ...")
      void this.cleanup().finally(() => process.exit(130))
    }
    process.once("SIGINT", onSignal)
    process.once("SIGTERM", onSignal)
    process.once("exit", () => this.docker?.stop())
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** HTML report folder of `os`, relative to the root. */
  private reportFolder(os: VisualOs): string {
    return `tools/results/visual/${VisualSettings.osFolder(os)}/report`
  }

  /**
   * Playwright `--grep` for families or single examples:  matches at the start of a title segment, so `item`
   * doesn't select `items`.
   * - A family is its folder, `ui-button`;  the `ui-` may be left out (`button` ~== `ui-button`)
   * - `button` => every `ui-button/...` test;  `modal/types` => that example's tests only
   * - `button,ui-modal/types` => `(^| )ui-(button/|modal/types( |$))`
   */
  static grep(targets: readonly string[]): string {
    const parts = targets.map((target) => target.replace(/[^\w/-]/g, "").replace(/^ui-/, "")).filter(Boolean)
    return `(^| )ui-(${parts.map((part) => (part.includes("/") ? `${part}( |$)` : `${part}/`)).join("|")})`
  }
}

/** Constructor options of `VisualRunner` (from the CLI's flags). */
export type VisualRunnerOptions = {
  /** OSes to run, in order */
  oses: readonly VisualOs[]
  /** Playwright projects to run */
  browsers: readonly VisualBrowser[]
  /** accept the new renders as baselines (`--update-snapshots=changed`) */
  update: boolean
  /** families (`ui-button`, or `button`) or examples (`ui-modal/types`) to run;  all when empty */
  grep?: readonly string[]
  /** add the class-grammar vs elements comparison */
  parity: boolean
  /** run ONLY the static render vs elements comparison (`StaticFamilies`' examples) */
  static: boolean
  /** Playwright workers, e.g. `4` or `50%` */
  workers?: string
}
