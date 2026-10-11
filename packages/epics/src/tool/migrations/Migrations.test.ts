/**
 * Tests of the plan doc migrations:  the registry (`Migrations`) and the summary an update gets when it has none
 * (`UpdateSummary`).  Each step's own cases are `PlanDoc.migrate()`'s, in `PlanDoc.test.ts`.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { UpdateSummary } from "../UpdateSummary"
import { Migrations } from "./Migrations"

/** A page holding one phase, with an older plan change in its `changes` slot. */
function olderDoc(): Document {
  return parseHTML(
    `<html><body><main><epic-page epic="x" title="X" updated="2026-10-05">` +
      `<epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="todo">` +
      `<epic-field name="goal">g</epic-field>` +
      `<epic-updated slot="changes" at="2026-10-05 10:00"><p>Moved the log. Then more.</p></epic-updated>` +
      `</epic-phase></epic-section></epic-page></main></body></html>`
  ).document as unknown as Document
}

describe("Migrations", () => {
  test("every step by name, in order;  `named()` finds one", () => {
    expect(Migrations.all.map((step) => step.name)).toEqual(["updates-as-epic-update", "owen-types-to-you-type"])
    expect(Migrations.named("updates-as-epic-update")?.description).toMatch(/<epic-update at summary>/)
    expect(Migrations.named("nope")).toBeUndefined()
  })

  test("`run()` names the steps that changed something;  a second run none (idempotent);  `only` picks steps", () => {
    const now = new Date(2026, 9, 11, 9, 0)
    const document = olderDoc()
    expect(Migrations.run(document, { now }, [])).toEqual([])
    expect(document.querySelector("epic-updated")).not.toBeNull()
    expect(Migrations.run(document, { now })).toEqual(["updates-as-epic-update"])
    const update = document.querySelector("#p1 > epic-update")!
    expect([
      update.getAttribute("at"),
      update.getAttribute("summary"),
      update.previousElementSibling?.localName
    ]).toEqual(["2026-10-05 10:00", "Moved the log", "epic-field"])
    expect(Migrations.run(document, { now })).toEqual([])
  })
})

describe("UpdateSummary", () => {
  test("the first sentence, its final period dropped;  white space squeezed", () => {
    expect(UpdateSummary.fromText("  Split P7 in two.  It was too big. ")).toBe("Split P7 in two")
    expect(UpdateSummary.fromText("Why not? Because.")).toBe("Why not?")
    expect(UpdateSummary.fromText("no sentence end")).toBe("no sentence end")
    expect(UpdateSummary.fromText("Keep PlanDoc.ts as is.")).toBe("Keep PlanDoc.ts as is")
    expect(UpdateSummary.fromText("")).toBe("")
  })

  test("a long one keeps its first `MAX_WORDS` words, with an ellipsis (Owen:  5-10 words)", () => {
    const summary = UpdateSummary.fromText(`${"word ".repeat(40)}end.`)
    expect(summary).toBe(`${Array(UpdateSummary.MAX_WORDS).fill("word").join(" ")}…`)
  })

  test("a lead saying who or when is dropped:  the text says it, and the update shows its date", () => {
    expect(
      UpdateSummary.fromText("From Owen's comment CM3 (2026-10-11): this epic has no Doc Review phase any more.")
    ).toBe("this epic has no Doc Review phase any more")
    expect(UpdateSummary.fromText("Owen, 2026-10-11: migrate works for every page kind.")).toBe(
      "migrate works for every page kind"
    )
    expect(UpdateSummary.fromText("Bedtime, 2026-10-11 (Owen): the goal pages stay.")).toBe("the goal pages stay")
    // a colon that isn't a who-or-when lead stays
    expect(UpdateSummary.fromText("Split in two: words first.")).toBe("Split in two: words first")
  })

  test("of nodes:  their text, a space between blocks", () => {
    const { document } = parseHTML("<div><p>First</p><p>block. Second.</p></div>")
    expect(UpdateSummary.of(document.querySelector("div")!.childNodes)).toBe("First block")
  })
})

describe("owen-types-to-you-type", () => {
  const page = (body: string) =>
    parseHTML(`<html><body><main><epic-page epic="x" title="X">${body}</epic-page></main></body></html>`)
      .document as unknown as Document
  const step = Migrations.named("owen-types-to-you-type")!
  const context = { now: new Date() }

  test('"Owen types" becomes "You type" at a sentence\'s start, "you type" inside one;  twice:  nothing more', () => {
    const doc = page(
      `<ul><li>Owen types <code>epic list</code>.</li><li>Then Owen types it again. Owen types more.</li></ul>`
    )
    expect(step.run(doc, context)).toBe(true)
    expect(doc.querySelector("ul")!.textContent).toBe("You type epic list.Then you type it again. You type more.")
    expect(step.run(doc, context)).toBe(false)
  })

  test("records stay as written:  his quoted words, code, the log, the kickoff prompt", () => {
    const doc = page(
      `<q>Owen types fast</q><code>Owen types</code><epic-event at="x">Owen types it</epic-event>` +
        `<epic-aside title="Owen's words"><p>Owen types</p></epic-aside><epic-prompt><p>Owen types</p></epic-prompt>`
    )
    expect(step.run(doc, context)).toBe(false)
    expect(doc.querySelector("q")!.textContent).toBe("Owen types fast")
  })

  test("an item's or phase's title attribute too", () => {
    const doc = page(
      `<epic-item id="t1" title="Every box Owen types in grows"></epic-item><epic-phase id="p1" title="Owen types less"></epic-phase>`
    )
    expect(step.run(doc, context)).toBe(true)
    expect([
      doc.querySelector("epic-item")!.getAttribute("title"),
      doc.querySelector("epic-phase")!.getAttribute("title")
    ]).toEqual(["Every box you type in grows", "You type less"])
  })
})
