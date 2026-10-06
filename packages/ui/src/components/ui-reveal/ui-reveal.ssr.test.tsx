/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIReveal } from "$/ui/components/ui-reveal/UIReveal"

/** `<ui-reveal>` in the static server render (`$/ui/static`, seo plan P3):  CSS reveals on hover and focus. */
describe("ui-reveal static render", () => {
  beforeAll(() => {
    StaticRender.define(UIReveal)
  })

  it("renders a focusable group, each named slot's content in its own box", () => {
    const html = StaticRender.fragment(
      `<ui-reveal fade><img slot="visible" alt="A" src="a.png"><img slot="hidden" alt="B" src="b.png"></ui-reveal>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="reveal" class="ui fade reveal" part="reveal" tabindex="0" role="group">` +
          `<div class="visible content" part="visible"><img data-ui-slotted="" alt="A" src="a.png"></div>` +
          `<div class="hidden content" part="hidden"><img data-ui-slotted="" alt="B" src="b.png"></div></div>`
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
