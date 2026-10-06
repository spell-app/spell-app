import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { FeedFallback } from "./ui-feed.fallback"

// the fallback keys on the host's and its parent's tags, so the stubs take the real tags
FallbackStub.define("ui-feed", (host, root, internals) =>
  FeedFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-event", (host, root, internals) =>
  FeedFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("FeedFallback", () => {
  it("renders the feed root:  a list of listitem events, an <ol> when ordered", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-feed connected size="small"><ui-event>One</ui-event><ui-event>Two</ui-event></ui-feed>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.localName).toBe("ul")
    expect(root.className).toBe("ui small connected feed")
    expect(root.getAttribute("part")).toBe("feed")
    expect(root.getAttribute("role")).toBe("list")
    for (const event of host.querySelectorAll<StubHost>("ui-event")) expect(event.internals.role).toBe("listitem")
    expect(host.handle!.degraded.length).toBeGreaterThan(0)
    await expectAccessible(host, AXE)
    const ordered = Fixture.render<StubHost>(`<ui-feed ordered></ui-feed>`)
    expect(FallbackStub.shadow(ordered).firstElementChild!.localName).toBe("ol")
  })

  it("renders an event:  its label box (image, text), a number box in an ordered feed, the slot", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-feed><ui-event image="data:," color="red" basic>A</ui-event><ui-event label="J">B</ui-event><ui-event>C</ui-event></ui-feed>`
    )
    const [image, text, plain] = [...host.querySelectorAll<StubHost>("ui-event")].map(
      (event) => FallbackStub.shadow(event).firstElementChild as HTMLElement
    )
    expect(image!.className).toBe("red basic event ui-red")
    expect(image!.getAttribute("part")).toBe("event")
    expect(image!.querySelector(".label > img")!.getAttribute("alt")).toBe("")
    expect(text!.querySelector(".label")!.getAttribute("data-text")).toBe("J")
    expect(plain!.querySelector(".label")).toBeNull()
    const ordered = Fixture.render<StubHost>(`<ui-feed ordered><ui-event disabled>C</ui-event></ui-feed>`)
    const event = FallbackStub.shadow(ordered.querySelector("ui-event")!).firstElementChild!
    expect(event.querySelector(".label")).not.toBeNull()
    expect(event.getAttribute("aria-disabled")).toBe("true")
    await expectAccessible(host, AXE)
  })
})
