/**
 * Tests of `OldParts`:  assembling an OLD-markup split doc, the first pass's input.
 */
import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { OldParts } from "./OldParts"

/** An old-markup skeleton:  a phase, an item panel and the log, each loading a part;  one host holding text of its own. */
const SKELETON = `<!doctype html><html><body data-spell-needs-server><main>
<ui-section id="phases"><ui-section id="p1" data-phase="1" data-status="todo" source="parts/p1.html" data-commits><p class="plan-part-note">Loads from parts/p1.html</p></ui-section></ui-section>
<ui-list class="plan-items" data-kind="caveat"><ui-item id="c1" data-status="open"><ui-accordion class="plan-item" source="parts/c1.html" data-part-ids="c1-x"><ui-title>C1</ui-title><ui-content><p class="plan-part-note">x</p><p>own</p></ui-content></ui-accordion></ui-item></ui-list>
<ui-section id="log" source="parts/log.html"></ui-section>
</main></body></html>`

/** The parts:  the log's is missing. */
const PARTS: Record<string, string> = {
  p1: '<!-- plan-doc part:  #p1\'s body -->\n<ui-list class="plan-phase-body"><a href="../../../guides/x.html">x</a></ui-list>',
  c1: '<p id="c1-x">details</p>'
}

describe("OldParts.assemble()", () => {
  test("each part into its host, URLs rebased to the page;  own content kept after;  a missing part said", () => {
    const { document } = parseHTML(SKELETON)
    const result = new OldParts(document as unknown as Document).assemble((id) => PARTS[id])
    expect(result).toEqual({ split: true, hosts: ["p1", "c1", "log"], missing: ["log"], inline: ["c1"] })
    expect(document.querySelector("#p1 > ui-list a")!.getAttribute("href")).toBe("../../guides/x.html")
    expect(document.querySelector("#c1 ui-content")!.innerHTML).toBe('<p id="c1-x">details</p><p>own</p>')
    expect(document.querySelector("[source], [data-commits], [data-part-ids], .plan-part-note")).toBeNull()
    expect(document.body.hasAttribute("data-spell-needs-server")).toBe(false)
  })
})
