import { describe, expect, it } from "vitest"

import { MD } from "$/markdown"

/** `markdown` rendered with `ui-*` elements, as HTML. */
function ui(markdown: string, options = {}) {
  return MD.render(markdown, options).html
}

describe("MD.render() -- ui-* elements", () => {
  it("headings:  ui-header, level shifted, GitHub slug ids, the outline", () => {
    const { html, headings } = MD.render("# Getting started!\n\n## Setup\n\n## Setup\n", { headingOffset: 1 })
    expect(html).toBe(
      '<ui-header level="2" id="getting-started">Getting started!</ui-header>' +
        '<ui-header level="3" id="setup">Setup</ui-header><ui-header level="3" id="setup-1">Setup</ui-header>'
    )
    expect(headings).toEqual([
      { level: 2, text: "Getting started!", id: "getting-started" },
      { level: 3, text: "Setup", id: "setup" },
      { level: 3, text: "Setup", id: "setup-1" }
    ])
  })

  it("code:  ui-code with its language and a copy button", () => {
    expect(ui("```ts\nlet x = 1 < 2\n```\n")).toBe('<ui-code language="ts" copy="">let x = 1 &lt; 2</ui-code>')
  })

  it("lists:  ui-list bulleted / ordered, numbered by value;  a bullet list in an ordered one stays plain", () => {
    expect(ui("- a\n- b\n")).toBe('<ui-list bulleted=""><ui-item>a</ui-item><ui-item>b</ui-item></ui-list>')
    expect(ui("3. a\n4. b\n")).toBe(
      '<ui-list ordered=""><ui-item value="3.">a</ui-item><ui-item value="4.">b</ui-item></ui-list>'
    )
    expect(ui("1. a\n   - b\n")).toBe(
      '<ui-list ordered=""><ui-item value="1.">a<ul><li>b</li></ul></ui-item></ui-list>'
    )
  })

  it("task items:  a read-only ui-checkbox", () => {
    expect(ui("- [x] done\n- [ ] not\n")).toBe(
      '<ui-list bulleted=""><ui-item class="task-list-item"><ui-checkbox readonly="" checked=""></ui-checkbox> done</ui-item>' +
        '<ui-item class="task-list-item"><ui-checkbox readonly=""></ui-checkbox> not</ui-item></ui-list>'
    )
  })

  it("alerts:  ui-message;  plain quotes:  ui-segment", () => {
    expect(ui("> [!WARNING]\n> Careful.\n")).toBe(
      '<ui-message state="warning" icon="exclamation triangle" header="Warning"><p>Careful.</p></ui-message>'
    )
    expect(ui("> quoted\n")).toBe('<ui-segment secondary=""><p>quoted</p></ui-segment>')
  })

  it("tables in ui-table;  thematic breaks as ui-divider", () => {
    expect(ui("| a |\n|---|\n| 1 |\n\n---\n")).toBe(
      '<ui-table celled=""><table><thead><tr><th>a</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table></ui-table>' +
        "<ui-divider></ui-divider>"
    )
  })

  it("breaks:  a line end is a <br>", () => {
    expect(ui("a\nb\n", { breaks: true })).toBe("<p>a<br />\nb</p>")
  })

  it("drawing twice gives the same:  rendering doesn't change the blocks", () => {
    const doc = MD.BlockScanner.parse("- [x] done\n\n> [!NOTE]\n> n\n")
    const first = MD.markupToHTML(MD.renderBlocks(doc, undefined, { ui: true }))
    expect(MD.markupToHTML(MD.renderBlocks(doc, undefined, { ui: true }))).toBe(first)
  })

  it("plain mode:  GitHub's task inputs and alert divs", () => {
    expect(MD.render("- [x] done\n", { ui: false }).html).toBe(
      '<ul><li class="task-list-item"><input type="checkbox" disabled="" checked="" /> done</li></ul>'
    )
  })
})
