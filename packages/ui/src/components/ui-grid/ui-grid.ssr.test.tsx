/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIColumn } from "$/ui/components/ui-grid/UIColumn"
import { UIGrid } from "$/ui/components/ui-grid/UIGrid"
import { UIRow } from "$/ui/components/ui-grid/UIRow"

/** `<ui-grid>`, `<ui-row>`, `<ui-column>` in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-grid static render", () => {
  beforeAll(() => {
    StaticRender.define(UIGrid, UIRow, UIColumn)
  })

  it("renders the grid's class grammar:  rows and columns as nested <div>s", () => {
    const html = StaticRender.fragment(
      `<ui-grid columns="2" divided><ui-row><ui-column width="4"><p>A</p></ui-column>` +
        `<ui-column><p>B</p></ui-column></ui-row></ui-grid>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="grid" class="ui divided two column grid" part="grid">` +
          `<div data-ui-slotted="" data-ui="row" class="ui row" part="row">` +
          `<div data-ui-slotted="" data-ui="column" class="ui four wide column" part="column">` +
          `<p data-ui-slotted="">A</p></div>` +
          `<div data-ui-slotted="" data-ui="column" class="ui column" part="column"><p data-ui-slotted="">B</p></div>` +
          `</div></div>`
      )
    )
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
