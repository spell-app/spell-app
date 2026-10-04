/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UILabel } from "$/ui/components/ui-label/UILabel"
import { UILabels } from "$/ui/components/ui-label/UILabels"
import { UIDetail } from "$/ui/components/ui-parts/UIDetail"

/**
 * `<ui-label>` / `<ui-labels>` in the static server render (`$/ui/server`, seo plan P3):  light-DOM class grammar,
 * as `examples/*.html` writes it.
 */
describe("ui-label static render", () => {
  beforeAll(() => {
    StaticRender.define(UILabel, UILabels, UIDetail)
  })

  it("renders a label as a <span> with its class words", () => {
    const html = StaticRender.fragment(`<ui-label color="red" size="small">New</ui-label>`)
    expect(sorted(html)).toBe(sorted(`<span data-ui="label" class="ui small red label" part="label">New</span>`))
  })

  it("renders a linked label as an <a>, its detail part marked in-label", () => {
    const html = StaticRender.fragment(`<ui-label href="#mail">Mail<ui-detail>23</ui-detail></ui-label>`)
    expect(sorted(html)).toBe(
      sorted(
        `<a data-ui="label" class="ui label" part="label" href="#mail">Mail<span data-ui-slotted="" ` +
          `data-ui="detail" data-state="in-label" class="detail in-label" part="detail">23</span></a>`
      )
    )
  })

  it("renders a group around its labels", () => {
    const html = StaticRender.fragment(
      `<ui-labels color="blue"><ui-label>A</ui-label><ui-label>B</ui-label></ui-labels>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui blue labels"/)
    expect(html.match(/class="ui label"/g)).toHaveLength(2)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
