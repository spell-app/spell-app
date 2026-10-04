import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

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
})
