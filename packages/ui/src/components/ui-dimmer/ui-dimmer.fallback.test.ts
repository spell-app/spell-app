import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { DimmerFallback } from "./ui-dimmer.fallback"

FallbackStub.define("x-fb-dimmer", (host, root, internals) =>
  DimmerFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** Render a fallback dimmer;  returns the host and its box. */
function dimmer(html: string) {
  const host = Fixture.render<StubHost>(html)
  const box = FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=dimmer]")!
  return { host, box }
}

describe("DimmerFallback", () => {
  it("renders the element dimmer in the class grammar, content box around the slot", async () => {
    const { box } = dimmer(`<x-fb-dimmer inverted shade="light" active>x</x-fb-dimmer>`)
    expect(box.localName).toBe("div")
    expect(box.className).toBe("ui light active inverted dimmer")
    expect(box.querySelector(":scope > .content[part=content] > slot")).not.toBeNull()
    await expectAccessible(box, AXE)
  })

  it("follows `active`", async () => {
    const { host, box } = dimmer(`<x-fb-dimmer>x</x-fb-dimmer>`)
    expect(box.classList.contains("active")).toBe(false)
    host.setAttribute("active", "")
    await expect.poll(() => box.classList.contains("active")).toBe(true)
    host.setAttribute("active", "no")
    await expect.poll(() => box.classList.contains("active")).toBe(false)
  })

  it("a page dimmer is a native modal dialog;  Escape drops `active`, with a ui-hide", async () => {
    const { host, box } = dimmer(`<x-fb-dimmer page active><button>In</button></x-fb-dimmer>`)
    const dialog = box as HTMLDialogElement
    expect(dialog.localName).toBe("dialog")
    expect(dialog.matches(":modal")).toBe(true)
    expect(dialog.getAttribute("aria-label")).toBe("Dimmed page")
    const hides: Event[] = []
    host.addEventListener("ui-hide", (event) => hides.push(event))
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => host.hasAttribute("active")).toBe(false)
    expect(hides).toHaveLength(1)
  })

  it("closes a page dimmer when disposed", () => {
    const { host, box } = dimmer(`<x-fb-dimmer page active>x</x-fb-dimmer>`)
    host.handle!.dispose()
    expect((box as HTMLDialogElement).open).toBe(false)
  })
})
