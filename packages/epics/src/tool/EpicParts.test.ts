/**
 * Tests of `EpicParts`:  splitting an `<epic-*>` doc into a skeleton and part files, and putting it back.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { Markup } from "$/epics/markup"

import { EpicParts } from "./EpicParts"

/** A small `<epic-*>` doc:  a host of each kind, one with a slotted title, one empty, URLs to rebase. */
const DOC = `<!doctype html><html><body><main><epic-page epic="x" title="X">
<epic-overview id="overview"><p slot="summary">S</p>
  <epic-section id="o1" kind="overview-part" title="One"><p>See <a href="../../guides/a.html">a</a>.</p><h4 id="o1-deep">D</h4></epic-section>
</epic-overview>
<epic-section id="phases" kind="phases"><epic-phase id="p1" title="P" status="done"><epic-field name="goal">g</epic-field><epic-commit sha="2c71ac5">c</epic-commit></epic-phase></epic-section>
<epic-section id="decisions" kind="questions">
  <epic-item id="q1" status="open"><span slot="title">The <code>x</code></span><p>body</p></epic-item>
  <epic-item id="q2" title="bare" status="open"></epic-item>
</epic-section>
<epic-section id="log" kind="log"><epic-event at="2026-10-07">made</epic-event></epic-section>
</epic-page></main></body></html>`

/** `DOC`, parsed. */
function document(): Document {
  return parseHTML(DOC).document as unknown as Document
}

describe("EpicParts.split() / assemble()", () => {
  test("each host's body goes to a part;  titles stay;  marks set through the definitions", () => {
    const doc = document()
    const parts = new EpicParts(doc).split({ docName: "x.plan.html" })
    expect([...parts.keys()]).toEqual(["o1", "p1", "q1", "log"])
    expect(Markup.read(doc.getElementById("o1")!)).toEqual({
      id: "o1",
      kind: "overview-part",
      title: "One",
      source: "parts/o1.html",
      partIds: "o1-deep"
    })
    expect(Markup.read(doc.getElementById("p1")!)).toMatchObject({ source: "parts/p1.html", commits: true })
    expect(doc.querySelector("#q1 > span[slot='title']")).not.toBeNull()
    expect(doc.querySelector("#q1 > p")).toBeNull()
    expect(doc.getElementById("q2")!.hasAttribute("source")).toBe(false)
    expect(doc.body.hasAttribute("data-spell-needs-server")).toBe(true)
    expect(parts.get("o1")).toContain('href="../../../guides/a.html"')
    expect(parts.get("q1")).toMatch(/^<!-- plan-doc part:  #q1's details in x\.plan\.html/)
  })

  test("assembling puts every body back, its URLs the page's again, and drops the marks", () => {
    const doc = document()
    const whole = doc.querySelector("main")!.innerHTML
    const parts = new EpicParts(doc).split()
    expect(new EpicParts(doc).assemble((id) => parts.get(id))).toEqual([])
    expect(doc.querySelector("main")!.innerHTML.replace(/\s+/g, "")).toBe(whole.replace(/\s+/g, ""))
  })

  test("a missing part is reported;  its host stays empty", () => {
    const doc = document()
    new EpicParts(doc).split()
    expect(new EpicParts(doc).assemble(() => undefined)).toEqual(["o1", "p1", "q1", "log"])
    expect(doc.getElementById("p1")!.children).toHaveLength(0)
  })
})
