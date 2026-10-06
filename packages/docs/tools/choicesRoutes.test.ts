/**
 * Tests of the syntax-choices route module on a real page server, over HTTP, in a scratch checkout:  a scratch
 * choices page, an epic's, a worktree's (as the main checkout's server serves it), and a details page beside them.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import choicesRoutes, { type ChoicesAnswer, type ChoicesDraft } from "./choicesRoutes"

let root: string
let server: PageServer
let port: number

/** choices pages in the scratch checkout, relative to it:  each gets rows `a` and `b` */
const CHOICES = [
  "pages/details/names.html",
  "epics/big/details/names.html",
  ".claude/worktrees/w/pages/details/far.html"
]

/** a details page, without rows */
const DETAILS = "pages/details/pick.html"

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "choices-routes-"))
  mkdirSync(join(root, ".git"))
  for (const page of [...CHOICES, DETAILS]) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), "<!doctype html><title>x</title>")
  }
  for (const page of CHOICES)
    writeFileSync(
      join(root, page.replace(/\.html$/, ".rows.json")),
      JSON.stringify({ rows: [{ id: "a" }, { id: "b" }] })
    )
  server = new PageServer({ root })
  await choicesRoutes.setup({
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
  rmSync(root, { recursive: true, force: true })
})

/** headers of a write from a page this server served */
function fromPage(extra: Record<string, string> = {}) {
  return {
    "content-type": "application/json",
    "x-server-token": server.web.guard.token,
    origin: `http://127.0.0.1:${port}`,
    ...extra
  }
}

/** POST `body` to `/api/choices/<what>` for `path`, with `headers` */
function post(
  what: "draft" | "answer",
  path: string,
  body: Record<string, unknown> = { values: { a: "isA" }, feedback: "  looks right  " },
  headers: Record<string, string> = fromPage()
) {
  return ask(port, "POST", `/api/choices/${what}`, { body: JSON.stringify({ page: path, ...body }), headers })
}

/** GET `/api/choices/<what>` for `path`:  status and the parsed body */
async function get(what: "draft" | "answer", path: string) {
  const got = await ask(port, "GET", `/api/choices/${what}?page=${encodeURIComponent(path)}`)
  return { status: got.status, body: got.status === 200 ? JSON.parse(got.text) : undefined }
}

/** the JSON file `<slug>.<kind>.json` beside page `relative` */
function written<T>(relative: string, kind: "draft" | "answer"): T {
  return JSON.parse(readFileSync(join(root, relative.replace(/\.html$/, `.${kind}.json`)), "utf8"))
}

test("a draft is saved beside the page, read back, and never makes an answer", async () => {
  expect((await get("draft", "/pages/details/names.html")).body).toEqual({ draft: null })
  expect((await post("draft", "/pages/details/names.html")).status).toBe(200)
  expect(written<ChoicesDraft>(CHOICES[0]!, "draft")).toMatchObject({
    page: "/pages/details/names.html",
    values: { a: "isA" },
    feedback: "looks right"
  })
  expect((await get("draft", "/pages/details/names.html")).body.draft.values).toEqual({ a: "isA" })
  expect(existsSync(join(root, "pages/details/names.answer.json"))).toBe(false)
})

test("Do it writes the answer and the draft;  sent again, changes counts up", async () => {
  const path = "/epics/big/details/names.html"
  expect((await get("answer", path)).body).toEqual({ answer: null })
  expect((await post("answer", path, { values: { b: "" }, feedback: "" })).status).toBe(200)
  expect(written<ChoicesAnswer>(CHOICES[1]!, "answer")).toMatchObject({ changes: 0, values: { b: "" } })
  expect(written<ChoicesDraft>(CHOICES[1]!, "draft").values).toEqual({ b: "" })
  await post("answer", path)
  expect(written<ChoicesAnswer>(CHOICES[1]!, "answer")).toMatchObject({
    changes: 1,
    values: { a: "isA" },
    feedback: "looks right"
  })
  expect((await get("answer", path)).body.answer.changes).toBe(1)
})

test("a worktree's page through /worktrees/", async () => {
  expect((await post("draft", "/worktrees/w/pages/details/far.html")).status).toBe(200)
  expect(written<ChoicesDraft>(CHOICES[2]!, "draft").page).toBe("/worktrees/w/pages/details/far.html")
})

test("only choices pages:  a details page without rows, a missing page, a path out", async () => {
  expect((await post("draft", "/pages/details/pick.html")).status).toBe(403)
  expect((await get("draft", "/pages/details/pick.html")).status).toBe(403)
  expect((await post("answer", "/pages/details/missing.html")).status).toBe(404)
  expect((await post("draft", "/pages/details/../other.html")).status).toBe(403)
  expect((await post("draft", "nope")).status).toBe(400)
})

test("bad values are refused:  not an object, not text, a row the page doesn't have", async () => {
  const path = "/pages/details/names.html"
  expect((await post("draft", path, { values: "isA" })).status).toBe(400)
  expect((await post("draft", path, { values: { a: 1 } })).status).toBe(400)
  const stale = await post("answer", path, { values: { gone: "x" } })
  expect(stale.status).toBe(400)
  expect(stale.text).toContain("reload")
})

test("writes need the token, our origin and our host", async () => {
  const path = "/pages/details/names.html"
  expect((await post("draft", path, undefined, { "content-type": "application/json" })).status).toBe(403)
  expect((await post("draft", path, undefined, fromPage({ origin: "http://evil.example" }))).status).toBe(403)
  expect((await post("answer", path, undefined, fromPage({ host: "evil.example" }))).status).toBe(403)
})
