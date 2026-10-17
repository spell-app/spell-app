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
  LOOKS,
  Window,
  claudeSessions,
  launchPlan,
  look,
  parseLsof,
  processTable,
  stayAdvice,
  tint,
  titledFor,
  withLook,
  withoutStay,
  withStay,
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

test("show():  sends `show-doc` to this session's window, with `hash` and `view` only when given", async () => {
  const seen = []
  const server = createServer((request, response) => {
    let body = ""
    request.on("data", (chunk) => (body += chunk))
    request.on("end", () => {
      seen.push(JSON.parse(body))
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ ok: true }))
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const window = { pid: process.ppid, port: server.address().port, token: "t", folders: [], workspaceFile: null }
  writeFileSync(join(dir, `${process.ppid}.json`), JSON.stringify(window))
  try {
    // no session:  nothing pending, so straight to the window
    assert.equal((await Window.show("/a.html", { sessionId: "" })).window.pid, process.ppid)
    await Window.show("/b.html", { hash: "q3", view: "review", sessionId: "" })
    assert.deepEqual(seen, [{ file: "/a.html" }, { file: "/b.html", hash: "q3", view: "review" }])
  } finally {
    server.close()
  }
})

test("reload-view:  sends `reload-view` with the view to this session's window;  needs no target", async () => {
  const seen = []
  const server = createServer((request, response) => {
    let body = ""
    request.on("data", (chunk) => (body += chunk))
    request.on("end", () => {
      seen.push({ op: request.url, ...JSON.parse(body) })
      const known = request.url === "/reload-view"
      response.writeHead(known ? 200 : 404, { "Content-Type": "application/json" })
      response.end(JSON.stringify(known ? { ok: true, url: "http://127.0.0.1:4747/x.html?t=1" } : { ok: false }))
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const window = { pid: process.ppid, port: server.address().port, token: "t", folders: [], workspaceFile: null }
  writeFileSync(join(dir, `${process.ppid}.json`), JSON.stringify(window))
  try {
    assert.equal(await Window.main(["reload-view"]), 0)
    assert.equal(await Window.main(["reload-view", "--review"]), 0)
    assert.deepEqual(seen, [
      { op: "/reload-view", view: "docs" },
      { op: "/reload-view", view: "review" }
    ])
  } finally {
    server.close()
  }
})

test("request():  no window, or none listening, throws a clear error", async () => {
  await assert.rejects(Window.request("show-doc", {}, null), /no window/)
  const window = { pid: process.ppid, port: 1, token: "abc", folders: [] }
  await assert.rejects(Window.request("show-doc", {}, window), /didn't answer on port 1/)
})

test("a worktree's window:  the main root first, then the worktree's root, then the shared content repo;  theme, tinted", () => {
  const workspace = Window.worktreeWorkspace("ui", "seo")
  assert.deepEqual(workspace.folders, [
    { path: "../..", name: "spell-app" },
    { path: "../../.claude/worktrees/seo", name: "⎇ seo" },
    // `[]` on a machine without `../spell-app-dev`
    ...Window.sharedFolder(dirname(Window.worktreeFile("seo")))
  ])
  assert.equal(workspace.spell.package, "ui")
  assert.equal(workspace.settings["workbench.colorTheme"], Window.theme("ui"))
  assert.deepEqual(workspace.settings["workbench.colorCustomizations"], tint("seo"))
  assert.match(Window.worktreeFile("seo"), /\/workspaces\/ongoing\/seo\.code-workspace$/)
})

test("looks:  twelve names, Tomorrow Night Blue re-hued;  blue IS the theme;  an unknown name lists them", () => {
  assert.equal(Object.keys(LOOKS).length, 12)
  const blue = look("blue")
  assert.equal(blue.theme, "Tomorrow Night Blue")
  assert.equal(blue.colors["editor.background"], "#002451")
  assert.equal(blue.colors["progressBar.background"], "#bbdaffcc")
  const purple = look("Purple")
  assert.notEqual(purple.colors["editor.background"], "#002451")
  // alpha kept, lightness kept:  the purple badge is as light as the blue one
  assert.match(purple.colors["badge.background"], /^#[0-9a-f]{6}cc$/)
  assert.throws(() => look("magenta"), /no look "magenta":  red, orange/)
})

test("withLook:  the theme, the look's colours scoped to it;  a global colour it sets goes, Owen's others stay", () => {
  const settings = {
    "workbench.colorTheme": "Abyss",
    "workbench.colorCustomizations": { "editor.background": "#000000", "editorCursor.foreground": "#ff0000" }
  }
  withLook(settings, "teal")
  assert.equal(settings["workbench.colorTheme"], "Tomorrow Night Blue")
  const custom = settings["workbench.colorCustomizations"]
  assert.equal(custom["editor.background"], undefined)
  assert.equal(custom["editorCursor.foreground"], "#ff0000")
  assert.deepEqual(custom["[Tomorrow Night Blue]"], look("teal").colors)
})

test("stay:  titled ⎇ <name>, tinted in its theme's scope;  --end puts back exactly what was there", () => {
  const before = {
    settings: {
      "workbench.colorTheme": "Tomorrow Night Blue",
      "window.title": "mine",
      "workbench.colorCustomizations": {
        "[Tomorrow Night Blue]": { "titleBar.activeBackground": "#123456", x: "#fff" }
      }
    },
    spell: { package: "docs" }
  }
  const workspace = structuredClone(before)
  withStay(workspace, "quick-open")
  assert.equal(
    workspace.settings["window.title"],
    "${dirty}${activeEditorShort}${separator}⎇ quick-open${separator}${appName}"
  )
  assert.equal(
    workspace.settings["workbench.colorCustomizations"]["[Tomorrow Night Blue]"]["titleBar.activeBackground"],
    tint("quick-open")["titleBar.activeBackground"]
  )
  // a second stay keeps the first one's record of what to put back
  withStay(workspace, "seo")
  assert.equal(workspace.spell.stay.name, "seo")
  assert.equal(withoutStay(workspace), true)
  assert.deepEqual(workspace, before)
  assert.equal(withoutStay(workspace), false)
})

test("a worktree's window:  --color gives it that look;  else the look of the window it's opened from, no stay tint", () => {
  const colored = Window.worktreeWorkspace("ui", "seo", { color: "green" })
  assert.equal(colored.settings["workbench.colorTheme"], "Tomorrow Night Blue")
  assert.deepEqual(colored.settings["workbench.colorCustomizations"]["[Tomorrow Night Blue]"], look("green").colors)
  const from = withStay({ settings: withLook({}, "purple") }, "other")
  const inherited = Window.worktreeWorkspace("ui", "seo", { from })
  assert.deepEqual(inherited.settings["workbench.colorCustomizations"], {
    "[Tomorrow Night Blue]": look("purple").colors
  })
  assert.equal(inherited.settings["window.title"], undefined)
  assert.ok(from.spell.stay, "the source window's file is left as it was")
})

test("a worktree's window hides the MAIN root's files (beside `.spell-main`), never `packages` outright", () => {
  const exclude = Window.worktreeWorkspace("ui", "seo").settings["files.exclude"]
  assert.deepEqual(exclude["*"], { when: ".spell-main" })
  assert.equal(exclude.packages, undefined)
  assert.equal(exclude[".claude/worktrees"], true)
})

test("a package window:  the whole branch, then the shared repo;  shared links shown only under the shared repo", () => {
  const workspace = Window.workspace("ui")
  assert.deepEqual(workspace.folders, [
    { path: "..", name: "spell-app" },
    ...Window.sharedFolder(dirname(Window.file("ui")))
  ])
  const exclude = workspace.settings["files.exclude"]
  // a checkout's links sit beside its package.json;  the shared repo's real folders don't
  assert.deepEqual(exclude.epics, { when: "package.json" })
  assert.deepEqual(exclude.agents, { when: "package.json" })
  assert.equal(exclude["*"], undefined)
  assert.equal(exclude.packages, undefined)
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
    // ... in the tab it was asked for
    const review = { file: "/plan.html", view: "review" }
    assert.equal((await Window.resume({ ...tab, show: review }, "isolate-me")).shown, true)
    assert.deepEqual(seen.splice(0)[1], ["/show-doc", review])
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
    // the Review tab:  the record keeps `view`, for `resume` to send
    await Window.show("/c.html", { view: "review", sessionId: SESSION })
    assert.deepEqual(JSON.parse(readFileSync(Window.handoffFile(SESSION), "utf8")).show, {
      file: "/c.html",
      view: "review"
    })
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
  assert.deepEqual(
    [...cwds],
    [
      [301, "/repo/.claude/worktrees/seo/packages/ui"],
      [302, "/repo"]
    ]
  )
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
  assert.match(main.reasons.join(), /epic page/)

  // no bridge:  a new window can't open, so staying is all there is
  assert.equal(stayAdvice({ window: null, others: [{ pid: 302, cwd: "/repo" }] }).recommend, "stay")
})

test("launchPlan():  wake the epic's running session;  else a new one in its open window;  open it only when it's closed", () => {
  const session = (id, more = {}) => ({
    sessionId: id,
    title: "🚧 seo",
    self: false,
    inWindow: true,
    window: {},
    ...more
  })
  const plan = (windowOpen, sessions) => {
    const { action, rewrite, open, start, wake } = launchPlan({ windowOpen, sessions })
    return { action, rewrite, open, start, wake: wake?.sessionId ?? null }
  }
  const neither = { rewrite: false, open: false, start: false, wake: null }
  // Owen's r2:  the epic's window open, its session running there:  typed into it, the window file left alone
  assert.deepEqual(plan(true, [session("a")]), { ...neither, action: "wake", wake: "a" })
  // its window open, no session:  a new one there, still no rewrite
  assert.deepEqual(plan(true, []), { ...neither, action: "start", start: true })
  // closed, nothing running:  the old way, a fresh look
  assert.deepEqual(plan(false, []), { action: "open", rewrite: true, open: true, start: true, wake: null })
  // closed, but its session runs in another window (it stayed in a main one):  woken there
  assert.deepEqual(plan(false, [session("b", { inWindow: false })]), { ...neither, action: "wake", wake: "b" })
  // its window's own session wins over one elsewhere
  assert.deepEqual(plan(true, [session("b", { inWindow: false }), session("a")]), {
    ...neither,
    action: "wake",
    wake: "a"
  })
  // several:  nothing typed;  a terminal's:  nothing either;  the caller is the epic's own:  nothing to wake
  const several = launchPlan({ windowOpen: true, sessions: [session("a"), session("c")] })
  assert.equal(several.action, "several")
  assert.deepEqual(
    several.sessions.map((it) => it.sessionId),
    ["a", "c"]
  )
  assert.deepEqual(plan(false, [session("a", { window: null, inWindow: false })]), { ...neither, action: "no-window" })
  assert.deepEqual(plan(true, [session("a", { self: true })]), { ...neither, action: "own" })
})

test("titledFor():  the epic's name, without the icon, or as a whole word in the title", () => {
  assert.equal(titledFor("🚧 epic-eject", "epic-eject"), true)
  assert.equal(titledFor("epic-eject review", "epic-eject"), true)
  assert.equal(titledFor("epic-eject-2", "epic-eject"), false)
  assert.equal(titledFor("try-layout", "epic-eject"), false)
  assert.equal(titledFor("", "epic-eject"), false)
})

test("launch():  the epic's window open, its session running:  typed into it;  none:  a new one;  no window file written", async () => {
  const seen = []
  const server = createServer((request, response) => {
    let body = ""
    request.on("data", (chunk) => (body += chunk))
    request.on("end", () => {
      seen.push([request.url, JSON.parse(body)])
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ ok: true }))
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  const name = `test-launch-${process.pid}`
  const file = Window.worktreeFile(name)
  // the epic's window:  this test process, the sessions' parent (a window's extension host)
  const entry = { pid: process.pid, port: server.address().port, token: "t", folders: [], workspaceFile: file }
  writeFileSync(join(dir, `${process.pid}.json`), JSON.stringify(entry))
  const home = mkdtempSync(join(tmpdir(), "spell-claude-home-"))
  mkdirSync(join(home, "sessions"))
  process.env.SPELL_CLAUDE_HOME = home
  const record = (id, title) =>
    writeFileSync(
      join(home, "sessions", `${id}.json`),
      JSON.stringify({ pid: sleeper.pid, sessionId: id, name: title })
    )
  try {
    record(SESSION, `🚧 ${name}`)
    record("other", "try-layout")
    const woken = await Window.launch(name, "spell-app", { prompt: "/epic request x r1" })
    assert.equal(woken.action, "wake")
    assert.deepEqual(seen.splice(0), [["/open-session", { sessionId: SESSION, prompt: "/epic request x r1" }]])
    rmSync(join(home, "sessions", `${SESSION}.json`))
    assert.equal((await Window.launch(name, "spell-app", { prompt: "/epic x" })).action, "start")
    assert.deepEqual(seen.splice(0), [["/open-session", { prompt: "/epic x" }]])
    // never written:  an open window's file changing would recolour it, live
    assert.equal(existsSync(file), false)
  } finally {
    delete process.env.SPELL_CLAUDE_HOME
    rmSync(home, { recursive: true, force: true })
    server.close()
  }
})

/** Write a registry entry for `pid` with `folders`. */
function register(pid, folders) {
  const entry = { pid, port: 1, token: "t", workspaceFile: null, folders }
  writeFileSync(join(dir, `${pid}.json`), JSON.stringify(entry))
}
