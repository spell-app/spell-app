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
    expect(Migrations.all.map((step) => step.name)).toEqual(["updates-as-epic-update"])
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

  test("a long one cut at a word, with an ellipsis, within `MAX_LENGTH`", () => {
    const long = `${"word ".repeat(40)}end.`
    const summary = UpdateSummary.fromText(long)
    expect(summary.length).toBeLessThanOrEqual(UpdateSummary.MAX_LENGTH + 1)
    expect(summary).toMatch(/^word( word)+…$/)
  })

  test("of nodes:  their text, a space between blocks", () => {
    const { document } = parseHTML("<div><p>First</p><p>block. Second.</p></div>")
    expect(UpdateSummary.of(document.querySelector("div")!.childNodes)).toBe("First block")
  })
})
