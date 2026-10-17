import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"
import { PageServer } from "$/server/page"
import { fakeMainCheckout, fakeWorktree } from "$/server/test/checkouts"

describe("worktreePath()", () => {
  /** A main checkout and its worktree `seo`, as git leaves them. */
  const top = mkdtempSync(join(tmpdir(), "srv-path-"))
  const main = fakeMainCheckout(join(top, "repo"))
  const seo = fakeWorktree(main, join(main, ".claude", "worktrees", "seo"))
  afterAll(() => rmSync(top, { recursive: true, force: true }))

  it("splits a worktree's file into main checkout, worktree and path", () => {
    expect(SRV.worktreePath(join(seo, "packages/docs/content/a b.html"))).toEqual({
      main,
      root: seo,
      worktree: "seo",
      path: ["packages", "docs", "content", "a b.html"]
    })
  })

  it("is `undefined` outside a worktree", () => {
    expect(SRV.worktreePath(join(main, "packages/docs/content/a.html"))).toBeUndefined()
    expect(SRV.worktreePath(join(main, ".claude", "worktrees"))).toBeUndefined()
  })
})

describe("mainServerUrl()", () => {
  it("answers on the main server once it runs and serves worktrees;  else `undefined`", async () => {
    const root = fakeMainCheckout(mkdtempSync(join(tmpdir(), "srv-main-")))
    const file = join(
      fakeWorktree(root, join(root, ".claude", "worktrees", "seo")),
      "packages",
      "docs",
      "content",
      "a b.html"
    )
    mkdirSync(join(file, ".."), { recursive: true })
    writeFileSync(file, "<p>a</p>")
    writeFileSync(join(root, "package.json"), "{}")
    // not running yet
    expect(await SRV.mainServerUrl(file)).toBeUndefined()
    const server = await new PageServer({ root }).start({ port: 0, routes: false })
    try {
      // running, but without epics' route module:  no running epics, so not a server that shows worktrees
      expect(await SRV.mainServerUrl(file)).toBeUndefined()
      server.web.router.get(SRV.RUNNING_EPICS_API, (_request, reply) => reply.json([]))
      const url = await SRV.mainServerUrl(file)
      expect(url).toBe(`http://127.0.0.1:${server.info.port}/worktrees/seo/packages/docs/content/a%20b.html`)
    } finally {
      await server.stop()
      rmSync(root, { recursive: true, force: true })
    }
  })

  it("serves shared content (a link both checkouts share) from the main checkout itself", async () => {
    const top = mkdtempSync(join(tmpdir(), "srv-shared-"))
    const root = join(top, "repo")
    const shared = join(top, "repo-dev", "epics")
    const worktree = fakeWorktree(root, join(root, ".claude", "worktrees", "seo"))
    mkdirSync(join(shared, "seo"), { recursive: true })
    writeFileSync(join(shared, "seo", "seo.plan.html"), "<p>plan</p>")
    writeFileSync(join(root, "package.json"), "{}")
    symlinkSync(shared, join(root, "epics"))
    symlinkSync(shared, join(worktree, "epics"))
    const server = await new PageServer({ root }).start({ port: 0, routes: false })
    try {
      // as epics' route module answers, so the server counts as one that shows worktrees
      server.web.router.get(SRV.RUNNING_EPICS_API, (_request, reply) => reply.json([]))
      const url = await SRV.mainServerUrl(join(worktree, "epics", "seo", "seo.plan.html"))
      expect(url).toBe(`http://127.0.0.1:${server.info.port}/epics/seo/seo.plan.html`)
    } finally {
      await server.stop()
      rmSync(top, { recursive: true, force: true })
    }
  })
})
