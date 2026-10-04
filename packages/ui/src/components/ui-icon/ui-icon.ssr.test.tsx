import { beforeAll, describe, expect, it } from "vite-plus/test"

import { ServerRuntime, StaticRender } from "$/ui/server"
import { UIButton } from "$/ui/components/ui-button/UIButton"
import { UIIcon } from "$/ui/components/ui-icon/UIIcon"
import { UIIcons } from "$/ui/components/ui-icon/UIIcons"

/** Icons in a static render:  the pack's SVG inline, `aria-hidden`, read from disk in node. */
describe("ui-icon static render", () => {
  beforeAll(async () => {
    StaticRender.define(UIIcon, UIIcons, UIButton)
    await ServerRuntime.icons()
  })

  it("draws a named icon as inline SVG", () => {
    const html = StaticRender.fragment(`<ui-icon name="house"></ui-icon>`)
    // the pack's licence comment stays in the SVG
    expect(html).toMatch(/^<span [^>]*data-ui="icon"[^>]*><svg aria-hidden="true"[^>]*viewBox="[^"]+"[^>]*>/)
    expect(html).toContain("<path ")
    expect(html).not.toContain("<ui-icon")
  })

  it("draws a component's icon shorthand", () => {
    const html = StaticRender.fragment(`<ui-button icon="house">Home</ui-button>`)
    expect(html).toMatch(/<svg aria-hidden="true"/)
    expect(html).toContain("Home")
  })

  it("draws nothing for an unknown name", () => {
    expect(StaticRender.fragment(`<ui-icon name="no-such-icon-anywhere"></ui-icon>`)).not.toContain("<svg")
  })
})
