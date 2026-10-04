import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { LabelFallback } from "./ui-label.fallback"

FallbackStub.define("x-fb-label", (host, root, internals) =>
  LabelFallback.render(host, root, new Error("boom"), internals)
)

describe("LabelFallback", () => {
  it("renders a span with the class grammar, part, slot and detail", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-label color="blue" basic detail="23" aria-label="Mail 23">Mail</x-fb-label>`
    )
    const label = FallbackStub.shadow(host).querySelector("span")!
    expect(label.className).toBe("ui blue basic label")
    expect(label.getAttribute("part")).toBe("label")
    expect(label.getAttribute("aria-label")).toBe("Mail 23")
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
