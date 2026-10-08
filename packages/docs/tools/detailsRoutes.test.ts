/**
 * Tests of the details route module on a real page server, over HTTP, in a scratch checkout:  its own
 * `pages/details/`, an epic's `details/`, and a worktree's, as the main checkout's server serves them.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import detailsRoutes, { type DetailsAnswer } from "./detailsRoutes"

let root: string
let server: PageServer
let port: number

/** pages in the scratch checkout, relative to it */
const PAGES = [
  "pages/details/pick.html",
  "epics/big/details/shape.html",
  ".claude/worktrees/w/pages/details/far.html",
  "guides/other.html"
]

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "details-routes-"))
  mkdirSync(join(root, ".git"))
  for (const page of PAGES) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), "<!doctype html><title>x</title>")
  }
  server = new PageServer({ root })
  await detailsRoutes.setup({
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
function page(extra: Record<string, string> = {}) {
  return {
    "content-type": "application/json",
    "x-server-token": server.web.guard.token,
    origin: `http://127.0.0.1:${port}`,
    ...extra
  }
}

/** POST an answer for `path`, with `headers` */
function answer(path: string, answers: unknown = { q1: { picked: ["B"] } }, headers: Record<string, string> = page()) {
  return ask(port, "POST", "/api/details/answer", {
    body: JSON.stringify({ page: path, answers, notes: "  why not  " }),
    headers
  })
}

/** the answer file written for page `relative` */
function written(relative: string): DetailsAnswer {
  return JSON.parse(readFileSync(join(root, relative.replace(/\.html$/, ".answer.json")), "utf8"))
}

test("writes the answer beside the page, and counts changes", async () => {
  const first = await answer("/pages/details/pick.html")
  expect(first.status).toBe(200)
  expect(written(PAGES[0]!)).toMatchObject({
    page: "/pages/details/pick.html",
    changes: 0,
    answers: { q1: { picked: ["B"] } },
    notes: "why not"
  })
  await answer("/pages/details/pick.html", { q1: { picked: [], other: " neither " } })
  expect(written(PAGES[0]!)).toMatchObject({ changes: 1, answers: { q1: { picked: [], other: "neither" } } })
})

test("the page reads its answer back:  null before one is sent", async () => {
  const got = await ask(port, "GET", "/api/details/answer?page=%2Fpages%2Fdetails%2Fpick.html")
  expect(got.status).toBe(200)
  expect(JSON.parse(got.text).answer.page).toBe("/pages/details/pick.html")
  const none = await ask(port, "GET", "/api/details/answer?page=%2Fepics%2Fbig%2Fdetails%2Fshape.html")
  expect(JSON.parse(none.text)).toEqual({ answer: null })
  expect((await ask(port, "GET", "/api/details/answer?page=%2Fguides%2Fother.html")).status).toBe(403)
})

test("an epic's details page, and a worktree's through /worktrees/", async () => {
  expect((await answer("/epics/big/details/shape.html")).status).toBe(200)
  expect(written(PAGES[1]!).answers.q1!.picked).toEqual(["B"])
  expect((await answer("/worktrees/w/pages/details/far.html")).status).toBe(200)
  expect(written(PAGES[2]!).page).toBe("/worktrees/w/pages/details/far.html")
})

test("only details pages, only pages that exist", async () => {
  expect((await answer("/guides/other.html")).status).toBe(403)
  expect((await answer("/pages/details/missing.html")).status).toBe(404)
  expect((await answer("/pages/details/../other.html")).status).toBe(403)
  expect((await answer("/pages/details/")).status).toBe(404)
  expect((await answer("nope")).status).toBe(400)
})

test("each option's comment is kept, trimmed;  blank ones dropped", async () => {
  await answer("/pages/details/pick.html", { q1: { picked: ["A"], comments: { A: " fine ", B: "  ", C: "too slow" } } })
  expect(written(PAGES[0]!).answers.q1).toEqual({ picked: ["A"], comments: { A: "fine", C: "too slow" } })
  await answer("/pages/details/pick.html", { q1: { picked: ["A"], comments: { B: " " } } })
  expect(written(PAGES[0]!).answers.q1).toEqual({ picked: ["A"] })
})

test("bad answers are refused", async () => {
  expect((await answer("/pages/details/pick.html", "B")).status).toBe(400)
  expect((await answer("/pages/details/pick.html", { q1: { picked: "B" } })).status).toBe(400)
  expect((await answer("/pages/details/pick.html", { q1: { picked: [], comments: ["x"] } })).status).toBe(400)
  expect((await answer("/pages/details/pick.html", { q1: { picked: [], comments: { A: 3 } } })).status).toBe(400)
})

test("writes need the token, our origin and our host", async () => {
  const path = "/pages/details/pick.html"
  expect((await answer(path, undefined, { "content-type": "application/json" })).status).toBe(403)
  expect((await answer(path, undefined, page({ origin: "http://evil.example" }))).status).toBe(403)
  expect((await answer(path, undefined, page({ host: "evil.example" }))).status).toBe(403)
})
