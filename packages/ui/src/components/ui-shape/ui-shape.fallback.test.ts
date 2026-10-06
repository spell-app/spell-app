import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { ShapeFallback } from "./ui-shape.fallback"

// the fallback keys on the host's tag, so the stubs take the real tags
for (const tag of ["ui-shape", "ui-side"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    ShapeFallback.render({ host, root, error: new Error("boom"), internals })
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ShapeFallback", () => {
  it("renders the stage and the sides box (a live region) around the slot, in the class grammar", async () => {
    const host = Fixture.render<StubHost>(`<ui-shape cube><ui-side>One</ui-side><ui-side>Two</ui-side></ui-shape>`)
    const stage = FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=shape]")!
    expect(stage.className).toBe("ui cube shape")
    const box = stage.querySelector("[part~=sides]")!
    expect(box.className).toBe("sides")
    expect(box.getAttribute("aria-live")).toBe("polite")
    expect(box.querySelector("slot")).not.toBeNull()
    await expectAccessible(host, AXE)
  })

  it("renders a side as its face around the slot", () => {
    const host = Fixture.render<StubHost>(`<ui-side>One</ui-side>`)
    const face = FallbackStub.shadow(host).querySelector("[part~=side]")!
    expect(face.className).toBe("side")
    expect(face.querySelector("slot")).not.toBeNull()
  })
})
