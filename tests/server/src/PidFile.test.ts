import { spawn, type ChildProcess } from "node:child_process"
import { mkdirSync, mkdtempSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"

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

/** A server on code before `/api/server`:  every path a 404;  prints its port. */
const SERVER_404 =
  "const s = require('node:http').createServer((q, r) => { r.statusCode = 404; r.end() });" +
  "s.listen(0, '127.0.0.1', () => console.log(s.address().port))"

/** A server answering `SERVER_API` for `root`, writing its pid file there. */
function serverAnswering(root: string): string {
  return (
    `const fs = require('node:fs'); const s = require('node:http').createServer((q, r) => {` +
    `if (q.url === '${SRV.SERVER_API}') { r.setHeader('content-type', 'application/json');` +
    `r.end(JSON.stringify({ pid: process.pid, port: s.address().port, root: ${JSON.stringify(root)}, started: new Date().toISOString() })) }` +
    `else { r.statusCode = 404; r.end() } });` +
    `s.listen(0, '127.0.0.1', () => fs.writeFileSync(${JSON.stringify(join(root, ".spell-server.json"))},` +
    `JSON.stringify({ pid: process.pid, port: s.address().port, root: ${JSON.stringify(root)}, started: new Date().toISOString() })));` +
    `process.on('SIGTERM', () => process.exit(0))`
  )
}
