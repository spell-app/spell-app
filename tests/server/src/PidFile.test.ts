import { spawn, type ChildProcess } from "node:child_process"
import { mkdirSync, mkdtempSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { SRV } from "$/server"

describe("newestChange()", () => {
  let folder: string

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), "newest-change-"))
  })

  afterEach(() => rmSync(folder, { recursive: true, force: true }))

  /** write `path` under the folder, last modified `seconds` after the epoch */
  function file(path: string, seconds: number) {
    const full = join(folder, path)
    mkdirSync(join(full, ".."), { recursive: true })
    writeFileSync(full, "")
    utimesSync(full, seconds, seconds)
  }

  it("the newest code file, all the way down;  0 for none or a missing folder", () => {
    expect(SRV.newestChange([folder, join(folder, "missing")])).toBe(0)
    file("a.ts", 100)
    file("page/deep/b.js", 300)
    file("c.mjs", 200)
    expect(SRV.newestChange([folder])).toBe(300_000)
  })

  it("skips what isn't the server's code:  other files, node_modules, _assets, dot folders", () => {
    file("a.ts", 100)
    file("notes.md", 900)
    file("node_modules/x/index.js", 900)
    file("_assets/spell-ui.js", 900)
    file(".cache/y.ts", 900)
    expect(SRV.newestChange([folder])).toBe(100_000)
  })
})

describe("PidFile.ensure(), a server on older code", () => {
  let root: string
  let old: ChildProcess | undefined

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "pid-file-")))
  })

  afterEach(() => {
    old?.kill("SIGKILL")
    rmSync(root, { recursive: true, force: true })
  })

  // its own process:  `process.kill()` on it must not reach the test runner
  it("stops this root's server that holds its port but doesn't answer SERVER_API, then starts a fresh one", async () => {
    old = spawn(process.execPath, ["-e", SERVER_404], { stdio: ["ignore", "pipe", "ignore"] })
    const port = Number(await new Promise<string>((done) => old!.stdout!.once("data", (data) => done(String(data)))))
    const pidFile = new SRV.PidFile(root)
    pidFile.write({ pid: old.pid!, port, root, started: new Date().toISOString() })
    expect(await pidFile.status()).toBeUndefined()
    const fresh = await pidFile.ensure({ command: [process.execPath, "-e", serverAnswering(root)], timeout: 5000 })
    expect(fresh.launched).toBe(true)
    expect(old.exitCode !== null || old.signalCode !== null).toBe(true)
    await pidFile.stop()
  })
})

describe("PidFile.stop():  waits for the PROCESS, not just for it to stop answering", () => {
  let root: string
  let server: ChildProcess | undefined

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "pid-file-stop-")))
  })

  afterEach(() => {
    server?.kill("SIGKILL")
    rmSync(root, { recursive: true, force: true })
  })

  /** run `code` (a server answering for the root, `serverAnswering()`), wait for it to answer;  its pid file */
  async function start(code: string): Promise<SRV.PidFile> {
    server = spawn(process.execPath, ["-e", code], { stdio: "ignore" })
    const pidFile = new SRV.PidFile(root)
    await vi.waitFor(async () => expect(await pidFile.status()).toBeDefined(), { timeout: 5000, interval: 50 })
    return pidFile
  }

  // the bug it fixes:  `ensure()` started the new server while the old one still held the port (epic `airplane`)
  it("a server that stops answering at once but takes a while to end:  returns once it HAS ended", async () => {
    const pidFile = await start(serverAnswering(root, { onTerm: "close, then exit after 800ms" }))
    const stopped = await pidFile.stop()
    expect(stopped).toBe(true)
    expect(alive(server!.pid!)).toBe(false)
  })

  it("a server that won't end:  SIGKILL once the wait is up", async () => {
    const pidFile = await start(serverAnswering(root, { onTerm: "ignore" }))
    const begun = Date.now()
    expect(await pidFile.stop({ wait: 500 })).toBe(true)
    expect(Date.now() - begun).toBeGreaterThanOrEqual(500)
    expect(alive(server!.pid!)).toBe(false)
  })

  it("nothing running:  false", async () => {
    expect(await new SRV.PidFile(root).stop()).toBe(false)
  })
})

/** Is `pid` still there?  (`stop()` returns only once node has reaped its child, so no zombie counts.) */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/** A server on code before `/api/server`:  every path a 404;  prints its port. */
const SERVER_404 =
  "const s = require('node:http').createServer((q, r) => { r.statusCode = 404; r.end() });" +
  "s.listen(0, '127.0.0.1', () => console.log(s.address().port))"

/**
 * A server answering `SERVER_API` for `root`, writing its pid file there.
 * - `onTerm`, on `SIGTERM`:  exit (the default);  stop answering at once, but end only 800ms later (as the page
 *   server does while its route modules stop);  or ignore it
 */
function serverAnswering(root: string, { onTerm = "exit" }: { onTerm?: TermBehaviour } = {}): string {
  return (
    `const fs = require('node:fs'); const s = require('node:http').createServer((q, r) => {` +
    `if (q.url === '${SRV.SERVER_API}') { r.setHeader('content-type', 'application/json');` +
    `r.end(JSON.stringify({ pid: process.pid, port: s.address().port, root: ${JSON.stringify(root)}, started: new Date().toISOString() })) }` +
    `else { r.statusCode = 404; r.end() } });` +
    `s.listen(0, '127.0.0.1', () => fs.writeFileSync(${JSON.stringify(join(root, ".spell-server.json"))},` +
    `JSON.stringify({ pid: process.pid, port: s.address().port, root: ${JSON.stringify(root)}, started: new Date().toISOString() })));` +
    `process.on('SIGTERM', () => { ${ON_TERM[onTerm]} })`
  )
}

/** What `serverAnswering()`'s server does on `SIGTERM`. */
type TermBehaviour = "exit" | "close, then exit after 800ms" | "ignore"

/** Each `TermBehaviour`, as code. */
const ON_TERM: Record<TermBehaviour, string> = {
  exit: "process.exit(0)",
  "close, then exit after 800ms": "s.close(); s.closeAllConnections(); setTimeout(() => process.exit(0), 800)",
  ignore: ""
}
