/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIFlag } from "$/ui/components/ui-flag/UIFlag"

/** `<ui-flag>` in the static server render (`$/ui/server`, seo plan P3). */
describe("ui-flag static render", () => {
  beforeAll(() => {
    StaticRender.define(UIFlag)
  })

  it("renders the flag emoji, named by the server's English region names", () => {
    const html = StaticRender.fragment(`<ui-flag country="fr" size="large"></ui-flag>`)
    expect(sorted(html)).toBe(
      sorted(`<span data-ui="flag" class="ui large flag" part="flag" role="img" aria-label="France">🇫🇷</span>`)
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
