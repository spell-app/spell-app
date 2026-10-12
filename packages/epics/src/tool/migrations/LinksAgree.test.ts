/**
 * Tests of the migration `links-agree` and the anchors it checks comments by (`PlanAnchors`):  old titles in a link's
 * words fixed, a moved phase followed, a comment whose block moved re-anchored, what's gone reported, not changed.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { PlanAnchors } from "../PlanAnchors"
import type { AnchorMove, InboxView, MigrationContext } from "./migrations.types"
import { Migrations } from "./Migrations"

/** The step under test. */
const STEP = Migrations.named("links-agree")!

/**
 * A page as it stands after a renamed phase, a renamed item and an inserted phase:
 * - P2 was "Old Two" (the log says), and a link still says so
 * - J1 was "Old call", and a link still says so
 * - "Docs" was P3 until "Inserted" took its place:  a link still says `P3 · Docs` to `#p3`
 * - a link to `#t9`, which is gone
 */
function page(): Document {
  return parseHTML(
    `<html><body><main><epic-page epic="x" title="X">` +
      `<epic-section id="phases" kind="phases">` +
      `<epic-phase id="p1" title="One" status="done"><epic-field name="goal"><p>` +
      `See <a href="#p2">P2 · Old Two</a>, <a href="#j1">Old call</a>, <a href="#p3">P3 · Docs</a>, ` +
      `<a href="#t9">T9 · Gone</a>, <a href="#p1">P1</a>.</p></epic-field></epic-phase>` +
      `<epic-phase id="p2" title="Two" status="todo"><epic-field name="goal"><p>Two's goal.</p></epic-field></epic-phase>` +
      `<epic-phase id="p3" title="Inserted" status="todo"><epic-field name="goal"><p>New goal.</p></epic-field></epic-phase>` +
      `<epic-phase id="p4" title="Docs" status="todo"><epic-field name="symptom">The docs lag.</epic-field>` +
      `<epic-field name="goal"><p>Write the docs.</p></epic-field></epic-phase>` +
      `</epic-section>` +
      `<epic-section id="judgements" kind="judgements"><epic-item id="j1" title="New call" status="open"></epic-item></epic-section>` +
      `<epic-section id="log" kind="log">` +
      `<epic-event at="2026-10-11T09:00-04:00">P2 renamed:  "Old Two" -> "Two"</epic-event>` +
      `<epic-event at="2026-10-11T09:01-04:00">J1 renamed:  "Old call" -> "New call"</epic-event>` +
      `<epic-event at="2026-10-11T09:02-04:00">see <a href="#p2">P2 · Old Two</a></epic-event>` +
      `</epic-section></epic-page></main></body></html>`
  ).document as unknown as Document
}

/** A context with an inbox:  a comment on the old P3's second field (now P4's), one on a gone item, a mark. */
function context(): MigrationContext & { notes: string[]; moves: AnchorMove[] } {
  const inbox: InboxView = {
    keyed: { mark: { t9: {}, j1: {}, summary: {}, new1: {} } },
    comments: {
      cm1: { anchor: "p3#field-2", excerpt: "Write the docs." },
      cm2: { anchor: "t9", excerpt: "Gone" },
      cm3: { anchor: "p2#field-1", excerpt: "Two's goal." }
    }
  }
  return { now: new Date(2026, 9, 11), inbox, notes: [], moves: [] }
}

/** The page's links in its goal, as `href words`. */
function links(document: Document): string[] {
  return Array.from(document.querySelectorAll("#p1 a")).map((a) => `${a.getAttribute("href")} ${a.textContent}`)
}

describe("links-agree", () => {
  test("old titles in a link's words fixed;  a moved phase followed;  a gone id reported, not changed", () => {
    const document = page()
    const run = context()
    expect(STEP.run(document, run)).toBe(true)
    expect(links(document)).toEqual(["#p2 P2 · Two", "#j1 New call", "#p4 P4 · Docs", "#t9 T9 · Gone", "#p1 P1"])
    expect(run.notes.filter((note) => /gone/.test(note))).toEqual([
      'links-agree:  #t9 is gone (a link saying "T9 · Gone"):  left for you',
      "links-agree:  comment cm2 is on t9, which is gone:  left for you",
      "links-agree:  mark on #t9, which is gone:  left for you"
    ])
    // the log is history:  its link keeps the old title
    expect(document.querySelector("epic-event a")!.textContent).toBe("P2 · Old Two")
  })

  test("a comment whose block moved is re-anchored (a move for the inbox);  one in place stays", () => {
    const run = context()
    STEP.run(page(), run)
    expect(run.moves).toEqual([{ id: "cm1", from: "p3#field-2", to: "p4#field-2" }])
  })

  test("idempotent:  a second run changes nothing, and reports only what's gone", () => {
    const document = page()
    STEP.run(document, context())
    const again = context()
    again.inbox!.comments.cm1!.anchor = "p4#field-2"
    expect(STEP.run(document, again)).toBe(false)
    expect(again.moves).toEqual([])
    expect(again.notes.every((note) => /gone/.test(note))).toBe(true)
  })

  test("a link's words that aren't an old title stay as written", () => {
    const document = page()
    const link = document.querySelector('a[href="#p2"]')!
    link.textContent = "P2 · the second phase"
    STEP.run(document, context())
    expect(link.textContent).toBe("P2 · the second phase")
  })

  test("a link with markup in its words is reported, not rewritten", () => {
    const document = page()
    document.querySelector('a[href="#j1"]')!.innerHTML = "<code>Old call</code>"
    const run = context()
    STEP.run(document, run)
    expect(document.querySelector('a[href="#j1"]')!.innerHTML).toBe("<code>Old call</code>")
    expect(run.notes.some((note) => /#j1 should say "New call", but its words hold markup/.test(note))).toBe(true)
  })
})

describe("PlanAnchors", () => {
  test("an anchor's block:  exact by id or position, moved by its excerpt, gone", () => {
    const document = page()
    expect(PlanAnchors.find(document, "j1").how).toBe("exact")
    expect(PlanAnchors.find(document, "p2#field-1", "Two's goal.").how).toBe("exact")
    const moved = PlanAnchors.find(document, "p3#field-2", "Write the docs.")
    expect([moved.how, PlanAnchors.anchorOf(moved.block!)]).toEqual(["moved", "p4#field-2"])
    expect(PlanAnchors.find(document, "p3#field-1", "nothing like it").how).toBe("changed")
    expect(PlanAnchors.find(document, "p3#field-9", "nothing like it").how).toBe("gone")
    expect(PlanAnchors.find(document, "zz").how).toBe("gone")
  })

  test("an excerpt is a block's first words, a space between elements' texts", () => {
    const document = page()
    expect(PlanAnchors.excerptOf(document.querySelector("#p1 > epic-field")!)).toBe(
      "See P2 · Old Two , Old call , P3 · Docs , T9 · Gone , P1 ."
    )
  })
})
