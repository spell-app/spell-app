import { describe, expect, it } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-components"

describe("<ui-components>", () => {
  it("draws nothing and takes no space;  holds its `source` as attribute and property", async () => {
    const domElement = await ElementFixture.render<DOMElement & { source?: string }>(
      `<ui-components source="packs/x.pack.js"></ui-components>`
    )
    expect(getComputedStyle(domElement).display).toBe("none")
    expect(domElement.shadowRoot!.childElementCount).toBe(0)
    expect(domElement.source).toBe("packs/x.pack.js")
    domElement.source = "packs/y.pack.js"
    await ElementFixture.tick()
    expect(domElement.getAttribute("source")).toBe("packs/y.pack.js")
  })

  it("outside a <ui-root> it loads nothing", async () => {
    const before = document.scripts.length
    await ElementFixture.render(`<ui-components source="packs/x.pack.js"></ui-components>`)
    expect(document.scripts.length).toBe(before)
  })

  it("passes axe", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-components source="x.pack.js"></ui-components><p>Text</p></div>`
    )
    await expectAccessible(holder)
  })
})
