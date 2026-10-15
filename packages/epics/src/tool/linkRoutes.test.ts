/**
 * Tests of the link routes (epic `epic-workflow` P15), over HTTP on a scratch checkout:  a typed `/saga/...` address
 * redirects to its page, and `GET /api/epics/target` answers what an `<epic-link>` points at.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import linkRoutes from "./linkRoutes"

const root = mkdtempSync(join(tmpdir(), "link-routes-"))

/** Write `html` at `path` (from the scratch root), its folders made. */
function write(path: string, html: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

describe("link routes", () => {
  let server: PageServer
  let port: number

  beforeAll(async () => {
    write("sagas/sagas.json", JSON.stringify({ sagas: [{ id: "spell-ui", title: "Spell UI", purpose: "" }] }))
    write("sagas/spell-ui/spell-ui.saga.html", "<title>Saga: Spell UI</title>")
    write(
      "epics/seo/seo.plan.html",
      `<title>Epic: SEO</title><epic-page epic="seo" saga="spell-ui"><epic-item id="j3" title="Titles"></epic-item></epic-page>`
    )
    server = new PageServer({ root })
    await linkRoutes.setup({
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

  test("a typed address goes to the page, a worktree's prefix kept;  a page that isn't there:  404, saying why", async () => {
    const go = async (path: string) => {
      const answer = await ask(port, "GET", path)
      return { status: answer.status, location: answer.headers.location }
    }
    expect(await go("/saga/spell-ui")).toEqual({ status: 302, location: "/sagas/spell-ui/spell-ui.saga.html" })
    expect(await go("/saga/spell-ui/seo")).toEqual({ status: 302, location: "/epics/seo/seo.plan.html" })
    expect(await go("/worktrees/w/saga/spell-ui/seo")).toEqual({
      status: 302,
      location: "/worktrees/w/epics/seo/seo.plan.html"
    })
    const missing = await ask(port, "GET", "/saga/spell-ui/gone")
    expect(missing.status).toBe(404)
    expect(missing.text).toContain("no page epics/gone/gone.plan.html")
  })

  test("GET target:  href, title, short form, found;  400 for a bad address", async () => {
    const target = async (query: string) => {
      const answer = await ask(port, "GET", `/api/epics/target?${query}`)
      return { status: answer.status, body: JSON.parse(answer.text) }
    }
    expect(await target("epic=seo&item=J3")).toEqual({
      status: 200,
      body: { href: "epics/seo/seo.plan.html#j3", title: "Titles", label: "seo J3", found: true }
    })
    expect((await target("saga=spell-ui&epic=seo&item=J9")).body).toMatchObject({ found: false, label: "seo J9" })
    expect((await target("saga=Bad")).status).toBe(400)
    expect((await target("item=T1")).status).toBe(400)
  })
})
