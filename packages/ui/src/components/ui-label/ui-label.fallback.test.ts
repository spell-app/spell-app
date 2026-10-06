import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { LabelFallback } from "./ui-label.fallback"

FallbackStub.define("x-fb-label", (host, root, internals) =>
  LabelFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("LabelFallback", () => {
  it("renders a span with the class grammar, part, slot and detail", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-label color="blue" basic detail="23" aria-label="Mail 23">Mail</x-fb-label>`
    )
    const label = FallbackStub.shadow(host).querySelector("span")!
    expect(label).toMatchObject({ className: "ui blue basic label", ariaLabel: "Mail 23" })
    expect(label.getAttribute("part")).toBe("label")
    expect(label.querySelector("slot")).not.toBeNull()
    expect(label.querySelector(".detail")!.textContent).toBe("23")
    await expectAccessible(host)
  })

  it("renders a link with href, and omits the delete button when removable", () => {
    const host = Fixture.render<StubHost>(`<x-fb-label href="/tag" removable>Tag</x-fb-label>`)
    const root = FallbackStub.shadow(host)
    expect(root.querySelector("a")!.getAttribute("href")).toBe("/tag")
    expect(root.querySelector("button")).toBeNull()
  })
})
