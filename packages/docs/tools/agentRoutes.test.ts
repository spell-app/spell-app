/**
 * Tests of the running-agents route module on a real page server, over HTTP, in a scratch checkout:  the list of an
 * epic, read and redirected from its plan doc, its worktree copy too;  pages that aren't plan docs;  the guard.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, beforeEach, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import { AgentList } from "./AgentList"
import agentRoutes from "./agentRoutes"

let root: string
let server: PageServer
let port: number

/** pages in the scratch checkout, relative to it */
const PAGES = {
  plan: "epics/big/big.plan.html",
  other: "epics/big/notes.html"
}

const PLAN_URL = `/${PAGES.plan}`

/** the scratch epic's list, as `spell dev agents` would write it */
let list: AgentList

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "agent-routes-"))
  mkdirSync(join(root, ".git"))
  for (const page of Object.values(PAGES)) {
    mkdirSync(dirname(join(root, page)), { recursive: true })
    writeFileSync(join(root, page), "<!doctype html><title>x</title><body class=plan-doc></body>")
  }
  list = new AgentList(root, { epic: "big" })
  server = new PageServer({ root })
  await agentRoutes.setup({
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

beforeEach(() => rmSync(list.file, { force: true }))

/** GET the list for page `page` */
async function get(page = PLAN_URL) {
  const answer = await ask(port, "GET", `/api/agents?page=${encodeURIComponent(page)}`)
  return { status: answer.status, body: JSON.parse(answer.text) }
}

/** POST a redirect;  the status and the list (or error) it answered */
async function redirect(body: unknown, headers: Record<string, string> = writeHeaders()) {
  const answer = await ask(port, "POST", "/api/agents/redirect", { body: JSON.stringify(body), headers })
  return { status: answer.status, body: JSON.parse(answer.text) }
}

/** headers of a write from a page this server served */
function writeHeaders(): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-server-token": server.web.guard.token,
    origin: `http://127.0.0.1:${port}`
  }
}

test("GET:  no agents, no file:  an empty list", async () => {
  expect(await get()).toEqual({ status: 200, body: { agents: [] } })
})

test("GET:  the epic's list, as `spell dev agents` wrote it", async () => {
  list.add("aaa", "docstrings in string.ts")
  const { status, body } = await get()
  expect(status).toBe(200)
  expect(body.agents).toMatchObject([{ name: "big-aaa", task: "docstrings in string.ts", status: "active" }])
})

test("GET:  only a plan doc's list", async () => {
  expect((await get(`/${PAGES.other}`)).status).toBe(403)
  expect((await get("/epics/big/nope.plan.html")).status).toBe(404)
})

test("redirect:  the note lands untold in the agent's entry;  the answer is the list after", async () => {
  list.add("aaa", "docstrings")
  const { status, body } = await redirect({ page: PLAN_URL, name: "big-aaa", note: "  only the exported ones  " })
  expect(status).toBe(200)
  expect(body.agents[0].redirects).toEqual([{ note: "only the exported ones", at: expect.any(String) }])
  expect(list.untold).toEqual([{ name: "big-aaa", note: "only the exported ones", at: expect.any(String) }])
  expect(list.told("aaa")).toBe(1)
  expect(list.untold).toEqual([])
  expect((await get()).body.agents[0].redirects[0].told).toEqual(expect.any(String))
})

test("redirect:  400 for an empty note, no name, or an agent not running", async () => {
  list.add("aaa", "docstrings")
  expect((await redirect({ page: PLAN_URL, name: "aaa", note: "   " })).status).toBe(400)
  expect((await redirect({ page: PLAN_URL, note: "x" })).status).toBe(400)
  const gone = await redirect({ page: PLAN_URL, name: "bbb", note: "x" })
  expect(gone.status).toBe(400)
  expect(gone.body.error).toMatch(/no agent `big-bbb` is running/)
})

test("redirect:  refused without the server's token", async () => {
  list.add("aaa", "docstrings")
  const { "x-server-token": _token, ...headers } = writeHeaders()
  expect((await redirect({ page: PLAN_URL, name: "aaa", note: "x" }, headers)).status).toBe(403)
  expect(list.untold).toEqual([])
})
