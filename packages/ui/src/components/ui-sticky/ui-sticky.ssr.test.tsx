/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UISticky } from "$/ui/components/ui-sticky/UISticky"

/** `<ui-sticky>` in the static server render (`$/ui/static`, seo plan P3):  CSS sticks it, nothing observes. */
describe("ui-sticky static render", () => {
  beforeAll(() => {
    StaticRender.define(UISticky)
  })

  it("renders the box alone, without the observer's sentinels, offsets inline", () => {
    const html = StaticRender.fragment(`<ui-sticky offset="8"><p>Stuck</p></ui-sticky>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="sticky" class="ui sticky" part="sticky" ` +
          `style="--_ui-sticky-offset:8px;--_ui-sticky-bottom-offset:0px"><p data-ui-slotted="">Stuck</p></div>`
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
