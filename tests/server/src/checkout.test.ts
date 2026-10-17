import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { SRV } from "$/server"
import { fakeMainCheckout, fakeWorktree } from "$/server/test/checkouts"

/** A main checkout with a worktree in it, and one beside it. */
const TOP = mkdtempSync(join(tmpdir(), "srv-checkout-"))
const MAIN = fakeMainCheckout(join(TOP, "repo"))
const INSIDE = fakeWorktree(MAIN, join(MAIN, ".claude", "worktrees", "seo"))
const BESIDE = fakeWorktree(MAIN, join(TOP, "repo.worktrees", "vite"))
afterAll(() => rmSync(TOP, { recursive: true, force: true }))

describe("SRV.checkoutOf()", () => {
  test("the main checkout is its own main, from any folder in it, there or not", () => {
    expect(SRV.checkoutOf(MAIN)).toEqual({ root: MAIN, main: MAIN })
    expect(SRV.checkoutOf(join(MAIN, "packages", "ui", "not-there.ts"))).toEqual({ root: MAIN, main: MAIN })
  })

  test("a worktree's main is the checkout its git shares, WHEREVER its folder is", () => {
    expect(SRV.checkoutOf(join(INSIDE, "epics", "seo"))).toEqual({ root: INSIDE, main: MAIN, worktree: "seo" })
    expect(SRV.checkoutOf(BESIDE)).toEqual({ root: BESIDE, main: MAIN, worktree: "vite" })
  })

  test("a `.git` file with no common dir (a submodule's) is a checkout of its own;  outside git:  `undefined`", () => {
    const submodule = join(MAIN, "vendor", "lib")
    mkdirSync(join(MAIN, ".git", "modules", "lib"), { recursive: true })
    mkdirSync(submodule, { recursive: true })
    writeFileSync(join(submodule, ".git"), `gitdir: ${join(MAIN, ".git", "modules", "lib")}\n`)
    expect(SRV.checkoutOf(join(submodule, "a.js"))).toEqual({ root: submodule, main: submodule })
    expect(SRV.checkoutOf(join(TOP, "elsewhere"))).toBeUndefined()
  })
})
