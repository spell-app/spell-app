import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { DocsTocFallback } from "./ui-docs-toc.fallback"

FallbackStub.define("x-fb-docs-toc", (host, root, internals) =>
  DocsTocFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("DocsTocFallback", () => {
  it("renders the class grammar, the header and a list of links to every section and entry", async () => {
    const wrapper = Fixture.render<HTMLElement>(
      `<div><x-fb-docs-toc for="fb-content" header="Button"></x-fb-docs-toc>` +
        `<section id="fb-content"><h2>Types</h2><h3>Basic</h3><h2>States</h2></section></div>`
    )
    const host = wrapper.querySelector<StubHost>("x-fb-docs-toc")!
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.className).toBe("ui small toc")
    expect(box.getAttribute("part")).toBe("toc")
    expect(box.querySelector("p[part=header]")!.textContent).toBe("Button")
    const nav = box.querySelector("nav[part=menu]")!
    expect(nav.getAttribute("aria-label")).toBe("On this page")
    expect(
      [...nav.querySelectorAll("a")].map((link) => [link.getAttribute("part"), link.getAttribute("href")])
    ).toEqual([
      ["section", "#types"],
      ["entry", "#basic"],
      ["section", "#states"]
    ])
    await expectAccessible(host)
  })
})
