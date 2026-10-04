/**
 * `node --test scripts/window.test.mjs`:  how `Window.current()` finds a session's window, `Window.request()`,
 * the worktree windows' moves, and `stay-check`'s advice.
 * - Registry entries go in a temp folder (`SPELL_WINDOWS_DIR`), never `~/.spell/windows`.
 * - The "window" is a stand-in:  our own parent pid (an ancestor, like a session's extension host), a `sleep`
 *   child (alive, but not an ancestor), or a pid that has exited.
 */
import assert from "node:assert/strict"
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, beforeEach, test } from "node:test"

import {
  Window,
  claudeSessions,
  mainRoot,
  parseLsof,
  processTable,
  stayAdvice,
  tint,
  worktreeOf
} from "./window.mjs"

/** The temp registry folder. */
const dir = mkdtempSync(join(tmpdir(), "spell-windows-"))
process.env.SPELL_WINDOWS_DIR = dir

/** A live process that isn't our ancestor:  a `sleep`, killed after the tests. */
const sleeper = spawn("sleep", ["60"], { stdio: "ignore" })

/** A Claude Code session id. */
const SESSION = "476d3ed5-a6ab-45fb-ae80-323bd1948901"

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

test("a worktree's window:  the main root first, then the worktree's package and root;  theme, tinted", () => {
  const workspace = Window.worktreeWorkspace("ui", "seo")
  assert.deepEqual(workspace.folders, [
    { path: "../..", name: "spell-app" },
    { path: "../../.claude/worktrees/seo/packages/ui", name: "ui ⎇ seo" },
    { path: "../../.claude/worktrees/seo", name: "spell-app ⎇ seo" }
  ])
  assert.equal(workspace.settings["workbench.colorTheme"], Window.theme("ui"))
  assert.deepEqual(workspace.settings["workbench.colorCustomizations"], tint("seo"))
  assert.match(Window.worktreeFile("seo"), /\/workspaces\/ongoing\/seo\.code-workspace$/)
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
  assert.equal(Window.packageOf({ workspaceFile: "/repo/workspaces/ui.code-workspace" }), "ui")
  assert.equal(Window.packageOf({ workspaceFile: "/repo/workspaces/ongoing/seo.code-workspace" }), null)
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

test("resume():  opens the session in the target window, then closes its tab, or its window, in the old one", async () => {
  const seen = []
  const server = createServer((request, response) => {
    let body = ""
    request.on("data", (chunk) => (body += chunk))
    request.on("end", () => {
      seen.push([request.url, JSON.parse(body)])
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ ok: true, closed: true }))
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const to = join(dir, "target.code-workspace")
  const port = server.address().port
  writeFileSync(to, "{}")
  const target = { pid: process.ppid, port, token: "t", folders: [], workspaceFile: to }
  writeFileSync(join(dir, `${process.ppid}.json`), JSON.stringify(target))
  const old = { pid: sleeper.pid, port, token: "t", folders: [], workspaceFile: null }
  writeFileSync(join(dir, `${sleeper.pid}.json`), JSON.stringify(old))
  const remove = join(dir, "remove-me")
  writeFileSync(remove, "")
  try {
    const tab = { sessionId: SESSION, to, from: sleeper.pid, close: "tab", remove: null }
    const expected = { opened: true, closed: true, matches: undefined, shown: undefined }
    assert.deepEqual(await Window.resume(tab, "isolate-me"), expected)
    assert.deepEqual(seen.splice(0), [
      ["/open-session", { sessionId: SESSION }],
      ["/close-session-tab", { titles: ["isolate-me"] }]
    ])
    // a doc asked for while the move was pending:  shown beside the session, before the old tab closes
    const show = { file: "/plan.html", hash: "p2" }
    assert.equal((await Window.resume({ ...tab, show }, "isolate-me")).shown, true)
    assert.deepEqual(seen.splice(0), [
      ["/open-session", { sessionId: SESSION }],
      ["/show-doc", show],
      ["/close-session-tab", { titles: ["isolate-me"] }]
    ])
    // a prompt to type into the new tab, and every title the old tab may show
    assert.equal((await Window.resume({ ...tab, prompt: "continue" }, ["iso", "Claude's title"])).closed, true)
    assert.deepEqual(seen.splice(0), [
      ["/open-session", { sessionId: SESSION, prompt: "continue" }],
      ["/close-session-tab", { titles: ["iso", "Claude's title"] }]
    ])
    // no title at all:  the old tab can't be found, so stays
    assert.equal((await Window.resume(tab)).closed, false)
    assert.deepEqual(seen.splice(0), [["/open-session", { sessionId: SESSION }]])
    const window = { ...tab, close: "window", remove }
    assert.equal((await Window.resume(window)).closed, true)
    assert.deepEqual(seen.splice(0), [
      ["/open-session", { sessionId: SESSION }],
      ["/close-window", {}]
    ])
    assert.equal(existsSync(remove), false)
    await assert.rejects(Window.resume({ ...tab, sessionId: "nope" }), /bad session id/)
  } finally {
    server.close()
  }
})

test("handoff():  records the move, keyed by session;  needs a session and the window file", () => {
  const name = `test-${process.pid}`
  assert.throws(() => Window.handoff(name, undefined), /no session/)
  assert.throws(() => Window.handoff(name, SESSION), /no window file/)
  mkdirSync(dirname(Window.worktreeFile(name)), { recursive: true })
  writeFileSync(Window.worktreeFile(name), JSON.stringify(Window.worktreeWorkspace("ui", name)))
  try {
    const handoff = Window.handoff(name, SESSION)
    assert.equal(handoff.to, Window.worktreeFile(name))
    assert.equal(handoff.close, "tab")
    assert.equal(handoff.prompt, null)
    assert.deepEqual(JSON.parse(readFileSync(Window.handoffFile(SESSION), "utf8")), handoff)
    assert.equal(Window.handoff(name, SESSION, { prompt: "continue" }).prompt, "continue")
    // not in the worktree's window:  nothing to move back
    assert.equal(Window.handoff(name, SESSION, { back: true }), null)
    const worktree = { pid: process.ppid, port: 1, token: "t", folders: [], workspaceFile: Window.worktreeFile(name) }
    writeFileSync(join(dir, `${process.ppid}.json`), JSON.stringify(worktree))
    const back = Window.handoff(name, SESSION, { back: true })
    assert.match(back.to, /workspaces\/ui\.code-workspace$/)
    assert.equal(back.to.includes(".claude"), false)
    assert.equal(back.close, "window")
    assert.equal(back.remove, Window.worktreeFile(name))
  } finally {
    rmSync(Window.worktreeFile(name), { force: true })
  }
})

test("show():  while a move is pending, the doc waits for the target window;  the last one wins", async () => {
  const record = { sessionId: SESSION, to: "/repo/workspaces/ongoing/seo.code-workspace", show: null }
  mkdirSync(Window.handoffs, { recursive: true })
  writeFileSync(Window.handoffFile(SESSION), JSON.stringify(record))
  try {
    assert.deepEqual(await Window.show("/a.html", { sessionId: SESSION }), { later: record.to })
    assert.deepEqual(await Window.show("/b.html", { hash: "g1", sessionId: SESSION }), { later: record.to })
    const { show } = JSON.parse(readFileSync(Window.handoffFile(SESSION), "utf8"))
    assert.deepEqual(show, { file: "/b.html", hash: "g1" })
  } finally {
    rmSync(Window.handoffFile(SESSION), { force: true })
  }
  // nothing pending, and no window:  `request()`'s error
  await assert.rejects(Window.show("/a.html", { sessionId: SESSION }), /no window/)
})

test("processTable() + claudeSessions():  a window's sessions are its extension host's `claude` children", () => {
  const ps = [
    "  100     1 /Applications/Visual Studio Code.app/Contents/MacOS/Code",
    "  200   100 /Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Plugin).app/Contents/MacOS/Code Helper (Plugin)",
    "  301   200 /Users/o/.vscode/extensions/anthropic.claude-code-2.1.288-darwin-arm64/resources/native-binary/claude",
    "  302   200 /Users/o/.vscode/extensions/anthropic.claude-code-2.1.288-darwin-arm64/resources/native-binary/claude",
    "  303   200 node",
    "  400   999 /Users/o/.local/bin/claude"
  ].join("\n")
  const processes = processTable(ps)
  assert.deepEqual(processes.get(200), {
    ppid: 100,
    command:
      "/Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Plugin).app/Contents/MacOS/Code Helper (Plugin)"
  })
  assert.deepEqual(claudeSessions(processes, 200), [301, 302])
  assert.deepEqual(claudeSessions(processes, 999), [400])
})

test("parseLsof() + worktreeOf():  each session's folder, and the worktree it's in", () => {
  const cwds = parseLsof("p301\nfcwd\nn/repo/.claude/worktrees/seo/packages/ui\np302\nfcwd\nn/repo\n")
  assert.deepEqual([...cwds], [
    [301, "/repo/.claude/worktrees/seo/packages/ui"],
    [302, "/repo"]
  ])
  assert.equal(worktreeOf(cwds.get(301)), "seo")
  assert.equal(worktreeOf(cwds.get(302)), null)
  assert.equal(worktreeOf(null), null)
})

test("stayAdvice():  stay when it's the window's only session;  else a window of its own, saying why", () => {
  const window = { pid: 200 }
  const alone = stayAdvice({ window })
  assert.equal(alone.recommend, "stay")
  assert.equal(alone.reasons.length, 1)
  assert.match(stayAdvice({ window, epic: true }).reasons.join(), /side bar/)

  const shared = stayAdvice({
    window,
    others: [
      { pid: 301, cwd: "/repo/.claude/worktrees/seo" },
      { pid: 302, cwd: "/repo" }
    ]
  })
  assert.equal(shared.recommend, "window")
  assert.deepEqual(shared.others, [
    { pid: 301, worktree: "seo" },
    { pid: 302, worktree: null }
  ])
  assert.match(shared.reasons[0], /2 other sessions share this window \(worktree `seo`, the main checkout\)/)
  assert.match(shared.reasons.join(), /Source Control/)

  const main = stayAdvice({ window, others: [{ pid: 302, cwd: "/repo" }], epic: true })
  assert.equal(main.recommend, "window")
  assert.match(main.reasons[0], /^another session shares this window \(the main checkout\)/)
  assert.doesNotMatch(main.reasons.join(), /Source Control/)
  assert.match(main.reasons.join(), /plan doc/)

  // no bridge:  a new window can't open, so staying is all there is
  assert.equal(stayAdvice({ window: null, others: [{ pid: 302, cwd: "/repo" }] }).recommend, "stay")
})

/** Write a registry entry for `pid` with `folders`. */
function register(pid, folders) {
  const entry = { pid, port: 1, token: "t", workspaceFile: null, folders }
  writeFileSync(join(dir, `${pid}.json`), JSON.stringify(entry))
}
