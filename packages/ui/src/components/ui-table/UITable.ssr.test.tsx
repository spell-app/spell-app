/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UITable } from "$/ui/components/ui-table/UITable"

/**
 * `<ui-table>` in the static server render (`$/ui/static`):  the author's `<table>` gets the class grammar the
 * element mirrors (`TableClassMirror`), and data mode renders its rows from the `rows` / `column-defs` attributes.
 */
describe("<ui-table> static render", () => {
  beforeAll(() => {
    StaticRender.define(UITable)
  })

  it("mirrors the class grammar onto the author's table, author classes first;  aria-sort on the sorted header", () => {
    const html = StaticRender.fragment(
      `<ui-table celled striped sortable sort-column="1" sort-direction="descending"><table class="mine">` +
        `<thead><tr><th>Name</th><th>Status</th></tr></thead><tbody><tr><td>John</td><td>Approved</td></tr></tbody>` +
        `</table></ui-table>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="scroller" part="scroller" data-ui="table">` +
          `<table class="mine ui celled sortable striped table" data-ui="table" data-ui-slotted="">` +
          `<thead><tr><th>Name</th><th aria-sort="descending">Status</th></tr></thead>` +
          `<tbody><tr><td>John</td><td>Approved</td></tr></tbody></table></div>`
      )
    )
  })

  it("renders data mode from JSON attributes:  sorted rows, column classes, sort buttons", () => {
    const html = StaticRender.fragment(
      `<ui-table celled sortable sort-column="0" rows='[{"name":"Jill","age":30},{"name":"Bob","age":25}]' ` +
        `column-defs='[{"key":"name","header":"Name"},{"key":"age","header":"Age","textAlign":"right"}]'></ui-table>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="scroller" part="scroller" data-ui="table"><table class="ui celled sortable table"><thead><tr>` +
          `<th scope="col" aria-sort="ascending" data-key="name"><button type="button">Name</button></th>` +
          `<th scope="col" class="right aligned" data-key="age"><button type="button">Age</button></th></tr></thead>` +
          `<tbody><tr><td>Bob</td><td class="right aligned">25</td></tr>` +
          `<tr><td>Jill</td><td class="right aligned">30</td></tr></tbody></table></div>`
      )
    )
  })

  it("an author table wins over rows;  a scrolling scroller is a named region", () => {
    const html = StaticRender.fragment(
      `<ui-table scrolling celled aria-label="People" rows='[{"a":1}]'><table><tbody><tr><td>x</td></tr></tbody>` +
        `</table></ui-table>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="scrolling scroller" part="scroller" tabindex="0" role="region" aria-label="People" ` +
          `data-ui="table"><table class="ui celled scrolling table" data-ui="table" data-ui-slotted="">` +
          `<tbody><tr><td>x</td></tr></tbody></table></div>`
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
