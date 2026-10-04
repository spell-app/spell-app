/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIContainer } from "$/ui/components/ui-container/UIContainer"

/** `<ui-container>` in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-container static render", () => {
  beforeAll(() => {
    StaticRender.define(UIContainer)
  })

  it("renders a container around its content", () => {
    const html = StaticRender.fragment(`<ui-container text><p>Body</p></ui-container>`)
    expect(sorted(html)).toBe(
      sorted(`<div data-ui="container" class="ui text container" part="container"><p data-ui-slotted="">Body</p></div>`)
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
