/**
 * Tests of the comments route module on a real page server, over HTTP, in a scratch checkout:
 * comments added, edited and deleted on a guide, the docs home and a worktree's page, and the pages that take none.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import commentsRoutes from "./commentsRoutes"
import { GuideInbox } from "./GuideInbox"

let root: string
let server: PageServer
let port: number

/** A page with one section. */
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
  "epics/big/parts/p3.html": PAGE,
  "epics/big/notes.html": PAGE,
  "epics/old/old.html": PAGE,
  "pages/details/asks.html": PAGE.replace("<p>Body.</p>", '<div class="spell-question">Q1</div>'),
  "pages/details/plain.html": PAGE,
  "templates/durable.html": PAGE,
  "goals/spell/index.html": PAGE
}

/** A comment on the second table of section `model`. */
const ON_TABLE = { anchor: "model#table-2", kind: "table", label: "1. The model", excerpt: "Name Size" }

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "comments-routes-"))
  mkdirSync(join(root, ".git"))
  for (const [page, html] of Object.entries(PAGES)) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), html)
  }
  server = new PageServer({ root })
  await commentsRoutes.setup({
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

/** POST `body` to the comments route;  `{ status, answer }` */
async function post(body: object, extra?: Record<string, string>) {
  const got = await ask(port, "POST", "/api/comments", { body: JSON.stringify(body), headers: headers(extra) })
  return { status: got.status, answer: JSON.parse(got.text || "{}") }
}

/** the inbox file of page `relative`, as written */
function inboxOf(relative: string) {
  return JSON.parse(readFileSync(join(root, relative.replace(/\.html$/, ".inbox.json")), "utf8"))
}

test("adds a comment to the page's INBOX FILE, never the page;  the answer lists the page's comments", async () => {
  const { status, answer } = await post({
    page: "/guides/solid/solid-2.html",
    action: "add",
    ...ON_TABLE,
    text: "Too wide on a phone?"
  })
  expect(status).toBe(200)
  expect(answer).toMatchObject({ ok: true, id: "cm1", comments: [{ id: "cm1", ...ON_TABLE, status: "new" }] })
  expect(inboxOf("guides/solid/solid-2.html")).toMatchObject({
    version: 1,
    comments: { cm1: { ...ON_TABLE, text: "Too wide on a phone?", status: "new" } }
  })
  expect(readFileSync(join(root, "guides/solid/solid-2.html"), "utf8")).toBe(PAGE)
})

test("edits and deletes a new comment;  the last one out takes the file", async () => {
  const page = "/pages/index.html"
  expect((await post({ page, action: "add", anchor: "page", kind: "page", text: "one" })).answer.id).toBe("cm1")
  const edited = await post({ page, action: "edit", id: "cm1", text: "one, better" })
  expect(edited.answer.comments[0]).toMatchObject({ text: "one, better", edited: expect.any(String) })
  expect((await post({ page, action: "delete", id: "cm1" })).answer.comments).toEqual([])
  expect(existsSync(join(root, "pages/index.inbox.json"))).toBe(false)
  expect((await post({ page, action: "delete", id: "cm1" })).status).toBe(404)
})

test("a taken comment can't change:  409", async () => {
  const page = "/epics/big/notes.html"
  const { id } = (await post({ page, action: "add", ...ON_TABLE, text: "x" })).answer
  GuideInbox.update(join(root, "epics/big/notes.inbox.json"), (comments) =>
    comments.take(id, { epic: "guide-changes", phase: 1 })
  )
  expect((await post({ page, action: "edit", id, text: "y" })).status).toBe(409)
  expect((await post({ page, action: "delete", id })).status).toBe(409)
})

test("any comment clears, taken or not;  an unknown one is a 404", async () => {
  const page = "/epics/big/notes.html"
  const { id } = (await post({ page, action: "add", ...ON_TABLE, text: "x" })).answer
  GuideInbox.update(join(root, "epics/big/notes.inbox.json"), (comments) =>
    comments.take(id, { epic: "guide-changes", phase: 1 })
  )
  const cleared = await post({ page, action: "clear", id })
  expect(cleared.answer.comments.some((comment: { id: string }) => comment.id === id)).toBe(false)
  expect((await post({ page, action: "clear", id })).status).toBe(404)
})

test("the page reads its comments back, every status", async () => {
  const got = await ask(port, "GET", "/api/comments?page=%2Fguides%2Fsolid%2Fsolid-2.html")
  expect(got.status).toBe(200)
  expect(JSON.parse(got.text)).toMatchObject({
    page: "/guides/solid/solid-2.html",
    takesComments: true,
    comments: [{ id: "cm1" }]
  })
})

test("a worktree's page through /worktrees/, an epic's own page, a details page without questions", async () => {
  for (const page of ["/worktrees/w/guides/far.html", "/epics/big/notes.html", "/pages/details/plain.html"])
    expect((await post({ page, action: "add", ...ON_TABLE, text: "x" })).status).toBe(200)
  expect(inboxOf(".claude/worktrees/w/guides/far.html").comments.cm1.text).toBe("x")
})

test("a plan doc's comments go in the epic's REVIEW INBOX, beside its marks;  a quote rides along", async () => {
  const page = "/epics/big/big.plan.html"
  const quoted = { ...ON_TABLE, anchor: "p3#field-2", kind: "field", quote: "the inbox file", offset: 14 }
  const { status, answer } = await post({ page, action: "add", ...quoted, text: "which one?" })
  expect([status, answer.id]).toEqual([200, "cm1"])
  expect(JSON.parse(readFileSync(join(root, "epics/big/big.inbox.json"), "utf8"))).toMatchObject({
    marks: {},
    comments: { cm1: { anchor: "p3#field-2", quote: "the inbox file", offset: 14, text: "which one?" } }
  })
  const read = await ask(port, "GET", "/api/comments?page=%2Fepics%2Fbig%2Fbig.plan.html")
  expect(JSON.parse(read.text)).toMatchObject({ takesComments: true, comments: [{ id: "cm1", status: "new" }] })
})

test("no comments on a plan doc's parts, details pages with questions, templates, goals, or pages not there", async () => {
  const add = (page: string) => post({ page, action: "add", ...ON_TABLE, text: "x" })
  for (const page of [
    "/epics/big/parts/p3.html",
    "/epics/old/old.html",
    "/pages/details/asks.html",
    "/templates/durable.html",
    "/goals/spell/index.html",
    "/guides/../templates/durable.html"
  ])
    expect([page, (await add(page)).status]).toEqual([page, 403])
  expect((await add("/guides/missing.html")).status).toBe(404)
  expect((await add("nope")).status).toBe(400)
  // reading is an answer, not a 403:  every docs page asks
  const read = await ask(port, "GET", "/api/comments?page=%2Ftemplates%2Fdurable.html")
  expect([read.status, JSON.parse(read.text)]).toMatchObject([200, { takesComments: false, comments: [] }])
})

test("bad changes are refused", async () => {
  const page = "/guides/solid/solid-2.html"
  expect((await post({ page, action: "shout", ...ON_TABLE, text: "x" })).status).toBe(400)
  expect((await post({ page, action: "add", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "add", ...ON_TABLE, text: "  " })).status).toBe(400)
  expect((await post({ page, action: "add", ...ON_TABLE, anchor: "two words", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "add", ...ON_TABLE, kind: "Not a kind", text: "x" })).status).toBe(400)
  expect((await post({ page, action: "edit", text: "x" })).status).toBe(400)
})

test("NEVER an empty comment:  an add or edit with no text, white space or zero-width spaces is a 400", async () => {
  const page = "/pages/details/plain.html"
  for (const text of [undefined, "", "   ", "\n\t \n", "​"])
    expect([text, (await post({ page, action: "add", ...ON_TABLE, text })).status]).toEqual([text, 400])
  const { id } = (await post({ page, action: "add", ...ON_TABLE, text: "kept" })).answer
  for (const text of [undefined, "", "  \n  "])
    expect([text, (await post({ page, action: "edit", id, text })).status]).toEqual([text, 400])
  const read = JSON.parse((await ask(port, "GET", `/api/comments?page=${encodeURIComponent(page)}`)).text)
  expect(read.comments.find((comment: { id: string }) => comment.id === id).text).toBe("kept")
  await post({ page, action: "delete", id })
})

test("writes need the token, our origin and our host", async () => {
  const body = { page: "/guides/solid/solid-2.html", action: "add", ...ON_TABLE, text: "x" }
  const bare = await ask(port, "POST", "/api/comments", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" }
  })
  expect(bare.status).toBe(403)
  expect((await post(body, { origin: "http://evil.example" })).status).toBe(403)
  expect((await post(body, { host: "evil.example" })).status).toBe(403)
})
