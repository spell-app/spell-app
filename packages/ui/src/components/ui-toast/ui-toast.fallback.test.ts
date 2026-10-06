import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { ToastFallback } from "./ui-toast.fallback"

FallbackStub.define("x-fb-toast", (host, root, internals) =>
  ToastFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("ToastFallback", () => {
  it("renders the box, the toast with its role, header, message and slot", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-toast type="success" header="Saved" message="All good">More</x-fb-toast>`
    )
    const box = FallbackStub.shadow(host).firstElementChild!
    expect(box.getAttribute("part")).toBe("box")
    expect(box.className).toBe("floating toast-box compact unclickable")
    const toast = box.querySelector("[part=toast]")!
    expect(toast.className).toBe("ui success toast")
    expect(toast.getAttribute("role")).toBe("status")
    expect(toast.querySelector("[part=header]")!.textContent).toBe("Saved")
    expect(toast.querySelector("[part=message]")!.textContent).toBe("All good")
    expect(toast.querySelector("[part=content] > slot")).not.toBeNull()
    await expectAccessible(host, AXE)
  })

  it("announces errors as alerts, and keeps a slot for actions", () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-toast type="error" message="Failed"><button slot="actions">Retry</button></x-fb-toast>`
    )
    const toast = FallbackStub.shadow(host).querySelector("[part=toast]")!
    expect(toast.getAttribute("role")).toBe("alert")
    expect(toast.querySelector("[part=actions] slot[name=actions]")).not.toBeNull()
  })

  it("still closes:  the close button hides the host and fires ui-hide", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-toast closable message="Hi"></x-fb-toast>`)
    const close = FallbackStub.shadow(host).querySelector("button")!
    expect(close.getAttribute("aria-label")).toBe("Close")
    await expectAccessible(host, AXE)
    const hides: Event[] = []
    host.addEventListener("ui-hide", (event) => hides.push(event))
    close.click()
    expect(host.hidden).toBe(true)
    expect(hides).toHaveLength(1)
  })

  it("still closes itself after display-time", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-toast display-time="30" message="Bye"></x-fb-toast>`)
    expect(host.hidden).toBe(false)
    await expect.poll(() => host.hidden).toBe(true)
  })
})
