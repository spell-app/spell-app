/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIMessage } from "$/ui/components/ui-message/UIMessage"

/** `<ui-message>` in the static server render (`$/ui/static`, seo plan P3). */
describe("<ui-message> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIMessage)
  })

  it("renders the header shorthand above the slotted content", () => {
    const html = StaticRender.fragment(`<ui-message state="info" header="Hello"><p>Body</p></ui-message>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="message" class="ui info message" part="message"><div class="content" part="content">` +
          `<div class="header" part="header">Hello</div><p data-ui-slotted="">Body</p></div></div>`
      )
    )
  })

  it("renders an icon box and a named close button", () => {
    const html = StaticRender.fragment(`<ui-message icon="envelope" dismissible>Hi</ui-message>`)
    expect(html).toMatch(/^<div [^>]*class="ui icon message"/)
    expect(html).toContain(`<span class="icon" part="icon">`)
    expect(html).toMatch(/<button [^>]*aria-label="Dismiss"/)
    expect(html).toMatch(/<button [^>]*type="button"/)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
