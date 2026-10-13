/**
 * Tests of the running epics' route module, in a scratch checkout with one worktree:  the list as JSON, the Epics
 * page served with its card, and the watcher closed with the server.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import { MARKER, type RunningEpic } from "$/epics/list/RunningEpics"
import runningRoutes, { RUNNING_API } from "$/epics/list/runningRoutes"

/** Write `html` at `path` under `root`, making folders. */
function put(root: string, path: string, html: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

describe("runningRoutes", () => {
  const root = mkdtempSync(join(tmpdir(), "epics-running-"))
  // no running sessions:  never this machine's (`RunningEpics.claudeHome`)
  const claudeHome = mkdtempSync(join(tmpdir(), "epics-running-claude-"))
  const home = process.env.SPELL_CLAUDE_HOME
  const stops: (() => unknown)[] = []
  let server: PageServer
  let port: number

  beforeAll(async () => {
    process.env.SPELL_CLAUDE_HOME = claudeHome
    put(root, "epics/index.html", `<html><head></head><body>${MARKER}</body></html>\n`)
    put(
      root,
      ".claude/worktrees/seo/epics/seo/seo.plan.html",
      `<html><head><title>Epic: SEO</title></head><body class="plan-doc"><epic-page epic="seo">` +
        `<epic-phase id="p1" title="Meta Tags" status="active"></epic-phase></epic-page></body></html>\n`
    )
    server = new PageServer({ root })
    await runningRoutes.setup({
      root,
      router: server.web.router,
      guard: server.web.guard,
      live: server.web.live!,
      web: server.web,
      info: server.info,
      onListening: () => {},
      onStop: (stop) => stops.push(stop)
    })
    await server.start({ port: 0, routes: false, pidFile: false })
    port = server.info.port
  })

  afterAll(async () => {
    for (const stop of stops) await stop()
    await server.stop()
    if (home === undefined) delete process.env.SPELL_CLAUDE_HOME
    else process.env.SPELL_CLAUDE_HOME = home
    rmSync(root, { recursive: true, force: true })
    rmSync(claudeHome, { recursive: true, force: true })
  })

  test("answers the running epics as JSON at `/api/epics/running`, never cached;  the old path is gone", async () => {
    const answer = await ask(port, "GET", RUNNING_API)
    expect(answer.status).toBe(200)
    expect(answer.headers["cache-control"]).toBe("no-store")
    const list = JSON.parse(answer.text) as RunningEpic[]
    expect(list).toMatchObject([
      {
        name: "seo",
        worktree: "seo",
        title: "SEO",
        url: "/worktrees/seo/epics/seo/seo.plan.html",
        active: "P1 · Meta Tags"
      }
    ])
    expect((await ask(port, "GET", "/_server/epics")).status).toBe(404)
  })

  test("serves the Epics page with the running epic's card at the marker", async () => {
    const page = (await ask(port, "GET", "/epics/index.html")).text
    expect(page).not.toContain(MARKER)
    expect(page).toContain('href="/worktrees/seo/epics/seo/seo.plan.html"')
  })

  test("closes its watcher when the server stops", () => {
    expect(stops).toHaveLength(1)
  })
})
