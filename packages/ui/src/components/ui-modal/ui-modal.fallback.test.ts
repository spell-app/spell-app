import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { ModalFallback } from "./ui-modal.fallback"

FallbackStub.define("x-fb-modal", (host, root, internals) =>
  ModalFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** Render a fallback modal;  returns the host and its native dialog. */
function modal(html: string) {
  const host = Fixture.render<StubHost>(html)
  const dialog = FallbackStub.shadow(host).querySelector("dialog")!
  return { host, dialog }
}

describe("ModalFallback", () => {
  it("renders a native <dialog> in the class grammar, with the shorthands, slot and close button", async () => {
    const { dialog } = modal(`<x-fb-modal size="tiny" basic header="Title" content="Body" closable open>x</x-fb-modal>`)
    expect(dialog.className).toBe("ui tiny basic active modal")
    expect(dialog.getAttribute("part")).toBe("modal")
    expect([...dialog.children].map((child) => child.getAttribute("part") ?? child.localName)).toEqual([
      "header",
      "content",
      "slot",
      "close"
    ])
    expect(dialog.getAttribute("aria-labelledby")).toBe(dialog.querySelector("[part=header]")!.id)
    expect(dialog.querySelector("button")!.getAttribute("aria-label")).toBe("Close")
    await expectAccessible(dialog, AXE)
  })

  it("follows the host's `open` with showModal() / close()", async () => {
    const { host, dialog } = modal(`<x-fb-modal>x</x-fb-modal>`)
    expect(dialog.open).toBe(false)
    host.setAttribute("open", "")
    await expect.poll(() => dialog.matches(":modal")).toBe(true)
    expect(dialog.classList.contains("active")).toBe(true)
    host.setAttribute("open", "no")
    await expect.poll(() => dialog.open).toBe(false)
    expect(dialog.classList.contains("active")).toBe(false)
  })

  it("Escape and the close button close it and drop the host's `open`, with a ui-hide", async () => {
    const { host, dialog } = modal(`<x-fb-modal open closable><button>In</button></x-fb-modal>`)
    const hides: Event[] = []
    host.addEventListener("ui-hide", (event) => hides.push(event))
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => host.hasAttribute("open")).toBe(false)
    expect(hides).toHaveLength(1)
    host.setAttribute("open", "")
    await expect.poll(() => dialog.open).toBe(true)
    dialog.querySelector<HTMLButtonElement>("[part=close]")!.click()
    await expect.poll(() => host.hasAttribute("open")).toBe(false)
  })

  it('closable="false":  no close button, and Escape\'s cancel is prevented', async () => {
    const { dialog } = modal(`<x-fb-modal open closable="false">x</x-fb-modal>`)
    expect(dialog.querySelector("[part=close]")).toBeNull()
    await expect.poll(() => dialog.open).toBe(true)
    const cancel = new Event("cancel", { cancelable: true })
    dialog.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
  })

  it("approve / deny still ask (cancelable), then close", async () => {
    const { host, dialog } = modal(
      `<x-fb-modal open><button class="deny">No</button><button class="approve">Yes</button></x-fb-modal>`
    )
    let veto = true
    host.addEventListener("ui-approve", (event) => veto && event.preventDefault())
    host.querySelector<HTMLButtonElement>(".approve")!.click()
    expect(dialog.open).toBe(true)
    veto = false
    host.querySelector<HTMLButtonElement>(".approve")!.click()
    expect(dialog.open).toBe(false)
    host.setAttribute("open", "")
    await expect.poll(() => dialog.open).toBe(true)
    const denies: Event[] = []
    host.addEventListener("ui-deny", (event) => denies.push(event))
    host.querySelector<HTMLButtonElement>(".deny")!.click()
    expect(denies).toHaveLength(1)
    expect(dialog.open).toBe(false)
  })

  it("closes the dialog when disposed", () => {
    const { host, dialog } = modal(`<x-fb-modal open>x</x-fb-modal>`)
    expect(dialog.open).toBe(true)
    host.handle!.dispose()
    expect(dialog.open).toBe(false)
  })
})
