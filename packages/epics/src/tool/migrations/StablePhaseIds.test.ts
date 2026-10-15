/**
 * Tests of the migration `stable-phase-ids`:  old phase ids (`p7`) become stable ones made from each name, their
 * links follow, the inbox's renames are handed back, and a second run changes nothing.  The files (parts, the inbox
 * written) are `MigrateCommands.test.ts`'s.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import type { MigrationContext } from "./migrations.types"
import { Migrations } from "./Migrations"

/** The step under test. */
const STEP = Migrations.named("stable-phase-ids")!

/**
 * A page from before P15:  three phases numbered by id, one renamed (its log says so), two titled alike;  links to
 * them in a phase, an item, the log and by the page's own file;  a link to another epic's phase;  an id clash.
 */
function page(): Document {
  return parseHTML(
    `<html><body><main><epic-page epic="x" title="X">` +
      `<epic-section id="phases" kind="phases">` +
      `<epic-phase id="p1" title="Epic Migrate" status="done"><epic-field name="goal"><p>` +
      `See <a href="#p2">P2 · Docs</a>, <a href="x.plan.html#p3">P3</a>, <a href="../y/y.plan.html#p2">y's P2</a>.` +
      `</p></epic-field></epic-phase>` +
      `<epic-phase id="p2" title="Docs" status="active"></epic-phase>` +
      `<epic-phase id="p3" status="todo"><span slot="title">Docs</span></epic-phase>` +
      `</epic-section>` +
      `<epic-section id="todos" kind="todos"><epic-item id="t1" title="see P1" status="open" phase="2">` +
      `<p><a href="#p1">P1 · Epic Migrate</a></p></epic-item></epic-section>` +
      `<epic-section id="log" kind="log">` +
      `<epic-event at="2026-10-11T09:00-04:00">see <a href="#p1">P1 · Epic Migrate</a></epic-event>` +
      `</epic-section></epic-page></main></body></html>`
  ).document as unknown as Document
}

/** A context with an inbox:  a mark on P2, a draft on P3, a comment on P2's field. */
function context(): MigrationContext & { notes: string[] } {
  return {
    now: new Date(2026, 9, 14),
    inbox: {
      keyed: { mark: { p2: {} }, draft: { p3: {} } },
      comments: { cm1: { anchor: "p2#field-1" } }
    },
    notes: []
  }
}

/** Every link's `href` in `document`, in page order. */
function hrefs(document: Document): string[] {
  return Array.from(document.querySelectorAll("a"), (link) => link.getAttribute("href")!)
}

describe("stable-phase-ids", () => {
  test("each phase's id from its name (a clash `-2`);  its links follow, by `#` or the page's own file", () => {
    const document = page()
    const run = context()
    expect(STEP.run(document, run)).toBe(true)
    expect(Array.from(document.querySelectorAll("epic-phase"), (phase) => phase.id)).toEqual([
      "p-epic-migrate",
      "p-docs",
      "p-docs-2"
    ])
    expect(hrefs(document)).toEqual([
      "#p-docs",
      "x.plan.html#p-docs-2",
      // another epic's phase:  left, its old address lands there (`PhaseIds.landing()`)
      "../y/y.plan.html#p2",
      "#p-epic-migrate",
      // the log's link lands too;  its words stay as written
      "#p-epic-migrate"
    ])
    // what points at a phase by NUMBER stays a number:  the phase active then
    expect(document.querySelector("#t1")!.getAttribute("phase")).toBe("2")
    expect(run.renames).toEqual({ p1: "p-epic-migrate", p2: "p-docs", p3: "p-docs-2" })
    expect(run.notes).toEqual([
      "stable-phase-ids:  3 phase ids (p1 -> p-epic-migrate, p2 -> p-docs, p3 -> p-docs-2), 4 links, 3 in the inbox"
    ])
  })

  test("idempotent:  a second run changes nothing;  a stray old link is pointed at the phase at that place", () => {
    const document = page()
    STEP.run(document, context())
    const again = context()
    expect(STEP.run(document, again)).toBe(false)
    expect([again.renames, again.notes]).toEqual([undefined, []])
    document.querySelector("#t1 a")!.setAttribute("href", "#p3")
    expect(STEP.run(document, again)).toBe(true)
    expect(document.querySelector("#t1 a")!.getAttribute("href")).toBe("#p-docs-2")
  })
})
