/**
 * Tests of the side bar link route (`scripts/showRoutes.ts`) on a real page server, in a scratch checkout, with an
 * EMPTY window registry (`SPELL_WINDOWS_DIR`):  nothing here ever reaches a real VS Code window or Chrome.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import showRoutes, { pickWindow, type WindowEntry } from "./showRoutes"

let root: string
let server: PageServer
let port: number

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "show-routes-"))
  mkdirSync(join(root, ".git"))
  mkdirSync(join(root, "packages/docs/content"), { recursive: true })
  writeFileSync(join(root, "packages/docs/content/page.html"), "<!doctype html><title>x</title>")
  writeFileSync(join(root, "packages/docs/content/data.json"), "{}")
  process.env.SPELL_WINDOWS_DIR = join(root, "no-windows")
  server = new PageServer({ root })
  await showRoutes.setup({
    root,
    router: server.web.router,
    guard: server.web.guard,
    live: server.web.live!,
    web: server.web,
    info: server.info,
    onListening: () => {},
    onStop: () => {}
  })
  await server.start({ port: 0, routes: false, pidFile: false })
  port = server.info.port
})

afterAll(async () => {
  await server.stop()
  delete process.env.SPELL_WINDOWS_DIR
  rmSync(root, { recursive: true, force: true })
})

/** GET the route for `path`, as a click (`Sec-Fetch-Site:  none`) unless `site` says otherwise */
function show(path: string, site = "none") {
  return ask(port, "GET", `/api/docs/show?path=${encodeURIComponent(path)}`, { headers: { "sec-fetch-site": site } })
}

test("answers 400 with no path:  how `spell dev docs link` tells the route is there", async () => {
  expect((await ask(port, "GET", "/api/docs/show")).status).toBe(400)
})

test("only pages that exist, served here", async () => {
  expect((await show("/packages/docs/content/missing.html")).status).toBe(404)
  expect((await show("/packages/docs/content/data.json")).status).toBe(400)
  expect((await show("/packages/docs/../../etc/passwd.html")).status).toBe(403)
})

test("refuses a request another site started", async () => {
  expect((await show("/packages/docs/content/page.html", "cross-site")).status).toBe(403)
  expect((await show("/packages/docs/content/page.html", "same-site")).status).toBe(403)
})

test("no VS Code window:  404, saying so", async () => {
  const answer = await show("/packages/docs/content/page.html")
  expect(answer.status).toBe(404)
  expect(answer.text).toMatch(/no VS Code window/)
})

test("picks the window by pid, else the one holding the file deepest, else any", () => {
  const entries = new Map<number, WindowEntry>([
    [1, { pid: 1, port: 1, token: "a", folders: ["/repo", "/repo/packages/ui"] }],
    [2, { pid: 2, port: 2, token: "b", folders: ["/repo", "/repo/.claude/worktrees/w"] }]
  ])
  expect(pickWindow(1, "/repo/.claude/worktrees/w/packages/docs/x.html", entries)?.pid).toBe(1)
  expect(pickWindow(99, "/repo/.claude/worktrees/w/packages/docs/x.html", entries)?.pid).toBe(2)
  expect(pickWindow(99, "/elsewhere/x.html", entries)?.pid).toBe(1)
  expect(pickWindow(99, "/x.html", new Map())).toBeUndefined()
})
