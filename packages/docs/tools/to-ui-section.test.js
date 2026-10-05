import { parseHTML } from "linkedom"
import { describe, expect, it } from "vite-plus/test"

import { serialize } from "./pages.js"
import { convertSections } from "./to-ui-section.js"

/** A page whose `main` is `body`, parsed. */
function page(body) {
  return parseHTML(`<!doctype html><html><body><main>${body}</main></body></html>`).document
}

describe("convertSections", () => {
  it("turns section.s2 > ui-sticky > h2 into <ui-section>, keeping the heading's id, icon and content", () => {
    const document = page(
      `<section class="s2"><ui-sticky class="spell-h2"><h2 id="api"><ui-icon name="bug"></ui-icon> 2. The API</h2></ui-sticky><p>body</p>` +
        `<section class="s3" data-fold="closed"><ui-sticky class="spell-h3"><h3 id="a1">2.1 Part</h3></ui-sticky><p>inner</p></section></section>`
    )
    const report = convertSections(document)
    expect(report.converted).toBe(2)
    expect(serialize(document)).toContain(
      '<main><ui-section id="api" header="2. The API" sticky collapsible dividing><ui-icon slot="icon" name="bug"></ui-icon><p>body</p>' +
        '<ui-section id="a1" header="2.1 Part" sticky collapsible dividing collapsed><p>inner</p></ui-section></ui-section></main>'
    )
    expect(convertSections(document).converted).toBe(0)
  })

  it("titles with markup go in a slot=header span;  plan-update labels stay, runtime counts go", () => {
    const document = page(
      `<section class="s2"><ui-sticky class="spell-h2"><h2 id="x">The <code>x</code> API ` +
        `<ui-label class="plan-update" data-phase="2">UPDATE</ui-label><ui-label class="spell-count">1/2</ui-label></h2></ui-sticky></section>`
    )
    const report = convertSections(document)
    expect(report.slotHeaders).toEqual(["x"])
    const section = document.getElementById("x")
    expect(section.hasAttribute("header")).toBe(false)
    const span = section.querySelector(':scope > span[slot="header"]')
    expect(span.innerHTML).toBe('The <code>x</code> API <ui-label class="plan-update" data-phase="2">UPDATE</ui-label>')
  })

  it("keeps the section's other attributes, phase data first;  drops its own id and relinks to the heading's", () => {
    const document = page(
      `<a href="#phases-section">phases</a><section class="s2 wide" id="phases-section"><ui-sticky class="spell-h2"><h2 id="phases">2. Phases</h2></ui-sticky>` +
        `<section data-status="done" data-phase="1" class="s3"><ui-sticky class="spell-h3"><h3 id="p1"><ui-icon name="circle check"></ui-icon> P1 · One</h3></ui-sticky></section></section>`
    )
    const report = convertSections(document)
    expect(report.droppedIds).toEqual(["phases-section"])
    expect(document.querySelector("a").getAttribute("href")).toBe("#phases")
    expect(document.getElementById("phases").getAttribute("class")).toBe("wide")
    expect(serialize(document)).toContain(
      '<ui-section id="p1" data-phase="1" data-status="done" header="P1 · One" sticky collapsible dividing>'
    )
  })

  it("keeps several icons together, and sets `level` where nesting would change the outline", () => {
    const document = page(
      `<section class="s3"><ui-sticky class="spell-h3"><h3 id="top"><ui-icon name="a"></ui-icon><ui-icon name="b"></ui-icon> Top</h3></ui-sticky></section>`
    )
    const report = convertSections(document)
    expect(report.multiIcons).toEqual(["top"])
    expect(report.levels).toHaveLength(1)
    const section = document.getElementById("top")
    expect(section.getAttribute("level")).toBe("3")
    expect(section.querySelectorAll(':scope > span[slot="icon"] > ui-icon')).toHaveLength(2)
  })
})
