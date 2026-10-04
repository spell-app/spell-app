import { describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/index"

/** `ElementFixture.breakRender()` must break ANY element, including one with no `keyOnly` attribute. */
describe("ElementFixture.breakRender()", () => {
  it.each([
    ["a vocabulary with a keyOnly attribute", `<ui-button primary>Save</ui-button>`],
    ["a vocabulary with no keyOnly attribute", `<ui-flag country="fr"></ui-flag>`]
  ])("breaks %s, leaving its attributes as they were", async (_name, html) => {
    const host = await ElementFixture.render<UIHost>(html)
    const before = host
      .getAttributeNames()
      .sort()
      .map((name) => [name, host.getAttribute(name)])
    vi.spyOn(console, "error").mockImplementation(() => {})
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    expect(
      host
        .getAttributeNames()
        .sort()
        .map((name) => [name, host.getAttribute(name)])
    ).toEqual(before)
  })
})
