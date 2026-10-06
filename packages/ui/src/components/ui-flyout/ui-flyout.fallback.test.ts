import { describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { FlyoutFallback } from "./ui-flyout.fallback"

FallbackStub.define("x-fb-flyout", (host, root, internals) =>
  FlyoutFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** Render a fallback flyout;  returns the host and its native dialog. */
function flyout(html: string) {
  const host = Fixture.render<StubHost>(html)
  const dialog = FallbackStub.shadow(host).querySelector("dialog")!
  return { host, dialog }
}

describe("FlyoutFallback", () => {
  it("renders the modal's native <dialog> in the flyout's class grammar and part", async () => {
    const { dialog } = flyout(`<x-fb-flyout position="right" inverted header="Title" closable open>x</x-fb-flyout>`)
    expect(dialog.className).toBe("ui right inverted visible flyout")
    expect(dialog.getAttribute("part")).toBe("flyout")
    expect([...dialog.children].map((child) => child.getAttribute("part") ?? child.localName)).toEqual([
      "header",
      "slot",
      "close"
    ])
    await expectAccessible(dialog, AXE)
  })

  it("adds a word width after the noun;  columns stay in the grammar", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(flyout(`<x-fb-flyout width="very wide">x</x-fb-flyout>`).dialog.className).toBe("ui left flyout very wide")
    expect(flyout(`<x-fb-flyout width="4">x</x-fb-flyout>`).dialog.className).toBe("ui left four wide flyout")
    warn.mockRestore()
  })

  it("follows `open` with showModal() and the `visible` class;  Escape drops it", async () => {
    const { host, dialog } = flyout(`<x-fb-flyout><button>In</button></x-fb-flyout>`)
    host.setAttribute("open", "")
    await expect.poll(() => dialog.matches(":modal")).toBe(true)
    expect(dialog.classList.contains("visible")).toBe(true)
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => host.hasAttribute("open")).toBe(false)
    expect(dialog.classList.contains("visible")).toBe(false)
  })
})
