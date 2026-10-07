/**
 * Tests of `PlanDocFiles`:  reading a doc whole (either markup), editing it under its lock, writing it as a skeleton
 * and parts (`EpicParts`) or one file, and refusing what an edit mustn't touch.
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, test } from "vite-plus/test"

import { Markup } from "$/epics/markup"

import { PlanDocError } from "./planDoc.types"

import { OldPlanReader } from "./OldPlanReader"
import { PlanDoc } from "./PlanDoc"
import { PlanDocFiles } from "./PlanDocFiles"

/** The tracked fixtures:  a new doc in `<epic-*>` markup, and one in the old markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

/** This checkout's plan docs:  the edits below are on temp files, linked and formatted as a real doc's. */
const FILES = new PlanDocFiles()

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/**
 * A plan doc with a body in every kind of host:  an Overview sub-section (with an `h4` id and a link), a phase,
 * an item with details (and a commit), an item without, the log.
 */
function richPlan() {
  const plan = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"), NOW)
  plan.document.getElementById("o1")!.innerHTML =
    '<p>See <a href="../../guides/x.html" target="src-x">x</a> and <a href="#c1">C1</a>.</p><h4 id="o1-deep">Deep</h4>'
  plan.addPhase("One", { goal: "<ul><li>a goal</li></ul>" })
  plan.addItem("caveat", "with details", { details: '<p>why, <a href="https://example.com">out</a></p>' })
  plan.addItem("todo", "bare line")
  plan.addCommit({ item: "c1" }, "a".repeat(40), "fixed it")
  plan.log("a line")
  return plan
}

/** `<epic-page>`, whitespace squashed:  two docs with the same content compare equal however they're laid out. */
function squashedPage(plan: PlanDoc) {
  return plan.page.outerHTML.replace(/\s+/g, " ").replace(/> </g, "><").replace(/ <\//g, "</")
}

describe("PlanDocFiles", () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  /** A fresh temp folder. */
  function folder() {
    const dir = mkdtempSync(join(tmpdir(), "plan-doc-files-"))
    dirs.push(dir)
    return dir
  }

  /** `richPlan()` as a one-file doc in a temp folder:  its path. */
  async function oneFile() {
    const file = join(folder(), "x.plan.html")
    writeFileSync(file, "")
    await FILES.writeDoc(file, richPlan(), false)
    return file
  }

  test("one file stays one file;  split writes a skeleton and parts;  join puts it back;  nothing lost", async () => {
    const file = await oneFile()
    const parts = join(file, "..", "parts")
    await FILES.edit(file, (plan) => plan.log("still one file"))
    expect(existsSync(parts)).toBe(false)
    const whole = squashedPage(FILES.read(file))
    await FILES.edit(file, () => {}, { split: true })
    expect(readdirSync(parts).sort()).toEqual(["c1.htm", "log.htm", "o1.htm", "p1.htm"])
    const skeleton = readFileSync(file, "utf8")
    expect(skeleton).toMatch(/<epic-phase[^>]*source="parts\/p1.htm"/)
    expect(skeleton).toMatch(/<epic-item\s+id="c1"[^>]*source="parts\/c1.htm"[^>]*commits/)
    expect(readFileSync(join(parts, "o1.htm"), "utf8")).toContain('href="../../../guides/x.html"')
    const plan = FILES.read(file)
    expect(plan.parts).toMatchObject({ split: true, hosts: ["o1", "p1", "c1", "log"], missing: [] })
    expect(squashedPage(plan)).toBe(whole)
    expect(Markup.validate(plan.document)).toEqual([])
    await FILES.edit(file, () => {}, { split: false })
    expect(existsSync(parts)).toBe(false)
    expect(squashedPage(FILES.read(file))).toBe(whole)
  })

  test("an edit rewrites only the parts it changed, and every command reads the doc whole", async () => {
    const file = await oneFile()
    await FILES.edit(file, () => {}, { split: true })
    const parts = join(file, "..", "parts")
    const stamps = (): Record<string, number> =>
      Object.fromEntries(readdirSync(parts).map((name) => [name, statSync(join(parts, name)).mtimeMs]))
    const before = stamps()
    await new Promise((done) => setTimeout(done, 20))
    await FILES.edit(file, (plan) => plan.log("one more"))
    let after = stamps()
    expect(Object.keys(after).filter((name) => after[name] !== before[name])).toEqual(["log.htm"])
    await FILES.edit(file, (plan) => plan.setDetails("c1", "<p>rewritten</p>"))
    const now = stamps()
    expect(Object.keys(now).filter((name) => now[name] !== after[name])).toEqual(["c1.htm"])
    after = now
    await FILES.edit(file, (plan) => plan.setItem("t1", "done"))
    const last = stamps()
    expect(Object.keys(last).filter((name) => last[name] !== after[name])).toEqual([])
    expect(readFileSync(file, "utf8")).toMatch(/<epic-item\s+id="t1"\s+title="bare line"\s+status="done"/)
    expect(FILES.read(file).item("c1").textContent).toContain("rewritten")
  })

  test("an item that gets details later gets a part on the next write", async () => {
    const file = await oneFile()
    await FILES.edit(file, () => {}, { split: true })
    await FILES.edit(file, (plan) => plan.setDetails("t1", "<p>now with details</p>"))
    expect(readFileSync(join(file, "..", "parts", "t1.htm"), "utf8")).toContain("now with details")
    expect(readFileSync(file, "utf8")).toMatch(/<epic-item\s+id="t1"[^>]*source="parts\/t1.htm"/)
  })

  test("an old-markup doc:  read (readAny), never edited:  every editing path refuses it, writing nothing", async () => {
    const file = join(folder(), "old.plan.html")
    const html = readFileSync(join(FIXTURES, "plan.html"), "utf8").replaceAll("{{title}}", "Old")
    writeFileSync(file, html)
    const plan = FILES.readAny(file)
    expect(plan).toBeInstanceOf(OldPlanReader)
    expect(plan.title).toBe("Old")
    expect(() => FILES.read(file)).toThrow(/is in the old markup:  convert it first \(spell dev plan-doc convert\)/)
    expect(() => FILES.requireNewMarkup(file)).toThrow(PlanDocError)
    await expect(FILES.edit(file, (doc) => doc.log("x"))).rejects.toThrow(/old markup/)
    expect(readFileSync(file, "utf8")).toBe(html)
  })

  test("an edit that would break the markup is refused, writing nothing", async () => {
    const file = await oneFile()
    const before = readFileSync(file, "utf8")
    await expect(
      FILES.edit(file, (plan) => plan.findSection("todos")!.append(plan.make("epic-event", { at: "2026-10-01" })))
    ).rejects.toThrow(/nothing written:  the edit would break the doc/)
    expect(readFileSync(file, "utf8")).toBe(before)
  })

  test("& in an attribute survives a write and a read (I2)", async () => {
    const file = await oneFile()
    await FILES.edit(file, (plan) => plan.addItem("todo", "A &lt; B & C"))
    expect(readFileSync(file, "utf8")).toContain('title="A &amp;lt; B &amp; C"')
    expect(FILES.read(file).items("todo").at(-1)!.title).toBe("A &lt; B & C")
  })
})
