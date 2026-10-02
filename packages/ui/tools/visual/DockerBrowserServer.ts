/// <reference types="node" />

import { spawnSync, type SpawnSyncReturns } from "node:child_process"
import { existsSync } from "node:fs"

import { SRV } from "$/server"

import { NodePackage } from "../NodePackage.ts"
import { VisualError } from "./visual.types.ts"
import { VisualSettings } from "./VisualSettings.ts"

/**
 * A Playwright browser server in the OFFICIAL Playwright Docker image, for `yarn test:visual --os linux`:  the
 * tests run on the host and connect to it, so Linux renders the pixels.
 * - Why only the browsers:  our `node_modules` hold macOS-native binaries (rolldown, lightningcss, oxc), so the dev
 *   server and the test runner can't run in the container.
 * - Image:  `mcr.microsoft.com/playwright:v<version>-noble`, `<version>` = the installed `@playwright/test`;
 *   client, server and browser builds MUST match.
 * - Server:  the host's own `node_modules/playwright-core` (pure JS, no dependencies) mounted read-only and run
 *   with the image's Node -- same version by construction, no `npx` download at every start.
 * - Docker handling (`start()`):
 *   - no `docker` CLI and no Docker Desktop app => `VisualError` saying so
 *   - daemon down => start Docker Desktop (`open -a Docker`, macOS) and poll `docker info` until `DAEMON_TIMEOUT`
 *   - the image is pulled on first use
 * - SIDE EFFECT: one container per run (`--rm`), named `spell-ui-visual-<pid>`;  `stop()` removes it.  The runner
 *   calls `stop()` on success, failure, Ctrl-C and exit.
 */
export class DockerBrowserServer {
  /** How long to wait for a starting Docker daemon, ms. */
  static readonly DAEMON_TIMEOUT = 180_000
  /** How long to wait for the browser server to listen, ms. */
  static readonly SERVER_TIMEOUT = 60_000
  /** Docker Desktop on macOS. */
  static readonly DESKTOP_APP = "/Applications/Docker.app"
  /** The CLI inside Docker Desktop, used when `docker` isn't on `PATH`. */
  static readonly DESKTOP_CLI = `${DockerBrowserServer.DESKTOP_APP}/Contents/Resources/bin/docker`

  /** Playwright version:  image tag and server. */
  readonly version: string
  /** container name */
  readonly name = `spell-ui-visual-${process.pid}`
  /** the `docker` executable, once found */
  private docker = "docker"
  /** a container is (probably) running */
  private running = false

  constructor(version = VisualSettings.playwrightVersion()) {
    this.version = version
  }

  /** The image this server runs. */
  get image(): string {
    return `mcr.microsoft.com/playwright:v${this.version}-noble`
  }

  ////////////////
  // ## Lifecycle
  ////////////////

  /** Make sure Docker runs, start the container, wait until it listens;  resolves with its `ws://` endpoint. */
  async start(): Promise<string> {
    this.locate()
    await this.ensureDaemon()
    this.ensureImage()
    const port = await DockerBrowserServer.freePort()
    const core = NodePackage.need("playwright-core")
    const run = this.exec([
      "run",
      "--detach",
      "--rm",
      "--init",
      "--ipc=host",
      "--name",
      this.name,
      "--publish",
      `127.0.0.1:${port}:3000`,
      "--volume",
      `${core}:/opt/playwright-core:ro`,
      "--workdir",
      "/home/pwuser",
      "--user",
      "pwuser",
      this.image,
      "node",
      "/opt/playwright-core/cli.js",
      "run-server",
      "--port",
      "3000",
      "--host",
      "0.0.0.0"
    ])
    if (run.status !== 0) throw new VisualError(`docker run failed:\n${run.stderr}`)
    this.running = true
    await this.waitListening()
    return `ws://127.0.0.1:${port}/`
  }

  /**
   * Remove the container, if one was started.  Synchronous, so exit / signal handlers can call it.
   * - Idempotent.
   */
  stop(): void {
    if (!this.running) return
    this.running = false
    this.exec(["rm", "--force", this.name])
  }

  ////////////////
  // ## Docker
  ////////////////

  /**
   * Find the `docker` CLI:  on `PATH`, else inside Docker Desktop.
   * - Neither => `VisualError`:  nothing to start.
   */
  private locate() {
    if (DockerBrowserServer.works(spawnSync("docker", ["--version"], { encoding: "utf8" }))) return
    if (existsSync(DockerBrowserServer.DESKTOP_CLI)) {
      this.docker = DockerBrowserServer.DESKTOP_CLI
      return
    }
    throw new VisualError(
      "Docker isn't installed:  `--os linux` renders in Playwright's Docker image.\n" +
        "Install Docker Desktop (https://docs.docker.com/desktop/), or run `yarn test:visual --os local`."
    )
  }

  /**
   * Make sure the daemon answers;  start Docker Desktop if not (macOS), and wait.
   * - Elsewhere (Linux) a stopped daemon is left to the person:  starting it needs root.
   */
  private async ensureDaemon() {
    if (this.daemonUp()) return
    if (process.platform !== "darwin") {
      throw new VisualError("The Docker daemon isn't running.  Start it (e.g. `sudo systemctl start docker`).")
    }
    console.log("[visual] Docker isn't running:  starting Docker Desktop ...")
    spawnSync("open", ["-a", "Docker"])
    const deadline = Date.now() + DockerBrowserServer.DAEMON_TIMEOUT
    while (Date.now() < deadline) {
      await DockerBrowserServer.sleep(2000)
      if (this.daemonUp()) {
        console.log("[visual] Docker is up")
        return
      }
    }
    throw new VisualError(
      `Docker Desktop didn't start within ${DockerBrowserServer.DAEMON_TIMEOUT / 1000}s ` +
        "(`docker info` still fails).  Open Docker Desktop and look for an error or an update prompt, " +
        'then run again.  See `docs/visual-testing.md`, "Troubleshooting".'
    )
  }

  /** Pull the image unless it's there;  progress goes to the terminal. */
  private ensureImage() {
    if (this.exec(["image", "inspect", this.image]).status === 0) return
    console.log(`[visual] pulling ${this.image} (once) ...`)
    const pull = spawnSync(this.docker, ["pull", this.image], { stdio: "inherit" })
    if (pull.status !== 0) throw new VisualError(`docker pull ${this.image} failed`)
  }

  /** Wait for the server's "Listening on" line;  a container that exits early fails with its logs. */
  private async waitListening() {
    const deadline = Date.now() + DockerBrowserServer.SERVER_TIMEOUT
    while (Date.now() < deadline) {
      const logs = this.exec(["logs", this.name])
      if (/Listening on/.test(`${logs.stdout}${logs.stderr}`)) return
      if (logs.status !== 0) {
        this.running = false
        throw new VisualError(`the browser server container exited:\n${logs.stderr}`)
      }
      await DockerBrowserServer.sleep(250)
    }
    const logs = this.exec(["logs", this.name])
    this.stop()
    throw new VisualError(`the browser server didn't start:\n${logs.stdout}${logs.stderr}`)
  }

  /** The daemon answers `docker info`. */
  private daemonUp(): boolean {
    return this.exec(["info"]).status === 0
  }

  /** Run `docker <args>`, capturing output. */
  private exec(args: string[]): SpawnSyncReturns<string> {
    return spawnSync(this.docker, args, { encoding: "utf8" })
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A spawn that ran and exited 0. */
  private static works(result: SpawnSyncReturns<string>): boolean {
    return !result.error && result.status === 0
  }

  /** A free TCP port on the loopback. */
  private static freePort(): Promise<number> {
    return SRV.freePort()
  }

  /** Wait `ms`. */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
