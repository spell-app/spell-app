/**
 * Tests of `PlanParts`:  splitting a plan doc into a skeleton and part files, assembling it back, and the files
 * `PlanDocFiles` writes.
 * - From `packages/docs/tools/plan-parts.test.js` (epic `epic-components`, P7):  every case.
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"
import { afterEach, describe, expect, test } from "vite-plus/test"

import { PlanDoc } from "./PlanDoc"
import { PlanDocFiles } from "./PlanDocFiles"
import { PlanParts } from "./PlanParts"

/** The template's copy the tests read (`PlanDoc.test.ts`'s too). */
const TEMPLATE = fileURLToPath(new URL("fixtures/plan.html", import.meta.url))

/** This checkout's plan docs:  the edits below are on temp files, linked and formatted as a real doc's. */
const FILES = new PlanDocFiles()

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/**
 * A plan doc with a body in every kind of host:  an Overview sub-section (with an `h4` id and a link), a phase,
 * an item with details (and commits), an item without, the log.
 */
function richPlan() {
  const plan = PlanDoc.parse(readFileSync(TEMPLATE, "utf8"), NOW)
  plan.document.getElementById("o1")!.innerHTML =
    '<p>See <a href="../../guides/x.html" target="src-x">x</a> and <a href="#q1">Q1</a>.</p><h4 id="o1-deep">Deep</h4>'
  plan.addPhase("One", { goal: "<ul><li>a goal</li></ul>" })
  plan.addItem("caveat", "with details", { details: '<p>why, <a href="https://example.com">out</a></p>' })
  plan.addItem("todo", "bare line")
  plan.addCommit({ item: "c1" }, "a".repeat(40), "fixed it")
  plan.log("a line")
  return plan
}

/** `main`, whitespace squashed:  two docs with the same content compare equal however they're laid out. */
function squashedMain(document: Document) {
  return document.querySelector("main")!.outerHTML.replace(/\s+/g, " ").replace(/> </g, "><").replace(/ <\//g, "</")
}

describe("PlanParts.split() / assemble()", () => {
  test("every host's body goes to a part;  the skeleton keeps lines, ids, statuses", () => {
    const plan = richPlan()
    const whole = squashedMain(plan.document)
    const parts = new PlanParts(plan.document).split({ docName: "x.plan.html" })
    expect([...parts.keys()]).toEqual(["o1", "p1", "c1", "log"])
    const doc = plan.document
    expect(new PlanParts(doc).isSplit).toBe(true)
    expect(doc.body.hasAttribute("data-spell-needs-server")).toBe(true)
    expect(doc.getElementById("o1")!.getAttribute("source")).toBe("parts/o1.htm")
    expect(doc.getElementById("o1")!.getAttribute("data-part-ids")).toBe("o1-deep")
    expect(doc.querySelector("#c1 > ui-accordion")!.getAttribute("source")).toBe("parts/c1.htm")
    expect(doc.querySelector("#c1 > ui-accordion")!.hasAttribute("data-commits")).toBe(true)
    // the line stays:  id chip, title, status
    expect(doc.querySelector("#c1 > ui-accordion > ui-title .plan-title")!.textContent).toBe("with details")
    expect(doc.getElementById("c1")!.getAttribute("data-status")).toBe("open")
    // the phase keeps its status icon, its body goes
    expect(doc.querySelector('#p1 > ui-icon[slot="icon"]')).not.toBeNull()
    expect(doc.querySelector("#p1 .plan-phase-body")).toBeNull()
    // an item without details has no part
    expect(doc.querySelector("#t1 [source]")).toBeNull()
    // the placeholder says where the body is
    expect(doc.querySelector("#p1 > .plan-part-note")!.textContent).toContain("parts/p1.htm")
    // a part:  its comment, then the body, relative URLs one folder down
    expect(parts.get("o1")).toMatch(/^<!-- plan-doc part:  #o1's body in x\.plan\.html/)
    expect(parts.get("o1")).toContain('href="../../../guides/x.html"')
    expect(parts.get("o1")).toContain('href="#q1"')
    expect(parts.get("c1")).toContain('href="https://example.com"')
    // and back:  the same doc
    const result = new PlanParts(doc).assemble((id) => parts.get(id))
    expect(result).toEqual({ split: true, hosts: ["o1", "p1", "c1", "log"], missing: [], inline: [] })
    expect(squashedMain(doc)).toBe(whole)
    expect(doc.body.hasAttribute("data-spell-needs-server")).toBe(false)
  })

  test("assembling keeps what a host holds beside its part (older code wrote into the empty panel)", () => {
    const plan = richPlan()
    const parts = new PlanParts(plan.document).split()
    const content = plan.document.querySelector("#c1 > ui-accordion > ui-content")
    content!.insertAdjacentHTML("beforeend", '<div class="late">a commit an older checkout added</div>')
    const result = new PlanParts(plan.document).assemble((id) => parts.get(id))
    expect(result.inline).toEqual(["c1"])
    const kids = Array.from(content!.children, (kid) => kid.className)
    expect(kids.at(-1)).toBe("late")
    expect(kids).toContain("plan-commits")
  })

  test("a missing part leaves its host as it is, and says so", () => {
    const plan = richPlan()
    const parts = new PlanParts(plan.document).split()
    const result = new PlanParts(plan.document).assemble((id) => (id === "p1" ? undefined : parts.get(id)))
    expect(result.missing).toEqual(["p1"])
    expect(plan.document.getElementById("p1")!.hasAttribute("source")).toBe(false)
  })

  test("rebasing to a part and back is exact", () => {
    for (const url of ["a/b.html", "../../x.ts", "parts/q1.htm", "./y", "../z#h"])
      expect(PlanParts.toPage(PlanParts.toPart(url))).toBe(url)
    expect(PlanParts.toPart("../../guides/x.html")).toBe("../../../guides/x.html")
  })

  test("hosts:  Overview sub-sections, phases, item panels, the log, in page order", () => {
    const plan = richPlan()
    expect(new PlanParts(plan.document).hosts.map((host) => `${host.kind} ${host.id}`)).toEqual([
      "section o1",
      "section p1",
      "item c1",
      "section log"
    ])
  })
})

describe("PlanParts files, through PlanDocFiles", () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  /** A one-file doc in a temp folder:  its path. */
  async function oneFile() {
    const dir = mkdtempSync(join(tmpdir(), "plan-parts-"))
    dirs.push(dir)
    const file = join(dir, "x.plan.html")
    writeFileSync(file, "")
    await FILES.writeDoc(file, richPlan(), false)
    return file
  }

  test("a one-file doc stays one file;  split writes a skeleton and parts;  join puts it back", async () => {
    const file = await oneFile()
    const parts = join(file, "..", "parts")
    await FILES.edit(file, (plan) => plan.log("still one file"))
    expect(existsSync(parts)).toBe(false)
    const whole = squashedMain(FILES.read(file).document)
    await FILES.edit(file, () => {}, { split: true })
    expect(readdirSync(parts).sort()).toEqual(["c1.htm", "log.htm", "o1.htm", "p1.htm"])
    expect(readFileSync(file, "utf8")).toContain('source="parts/p1.htm"')
    const plan = FILES.read(file)
    expect(plan.parts!.split).toBe(true)
    expect(squashedMain(plan.document)).toBe(whole)
    await FILES.edit(file, () => {}, { split: false })
    expect(existsSync(parts)).toBe(false)
    expect(squashedMain(FILES.read(file).document)).toBe(whole)
  })

  test("an edit rewrites only the parts it changed, and every command reads the doc whole", async () => {
    const file = await oneFile()
    await FILES.edit(file, () => {}, { split: true })
    const parts = join(file, "..", "parts")
    const stamps = (): Record<string, number> =>
      Object.fromEntries(readdirSync(parts).map((name) => [name, statSync(join(parts, name)).mtimeMs]))
    const before = stamps()
    await new Promise((done) => setTimeout(done, 20))
    // a log line:  the log's part (and the skeleton) only
    await FILES.edit(file, (plan) => plan.log("one more"))
    let after = stamps()
    expect(Object.keys(after).filter((name) => after[name] !== before[name])).toEqual(["log.htm"])
    // an item's details:  that item's part
    await FILES.edit(file, (plan) => plan.setDetails("c1", "<p>rewritten</p>"))
    const now = stamps()
    expect(
      Object.keys(now)
        .filter((name) => now[name] !== after[name])
        .sort()
    ).toEqual(["c1.htm"])
    expect(readFileSync(join(parts, "c1.htm"), "utf8")).toContain("rewritten")
    // a status:  the skeleton only
    after = now
    await FILES.edit(file, (plan) => plan.setItem("t1", "done"))
    const last = stamps()
    expect(Object.keys(last).filter((name) => last[name] !== after[name])).toEqual([])
    expect(readFileSync(file, "utf8")).toMatch(/id="t1"[^>]*data-status="done"|data-status="done"[^>]*id="t1"/)
    // read whole:  details come back from the part
    expect(FILES.read(file).detailsOf(FILES.read(file).item("c1")).textContent).toContain("rewritten")
  })

  test("an item that gets details later gets a part on the next write", async () => {
    const file = await oneFile()
    await FILES.edit(file, () => {}, { split: true })
    await FILES.edit(file, (plan) => plan.setDetails("t1", "<p>now with details</p>"))
    expect(readFileSync(join(file, "..", "parts", "t1.htm"), "utf8")).toContain("now with details")
    const { document } = parseHTML(readFileSync(file, "utf8"))
    expect(document.querySelector("#t1 > ui-accordion")!.getAttribute("source")).toBe("parts/t1.htm")
  })
})
