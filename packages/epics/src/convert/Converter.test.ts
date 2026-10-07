/**
 * Tests of `Converter`:  each generation of today's plan-doc markup still in use, converted to `<epic-*>` markup,
 * valid and proved (`ConversionProof`), on small fixtures (`fixtures/`).
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { Markup } from "$/epics/markup"
import { EpicParts } from "$/epics/tool/EpicParts"
import { PlanParts } from "$/epics/tool/PlanParts"

import { ConvertError, type Conversion } from "./convert.types"

import { Converter } from "./Converter"

////////////////
// ## Fixtures
////////////////

/** The fixtures folder. */
const FIXTURES = fileURLToPath(new URL("fixtures/", import.meta.url))

/** Convert fixture `file` (under `fixtures/`), its parts beside it. */
function convert(file: string, name = file.replace(/^.*\/|\.plan\.html$/g, "")): Promise<Conversion> {
  const path = `${FIXTURES}${file}`
  return new Converter({ name, skeleton: readFileSync(path, "utf8"), readPart: PlanParts.reader(path) }).convert()
}

/** `conversion`'s output read back whole:  the skeleton with its parts put in. */
function whole(conversion: Conversion): Document {
  const document = parseHTML(conversion.skeleton).document as unknown as Document
  new EpicParts(document).assemble((id) => conversion.parts.get(id))
  return document
}

/** The conversion succeeded:  no invalid markup, a clean proof. */
function expectClean(conversion: Conversion) {
  expect(conversion.problems).toEqual([])
  expect(conversion.proof.ids.missing).toEqual([])
  expect(conversion.proof.links).toMatchObject({ missing: [], added: [] })
  expect(conversion.proof.text.units).toEqual([])
  expect(conversion.proof.clean).toBe(true)
}

/** `element`'s data, through the definitions. */
function data(document: Document, selector: string) {
  return Markup.read(document.querySelector(selector)!)
}

////////////////
// ## Tests
////////////////

describe("Converter.convert():  the newest layout, split", () => {
  test("converts cleanly, and comes out split again", async () => {
    const conversion = await convert("split/split.plan.html")
    expectClean(conversion)
    expect(conversion.wasSplit).toBe(true)
    expect([...conversion.parts.keys()]).toEqual(["o1", "o2", "p1", "p2", "q1", "q2", "q4", "j1", "log"])
    expect(conversion.proof.ids.excluded).toEqual([
      "#plan-started (meta line, drawn by <epic-page>)",
      "#plan-updated (meta line, drawn by <epic-page>)"
    ])
  })

  test("the page:  data from <body>, the h1 and the meta lines;  the pack loaded through <ui-root>", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "epic-page")).toEqual({
      epic: "split",
      title: "Split Fixture",
      branch: "split",
      worktree: "/Users/owen/www/spell-app/spell-app/.claude/worktrees/split",
      started: "2026-10-06",
      updated: "2026-10-07",
      recentSince: "2026-10-06T22:56:42-04:00",
      repo: "https://github.com/spell-app/spell-app"
    })
    expect(document.querySelector("body > ui-root > ui-components")!.getAttribute("source")).toBe(
      "../../packages/epics/pack/epics.pack.js"
    )
    expect(document.querySelectorAll("body > script")).toHaveLength(2)
    expect(document.body.getAttribute("class")).toBe("spell-doc-page plan-doc")
    expect(document.body.hasAttribute("data-plan")).toBe(false)
    expect(document.querySelector("epic-page > a[slot='durable']")!.getAttribute("href")).toBe(
      "../../guides/split.html"
    )
    expect(document.querySelector(".plan-meta, .spell-h1, .plan-step")).toBeNull()
    expect(document.querySelector("main > ui-breadcrumb + epic-page")).not.toBeNull()
  })

  test("the Overview:  summary and prompt slotted, the estimate an attribute, titles without numbers", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "epic-overview")).toEqual({ id: "overview", estimate: "3h in all, 2h left" })
    expect(document.querySelector("epic-overview > p[slot='summary']")!.innerHTML).toBe(
      "A fixture in the <b>newest</b> layout: split into parts."
    )
    expect(document.querySelector("epic-overview > blockquote[slot='prompt'] > p")!.textContent).toBe(
      "Convert every doc.Lose nothing."
    )
    expect(data(document, "#o1")).toEqual({ id: "o1", kind: "overview-part", title: "Structure" })
    expect(document.querySelector("#o1 > ui-section#o1-1")).not.toBeNull()
    expect(document.querySelector("#o2 > span[slot='title']")!.innerHTML).toBe("The <code>convert</code> command")
  })

  test("a phase:  its fields in the content model's order, Updated lines and commits their own elements", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "#p1")).toEqual({ id: "p1", title: "First Step", status: "done", estimate: "1h" })
    const children = (id: string) =>
      Array.from(document.querySelector(id)!.children, (it) => it.getAttribute("name") ?? it.localName)
    expect(children("#p1")).toEqual(["goal", "done", "epic-commit", "files", "verify", "to-review"])
    expect(children("#p2")).toEqual(["symptom", "changes", "epic-updated", "files", "verify"])
    expect(data(document, "#p2 > epic-updated")).toEqual({ at: "2026-10-06 14:30", phase: 1 })
    expect(document.querySelector("#p1 epic-commit")!.getAttribute("sha")).toBe(
      "2c71ac57aaaabbbbccccddddeeeeffff00001111"
    )
    // `Judgement calls:` has no field:  kept whole at the end of Done
    expect(document.querySelector("#p1 > epic-field[name='done'] > div:last-child")!.textContent).toBe(
      "Judgement calls: J1"
    )
    expect(document.querySelector("#phases > ui-progress, #phases > ui-message")).toBeNull()
  })

  test("the Plan changes box:  written anew, as the tool writes it (T14), from the lines of the phases to do", async () => {
    const conversion = await convert("split/split.plan.html")
    const document = whole(conversion)
    const copies = document.querySelectorAll("#phases > epic-updated[slot='changes']")
    expect(Array.from(copies, (copy) => [Markup.read(copy), copy.textContent!.trim()])).toEqual([
      [{ at: "2026-10-06 14:30", phase: 1, of: 2 }, "moved the log first"]
    ])
    expect(document.querySelector("#phases")!.firstElementChild).toBe(copies[0])
    // in the skeleton, not a part:  the box shows with the phases folded
    expect(conversion.skeleton).toContain('slot="changes"')
    expectClean(conversion)
  })

  test("an answered question:  its text, Choices, the answer (keeping `d1`), replies, Original Discussion, commits", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "#q1")).toEqual({
      id: "q1",
      title: "Which colour names?",
      status: "decided",
      state: "old",
      changed: "2026-10-06T09:28:23-04:00",
      answered: true,
      reviewed: "2026-10-06",
      reviewAs: "approve"
    })
    const q1 = document.querySelector("#q1")!
    expect(Array.from(q1.children, (it) => it.localName)).toEqual([
      "p",
      "p",
      "ul",
      "epic-choices",
      "epic-answer",
      "epic-reply",
      "epic-reply",
      "epic-original",
      "epic-commit"
    ])
    expect(data(document, "#q1 epic-choices")).toEqual({ chosen: "A" })
    expect(Array.from(q1.querySelectorAll("epic-option"), (it) => Markup.read(it))).toEqual([
      { letter: "A", title: "A named palette", recommended: true },
      { letter: "B" }
    ])
    expect(q1.querySelector("epic-option[letter='B'] > span[slot='title']")!.innerHTML).toBe(
      "Any <code>CSS</code> colour"
    )
    expect(data(document, "#d1")).toEqual({ id: "d1", title: "Named palette" })
    expect(Array.from(q1.querySelectorAll("epic-reply"), (it) => Markup.read(it))).toEqual([
      { from: "Owen", at: "2026-10-06 17:27", re: "revisit now" },
      { from: "Claude", at: "2026-10-06 17:30", re: '"Maybe teal too?"' }
    ])
    expect(Array.from(q1.querySelectorAll("epic-version"), (it) => Markup.read(it))).toEqual([
      {},
      { asOf: "2026-10-04 20:49" }
    ])
    expect(q1.querySelector("epic-version h5")).toBeNull()
  })

  test("an open question's option grid becomes its choices;  the text after it moves up", async () => {
    const conversion = await convert("split/split.plan.html")
    const q2 = whole(conversion).querySelector("#q2")!
    expect(Array.from(q2.children, (it) => it.localName)).toEqual(["p", "p", "ul", "epic-choices"])
    expect(q2.querySelector("epic-choices")!.hasAttribute("chosen")).toBe(false)
    expect(Array.from(q2.querySelectorAll("epic-option"), (it) => Markup.read(it))).toEqual([
      { letter: "A", title: "Oldest first", recommended: true },
      { letter: "B", title: "Newest first" }
    ])
    expect(conversion.notes).toContain("#q2:  2 block(s) after its options moved up, before them")
    expect(conversion.proof.text.reordered).toContain("q2")
  })

  test("a born-answered question, a title with markup and an UPDATE marker, a bare line", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "#q3")).toEqual({
      id: "q3",
      title: "Agents: up to 5, without asking",
      status: "decided",
      state: "old",
      answered: true
    })
    expect(document.querySelector("#q3")!.childNodes).toHaveLength(0)
    const title = document.querySelector("#q4 > span[slot='title']")!
    expect(title.querySelector("epic-update")!.getAttribute("phase")).toBe("2")
    expect(title.textContent!.replace(/\s+/g, " ").trim()).toBe("Does convert keep the &lt;b&gt; tags?")
    expect(data(document, "#q4")).toMatchObject({ bedtime: true, state: "recent" })
    expect(data(document, "#c1")).toEqual({ id: "c1", title: "A bare line", status: "open", state: "open" })
  })

  test("a judgement call keeps its grid and hand-written notes as prose;  the script's UPDATE note is <epic-update>", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(data(document, "#j1")).toMatchObject({ queued: "2026-10-06", work: "Skip short sections", phase: 1 })
    const j1 = document.querySelector("#j1")!
    expect(j1.querySelector(":scope > epic-update[phase='1'] > p")!.textContent).toBe("Rewritten after P1.")
    expect(j1.querySelector(":scope > ui-grid.spell-pros-cons")).not.toBeNull()
    expect(j1.querySelector(":scope > ui-message.plan-update")!.getAttribute("header")).toBe(
      "DONE · option A, 2026-10-06"
    )
    expect(j1.querySelector("epic-choices")).toBeNull()
  })

  test("the log:  an <epic-event> per line, `at` from its datetime, the default icon left out", async () => {
    const document = whole(await convert("split/split.plan.html"))
    expect(Array.from(document.querySelectorAll("#log > epic-event"), (it) => Markup.read(it))).toEqual([
      { at: "2026-10-06T09:05-04:00" },
      { at: "2026-10-06T22:00-04:00", icon: "circle check" }
    ])
  })
})

describe("Converter.convert():  older generations", () => {
  test("one file:  comes out split;  letterless options, a marked-up answer title, More Details, an old log", async () => {
    const conversion = await convert("one-file.plan.html")
    expectClean(conversion)
    expect(conversion.wasSplit).toBe(false)
    expect(conversion.parts.size).toBeGreaterThan(0)
    const document = whole(conversion)
    expect(Array.from(document.querySelectorAll("#q1 epic-option"), (it) => Markup.read(it))).toEqual([
      { letter: "A", title: "New package", recommended: true },
      { letter: "B", title: "Inside parser" }
    ])
    expect(data(document, "#q1 epic-choices")).toEqual({ chosen: "A" })
    expect(data(document, "#q2 epic-choices")).toEqual({ chosen: "C" })
    expect(data(document, "#q2 epic-option[letter='A']")).toEqual({ letter: "A", title: "A \\s marker" })
    // a title with markup is its answer's `slot="title"`, first
    expect(data(document, "#d2")).toEqual({ id: "d2" })
    expect(document.querySelector("#d2 > span[slot='title']:first-child")!.innerHTML).toBe(
      '<code>packages/markdown</code>, see <a href="#o1">1.1</a>'
    )
    expect(data(document, "#q2 epic-answer")).toEqual({ title: "As it looks" })
    const j1 = document.querySelector("#j1")!
    expect(Array.from(j1.children, (it) => it.localName)).toEqual(["p", "epic-more", "epic-reply"])
    expect(j1.querySelector("epic-reply")!.lastElementChild!.textContent).toBe("Also: a note written after the reply.")
    expect(Array.from(document.querySelectorAll("#log > epic-event"), (it) => it.getAttribute("at"))).toEqual([
      "2026-09-30T00:21-04:00",
      "2026-10-01"
    ])
    expect(data(document, "epic-page")).toMatchObject({
      branch: "one-file",
      worktree: "/Users/owen/www/spell-app/spell-app"
    })
  })

  test("a section the page has no place for stays as it was, where it stood", async () => {
    const conversion = await convert("one-file.plan.html")
    const document = whole(conversion)
    expect(document.querySelector("main > ui-section#overnight + epic-page")).not.toBeNull()
    expect(conversion.notes).toContain("#overnight has no place in <epic-page>:  kept before it, as it was")
  })

  test("phase fields with no name:  kept whole, at the end of the Goal when there's no Done", async () => {
    const conversion = await convert("one-file.plan.html")
    const goal = whole(conversion).querySelector("#p1 > epic-field[name='goal']")!
    expect(Array.from(goal.querySelectorAll(":scope > div > b:first-child"), (it) => it.textContent)).toEqual([
      "Outcome:",
      "Judgement calls:"
    ])
  })

  test("claude-design's answer card first:  moved after the question and its choices, the chosen option kept", async () => {
    const conversion = await convert("answer-first.plan.html")
    expectClean(conversion)
    const q1 = whole(conversion).querySelector("#q1")!
    expect(Array.from(q1.children, (it) => it.localName)).toEqual(["p", "p", "ul", "epic-choices", "epic-answer"])
    expect(q1.querySelector("epic-choices")!.getAttribute("chosen")).toBe("A")
    expect(q1.querySelector("epic-option[letter='A']")!.hasAttribute("recommended")).toBe(true)
    expect(Markup.read(q1.querySelector("epic-answer")!)).toEqual({ title: "Claude Code carries them" })
    expect(conversion.notes).toContain("#q1:  its answer card, first in the old layout, now after its question")
  })

  test("a doc still planning:  the `Plan hung?` notice is drawn, not written;  bedtime moves to the page", async () => {
    const conversion = await convert("planning.plan.html")
    expectClean(conversion)
    const document = whole(conversion)
    expect(document.querySelector(".plan-hung")).toBeNull()
    expect(data(document, "epic-page")).toMatchObject({ bedtime: "P3-P6" })
    expect(document.querySelectorAll("epic-section[kind='phases'] > *")).toHaveLength(0)
    expect(data(document, "#log > epic-event")).toEqual({ at: "2026-10-07 09:00" })
  })

  test("a future epic:  `future`, no branch or worktree, its notice and its link drawn", async () => {
    const conversion = await convert("future.plan.html")
    expectClean(conversion)
    expect(conversion.proof.links.excluded).toEqual([
      "details/analysis.html (future-epic notice, drawn by <epic-page future>)"
    ])
    const document = whole(conversion)
    expect(data(document, "epic-page")).toEqual({
      epic: "someday",
      title: "Someday",
      started: "2026-10-07",
      updated: "2026-10-07",
      future: true
    })
  })

  test("a layout from before 2026-10-02 is refused:  `migrate` it first", async () => {
    const skeleton =
      '<!doctype html><html><body><main><section class="s2" id="overview"></section></main></body></html>'
    await expect(new Converter({ name: "old", skeleton }).convert()).rejects.toThrow(ConvertError)
    await expect(new Converter({ name: "old", skeleton }).convert()).rejects.toThrow(/spell dev plan-doc migrate old/)
  })
})
