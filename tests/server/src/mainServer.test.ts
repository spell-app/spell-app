import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
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

  // epic `epic-eject` I20:  spell-epic hands out content-folder paths, with no checkout in them
  describe("a file of the shared content folder, by its own path", () => {
    const top = realpathSync(mkdtempSync(join(tmpdir(), "srv-content-")))
    const root = fakeMainCheckout(join(top, "repo"))
    const content = fakeMainCheckout(join(top, "repo.epics"))
    const worktree = fakeWorktree(root, join(top, "repo.worktrees", "seo"))
    const plan = join(content, "epics", "x", "x.plan.html")
    mkdirSync(dirname(plan), { recursive: true })
    writeFileSync(plan, "<p>plan</p>")
    writeFileSync(join(root, "package.json"), "{}")
    // the worktrees' folder's link to it (spell-epic's `linkContentBeside()`)
    symlinkSync("../repo.epics", join(top, "repo.worktrees", "repo.epics"))
    afterAll(() => rmSync(top, { recursive: true, force: true }))

    it("contentPathOf():  its path in the content folder, by path or through a link;  else `undefined`", () => {
      expect(SRV.contentPathOf(plan, { contentFolder: content })).toBe("/epics/x/x.plan.html")
      const linked = join(top, "repo.worktrees", "repo.epics", "epics", "x", "x.plan.html")
      expect(SRV.contentPathOf(linked, { contentFolder: content })).toBe("/epics/x/x.plan.html")
      expect(SRV.contentPathOf(join(root, "a.html"), { contentFolder: content })).toBeUndefined()
      expect(SRV.contentPathOf(content, { contentFolder: content })).toBeUndefined()
      expect(SRV.contentPathOf(plan, {})).toBeUndefined()
    })

    it("answers on the main server that serves it, from no checkout, a worktree or the main one", async () => {
      expect(SRV.contentServerOf(plan)).toBeUndefined()
      const server = new PageServer({ root })
      // as epics' route module does, before the server listens and writes its pid file
      server.serveContent(content)
      await server.start({ port: 0, routes: false })
      try {
        server.web.router.get(SRV.RUNNING_EPICS_API, (_request, reply) => reply.json([]))
        const url = `http://127.0.0.1:${server.info.port}/epics/x/x.plan.html`
        expect(SRV.contentServerOf(plan)).toBe(root)
        expect(await SRV.mainServerUrl(plan)).toBe(url)
        expect(await SRV.mainServerUrl(plan, worktree)).toBe(url)
        expect(await SRV.mainServerUrl(plan, root)).toBe(url)
        // a file of the main checkout itself, with no checkout given:  not the content's, no main server URL
        expect(await SRV.mainServerUrl(join(root, "package.json"))).toBeUndefined()
      } finally {
        await server.stop()
      }
    })
  })
})
