import { spawn, type ChildProcess } from "node:child_process"
import { createWriteStream, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

import { SRV } from "$/server"
import environment from "$/spell/node/environment"

/**
 * The editor UI -- vite's dev server for `packages/app` (what `yarn start:dev` runs), with hot reload -- as a child
 * of the PAGE server:  it starts when the page server listens, and stops when it stops (`appRoutes.ts`).  So however
 * the page server starts -- `yarn server`, `spell serve`, an opener, VS Code -- the site header's "Editor" works.
 * - Port:  `SPELL_EDITOR_PORT`, else `VITE_PORT`, else 3000, if free;  taken (another checkout's editor):  any free
 *   one.  The real URL goes in `<root>/.spell-server.editor.json` (`EDITOR_FILE`) once it answers, where `/editor`
 *   and `spell serve` find it.
 * - It reaches the page server's `/api` through vite's proxy, by IP:  `localhost` may be ::1 first, where the page
 *   server doesn't listen.
 * - Its output goes to `<root>/.spell-server.editor.log`, through a pipe:  the record is written when vite itself
 *   says it's ready.
 * - Runs vite's own script with this `node`, NOT `yarn start:dev`:  a page server launched by a `yarn` script
 *   (`yarn server ensure`) inherits a PATH whose `yarn` is a temporary shim, gone once that script exits.
 * - `SPELL_NO_EDITOR=1`:  don't start it.
 * - NOTE: if the page server dies without stopping (kill -9), vite keeps running:  `yarn stop` in `packages/app`.
 */
export class EditorServer {
  /** the checkout */
  readonly root: string

  /** the running vite, in its own process group */
  private child?: ChildProcess

  constructor(root: string) {
    this.root = root
  }

  /** `<root>/.spell-server.editor.json`:  `{ url, pid }` of the running editor */
  get recordFile(): string {
    return join(this.root, EDITOR_FILE)
  }

  /**
   * Start vite, talking to the page server on `pagePort`;  resolves at once (vite takes seconds:  the page server
   * doesn't wait), and records the editor's URL once it answers.
   */
  async start(pagePort: number): Promise<void> {
    if (process.env.SPELL_NO_EDITOR || this.child) return
    const port = await editorPort()
    const log = createWriteStream(join(this.root, ".spell-server.editor.log"), { flags: "a" })
    const env = { ...process.env, VITE_PORT: String(port), PORT: String(pagePort), API_SERVER: "127.0.0.1" }
    const child = spawn(process.execPath, [VITE, "--port", String(port), "--strictPort"], {
      cwd: APP_DIR,
      env,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"]
    })
    this.child = child
    child.on("exit", () => {
      if (this.child === child) this.stop()
    })
    // its output to the log -- and the record once IT says it's ready:  a fetch could be answered by another
    // checkout's editor holding the port, before ours fails with "already in use" (`--strictPort`)
    let output = ""
    let ready = false
    const watch = (data: Buffer) => {
      log.write(data)
      if (ready) return
      output += data
      if (!READY.test(output)) return
      ready = true
      if (this.child === child) this.record(`http://localhost:${port}/`, child)
    }
    child.stdout!.on("data", watch)
    child.stderr!.on("data", watch)
  }

  /** stop vite and everything it started, and forget its record */
  stop(): void {
    const pid = this.child?.pid
    this.child = undefined
    rmSync(this.recordFile, { force: true })
    if (!pid) return
    try {
      process.kill(-pid, "SIGTERM")
    } catch {
      // already gone
    }
  }

  /** Write the record:  `url` is `child`'s, which said it's ready. */
  private record(url: string, child: ChildProcess): void {
    writeFileSync(this.recordFile, `${JSON.stringify({ url, pid: child.pid }, null, 2)}\n`)
  }
}

/** Where the editor is recorded, relative to the checkout:  read by `appRoutes.ts`'s `/editor` and `spell serve`. */
export const EDITOR_FILE = ".spell-server.editor.json"

/** `packages/app`, where vite runs (its `vite.config.ts`). */
const APP_DIR = join(environment.packagesDir, "app")

/** vite's command-line script, as `packages/app` resolves it. */
const VITE = join(dirname(createRequire(join(APP_DIR, "package.json")).resolve("vite/package.json")), "bin/vite.js")

/** What vite prints once it listens, e.g. `VITE v8.3.1  ready in 226 ms`. */
const READY = /\bready in\b/

/**
 * The editor's port:  the wanted one if free on IPv4 AND IPv6 (vite listens on 0.0.0.0), else any free one.
 * - NOTE: both:  on macOS `::` binds even while another process holds `0.0.0.0:<port>` -- another checkout's editor.
 */
async function editorPort(): Promise<number> {
  const wanted = Number(process.env.SPELL_EDITOR_PORT) || environment.vitePort
  const free = (await SRV.isFree(wanted, "0.0.0.0")) && (await SRV.isFree(wanted, "::"))
  return free ? wanted : SRV.freePort()
}
