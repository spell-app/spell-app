import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"
import { PageServer } from "$/server/page"

describe("worktreePath()", () => {
  it("splits a worktree's file into main checkout, worktree and path", () => {
    expect(SRV.worktreePath("/repo/.claude/worktrees/seo/packages/docs/content/a b.html")).toEqual({
      main: "/repo",
      worktree: "seo",
      path: ["packages", "docs", "content", "a b.html"]
    })
  })

  it("is `undefined` outside a worktree", () => {
    expect(SRV.worktreePath("/repo/packages/docs/content/a.html")).toBeUndefined()
    expect(SRV.worktreePath("/repo/.claude/worktrees")).toBeUndefined()
  })
})

describe("mainServerUrl()", () => {
  it("answers on the main server once it runs and serves worktrees;  else `undefined`", async () => {
    const root = mkdtempSync(join(tmpdir(), "srv-main-"))
    const file = join(root, ".claude", "worktrees", "seo", "packages", "docs", "content", "a b.html")
    mkdirSync(join(file, ".."), { recursive: true })
    writeFileSync(file, "<p>a</p>")
    writeFileSync(join(root, "package.json"), "{}")
    // not running yet
    expect(await SRV.mainServerUrl(file)).toBeUndefined()
    const server = await new PageServer({ root }).start({ port: 0, routes: false })
    try {
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
    const worktree = join(root, ".claude", "worktrees", "seo")
    mkdirSync(join(shared, "seo"), { recursive: true })
    mkdirSync(worktree, { recursive: true })
    writeFileSync(join(shared, "seo", "seo.plan.html"), "<p>plan</p>")
    writeFileSync(join(root, "package.json"), "{}")
    symlinkSync(shared, join(root, "epics"))
    symlinkSync(shared, join(worktree, "epics"))
    const server = await new PageServer({ root }).start({ port: 0, routes: false })
    try {
      const url = await SRV.mainServerUrl(join(worktree, "epics", "seo", "seo.plan.html"))
      expect(url).toBe(`http://127.0.0.1:${server.info.port}/epics/seo/seo.plan.html`)
    } finally {
      await server.stop()
      rmSync(top, { recursive: true, force: true })
    }
  })
})
