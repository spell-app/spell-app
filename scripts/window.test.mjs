/**
 * `node --test scripts/window.test.mjs`:  how `Window.current()` finds a session's window, and `Window.request()`.
 * - Registry entries go in a temp folder (`SPELL_WINDOWS_DIR`), never `~/.spell/windows`.
 * - The "window" is a stand-in:  our own parent pid (an ancestor, like a session's extension host), a `sleep`
 *   child (alive, but not an ancestor), or a pid that has exited.
 */
import assert from "node:assert/strict"
import { spawn, spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, beforeEach, test } from "node:test"

import { Window } from "./window.mjs"

/** The temp registry folder. */
const dir = mkdtempSync(join(tmpdir(), "spell-windows-"))
process.env.SPELL_WINDOWS_DIR = dir

/** A live process that isn't our ancestor:  a `sleep`, killed after the tests. */
const sleeper = spawn("sleep", ["60"], { stdio: "ignore" })

/** A pid that has exited. */
const dead = spawnSync("true").pid

beforeEach(() => {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir)
})

after(() => {
  sleeper.kill()
  rmSync(dir, { recursive: true, force: true })
})

test("no registry entries:  no window", () => {
  assert.equal(Window.current(), null)
})

test("finds the entry of an ANCESTOR pid (our parent), over a cwd match", () => {
  register(sleeper.pid, ["/repo", process.cwd()])
  register(process.ppid, ["/repo", "/somewhere/else"])
  assert.equal(Window.current()?.pid, process.ppid)
})

test("no ancestor:  falls back to the window with cwd in a folder after the first", () => {
  register(sleeper.pid, ["/repo", process.cwd()])
  assert.equal(Window.current()?.pid, sleeper.pid)
})

test("never matches cwd against the FIRST folder (the repo root, in every window)", () => {
  register(sleeper.pid, [process.cwd(), "/somewhere/else"])
  assert.equal(Window.current(), null)
})

test("skips a dead pid's entry", () => {
  register(dead, ["/repo", process.cwd()])
  assert.equal(Window.current(), null)
})

test("request():  POSTs the op with the token;  throws the window's error", async () => {
  const seen = []
  const server = createServer((request, response) => {
    let body = ""
    request.on("data", (chunk) => (body += chunk))
    request.on("end", () => {
      seen.push({ url: request.url, auth: request.headers.authorization, body: JSON.parse(body) })
      const ok = request.url === "/show-doc"
      response.writeHead(ok ? 200 : 404, { "Content-Type": "application/json" })
      response.end(JSON.stringify(ok ? { ok: true, file: "/x.html" } : { ok: false, error: "unknown op" }))
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const window = { pid: process.ppid, port: server.address().port, token: "abc", folders: [] }
  try {
    assert.deepEqual(await Window.request("show-doc", { file: "/x.html" }, window), { ok: true, file: "/x.html" })
    assert.deepEqual(seen[0], { url: "/show-doc", auth: "Bearer abc", body: { file: "/x.html" } })
    await assert.rejects(Window.request("nope", {}, window), /`nope` failed:  unknown op/)
  } finally {
    server.close()
  }
})

test("request():  no window, or none listening, throws a clear error", async () => {
  await assert.rejects(Window.request("show-doc", {}, null), /no window/)
  const window = { pid: process.ppid, port: 1, token: "abc", folders: [] }
  await assert.rejects(Window.request("show-doc", {}, window), /didn't answer on port 1/)
})

/** Write a registry entry for `pid` with `folders`. */
function register(pid, folders) {
  const entry = { pid, port: 1, token: "t", workspaceFile: null, folders }
  writeFileSync(join(dir, `${pid}.json`), JSON.stringify(entry))
}
