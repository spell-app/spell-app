/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIAd } from "$/ui/components/ui-ad/UIAd"

/** `<ui-ad>` in the static server render (`$/ui/static`, seo plan P3). */
describe("<ui-ad> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIAd)
  })

  it("renders an ad unit, its test text as data", () => {
    const html = StaticRender.fragment(`<ui-ad unit="medium rectangle" test></ui-ad>`)
    expect(sorted(html)).toBe(
      sorted(`<div data-ui="ad" class="ui medium rectangle test ad" part="ad" data-text="Ad"></div>`)
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
