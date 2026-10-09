/**
 * Tests of the notes route module on a real page server, over HTTP, in a scratch checkout:  notes added, edited and
 * deleted on a guide, the docs home and a worktree's page, and the pages that take none.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import notesRoutes from "./notesRoutes"

let root: string
let server: PageServer
let port: number

/** A page with one section, formatted as `vp fmt` leaves it. */
const PAGE = `<!doctype html>
<html lang="en">
  <body>
    <main class="spell-doc-main">
      <ui-sticky class="spell-h1"><header class="spell-page-head"><h1>Page</h1></header></ui-sticky>
      <ui-section id="model" header="1. The model" sticky collapsible dividing collapsed>
        <p>Body.</p>
      </ui-section>
    </main>
  </body>
</html>
`

/** pages in the scratch checkout, relative to it -> their source */
const PAGES: Record<string, string> = {
  "guides/solid/solid-2.html": PAGE,
  "pages/index.html": PAGE,
  ".claude/worktrees/w/guides/far.html": PAGE,
  "epics/big/big.plan.html": PAGE,
  "epics/big/notes.html": PAGE,
  "epics/old/old.html": PAGE,
  "pages/details/asks.html": PAGE.replace("<p>Body.</p>", '<div class="spell-question">Q1</div>'),
  "pages/details/plain.html": PAGE,
  "templates/durable.html": PAGE,
  "goals/spell/index.html": PAGE
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "notes-routes-"))
  mkdirSync(join(root, ".git"))
  for (const [page, html] of Object.entries(PAGES)) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), html)
  }
  server = new PageServer({ root })
  await notesRoutes.setup({
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
function headers(extra: Record<string, string> = {}) {
  return {
    "content-type": "application/json",
    "x-server-token": server.web.guard.token,
    origin: `http://127.0.0.1:${port}`,
    ...extra
  }
}

/** POST `body` to the notes route;  `{ status, answer }` */
async function post(body: object, extra?: Record<string, string>) {
  const got = await ask(port, "POST", "/api/notes", { body: JSON.stringify(body), headers: headers(extra) })
  return { status: got.status, answer: JSON.parse(got.text || "{}") }
}

/** the page `relative` as written */
function written(relative: string): string {
  return readFileSync(join(root, relative), "utf8")
}

test("adds a note INTO the page, in the section's group;  the answer lists the page's notes", async () => {
  const { status, answer } = await post({
    page: "/guides/solid/solid-2.html",
    action: "add",
    for: "model",
    text: "Why a store?"
  })
  expect(status).toBe(200)
  expect(answer).toMatchObject({ ok: true, id: "n1", notes: [{ id: "n1", for: "model", text: "Why a store?" }] })
  expect(written("guides/solid/solid-2.html")).toMatch(
    /<p>Body\.<\/p>\n {8}<spell-notes for="model">\n {10}<spell-note id="n1" status="new" at="[\d-]+ [\d:]+">\n {12}<p>Why a store\?<\/p>/
  )
})

test("edits and deletes a new note;  the last one out takes its group", async () => {
  const page = "/pages/index.html"
  expect((await post({ page, action: "add", for: "page", text: "one" })).answer.id).toBe("n1")
  expect((await post({ page, action: "edit", id: "n1", text: "one, better" })).answer.notes[0].text).toBe("one, better")
  expect((await post({ page, action: "delete", id: "n1" })).answer.notes).toEqual([])
  expect(written("pages/index.html")).toBe(PAGE)
  expect((await post({ page, action: "delete", id: "n1" })).status).toBe(404)
})

test("the page reads its notes back, every status", async () => {
  const got = await ask(port, "GET", "/api/notes?page=%2Fguides%2Fsolid%2Fsolid-2.html")
  expect(got.status).toBe(200)
  expect(JSON.parse(got.text)).toMatchObject({ page: "/guides/solid/solid-2.html", notes: [{ id: "n1" }] })
})

test("a worktree's page through /worktrees/, an epic's own page, a details page without questions", async () => {
  for (const page of ["/worktrees/w/guides/far.html", "/epics/big/notes.html", "/pages/details/plain.html"])
    expect((await post({ page, action: "add", for: "model", text: "x" })).status).toBe(200)
  expect(written(".claude/worktrees/w/guides/far.html")).toContain('<spell-note id="n1"')
})

test("no notes on plan docs, details pages with questions, templates, goals, or pages that aren't there", async () => {
  const add = (page: string) => post({ page, action: "add", for: "model", text: "x" })
  for (const page of [
    "/epics/big/big.plan.html",
    "/epics/old/old.html",
    "/pages/details/asks.html",
    "/templates/durable.html",
    "/goals/spell/index.html",
    "/guides/../templates/durable.html"
  ])
    expect([page, (await add(page)).status]).toEqual([page, 403])
  expect((await add("/guides/missing.html")).status).toBe(404)
  expect((await add("nope")).status).toBe(400)
  expect((await ask(port, "GET", "/api/notes?page=%2Fepics%2Fbig%2Fbig.plan.html")).status).toBe(403)
})

test("bad changes are refused", async () => {
  const page = "/guides/solid/solid-2.html"
  expect((await post({ page, action: "shout", for: "model", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "add", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "add", for: "model", text: "  " })).status).toBe(400)
  expect((await post({ page, action: "add", for: "nowhere", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "edit", text: "x" })).status).toBe(400)
})

test("writes need the token, our origin and our host", async () => {
  const body = { page: "/guides/solid/solid-2.html", action: "add", for: "model", text: "x" }
  const bare = await ask(port, "POST", "/api/notes", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" }
  })
  expect(bare.status).toBe(403)
  expect((await post(body, { origin: "http://evil.example" })).status).toBe(403)
  expect((await post(body, { host: "evil.example" })).status).toBe(403)
})
