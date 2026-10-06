import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { ProgressFallback } from "./ui-progress.fallback"

FallbackStub.define("x-fb-progress", (host, root, internals) =>
  ProgressFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ProgressFallback", () => {
  it("renders a native <progress> in the class grammar, named by the label", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-progress value="9" total="20" color="teal" label="Uploading"></x-fb-progress>`
    )
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui teal progress")
    const bar = root.querySelector<HTMLProgressElement>("progress[part=bar]")!
    expect([bar.max, bar.value]).toEqual([20, 9])
    const label = root.querySelector("[part=label]")!
    expect(bar.getAttribute("aria-labelledby")).toBe(label.id)
    expect(label.querySelector("slot")!.textContent).toBe("Uploading")
    await expectAccessible(host, AXE)
  })

  it("sums several bars, and leaves the value off while indeterminate", () => {
    const host = Fixture.render<StubHost>(`<x-fb-progress value="10,20" aria-label="Disk"></x-fb-progress>`)
    const bar = FallbackStub.shadow(host).querySelector("progress")!
    expect([bar.max, bar.value, bar.getAttribute("aria-label")]).toEqual([100, 30, "Disk"])
    expect(bar.hasAttribute("aria-labelledby")).toBe(false)
    const waiting = Fixture.render<StubHost>(`<x-fb-progress indeterminate aria-label="Waiting"></x-fb-progress>`)
    const indeterminate = FallbackStub.shadow(waiting).querySelector("progress")!
    expect(indeterminate.hasAttribute("value")).toBe(false)
    expect(indeterminate.matches(":indeterminate")).toBe(true)
  })
})
