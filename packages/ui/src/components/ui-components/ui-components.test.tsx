import { describe, expect, test } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-components"

describe("<ui-components>", () => {
  test("draws nothing and takes no space;  holds its `source` as attribute and property", async () => {
    const host = await ElementFixture.render<UIHost & { source?: string }>(
      `<ui-components source="packs/x.pack.js"></ui-components>`
    )
    expect(getComputedStyle(host).display).toBe("none")
    expect(host.shadowRoot!.childElementCount).toBe(0)
    expect(host.source).toBe("packs/x.pack.js")
    host.source = "packs/y.pack.js"
    await ElementFixture.tick()
    expect(host.getAttribute("source")).toBe("packs/y.pack.js")
  })

  test("outside a <ui-root> it loads nothing", async () => {
    const before = document.scripts.length
    await ElementFixture.render(`<ui-components source="packs/x.pack.js"></ui-components>`)
    expect(document.scripts.length).toBe(before)
  })

  test("axe passes", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-components source="x.pack.js"></ui-components><p>Text</p></div>`
    )
    await expectAccessible(holder)
  })
})
