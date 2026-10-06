import { afterEach, describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import { SiteData } from "$/ui/docs-components"

import { DocsSearchFallback } from "./ui-docs-search.fallback"

FallbackStub.define("x-fb-docs-search", (host, root, internals) =>
  DocsSearchFallback.render({ host, root, error: new Error("boom"), internals })
)

/** A data file with two components, as a blob URL. */
function serve(): string {
  const data = { topics: [], components: [component("Button", "ui-button"), component("Input", "ui-input")], docs: [] }
  return URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
}

/** One main component's entry in the data file. */
function component(name: string, folder: string) {
  return { tag: folder, name, folder, mainTag: folder, main: true }
}

afterEach(() => {
  SiteData.reset()
  SiteData.url = undefined
})

describe("DocsSearchFallback.render()", () => {
  it("renders a labelled native search field, suggesting every component once the data loads", async () => {
    SiteData.reset(serve())
    const host = Fixture.render<StubHost>(`<x-fb-docs-search base="#/"></x-fb-docs-search>`)
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.className).toBe("ui finder")
    expect(box.getAttribute("part")).toBe("search")
    const input = box.querySelector("input")!
    expect({ type: input.type, label: input.getAttribute("aria-label"), part: input.getAttribute("part") }).toEqual({
      type: "search",
      label: "Search the docs",
      part: "input"
    })
    await expect.poll(() => box.querySelectorAll("datalist option").length).toBe(2)
    expect(input.list!.querySelector("option")!.value).toBe("Button")
    await expectAccessible(host)
  })

  it("still fires `ui-input` per keystroke, for the nav's filter", async () => {
    SiteData.reset("/no-such-folder/_data/components.json")
    const host = Fixture.render<StubHost>(`<x-fb-docs-search></x-fb-docs-search>`)
    const input = FallbackStub.shadow(host).querySelector("input")!
    const values: string[] = []
    host.addEventListener("ui-input", (event) => values.push((event as CustomEvent<{ value: string }>).detail.value))
    input.value = "but"
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
    expect(values).toEqual(["but"])
    await expect(SiteData.load()).rejects.toThrow()
    expect(FallbackStub.shadow(host).querySelectorAll("datalist option")).toHaveLength(0)
  })
})
