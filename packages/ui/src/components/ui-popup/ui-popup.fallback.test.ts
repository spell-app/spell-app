import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { PopupFallback } from "./ui-popup.fallback"

FallbackStub.define("x-fb-popup", (host, root, internals) =>
  PopupFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("PopupFallback", () => {
  it("renders the popup box with its shorthands and slot, in the class grammar", async () => {
    const container = Fixture.render(
      `<div><button>t</button><x-fb-popup inverted position="bottom center" header="Head" content="Body">More</x-fb-popup></div>`
    )
    const host = container.querySelector<StubHost>("x-fb-popup")!
    const popup = FallbackStub.shadow(host).firstElementChild!
    expect(popup.className).toBe("ui inverted popup bottom center")
    expect(popup.getAttribute("part")).toBe("popup")
    expect([...popup.children].map((child) => child.getAttribute("part") ?? child.localName)).toEqual([
      "header",
      "content",
      "slot"
    ])
    await expectAccessible(container, AXE)
  })

  it("leaves the native tooltip:  the target's `title`, removed again on dispose", () => {
    const container = Fixture.render(
      `<div><button id="t">t</button><span></span><x-fb-popup for="t" header="Head" content="Body"></x-fb-popup></div>`
    )
    const host = container.querySelector<StubHost>("x-fb-popup")!
    const button = container.querySelector("button")!
    expect(button.title).toBe("Head -- Body")
    host.handle!.dispose()
    expect(button.hasAttribute("title")).toBe(false)
  })

  it("never overwrites a title, and does nothing for a click popup", () => {
    const container = Fixture.render(
      `<div><button title="Mine">a</button><x-fb-popup content="Tip"></x-fb-popup>` +
        `<button>b</button><x-fb-popup open-on="click" content="Menu"></x-fb-popup></div>`
    )
    const [first, second] = container.querySelectorAll("button")
    expect(first!.title).toBe("Mine")
    expect(second!.hasAttribute("title")).toBe(false)
  })
})
