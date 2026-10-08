/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIRail } from "$/ui/components/ui-rail/UIRail"

/** `<ui-rail>` in the static server render (`$/ui/static`, seo plan P3). */
describe("<ui-rail> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIRail)
  })

  it("renders a rail around its content", () => {
    const html = StaticRender.fragment(`<ui-rail position="left" close><p>Rail</p></ui-rail>`)
    expect(sorted(html)).toBe(
      sorted(`<div data-ui="rail" class="ui left close rail" part="rail"><p data-ui-slotted="">Rail</p></div>`)
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
