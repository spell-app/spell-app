/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UIRoot } from "$/ui/components/ui-root/UIRoot"

/**
 * `<ui-root>` in the static server render (`$/ui/server`):  a plain wrapper carrying its classes, theme / box states and
 * box style -- never hidden, no loader, no skeletons:  a static page has nothing to wait for.
 */
describe("ui-root, static", () => {
  beforeAll(() => {
    StaticRender.define(UIRoot)
  })

  it("renders a wrapper with no box of its own, its content shown, whatever `display` says", () => {
    const html = StaticRender.fragment(`<ui-root display="when-ready" loading="Wait"><p>Hi</p></ui-root>`)
    expect(sorted(html)).toBe(
      sorted(
        `<div class="ui root" style="display: contents" data-ui="root" data-state="ready">` +
          `<p data-ui-slotted="">Hi</p></div>`
      )
    )
  })

  it("renders a themed, sized box:  its size inline, its content in a named scrolling region", () => {
    const html = StaticRender.fragment(
      `<ui-root theme="dark" size="small" height="8em" aria-label="Report"><p>Hello</p></ui-root>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="ui small root" style="height: 8em; --ui-scale: var(--ui-size-small)" aria-label="Report" ` +
          `data-ui="root" data-state="ready dark box"><div part="scroller" tabindex="0" role="region" ` +
          `aria-label="Report"><p data-ui-slotted="">Hello</p></div></div>`
      )
    )
  })

  it("drops a width or height that could inject other declarations", () => {
    const html = StaticRender.fragment(`<ui-root width="10px; color: red"><p>x</p></ui-root>`)
    expect(html).not.toContain("color: red")
    expect(html).toContain(`style="display: contents"`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
