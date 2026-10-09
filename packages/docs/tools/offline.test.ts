import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vite-plus/test"

import { HIGHLIGHT, Offline, run } from "./offline.ts"

describe("Offline.loadsIn()", () => {
  it("finds what a page fetches as it loads:  scripts, media, stylesheets, CSS urls", () => {
    const page = [
      `<script src="${HIGHLIGHT.cdn}"></script>`,
      `<img alt="x" src="https://example.com/a.png">`,
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Karma">`,
      `<style>@import url("https://example.com/b.css"); .x { background: url(//example.com/c.png) }</style>`
    ].join("\n")
    expect(Offline.loadsIn("page.html", page).map(({ line, kind }) => `${line} ${kind}`)).toEqual([
      "1 script",
      "2 media",
      "3 link",
      "4 css",
      "4 css"
    ])
  })

  it("skips plain links, links that don't load, local files, and code shown on the page", () => {
    const page = [
      `<a href="https://example.com/">a link</a>`,
      `<link rel="canonical" href="https://example.com/page">`,
      `<script src="../packages/docs/tools/_assets/spell-ui.js"></script>`,
      `<pre>&lt;script src="${HIGHLIGHT.cdn}"&gt;&lt;/script&gt;</pre>`
    ].join("\n")
    expect(Offline.loadsIn("page.html", page)).toEqual([])
  })
})

describe("spell dev docs offline", () => {
  const root = mkdtempSync(join(tmpdir(), "docs-offline-"))
  const page = join(root, "guides", "topic", "topic.html")
  mkdirSync(join(root, ".git"))
  mkdirSync(join(root, "guides", "topic"), { recursive: true })
  writeFileSync(page, `<script src="${HIGHLIGHT.cdn}"></script>\n`)

  afterAll(() => rmSync(root, { recursive: true, force: true }))

  it("lists remote loads in the docs folders, and exits 1", () => {
    expect(run(["--json"], { cwd: root })).toBe(1)
  })

  it("--fix points highlight.js at the repo's copy, relative to the page, and exits 0", () => {
    expect(run(["--fix", "--json"], { cwd: root })).toBe(0)
    expect(readFileSync(page, "utf8")).toBe(`<script src="../../${HIGHLIGHT.local}"></script>\n`)
  })

  it("exits 2 on an unknown flag or a missing path", () => {
    expect(run(["--fast"], { cwd: root })).toBe(2)
    expect(run(["nowhere"], { cwd: root })).toBe(2)
  })
})
