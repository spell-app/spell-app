/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIVisibility } from "$/ui/components/ui-visibility/UIVisibility"

/** `<ui-visibility>` in the static server render (`$/ui/static`, seo plan P3):  nothing observes. */
describe("<ui-visibility> static render", () => {
  beforeAll(() => {
    StaticRender.define(UIVisibility)
  })

  it("renders a box around its content", () => {
    const html = StaticRender.fragment(`<ui-visibility><p>Watched</p></ui-visibility>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div data-ui="visibility" class="ui visibility" part="visibility"><p data-ui-slotted="">Watched</p></div>`
      )
    )
  })

  it("gives lazy images their source at once, lazy-loaded by the browser", () => {
    const html = StaticRender.fragment(
      `<ui-visibility type="image"><img alt="A" data-src="a.png" data-srcset="a.png 1x">` +
        `<img alt="B" data-src="b.png" loading="eager"></ui-visibility>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui image visibility"/)
    expect(html).toMatch(/<img [^>]*alt="A"[^>]*>/)
    const [first, second] = [...html.matchAll(/<img [^>]*>/g)].map((match) => sorted(match[0]))
    expect(first).toContain(` src="a.png"`)
    expect(first).toContain(` srcset="a.png 1x"`)
    expect(first).toContain(` loading="lazy"`)
    expect(second).toContain(` src="b.png"`)
    expect(second).toContain(` loading="eager"`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
