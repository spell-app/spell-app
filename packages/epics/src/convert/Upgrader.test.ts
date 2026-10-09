/**
 * Tests of `Upgrader`, the second pass:  a converted doc (`fixtures/converted/`, small snippets of the real docs) taken
 * on to P14's elements, valid and proved (`ConversionProof` with `ConvertedReading`);  each pattern's markup;  what it
 * keeps as prose;  a second run doing nothing;  and the proof catching what a broken upgrade would lose.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { Definitions } from "$/epics/definitions"
import { Markup } from "$/epics/markup"
import { EpicParts } from "$/epics/tool/EpicParts"
import { PlanParts } from "$/epics/tool/PlanParts"

import { ConvertError, Counted, type Conversion } from "./convert.types"

import { ConversionProof } from "./ConversionProof"
import { ConvertedReading } from "./ConvertedReading"
import { Converter } from "./Converter"
import { Upgrader } from "./Upgrader"

////////////////
// ## Fixtures
////////////////

/** `<epic-field>` takes a `label` (p14-writers' content model):  labelled blocks become fields. */
const HAS_LABEL = Boolean(Definitions.attribute("epic-field", "label"))

/** The converted fixture's skeleton. */
const FIXTURE = fileURLToPath(new URL("fixtures/converted/converted.plan.html", import.meta.url))

/** Upgrade the converted fixture. */
function upgrade(): Promise<Conversion> {
  return new Upgrader({
    name: "converted",
    skeleton: readFileSync(FIXTURE, "utf8"),
    readPart: PlanParts.reader(FIXTURE)
  }).upgrade()
}

/** `conversion`'s output read back whole:  the skeleton with its parts put in. */
function whole(conversion: Conversion): Document {
  const document = parseHTML(conversion.skeleton).document as unknown as Document
  new EpicParts(document).assemble((id) => conversion.parts.get(id))
  return document
}

/** The fixture as it is, assembled:  the proof's `before`. */
function before(): Document {
  const document = parseHTML(readFileSync(FIXTURE, "utf8")).document as unknown as Document
  new EpicParts(document).assemble(PlanParts.reader(FIXTURE))
  return document
}

/** `element`'s data, through the definitions. */
function data(document: Document, selector: string) {
  return Markup.read(document.querySelector(selector)!)
}

/** I1's Net effect label in other words, `Net effect (once fixed):`, kept as prose. */
function keptLabel(document: Document): Element | undefined {
  return Array.from(document.querySelectorAll("#i1 > p > b")).find((bold) => bold.textContent!.startsWith("Net effect"))
}

/** The tags of `selector`'s children, slotted ones marked. */
function childTags(document: Document, selector: string): string[] {
  return Array.from(document.querySelector(selector)!.children, (child) =>
    child.hasAttribute("slot") ? `${child.localName}[slot=${child.getAttribute("slot")}]` : child.localName
  )
}

////////////////
// ## Tests
////////////////

describe("Upgrader.upgrade():  a converted doc", () => {
  test("upgrades cleanly:  valid, the same ids, links and words;  split again, into the same parts", async () => {
    const conversion = await upgrade()
    expect(conversion.problems).toEqual([])
    expect(conversion.proof.ids.missing).toEqual([])
    expect(conversion.proof.links).toMatchObject({ missing: [], added: [] })
    expect(conversion.proof.text.units).toEqual([])
    expect(conversion.proof.clean).toBe(true)
    expect(conversion.pass).toBe(2)
    expect(conversion.wasSplit).toBe(true)
    expect([...conversion.parts.keys()]).toEqual(["o1", "p1", "q1", "q2", "q3", "q4", "q5", "j1", "i1", "log"])
  })

  test("counts each pattern, and what it kept as prose", async () => {
    const { counts } = await upgrade()
    expect(counts).toEqual({
      [Counted.css]: 1,
      [Counted.crumbs]: 1,
      [Counted.report]: 1,
      [Counted.summary]: 1,
      [Counted.prompt]: 1,
      [Counted.choices]: 2,
      [Counted.code]: 1,
      [Counted.aside]: 1,
      [Counted.note]: 2,
      [Counted.update]: 2,
      [Counted.netEffect]: 5,
      [Counted.optionNetEffect]: 2,
      [Counted.inlineNetEffect]: 1,
      [Counted.question]: 3,
      [Counted.versionQuestion]: 1,
      [Counted.keptNote]: 1,
      [Counted.keptNetEffect]: 2,
      [Counted.keptCode]: 1,
      [Counted.answer]: 1,
      ...(HAS_LABEL ? { [Counted.field]: 1 } : { [Counted.keptLabel]: 1 })
    })
    expect(Upgrader.changed(counts)).toBe(true)
  })

  test("the page:  no old crumbs, no plan-doc.css;  the report after the Overview, its title from its header", async () => {
    const document = whole(await upgrade())
    expect(document.querySelector("ui-breadcrumb")).toBeNull()
    expect(document.querySelector('link[href$="plan-doc.css"]')).toBeNull()
    expect(childTags(document, "main")).toEqual(["epic-page"])
    expect(childTags(document, "epic-page").slice(0, 3)).toEqual(["epic-overview", "epic-section", "epic-section"])
    expect(data(document, "epic-page > epic-section:nth-child(2)")).toEqual({
      id: "overnight",
      kind: "report",
      title: "Overnight · 2026-10-04"
    })
    expect(document.querySelector("#overnight ui-icon")).toBeNull()
  })

  test("the Overview:  <epic-summary> and <epic-prompt> first, where the slots were", async () => {
    const document = whole(await upgrade())
    expect(childTags(document, "epic-overview")).toEqual(["epic-summary", "epic-prompt", "epic-section"])
    expect(document.querySelector("epic-summary")!.textContent).toMatch(/^\s*Moved the repo to Vite\+/)
    expect(childTags(document, "epic-prompt")).toEqual(["p"])
    expect(document.querySelector("[slot='summary'], [slot='prompt']")).toBeNull()
  })

  test("Net effect:  the label into `option` / `recommended`, its list inside;  a sentence too;  in any prose", async () => {
    const document = whole(await upgrade())
    // q1:  `<b>Net effect</b> (A, recommended):`
    expect(data(document, "#q1 > epic-net-effect")).toEqual({ option: "A", recommended: true })
    expect(childTags(document, "#q1 > epic-net-effect")).toEqual(["ul"])
    // in a reply, after its option cards;  in an option card;  in a phase field
    expect(data(document, "#q2 epic-reply > epic-net-effect")).toEqual({ option: "A", recommended: true })
    expect(data(document, "#q2 epic-reply epic-option[letter='A'] > epic-net-effect")).toEqual({})
    expect(document.querySelector("#p1 epic-field[name='goal'] > epic-net-effect > ul")).not.toBeNull()
    // `<b>Net effect:</b> still open ...`:  the sentence, its label gone
    const inline = document.querySelector("#i1 > epic-net-effect > p")!
    expect(inline.innerHTML).toMatch(/^still open until <code>/)
    // other words:  prose, as it was
    expect(keptLabel(document)?.textContent).toBe("Net effect (once fixed):")
    expect(document.querySelector("#o1 > p > b")!.textContent).toBe("Net effect (every recommended option):")
  })

  test("a question's text as asked:  <epic-question> first;  in a version too;  not on a question born answered", async () => {
    const document = whole(await upgrade())
    expect(childTags(document, "#q1")).toEqual(["epic-question", "epic-net-effect", "epic-choices"])
    expect(childTags(document, "#q1 > epic-question")).toEqual(["p", "ul"])
    expect(childTags(document, "#q2")).toEqual(["epic-question", "epic-choices", "epic-answer", "epic-reply"])
    expect(childTags(document, "#q4 > epic-question")).toEqual(["p", "p"])
    expect(childTags(document, "#q4 epic-version")).toEqual(["epic-question"])
    // born answered:  no choices, no answer card
    expect(document.querySelector("#q3 epic-question")).toBeNull()
    // its text is all answer and history:  nothing to wrap
    expect(document.querySelector("#q5 epic-question")).toBeNull()
  })

  test("code and asides:  <epic-code title language open> of ONE <pre>;  <epic-aside title> without `Aside:`", async () => {
    const document = whole(await upgrade())
    const code = document.querySelector("#q2 epic-reply > epic-code")!
    expect(Markup.read(code)).toEqual({
      title: "packages/cli/src/dev/packNew.ts · how a template is filled (excerpts)",
      language: "ts",
      open: true
    })
    expect(childTags(document, "#q2 epic-reply > epic-code")).toEqual(["pre"])
    expect(code.querySelector("pre")!.textContent).toContain("Record<string, string>")
    expect(data(document, "#o1 > epic-aside")).toEqual({ title: "yarn oddities found so far" })
    // two `<pre>`s in one accordion:  kept
    expect(document.querySelector("#i1 > ui-accordion.spell-code")).not.toBeNull()
  })

  test("notes:  UPDATE / DONE into `state` and `title`;  a phase's bare UPDATE an <epic-update>;  other headers kept", async () => {
    const document = whole(await upgrade())
    expect(Array.from(document.querySelectorAll("#i1 > epic-note"), (note) => Markup.read(note))).toEqual([
      { state: "update", title: "partly fixed by J1, 2026-10-06" },
      { state: "done", title: "2026-10-06" }
    ])
    // the script's, for a phase (`data-phase`):  the phase's marker, as the tool's way in makes it (J74)
    expect(data(document, "#p1 epic-field[name='symptom'] > epic-update")).toEqual({ phase: 1 })
    expect(data(document, "#o1 > epic-update")).toEqual({ phase: 7 })
    expect(document.querySelector("#o1 > epic-update > p")!.textContent).toMatch(/^P7 moved/)
    expect(document.querySelector("#o1 > ui-message.plan-update")!.getAttribute("header")).toBe("DEFERRED")
  })

  test.skipIf(!HAS_LABEL)("labelled blocks:  <epic-field label>, once <epic-field> takes a label", async () => {
    const document = whole(await upgrade())
    const field = document.querySelector("#i1 > epic-field")!
    expect(field.getAttribute("label")).toBe("Where")
    expect(field.innerHTML).toBe("<p>the outline parser's phrase rule</p>")
  })

  test("option grids:  <epic-choices> on any item, in a reply too;  `(chosen)` its `chosen`;  a title with markup slotted", async () => {
    const document = whole(await upgrade())
    expect(data(document, "#j1 > epic-choices")).toEqual({ chosen: "A" })
    expect(childTags(document, "#j1")).toEqual(["p", "ul", "epic-choices", "epic-net-effect"])
    expect(Array.from(document.querySelectorAll("#j1 epic-option"), (option) => Markup.read(option))).toEqual([
      { letter: "A", title: "Monaco, no cursor-follow" },
      { letter: "B", title: "Keep the ASTViewer" }
    ])
    const options = Array.from(document.querySelectorAll("#q2 epic-reply > epic-choices > epic-option"))
    expect(options.map((option) => Markup.read(option))).toEqual([
      { letter: "A", title: "Keep one file per template", recommended: true },
      { letter: "B" }
    ])
    expect(options[1]!.querySelector(":scope > span[slot='title']")!.innerHTML).toBe(
      "One JSON file holding every <code>.tmpl</code>"
    )
    expect(document.querySelector("ui-grid")).toBeNull()
  })

  test("a hand-written answer in a version becomes <epic-answer>:  <epic-version> takes it (P14)", async () => {
    const document = whole(await upgrade())
    expect(document.querySelector("#q5 epic-version > div.plan-answer-block")).toBeNull()
    expect(document.querySelector("#q5 epic-version > epic-answer")).not.toBeNull()
  })

  test("a second run over its output has nothing to do, but what it keeps", async () => {
    const first = await upgrade()
    const again = await new Upgrader({
      name: "converted",
      skeleton: first.skeleton,
      readPart: (id) => first.parts.get(id)
    }).upgrade()
    expect(Upgrader.changed(again.counts)).toBe(false)
    expect(Object.keys(again.counts).every((key) => key.startsWith("kept: "))).toBe(true)
    expect(again.skeleton).toBe(first.skeleton)
    expect(again.parts).toEqual(first.parts)
    expect(again.proof.clean).toBe(true)
  })

  test("a doc still in the old markup is refused:  the first pass converts it", async () => {
    const old = fileURLToPath(new URL("fixtures/one-file.plan.html", import.meta.url))
    await expect(new Upgrader({ name: "one-file", skeleton: readFileSync(old, "utf8") }).upgrade()).rejects.toThrow(
      ConvertError
    )
  })

  test("the first pass's output takes the second pass too", async () => {
    const old = fileURLToPath(new URL("fixtures/split/split.plan.html", import.meta.url))
    const converted = await new Converter({
      name: "split",
      skeleton: readFileSync(old, "utf8"),
      readPart: PlanParts.reader(old)
    }).convert()
    const upgraded = await new Upgrader({
      name: "split",
      skeleton: converted.skeleton,
      readPart: (id) => converted.parts.get(id)
    }).upgrade()
    expect(upgraded.problems).toEqual([])
    expect(upgraded.proof.clean).toBe(true)
  })
})

describe("ConversionProof with ConvertedReading:  what a broken upgrade loses", () => {
  test("a good upgrade:  clean;  the old crumbs' links and plan-doc.css left out, each with why", async () => {
    const report = new ConversionProof({ before: before(), after: whole(await upgrade()), reading: ConvertedReading })
      .report
    expect(report.clean).toBe(true)
    expect(report.links.excluded).toEqual([
      "../../packages/docs/tools/_assets/plan-doc.css (plan-doc.css, dropped:  the elements style themselves)",
      "../../pages/index.html (the old crumbs, drawn by <epic-page>)",
      "../../epics/index.html (the old crumbs, drawn by <epic-page>)"
    ])
  })

  test("a word lost from a question:  its words, in its unit", async () => {
    const document = whole(await upgrade())
    document.querySelector("#q1 > epic-question > p")!.append(" extra")
    document.querySelector("#q1 > epic-question > ul")!.remove()
    const report = new ConversionProof({ before: before(), after: document, reading: ConvertedReading }).report
    expect(report.clean).toBe(false)
    expect(report.text.units).toEqual([
      expect.objectContaining({ unit: "q1", added: ["extra"], missing: expect.arrayContaining(["worktree's"]) })
    ])
  })

  test("a link lost from an option card, an id lost from an answer", async () => {
    const document = whole(await upgrade())
    document.querySelector("#q2 epic-reply epic-option a")!.remove()
    document.querySelector("#d2")!.removeAttribute("id")
    const report = new ConversionProof({ before: before(), after: document, reading: ConvertedReading }).report
    expect(report.links.missing).toEqual(["../../packages/cli/src/dev/packNew.ts"])
    expect(report.ids.missing).toEqual(["d2"])
  })

  test("a label kept as prose is compared:  its words lost are caught", async () => {
    const document = whole(await upgrade())
    keptLabel(document)!.remove()
    const report = new ConversionProof({ before: before(), after: document, reading: ConvertedReading }).report
    expect(report.text.units).toEqual([{ unit: "i1", missing: ["Net", "effect", "(once", "fixed):"], added: [] }])
  })

  test("a code block's title lost:  caught (the element draws it from `title`)", async () => {
    const document = whole(await upgrade())
    document.querySelector("#q2 epic-code")!.removeAttribute("title")
    const report = new ConversionProof({ before: before(), after: document, reading: ConvertedReading }).report
    expect(report.text.units).toEqual([
      expect.objectContaining({ unit: "q2", missing: expect.arrayContaining(["packages/cli/src/dev/packNew.ts"]) })
    ])
  })
})
