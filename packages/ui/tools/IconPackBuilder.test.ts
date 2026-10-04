import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { afterEach, describe, expect, it } from "vite-plus/test"

import type { IconPackIndex } from "../src/icons/icons.types.ts"
import { IconPackBuilder, IconPackError } from "./IconPackBuilder.ts"

/** FA-style glyph:  licence comment, one path, no fill (inherits). */
const FA = (width: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 512"><!--! Font Awesome Free 7.3.1 --><path d="M0 0h1v1z"/></svg>`

/** Lucide-style glyph:  stroked, `fill="none"`, several elements. */
const STROKE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="12" r="3"/></svg>'

/** Temporary pack folders, removed after each test. */
const folders: string[] = []

afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true })
})

describe("IconPackBuilder:  index", () => {
  it("keys each SVG by its path, sizes it from its viewBox, and puts the common size in `defaults`", async () => {
    const folder = pack({ "solid/address-book.svg": FA(448), "solid/gear.svg": FA(512), "solid/bell.svg": FA(448) })
    const report = await new IconPackBuilder({ folder, id: "test" }).build()
    const index = await read(folder)
    expect(index.id).toBe("test")
    expect(index.defaults).toEqual({ width: 448, height: 512 })
    expect(index.icons).toEqual({ "solid/address-book": {}, "solid/bell": {}, "solid/gear": { width: 512 } })
    expect(report).toMatchObject({ count: 3, added: ["solid/address-book", "solid/bell", "solid/gear"], dropped: [] })
  })

  it("orders sub-folders as asked, so the first folder keeps a shared file name", async () => {
    const folder = pack({ "regular/bell.svg": FA(448), "solid/bell.svg": FA(448) })
    const report = await new IconPackBuilder({ folder, id: "test", folders: ["solid", "regular"] }).build()
    expect(Object.keys((await read(folder)).icons)).toEqual(["solid/bell", "regular/bell"])
    expect(report.unreachable).toEqual(["regular/bell"])
  })

  it("gives new entries their `aliases`, which make them reachable", async () => {
    const folder = pack({ "regular/bell.svg": FA(448), "solid/bell.svg": FA(448) })
    const report = await new IconPackBuilder({
      folder,
      id: "test",
      folders: ["solid", "regular"],
      aliases: { "regular/bell": "bell outline" }
    }).build()
    expect((await read(folder)).icons["regular/bell"]).toEqual({ alias: "bell outline" })
    expect(report.unreachable).toEqual([])
  })

  it("indexes a stroke-style (Lucide-like) SVG like any other", async () => {
    const folder = pack({ "bell.svg": STROKE })
    await new IconPackBuilder({ folder, id: "lucide" }).build()
    expect(await read(folder)).toMatchObject({ defaults: { width: 24, height: 24 }, icons: { bell: {} } })
  })

  it("takes explicit keys, including ones in a sibling folder", async () => {
    const root = pack({ "fa/solid/gear.svg": FA(512), "fomantic/.keep.txt": "" })
    const folder = path.join(root, "fomantic")
    await new IconPackBuilder({
      folder,
      id: "fomantic",
      keys: ["../fa/solid/gear"],
      aliases: { "../fa/solid/gear": ["setting", "cog"] }
    }).build()
    expect((await read(folder)).icons).toEqual({ "../fa/solid/gear": { alias: ["setting", "cog"] } })
  })

  it("writes one icon per line", async () => {
    const folder = pack({ "a.svg": FA(448), "b.svg": FA(512) })
    await new IconPackBuilder({ folder, id: "test" }).build()
    const text = readFileSync(path.join(folder, "pack.js"), "utf8")
    expect(text).toContain('\n    "a": {},\n    "b": {"width":512}\n')
  })

  it("never changes an SVG", async () => {
    const files = { "solid/a.svg": FA(448), "b.svg": STROKE }
    const folder = pack(files)
    await new IconPackBuilder({ folder, id: "test" }).build()
    for (const [file, text] of Object.entries(files)) expect(readFileSync(path.join(folder, file), "utf8")).toBe(text)
  })
})

describe("IconPackBuilder:  verify", () => {
  it.each([
    ["<script>", '<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>', "<script> element"],
    ["onload", '<svg viewBox="0 0 1 1" onload="alert(1)"><path d="M0 0"/></svg>', "onload attribute on <svg>"],
    ["<foreignObject>", '<svg viewBox="0 0 1 1"><foreignObject><div/></foreignObject></svg>', "<foreignObject>"],
    ["external href", '<svg viewBox="0 0 1 1"><use href="https://x.test/a.svg#i"/></svg>', 'external href "https:'],
    ["xlink:href", '<svg viewBox="0 0 1 1"><image xlink:href="a.png"/></svg>', 'external xlink:href "a.png"'],
    ["CSS url()", '<svg viewBox="0 0 1 1"><style>path { fill: url(x.svg) }</style></svg>', "external resource"],
    ["no viewBox", "<svg><path/></svg>", "no usable viewBox"],
    ["not an SVG", "<html><body/></html>", "root is <html>"],
    ["entity", '<!DOCTYPE svg [<!ENTITY x "y">]><svg viewBox="0 0 1 1"/>', "<!ENTITY>"]
  ])("refuses %s, naming the file and why, and writes no index", async (_what, svg, reason) => {
    const folder = pack({ "good.svg": FA(448), "bad.svg": svg })
    const error = await new IconPackBuilder({ folder, id: "test" }).build().catch((error: unknown) => error)
    expect(error).toBeInstanceOf(IconPackError)
    const { problems } = error as IconPackError
    expect(problems.map((problem) => problem.file)).toContain("bad.svg")
    expect(problems.find((problem) => problem.file === "bad.svg")?.reason).toContain(reason)
    expect(() => readFileSync(path.join(folder, "pack.js"))).toThrow()
  })

  it("accepts same-file fragments, comments with markup-like text and `>` in quoted values", () => {
    const svg =
      '<svg viewBox="0 0 10 10"><!-- <script> --><defs><linearGradient id="g"/></defs>' +
      '<rect fill="url(#g)" data-note="a > b"/><use href="#g"/></svg>'
    expect(IconPackBuilder.check(svg)).toEqual({ size: [10, 10], unsafe: [], broken: [] })
  })
})

describe("IconPackBuilder:  sanitize", () => {
  it("strips only unsafe attributes, keeping everything else byte for byte, comments included", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><!--! licence <a onclick="x"> -->' +
      '<use href="#g"/><image xlink:href="https://x.test/a.png" width="1"/>' +
      '<path style="fill: url(https://x.test/p.svg)" d="M0 0h1v1z" ONMOUSEOVER=\'y\'/></svg>'
    const { text, removed } = IconPackBuilder.sanitize(svg)
    expect(text).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!--! licence <a onclick="x"> -->' +
        '<use href="#g"/><image width="1"/><path d="M0 0h1v1z"/></svg>'
    )
    expect(removed).toHaveLength(4)
    expect(removed[0]).toBe("removed onload attribute on <svg>")
    expect(IconPackBuilder.check(text)).toEqual({ size: [10, 10], unsafe: [], broken: [] })
  })

  it("returns a safe SVG unchanged", () => {
    const svg = FA(448)
    expect(IconPackBuilder.sanitize(svg)).toEqual({ text: svg, removed: [] })
  })

  it("rewrites only the files it changed, and reports each removal", async () => {
    const dirty = '<svg viewBox="0 0 1 1" onload="alert(1)"><path d="M0 0"/></svg>'
    const folder = pack({ "clean.svg": FA(448), "dirty.svg": dirty })
    const report = await new IconPackBuilder({ folder, id: "test", sanitize: true }).build()
    expect(readFileSync(path.join(folder, "dirty.svg"), "utf8")).toBe('<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>')
    expect(readFileSync(path.join(folder, "clean.svg"), "utf8")).toBe(FA(448))
    expect(report.sanitized).toEqual([{ file: "dirty.svg", reason: "removed onload attribute on <svg>" }])
  })

  it("still refuses unsafe elements, and then rewrites nothing", async () => {
    const dirty = '<svg viewBox="0 0 1 1" onload="alert(1)"><path d="M0 0"/></svg>'
    const script = '<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>'
    const folder = pack({ "dirty.svg": dirty, "script.svg": script })
    const error = await new IconPackBuilder({ folder, id: "test", sanitize: true }).build().catch((e: unknown) => e)
    expect((error as IconPackError).problems).toEqual([{ file: "script.svg", reason: "<script> element" }])
    expect(readFileSync(path.join(folder, "dirty.svg"), "utf8")).toBe(dirty)
    expect(existsSync(path.join(folder, "pack.js"))).toBe(false)
  })

  it("without `sanitize`, reports the same attributes as problems and changes nothing", async () => {
    const dirty = '<svg viewBox="0 0 1 1" onload="alert(1)"><path d="M0 0"/></svg>'
    const folder = pack({ "dirty.svg": dirty })
    await expect(new IconPackBuilder({ folder, id: "test" }).build()).rejects.toThrow("onload attribute")
    expect(readFileSync(path.join(folder, "dirty.svg"), "utf8")).toBe(dirty)
  })
})

describe("IconPackBuilder:  skip / allow unsafe files", () => {
  /** An unsafe file, a broken one and a good one. */
  const FILES = {
    "good.svg": FA(448),
    "script.svg": '<svg viewBox="0 0 1 1"><script>alert(1)</script><path d="M0 0"/></svg>',
    "broken.svg": '<svg><path d="M0 0"/></svg>'
  }

  it("`skip` leaves every failing file out of the index, and reports why", async () => {
    const folder = pack(FILES)
    const report = await new IconPackBuilder({ folder, id: "test", unsafe: "skip" }).build()
    expect(Object.keys((await read(folder)).icons)).toEqual(["good"])
    expect(report.count).toBe(1)
    expect(report.skipped).toEqual([
      { file: "broken.svg", reason: "no usable viewBox on <svg>" },
      { file: "script.svg", reason: "<script> element" }
    ])
  })

  it("`allow` indexes an unsafe file anyway, reported, but still refuses a broken one", async () => {
    const folder = pack(FILES)
    await expect(new IconPackBuilder({ folder, id: "test", unsafe: "allow" }).build()).rejects.toThrow("viewBox")
    rmSync(path.join(folder, "broken.svg"))
    const report = await new IconPackBuilder({ folder, id: "test", unsafe: "allow" }).build()
    expect(Object.keys((await read(folder)).icons)).toEqual(["good", "script"])
    expect(report.allowed).toEqual([{ file: "script.svg", reason: "<script> element" }])
  })

  it("`skip` after `sanitize`:  a file only needing attributes stripped stays, rewritten;  a skipped one isn't", async () => {
    const folder = pack({
      "dirty.svg": '<svg viewBox="0 0 1 1" onload="x"><path d="M0 0"/></svg>',
      "worse.svg": '<svg viewBox="0 0 1 1" onload="x"><script>y</script></svg>'
    })
    const report = await new IconPackBuilder({ folder, id: "test", sanitize: true, unsafe: "skip" }).build()
    expect(Object.keys((await read(folder)).icons)).toEqual(["dirty"])
    expect(readFileSync(path.join(folder, "dirty.svg"), "utf8")).not.toContain("onload")
    expect(readFileSync(path.join(folder, "worse.svg"), "utf8")).toContain("onload")
    expect(report.skipped).toEqual([{ file: "worse.svg", reason: "<script> element" }])
  })
})

describe("IconPackBuilder:  re-run", () => {
  it("keeps hand-added aliases and other fields, refreshes sizes, adds new files and drops gone ones", async () => {
    const folder = pack({ "a.svg": FA(448), "b.svg": FA(448), "gone.svg": FA(448) })
    await new IconPackBuilder({ folder, id: "test" }).build()
    const file = path.join(folder, "pack.js")
    writeFileSync(file, readFileSync(file, "utf8").replace('"b": {}', '"b": {"alias":["bee","buzz"],"note":"mine"}'))
    rmSync(path.join(folder, "gone.svg"))
    writeFileSync(path.join(folder, "b.svg"), FA(640))
    writeFileSync(path.join(folder, "c.svg"), FA(448))

    const report = await new IconPackBuilder({ folder, id: "test" }).build()
    expect((await read(folder)).icons).toEqual({
      a: {},
      b: { width: 640, alias: ["bee", "buzz"], note: "mine" },
      c: {}
    })
    expect(report).toMatchObject({ added: ["c"], dropped: ["gone"] })
  })

  it("refuses a folder whose pack.js has another id, unless forced", async () => {
    const folder = pack({ "a.svg": FA(448) })
    await new IconPackBuilder({ folder, id: "one" }).build()
    await expect(new IconPackBuilder({ folder, id: "two" }).build()).rejects.toThrow('is pack "one"')
    await new IconPackBuilder({ folder, id: "two", force: true }).build()
    expect((await read(folder)).id).toBe("two")
  })
})

describe("IconPackBuilder:  the built-in packs", () => {
  /** `src/icons/icon-packs/`. */
  const PACKS = path.resolve(import.meta.dirname, "../src/icons/icon-packs")

  it("every shipped SVG passes verify", () => {
    const files = readdirSync(PACKS, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".svg"))
    expect(files.length).toBeGreaterThan(2000)
    const failed = files.filter((file) => {
      const { unsafe, broken } = IconPackBuilder.check(readFileSync(path.join(PACKS, file), "utf8"))
      return unsafe.length + broken.length > 0
    })
    expect(failed).toEqual([])
  })

  it.each(["fa7-free", "fa7-brands", "fomantic"])("every entry of %s points at an SVG", async (id) => {
    const index = await read(path.join(PACKS, id))
    expect(index.id).toBe(id)
    const missing = Object.keys(index.icons).filter((key) => !existsSync(path.join(PACKS, id, `${key}.svg`)))
    expect(missing).toEqual([])
  })
})

/** A temporary pack folder holding `files` (path => text). */
function pack(files: Record<string, string>): string {
  const folder = mkdtempSync(path.join(tmpdir(), "icon-pack-"))
  folders.push(folder)
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(folder, file)), { recursive: true })
    writeFileSync(path.join(folder, file), text)
  }
  return folder
}

/** The `pack.js` in `folder`, freshly imported. */
async function read(folder: string): Promise<IconPackIndex> {
  const url = `${pathToFileURL(path.join(folder, "pack.js")).href}?t=${Math.random()}`
  return ((await import(/* @vite-ignore */ url)) as { default: IconPackIndex }).default
}
