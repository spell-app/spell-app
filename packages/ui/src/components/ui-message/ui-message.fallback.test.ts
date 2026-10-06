import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { MessageFallback } from "./ui-message.fallback"

FallbackStub.define("x-fb-message", (host, root, internals) =>
  MessageFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("MessageFallback", () => {
  it("renders the message, content block, header and slot", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-message state="negative" header="Oops">Body</x-fb-message>`)
    const message = FallbackStub.shadow(host).firstElementChild!
    expect(message.className).toBe("ui negative message")
    expect(message.getAttribute("part")).toBe("message")
    const content = message.querySelector("[part=content]")!
    expect(content.querySelector("[part=header]")!.textContent).toBe("Oops")
    expect(content.querySelector("slot")).not.toBeNull()
    expect(message.querySelector("button")).toBeNull()
    await expectAccessible(host, AXE)
  })

  it("keeps a slotted icon's box and the icon class", () => {
    const host = Fixture.render<StubHost>(`<x-fb-message><span slot="icon">!</span>Body</x-fb-message>`)
    const message = FallbackStub.shadow(host).firstElementChild!
    expect(message.className).toBe("ui message icon")
    expect(message.querySelector("[part=icon] slot[name=icon]")).not.toBeNull()
  })

  it("still dismisses:  a cancelable ui-dismiss, then hidden", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-message dismissible>Body</x-fb-message>`)
    const close = FallbackStub.shadow(host).querySelector("button")!
    expect(close.getAttribute("aria-label")).toBe("Dismiss")
    await expectAccessible(host, AXE)
    let cancel = true
    host.addEventListener("ui-dismiss", (event) => {
      if (cancel) event.preventDefault()
    })
    close.click()
    expect(host.hidden).toBe(false)
    cancel = false
    close.click()
    expect(host.hidden).toBe(true)
  })
})
