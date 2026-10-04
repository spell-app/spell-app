import { afterEach, describe, expect, it } from "vitest"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import { SiteData } from "$/ui/docs-components"

import { DocsSearchFallback } from "./ui-docs-search.fallback"

FallbackStub.define("x-fb-docs-search", (host, root, internals) =>
  DocsSearchFallback.render(host, root, new Error("boom"), internals)
)

/** A data file with two components, as a blob URL. */
function serve(): string {
  const tag = (name: string, folder: string) => ({ tag: folder, name, folder, mainTag: folder, main: true })
  const data = { topics: [], components: [tag("Button", "ui-button"), tag("Input", "ui-input")], docs: [] }
  return URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
}

afterEach(() => {
  SiteData.reset()
  SiteData.url = undefined
})

describe("DocsSearchFallback", () => {
  it("renders a labelled native search field, suggesting every component once the data loads", async () => {
    SiteData.reset(serve())
    const host = Fixture.render<StubHost>(`<x-fb-docs-search base="#/"></x-fb-docs-search>`)
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.className).toBe("ui finder")
    expect(box.getAttribute("part")).toBe("search")
    const input = box.querySelector("input")!
    expect(input.type).toBe("search")
    expect(input.getAttribute("aria-label")).toBe("Search the docs")
    expect(input.getAttribute("part")).toBe("input")
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
