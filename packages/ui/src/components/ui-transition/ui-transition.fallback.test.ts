import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { TransitionFallback } from "./ui-transition.fallback"

FallbackStub.define("x-fb-transition", (host, root, internals) =>
  TransitionFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Render a fallback transition;  returns the host and its box. */
function transition(html: string) {
  const host = Fixture.render<StubHost>(html)
  const box = FallbackStub.shadow(host).querySelector<HTMLDivElement>("[part~=transition]")!
  return { host, box }
}

describe("TransitionFallback", () => {
  it("renders the box in the class grammar around the slot, hidden without `visible`", async () => {
    const { box } = transition(`<x-fb-transition color="red" pulsating>x</x-fb-transition>`)
    expect(box.className).toBe("ui red pulsating transition")
    expect(box.hidden).toBe(true)
    expect(box.querySelector("slot")).not.toBeNull()
    const shown = transition(`<x-fb-transition visible>Shown</x-fb-transition>`)
    expect(shown.box.className).toBe("ui transition visible")
    expect(shown.box.hidden).toBe(false)
    await expectAccessible(shown.host, { rules: { "color-contrast": { enabled: false } } })
  })

  it("follows `visible` at once, firing ui-show / ui-hide and ui-complete", async () => {
    const { host, box } = transition(`<x-fb-transition animation="scale" visible>x</x-fb-transition>`)
    const events: string[] = []
    for (const name of ["ui-show", "ui-hide", "ui-complete"]) host.addEventListener(name, () => events.push(name))
    host.removeAttribute("visible")
    await expect.poll(() => box.hidden).toBe(true)
    expect(box.className).toBe("ui transition")
    host.setAttribute("visible", "")
    await expect.poll(() => box.hidden).toBe(false)
    expect(events).toEqual(["ui-hide", "ui-complete", "ui-show", "ui-complete"])
  })

  it("stops following once disposed", async () => {
    const { host, box } = transition(`<x-fb-transition visible>x</x-fb-transition>`)
    host.handle!.dispose()
    host.removeAttribute("visible")
    // a `MutationObserver` delivers in a microtask:  one turn would have shown a change
    await Promise.resolve()
    expect(box.hidden).toBe(false)
  })
})
