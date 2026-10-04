/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIDivider } from "$/ui/components/ui-divider/UIDivider"

/** `<ui-divider>` in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-divider static render", () => {
  beforeAll(() => {
    StaticRender.define(UIDivider)
  })

  it("renders a separator, with or without text", () => {
    const html = StaticRender.fragment(`<ui-divider horizontal>Or</ui-divider><ui-divider></ui-divider>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="divider" class="ui horizontal divider" role="separator" part="divider">Or</div>` +
          `<div data-ui="divider" class="ui divider" role="separator" part="divider"></div>`
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
