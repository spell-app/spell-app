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

import { Window, mainRoot, tint } from "./window.mjs"

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

test("a worktree's window:  its own root and package, the package's theme, tinted", () => {
  const workspace = Window.worktreeWorkspace("ui", "seo")
  assert.deepEqual(workspace.folders, [
    { path: "seo", name: "spell-app ⎇ seo" },
    { path: "seo/packages/ui", name: "ui ⎇ seo" }
  ])
  assert.equal(workspace.settings["workbench.colorTheme"], Window.theme("ui"))
  assert.deepEqual(workspace.settings["workbench.colorCustomizations"], tint("seo"))
  assert.match(Window.worktreeFile("seo"), /\/\.claude\/worktrees\/seo\.code-workspace$/)
})

test("tint():  a dark hue per name, the same every time", () => {
  const colours = tint("seo")
  assert.match(colours["titleBar.activeBackground"], /^#[0-9a-f]{6}$/)
  assert.deepEqual(tint("seo"), colours)
  assert.notEqual(tint("docs-index")["titleBar.activeBackground"], colours["titleBar.activeBackground"])
  const [r, g, b] = colours["titleBar.activeBackground"]
    .slice(1)
    .match(/../g)
    .map((hex) => parseInt(hex, 16))
  assert.ok(Math.max(r, g, b) < 0xb0, "dark enough for white text")
})

test("mainRoot():  the checkout a worktree is in;  a main checkout is its own", () => {
  assert.equal(mainRoot("/repo/.claude/worktrees/seo"), "/repo")
  assert.equal(mainRoot("/repo"), "/repo")
})

test("packageOf():  a package window's package, else null", () => {
  assert.equal(Window.packageOf({ workspaceFile: "/repo/packages/ui/ui.code-workspace" }), "ui")
  assert.equal(Window.packageOf({ workspaceFile: "/repo/.claude/worktrees/seo.code-workspace" }), null)
  assert.equal(Window.packageOf(null), null)
})

test("close():  asks the worktree's window to close", async () => {
  const seen = []
  const server = createServer((request, response) => {
    seen.push(request.url)
    request.resume()
    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(JSON.stringify({ ok: true, closing: true }))
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const name = `test-${process.pid}`
  const entry = { pid: process.ppid, port: server.address().port, token: "t", folders: [] }
  entry.workspaceFile = Window.worktreeFile(name)
  writeFileSync(join(dir, `${process.ppid}.json`), JSON.stringify(entry))
  try {
    assert.equal(await Window.close(name), true)
    assert.deepEqual(seen, ["/close-window"])
    assert.equal(await Window.close("not-open"), false)
  } finally {
    server.close()
  }
})

/** Write a registry entry for `pid` with `folders`. */
function register(pid, folders) {
  const entry = { pid, port: 1, token: "t", workspaceFile: null, folders }
  writeFileSync(join(dir, `${pid}.json`), JSON.stringify(entry))
}
