import { spawnSync } from "child_process"
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, beforeAll, describe, expect, test } from "vitest"

import { CLI } from "$/cli"

/** The real `spell` command:  `spell static` renders in a child process, through Vite. */
const SPELL = resolve(import.meta.dirname, "..", "..", "bin", "spell.mjs")
/** `ui-segment`, `ui-card` with parts, `ui-button` with an icon, `ui-modal`;  two element scripts and a plain one. */
const FIXTURE = resolve(import.meta.dirname, "staticCommand.fixture.html")
/** Temp folder for pages and what's written:  its REAL path, as on macOS `tmpdir()` is a symlink. */
const TEMP = realpathSync(mkdtempSync(resolve(tmpdir(), "spell-static-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** Each spawn starts Vite and compiles every family:  a few seconds. */
const SLOW = 120_000

/** Run `spell static ...args` in `TEMP`. */
function spellStatic(args: string[]) {
  const { status, stdout, stderr } = spawnSync(process.execPath, [SPELL, "static", ...args], {
    cwd: TEMP,
    encoding: "utf8"
  })
  return { status, stdout, stderr }
}

/** `TEMP/<path>`, read. */
function read(path: string): string {
  return readFileSync(resolve(TEMP, path), "utf8")
}

describe("spell static", () => {
  let run: ReturnType<typeof spellStatic>
  beforeAll(() => {
    copyFileSync(FIXTURE, resolve(TEMP, "page.html"))
    run = spellStatic(["page.html"])
  }, SLOW)

  test("writes page.static.html beside the page, and the folder's ui.static.css", () => {
    expect(run.stderr).toContain("page.html -> page.static.html")
    expect(run.status).toBe(0)
    expect(run.stdout.trim().split("\n")).toEqual(["page.static.html", "ui.static.css"])
    expect(existsSync(resolve(TEMP, "ui.static.css"))).toBe(true)
  })

  test("the page has no elements left:  no ui-* tags, no slots, every family rendered", () => {
    const html = read("page.static.html")
    expect(html).not.toMatch(/<ui-/)
    expect(html).not.toMatch(/<slot[\s>]/)
    for (const noun of ["segment", "card", "header", "button", "modal"]) expect(html).toContain(`data-ui="${noun}"`)
    expect(html).toContain("Card description")
    expect(html).toMatch(/<svg[^>]*viewBox/)
    expect(html).toMatch(/<dialog[^>]*data-ui="modal"/)
  })

  test("drops the scripts that load the elements, keeps the rest", () => {
    const html = read("page.static.html")
    expect(html).not.toContain("@spell-app/ui")
    expect(html).toContain('dataset.plain = "kept"')
    expect(run.stderr).toContain("removed scripts:  inline, /node_modules/@spell-app/ui/dist/ui-button.js")
  })

  test("links the stylesheet first in <head>, before the page's own CSS", () => {
    const head = read("page.static.html").split("</head>")[0]!
    const link = head.indexOf('href="ui.static.css"')
    expect(link).toBeGreaterThan(-1)
    expect(link).toBeLessThan(head.indexOf('href="site.css"'))
    // the page's own <style>, rewritten for the flattened output
    expect(head).toContain('[data-ui="card"][part~="header"]')
  })

  test("the stylesheet is scoped, layered and minified, and says what it covers", () => {
    const css = read("ui.static.css")
    expect(css).toContain("@scope")
    expect(css).toContain("@layer")
    expect(css).toContain(":where(")
    expect(css).not.toMatch(/\n\s*\n/)
    expect(run.stderr).toMatch(/ui\.static\.css {2}[\d.]+ kB from [\d.]+ kB/)
    expect(CLI.readCoverage(resolve(TEMP, "ui.static.css"))!.tags).toEqual(
      expect.arrayContaining(["ui-button", "ui-card", "ui-modal", "ui-segment"])
    )
  })

  test(
    "re-rendering ONE page keeps what the folder's sheet covered for the others",
    () => {
      mkdirSync(resolve(TEMP, "cache"), { recursive: true })
      copyFileSync(FIXTURE, resolve(TEMP, "cache", "full.html"))
      writeFileSync(resolve(TEMP, "cache", "small.html"), "<!doctype html><p>x</p><ui-label>New</ui-label>")
      expect(spellStatic(["cache"]).status).toBe(0)
      const before = CLI.readCoverage(resolve(TEMP, "cache", "ui.static.css"))!.tags
      expect(before).toEqual(expect.arrayContaining(["ui-card", "ui-label"]))
      expect(spellStatic(["cache/small.html"]).status).toBe(0)
      const after = CLI.readCoverage(resolve(TEMP, "cache", "ui.static.css"))!.tags
      expect(after).toEqual(before)
      expect(read("cache/ui.static.css")).toContain("[data-ui=card]")
    },
    SLOW
  )

  test(
    "--inline-css:  the stylesheet in a <style>, no file",
    () => {
      mkdirSync(resolve(TEMP, "inline"), { recursive: true })
      copyFileSync(FIXTURE, resolve(TEMP, "inline", "inline.html"))
      const { status } = spellStatic(["inline/inline.html", "--inline-css", "-o", "inline/inline-out.html"])
      expect(status).toBe(0)
      const head = read("inline/inline-out.html").split("</head>")[0]!
      expect(head).toMatch(/<style>@layer[^<]*@scope/)
      expect(existsSync(resolve(TEMP, "inline", "ui.static.css"))).toBe(false)
    },
    SLOW
  )

  test(
    "a folder, -o another folder and --css:  each page keeps its name, one stylesheet links from each",
    () => {
      mkdirSync(resolve(TEMP, "site", "nested"), { recursive: true })
      copyFileSync(FIXTURE, resolve(TEMP, "site", "a.html"))
      writeFileSync(
        resolve(TEMP, "site", "nested", "b.html"),
        "<!doctype html><p>no elements</p><ui-label>New</ui-label>"
      )
      const { status, stdout } = spellStatic(["site", "-o", "out", "--css", "out/site.css"])
      expect(status).toBe(0)
      expect(stdout.trim().split("\n")).toEqual(["out/a.html", "out/nested/b.html", "out/site.css"])
      expect(read("out/a.html")).toContain('href="site.css"')
      expect(read("out/nested/b.html")).toContain('href="../site.css"')
      // one sheet for both pages' families (minified:  attribute values unquoted)
      const css = read("out/site.css")
      expect(css).toContain("[data-ui=card]")
      expect(css).toContain("[data-ui=label]")
    },
    SLOW
  )

  test(
    "--inline-css with --css is a usage error",
    () => {
      const { status, stderr } = spellStatic(["page.html", "--inline-css", "--css", "x.css"])
      expect(status).toBe(CLI.EXIT.USAGE)
      expect(stderr).toContain("--inline-css and --css")
    },
    SLOW
  )
})

describe("staticPages()", () => {
  test("beside each page, as <page>.static.html", () => {
    const page = resolve(TEMP, "page.html")
    writeFileSync(page, "")
    expect(CLI.staticPages([page], {})).toEqual([{ input: page, output: resolve(TEMP, "page.static.html") }])
  })

  test("-o names the page for one, a folder for several", () => {
    const [a, b] = ["one.html", "two.html"].map((name) => resolve(TEMP, name))
    for (const page of [a!, b!]) writeFileSync(page, "")
    expect(CLI.staticPages([a!], { output: resolve(TEMP, "x.html") })[0]!.output).toBe(resolve(TEMP, "x.html"))
    expect(CLI.staticPages([a!, b!], { output: resolve(TEMP, "dist") }).map((it) => it.output)).toEqual([
      resolve(TEMP, "dist", "one.html"),
      resolve(TEMP, "dist", "two.html")
    ])
  })

  test("refuses a missing page and overwriting a page", () => {
    expect(() => CLI.staticPages([resolve(TEMP, "nope.html")], {})).toThrow("No such page")
    const page = resolve(TEMP, "same.html")
    writeFileSync(page, "")
    expect(() => CLI.staticPages([page], { output: page })).toThrow("Won't overwrite")
  })
})

describe("coverageLine() / readCoverage()", () => {
  test("round-trip through a sheet's first line;  a sheet without one covers nothing", () => {
    const coverage = { tags: ["ui-card"], users: { list: ["item", "list"] }, orders: [["item", "list"]] }
    const path = resolve(TEMP, "covered.css")
    writeFileSync(path, `${CLI.coverageLine(coverage)}\n.x{}`)
    expect(CLI.readCoverage(path)).toEqual(coverage)
    writeFileSync(path, ".x{}")
    expect(CLI.readCoverage(path)).toBeUndefined()
    expect(CLI.readCoverage(resolve(TEMP, "no-such.css"))).toBeUndefined()
  })
})
