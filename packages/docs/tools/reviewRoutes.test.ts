/**
 * Tests of the review route module on a real page server, over HTTP, in a scratch checkout:  its own plan doc, a
 * worktree's (as the main checkout's server serves it), and pages that aren't plan docs.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, beforeEach, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import { emptyInbox } from "./inbox.js"
import reviewRoutes from "./reviewRoutes"

let root: string
let server: PageServer
let port: number

/** pages in the scratch checkout, relative to it */
const PAGES = {
  plan: "epics/big/big.plan.html",
  far: ".claude/worktrees/w/epics/far/far.plan.html",
  other: "epics/big/notes.html",
  details: "packages/docs/details/pick.html"
}

/** the scratch plan doc's items */
const PLAN = `<!doctype html><title>x</title><body class="plan-doc">
<ui-section id="p1" data-phase="1" data-status="active" header="P1 · Go"></ui-section>
<ui-list class="plan-items"><ui-item data-state="open" id="j3" data-status="open"></ui-item>
<ui-item id="q8" data-status="open"></ui-item><ui-item id="i2" data-status="open"></ui-item></ui-list>`

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "review-routes-"))
  mkdirSync(join(root, ".git"))
  for (const page of Object.values(PAGES)) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), PLAN)
  }
  server = new PageServer({ root })
  await reviewRoutes.setup({
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

beforeEach(() => {
  for (const page of [PAGES.plan, PAGES.far]) rmSync(inboxFile(page), { force: true })
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

/** POST `body` to route `route`;  the status and the inbox (or error) it answered */
async function post(route: string, body: unknown, extra?: Record<string, string>) {
  const answer = await ask(port, "POST", `/api/review/${route}`, {
    body: JSON.stringify(body),
    headers: headers(extra)
  })
  return { status: answer.status, body: JSON.parse(answer.text) }
}

/** the inbox file of page `relative` */
function inboxFile(relative: string): string {
  return join(root, relative.replace(/\.plan\.html$/, ".inbox.json"))
}

/** what's in the inbox file of page `relative` */
function written(relative: string) {
  return JSON.parse(readFileSync(inboxFile(relative), "utf8"))
}

const PLAN_URL = `/${PAGES.plan}`

test("GET:  an empty inbox before any mark, and no file", async () => {
  const got = await ask(port, "GET", `/api/review/inbox?page=${encodeURIComponent(PLAN_URL)}`)
  expect(got.status).toBe(200)
  expect(JSON.parse(got.text)).toEqual(emptyInbox())
  expect(existsSync(inboxFile(PAGES.plan))).toBe(false)
})

test("mark:  set (stamped here), replaced, removed;  every answer is the whole inbox", async () => {
  const first = await post("mark", { page: PLAN_URL, id: "J3", mark: { action: "approve", at: "forged" } })
  expect(first.status).toBe(200)
  expect(first.body.marks.j3.action).toBe("approve")
  expect(first.body.marks.j3.at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[+-]\d\d:\d\d$/)
  expect(written(PAGES.plan)).toEqual(first.body)
  const picked = await post("mark", { page: PLAN_URL, id: "q8", mark: { action: "pick", pick: "B" } })
  expect(picked.body.marks.q8).toMatchObject({ action: "pick", pick: "B" })
  const gone = await post("mark", { page: PLAN_URL, id: "j3", mark: null })
  expect(Object.keys(gone.body.marks)).toEqual(["q8"])
  await post("mark", { page: PLAN_URL, id: "q8", mark: null })
  expect(existsSync(inboxFile(PAGES.plan))).toBe(false)
})

// epic `windows-and-review` P1:  a note box's text saved as typed, on the server every address reads
test("draft:  kept as typed until the mark that uses it;  blank drops it;  only note actions", async () => {
  const typed = await post("draft", { page: PLAN_URL, id: "Q8", action: "revisit", note: "why not B?\n" })
  expect(typed.status).toBe(200)
  expect(typed.body.drafts.q8).toMatchObject({ action: "revisit", note: "why not B?\n" })
  expect(typed.body.marks).toEqual({})
  expect(written(PAGES.plan).drafts.q8.note).toBe("why not B?\n")
  const marked = await post("mark", { page: PLAN_URL, id: "q8", mark: { action: "revisit", note: "why not B?" } })
  expect(marked.body.drafts).toEqual({})
  await post("draft", { page: PLAN_URL, id: "j3", action: "revisit", note: "x" })
  expect((await post("draft", { page: PLAN_URL, id: "j3", action: "revisit", note: "  " })).body.drafts).toEqual({})
  expect((await post("draft", { page: PLAN_URL, id: "j3", action: "approve", note: "x" })).status).toBe(400)
  expect((await post("draft", { page: PLAN_URL, id: "z9", action: "revisit", note: "x" })).status).toBe(400)
})

// epic `windows-and-review` P2
test("cancel:  a queued request and its mark go, recorded as canceled;  nothing asked is still a 200", async () => {
  await post("now", { page: PLAN_URL, id: "i2", action: "details" })
  const off = await post("cancel", { page: PLAN_URL, id: "I2" })
  expect(off.status).toBe(200)
  expect(off.body.now).toEqual([])
  expect(off.body.marks).toEqual({})
  expect(off.body.canceled.i2).toMatchObject({ action: "details", told: true })
  expect((await post("cancel", { page: PLAN_URL, id: "j3" })).status).toBe(200)
  expect((await post("cancel", { page: PLAN_URL, id: "z9" })).status).toBe(400)
})

test("now:  queued and marked;  revisit carries its note", async () => {
  const details = await post("now", { page: PLAN_URL, id: "i2", action: "details" })
  expect(details.status).toBe(200)
  expect(details.body.now).toMatchObject([{ id: "i2", action: "details" }])
  expect(details.body.marks.i2.action).toBe("details")
  const revisit = await post("now", { page: PLAN_URL, id: "q8", action: "revisit", note: " why? " })
  expect(revisit.body.marks.q8).toMatchObject({ action: "revisit", when: "now", note: "why?" })
  expect(revisit.body.now.map((each: { id: string }) => each.id)).toEqual(["i2", "q8"])
  expect((await post("now", { page: PLAN_URL, id: "j3", action: "approve" })).status).toBe(400)
})

test("a pick and a revisit together:  the mark carries both;  revisit now keeps the pick;  a bad letter is a 400", async () => {
  await post("mark", { page: PLAN_URL, id: "q8", mark: { action: "pick", pick: "B" } })
  const both = await post("mark", {
    page: PLAN_URL,
    id: "q8",
    mark: { action: "revisit", when: "soon", note: "only plan docs?", pick: "B" }
  })
  expect(both.status).toBe(200)
  expect(both.body.marks.q8).toMatchObject({ action: "revisit", when: "soon", note: "only plan docs?", pick: "B" })
  const now = await post("now", { page: PLAN_URL, id: "q8", action: "revisit", note: "now?" })
  expect(now.body.marks.q8).toMatchObject({ action: "revisit", when: "now", note: "now?", pick: "B" })
  expect(now.body.now).toMatchObject([{ id: "q8", action: "revisit", note: "now?", pick: "B" }])
  const bad = { action: "revisit", note: "x", pick: "b" }
  expect((await post("mark", { page: PLAN_URL, id: "q8", mark: bad })).status).toBe(400)
  expect(written(PAGES.plan).marks.q8.note).toBe("now?")
})

test("a stale listening answers null;  a live one as written;  the file keeps it", async () => {
  const old = new Date(Date.now() - 5 * 60_000).toISOString()
  const listening = { session: "gone", since: old, seen: old }
  writeFileSync(inboxFile(PAGES.plan), JSON.stringify({ ...emptyInbox(), listening }))
  const stale = await ask(port, "GET", `/api/review/inbox?page=${encodeURIComponent(PLAN_URL)}`)
  expect(JSON.parse(stale.text).listening).toBeNull()
  expect((await post("send", { page: PLAN_URL })).body.listening).toBeNull()
  expect(written(PAGES.plan).listening).toEqual(listening)
  const fresh = { ...listening, seen: new Date().toISOString() }
  writeFileSync(inboxFile(PAGES.plan), JSON.stringify({ ...emptyInbox(), listening: fresh }))
  const live = await ask(port, "GET", `/api/review/inbox?page=${encodeURIComponent(PLAN_URL)}`)
  expect(JSON.parse(live.text).listening).toEqual(fresh)
})

test("send:  dates the marks so far", async () => {
  await post("mark", { page: PLAN_URL, id: "j3", mark: { action: "approve" } })
  const sent = await post("send", { page: PLAN_URL })
  expect(sent.status).toBe(200)
  expect(sent.body.sent).toMatch(/^\d{4}-\d\d-\d\dT/)
  expect(written(PAGES.plan).sent).toBe(sent.body.sent)
})

test("a worktree's plan doc, through /worktrees/", async () => {
  const far = await post("mark", {
    page: `/worktrees/w/epics/far/far.plan.html`,
    id: "j3",
    mark: { action: "todo" }
  })
  expect(far.status).toBe(200)
  expect(written(PAGES.far).marks.j3.action).toBe("todo")
})

test("only plan docs:  403;  missing:  404;  not a path:  400", async () => {
  const mark = { action: "approve" }
  expect((await post("mark", { page: `/${PAGES.other}`, id: "j3", mark })).status).toBe(403)
  expect((await post("mark", { page: `/${PAGES.details}`, id: "j3", mark })).status).toBe(403)
  expect((await post("mark", { page: "/epics/gone/gone.plan.html", id: "j3", mark })).status).toBe(404)
  expect((await post("send", { page: "/epics/big/../big/notes.html" })).status).toBe(403)
  expect((await post("send", { page: "nope" })).status).toBe(400)
  const get = await ask(port, "GET", `/api/review/inbox?page=${encodeURIComponent(`/${PAGES.other}`)}`)
  expect(get.status).toBe(403)
})

test("unknown items and bad marks:  400, nothing written", async () => {
  expect((await post("mark", { page: PLAN_URL, id: "t99", mark: { action: "approve" } })).status).toBe(400)
  expect((await post("mark", { page: PLAN_URL, id: "p1", mark: { action: "approve" } })).status).toBe(400)
  expect((await post("mark", { page: PLAN_URL, id: "j3", mark: { action: "nope" } })).status).toBe(400)
  expect((await post("mark", { page: PLAN_URL, id: "q8", mark: { action: "pick", pick: "b" } })).status).toBe(400)
  expect((await post("mark", { page: PLAN_URL, id: "j3" })).status).toBe(400)
  expect(existsSync(inboxFile(PAGES.plan))).toBe(false)
})

test("writes need the token, our origin and our host", async () => {
  const body = { page: PLAN_URL }
  const bare = await ask(port, "POST", "/api/review/send", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" }
  })
  expect(bare.status).toBe(403)
  expect((await post("send", body, { origin: "http://evil.example" })).status).toBe(403)
  expect((await post("send", body, { host: "evil.example" })).status).toBe(403)
  expect(existsSync(inboxFile(PAGES.plan))).toBe(false)
})
