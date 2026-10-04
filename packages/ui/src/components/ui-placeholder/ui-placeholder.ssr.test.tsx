/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIPlaceholder } from "$/ui/components/ui-placeholder/UIPlaceholder"
import { UIPlaceholderHeader } from "$/ui/components/ui-placeholder/UIPlaceholderHeader"
import { UIPlaceholderLine } from "$/ui/components/ui-placeholder/UIPlaceholderLine"
import { UIPlaceholderParagraph } from "$/ui/components/ui-placeholder/UIPlaceholderParagraph"

/** `<ui-placeholder>` and its shapes in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-placeholder static render", () => {
  beforeAll(() => {
    StaticRender.define(UIPlaceholder, UIPlaceholderHeader, UIPlaceholderLine, UIPlaceholderParagraph)
  })

  it("renders a hidden skeleton of nested shapes", () => {
    const html = StaticRender.fragment(
      `<ui-placeholder><ui-placeholder-header image><ui-placeholder-line></ui-placeholder-line>` +
        `</ui-placeholder-header><ui-placeholder-paragraph><ui-placeholder-line length="short">` +
        `</ui-placeholder-line></ui-placeholder-paragraph></ui-placeholder>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="placeholder" aria-hidden="true" data-state="placeholder" class="ui placeholder" ` +
          `part="placeholder"><div data-ui-slotted="" data-ui="placeholder-header" class="image header" part="header">` +
          `<div data-ui-slotted="" data-ui="placeholder-line" class="line" part="line"></div></div>` +
          `<div data-ui-slotted="" data-ui="placeholder-paragraph" class="paragraph" part="paragraph">` +
          `<div data-ui-slotted="" data-ui="placeholder-line" class="short line" part="line"></div></div></div>`
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
