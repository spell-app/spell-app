/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIText } from "$/ui/components/ui-text/UIText"

/** `<ui-text>` in the static server render (`$/ui/static`, seo plan P3). */
describe("ui-text static render", () => {
  beforeAll(() => {
    StaticRender.define(UIText)
  })

  it("renders a <span> with its class words", () => {
    const html = StaticRender.fragment(`<ui-text color="red" size="large">Hi</ui-text>`)
    expect(sorted(html)).toBe(sorted(`<span data-ui="text" class="ui large red text" part="text">Hi</span>`))
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
