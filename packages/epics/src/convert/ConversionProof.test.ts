/**
 * Tests of `ConversionProof`:  it finds what a conversion lost or added -- an id, a link, a word, text moved to
 * another unit -- and lists what it leaves out.  Each case breaks a good conversion of the split fixture.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { EpicParts } from "$/epics/tool/EpicParts"
import { PlanParts } from "$/epics/tool/PlanParts"

import { ConversionProof } from "./ConversionProof"
import { Converter } from "./Converter"
import { OldParts } from "./OldParts"

/** The split fixture's skeleton. */
const FIXTURE = fileURLToPath(new URL("fixtures/split/split.plan.html", import.meta.url))

/** The fixture as it is, assembled:  the proof's `before`. */
function before(): Document {
  const document = parseHTML(readFileSync(FIXTURE, "utf8")).document as unknown as Document
  new OldParts(document).assemble(PlanParts.reader(FIXTURE))
  return document
}

/** The fixture converted, assembled:  a good `after`, for each test to break. */
async function after(): Promise<Document> {
  const skeleton = readFileSync(FIXTURE, "utf8")
  const conversion = await new Converter({ name: "split", skeleton, readPart: PlanParts.reader(FIXTURE) }).convert()
  const document = parseHTML(conversion.skeleton).document as unknown as Document
  new EpicParts(document).assemble((id) => conversion.parts.get(id))
  return document
}

describe("ConversionProof.report", () => {
  test("a good conversion is clean;  the exclusions are listed, each with why", async () => {
    const report = new ConversionProof({ before: before(), after: await after() }).report
    expect(report.clean).toBe(true)
    expect(report.links.excluded).toEqual([
      "../../packages/docs/tools/_assets/plan-doc.css (plan-doc.css, dropped:  the elements style themselves)",
      "#p2 (step label, drawn by <epic-page>)",
      "../../ (worktree meta line, drawn by <epic-page>)",
      "#p2 (Plan changes box, drawn from the phases' <epic-updated> lines)"
    ])
    expect(report.text.words).toBeGreaterThan(100)
  })

  test("a lost paragraph:  its words, in its unit", async () => {
    const document = await after()
    document.querySelector("#d1 > p")!.remove()
    const report = new ConversionProof({ before: before(), after: document }).report
    expect(report.clean).toBe(false)
    expect(report.text.units).toEqual([{ unit: "q1", missing: ["The", "whole", "window,", "recoloured."], added: [] }])
  })

  test("text moved to another item:  missing from one, added to the other", async () => {
    const document = await after()
    document.querySelector("#q2")!.prepend(document.querySelector("#d1 > p")!)
    const { text } = new ConversionProof({ before: before(), after: document }).report
    expect(text.units.map(({ unit, missing, added }) => [unit, missing.length, added.length])).toEqual([
      ["q1", 4, 0],
      ["q2", 0, 4]
    ])
  })

  test("a lost id, a changed link, a lost commit link (no `repo` to draw it from)", async () => {
    const document = await after()
    document.getElementById("o1-deep")!.removeAttribute("id")
    document.querySelector("#o1 a[href^='../../guides']")!.setAttribute("href", "../../guides/other.html")
    document.querySelector("epic-page")!.removeAttribute("repo")
    const report = new ConversionProof({ before: before(), after: document }).report
    expect(report.ids.missing).toEqual(["o1-deep"])
    expect(report.links.missing).toEqual([
      "https://github.com/spell-app/spell-app/commit/2c71ac57aaaabbbbccccddddeeeeffff00001111",
      "https://github.com/spell-app/spell-app/commit/08683b613a9a8e06cdd52c69f4cb953300e574d9"
    ])
    expect(report.links.added).toEqual(["../../guides/other.html"])
    expect(report.clean).toBe(false)
  })

  test("a title that lost a word, read from its attribute", async () => {
    const document = await after()
    document.querySelector("#p1")!.setAttribute("title", "First")
    const { text } = new ConversionProof({ before: before(), after: document }).report
    expect(text.units).toEqual([{ unit: "p1", missing: ["Step"], added: [] }])
  })

  test("words only reordered in a unit are no loss, but listed", async () => {
    const document = await after()
    const q3 = document.querySelector("#q3")!
    q3.setAttribute("title", "without asking Agents: up to 5,")
    const report = new ConversionProof({ before: before(), after: document }).report
    expect(report.clean).toBe(true)
    expect(report.text.reordered).toContain("q3")
  })
})
