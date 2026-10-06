import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { GridFallback } from "./ui-grid.fallback"

// the fallback keys its vocabulary on the host's tag, so the stubs take the real tags
for (const tag of ["ui-grid", "ui-row", "ui-column"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    GridFallback.render({ host, root, error: new Error("boom"), internals })
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("GridFallback", () => {
  it("renders a grid, row and column with the class grammar, part and slot, keyed by tag", async () => {
    const grid = Fixture.render<StubHost>(
      `<ui-grid columns="3" divided><ui-row color="red"><ui-column width="4" width-mobile="16">A</ui-column></ui-row></ui-grid>`
    )
    const roots = [grid, grid.querySelector("ui-row")!, grid.querySelector("ui-column")!].map(
      (host) => FallbackStub.shadow(host).firstElementChild!
    )
    expect(roots.map((root) => root.className)).toEqual([
      "ui divided three column grid",
      "ui red row",
      "ui four wide sixteen wide mobile column"
    ])
    expect(roots.map((root) => root.getAttribute("part"))).toEqual(["grid", "row", "column"])
    for (const root of roots) expect(root.querySelector("slot")).not.toBeNull()
    await expectAccessible(grid, AXE)
  })
})
