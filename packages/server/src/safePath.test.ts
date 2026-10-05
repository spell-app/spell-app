import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"

/** A folder with `site/` to serve and `secret.txt` beside it. */
const DIR = mkdtempSync(join(tmpdir(), "srv-safe-"))
const ROOT = join(DIR, "site")
mkdirSync(join(ROOT, "docs"), { recursive: true })
mkdirSync(join(ROOT, "empty"))
writeFileSync(join(ROOT, "index.html"), "<p>home</p>")
writeFileSync(join(ROOT, "docs", "index.html"), "<p>docs</p>")
writeFileSync(join(ROOT, "docs", "a b.css"), "a{}")
writeFileSync(join(ROOT, ".env"), "SECRET=1")
writeFileSync(join(DIR, "secret.txt"), "secret")

afterAll(() => rmSync(DIR, { recursive: true, force: true }))

describe("resolveInside()", () => {
  it("finds files, decoding each segment", () => {
    expect(SRV.resolveInside(ROOT, "/docs/a%20b.css")).toMatchObject({ file: join(ROOT, "docs", "a b.css") })
  })

  it("serves a folder's index.html, redirecting without the trailing slash", () => {
    expect(SRV.resolveInside(ROOT, "/")).toMatchObject({ file: join(ROOT, "index.html") })
    expect(SRV.resolveInside(ROOT, "/docs/")).toMatchObject({ file: join(ROOT, "docs", "index.html") })
    expect(SRV.resolveInside(ROOT, "/docs")).toEqual({ redirect: "/docs/" })
    expect(SRV.resolveInside(ROOT, "/empty/")).toMatchObject({ status: 404 })
    expect(SRV.resolveInside(ROOT, "/docs/", { index: false })).toMatchObject({ status: 404 })
  })

  it.each([
    ["/../secret.txt", 403],
    ["/%2e%2e/secret.txt", 403],
    ["/docs/%2e%2e/%2e%2e/secret.txt", 403],
    ["/..%2fsecret.txt", 400],
    ["/%2fetc%2fpasswd", 400],
    ["/docs%5c..%5csecret.txt", 400],
    ["/a%00b", 400],
    ["/%E0%A4%A", 400],
    ["/.env", 403],
    ["/nope.html", 404]
  ])("refuses %s with %i", (path, status) => {
    expect(SRV.resolveInside(ROOT, path)).toMatchObject({ status })
  })

  it("serves dot files only when allowed, and never `..`", () => {
    expect(SRV.resolveInside(ROOT, "/.env", { dotFiles: true })).toMatchObject({ file: join(ROOT, ".env") })
    expect(SRV.resolveInside(ROOT, "/../secret.txt", { dotFiles: true })).toMatchObject({ status: 403 })
  })
})

describe("isInside()", () => {
  it("is segment-wise, not a string prefix", () => {
    expect(SRV.isInside("/a/b", "/a/b")).toBe(true)
    expect(SRV.isInside("/a/b", "/a/b/c")).toBe(true)
    expect(SRV.isInside("/a/b", "/a/bc")).toBe(false)
    expect(SRV.isInside("/a/b", "/a")).toBe(false)
  })
})

describe("mime", () => {
  it("types by extension, any case, with a fallback", () => {
    expect(SRV.typeFor("x/Page.HTML")).toBe("text/html; charset=utf-8")
    expect(SRV.typeFor("a.spell")).toBe("text/plain; charset=utf-8")
    expect(SRV.typeFor("a.weird")).toBe(SRV.UNKNOWN_TYPE)
  })

  it("names types as Express's `type()` does", () => {
    expect(SRV.typeNamed("json")).toBe(SRV.TYPES[".json"])
    expect(SRV.typeNamed(".css")).toBe(SRV.TYPES[".css"])
    expect(SRV.typeNamed("text/javascript")).toBe("text/javascript")
  })
})
