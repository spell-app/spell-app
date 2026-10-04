import { afterEach, describe, expect, it } from "vitest"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import { SiteData } from "$/ui/docs-components"

import { DocsNavFallback } from "./ui-docs-nav.fallback"

FallbackStub.define("x-fb-docs-nav", (host, root, internals) =>
  DocsNavFallback.render(host, root, new Error("boom"), internals)
)

/** A data file with two components, as a blob URL. */
function serve(): string {
  const tag = (name: string, folder: string) => ({
    tag: folder,
    name,
    folder,
    main: true,
    href: `components/${folder}.html`,
    topics: [],
    aka: []
  })
  const data = {
    topics: [],
    components: [tag("Input", "ui-input"), tag("Button", "ui-button")],
    docs: [],
    families: {}
  }
  return URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
}

afterEach(() => {
  SiteData.reset()
  SiteData.url = undefined
})

describe("DocsNavFallback", () => {
  it("renders plain links:  top pages, every component A-Z once the data loads, Foundation;  the current one marked", async () => {
    SiteData.reset(serve())
    const host = Fixture.render<StubHost>(`<x-fb-docs-nav base="#/" current="ui-button"></x-fb-docs-nav>`)
    const box = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(box.className).toBe("ui nav")
    expect(box.getAttribute("part")).toBe("nav")
    const nav = box.querySelector("nav[part=menu]")!
    expect(nav.getAttribute("aria-label")).toBe("Documentation")
    await expect.poll(() => nav.querySelectorAll("a").length).toBe(10)
    const links = [...nav.querySelectorAll("a")].map((link) => link.getAttribute("href"))
    expect(links.slice(0, 6)).toEqual([
      "#/index.html",
      "#/getting-started.html",
      "#/grammar.html",
      "#/components/index.html",
      "#/components/ui-button.html",
      "#/components/ui-input.html"
    ])
    expect(nav.querySelector("[aria-current=page]")!.textContent).toBe("Button")
    expect([...nav.querySelectorAll("h2")].map((heading) => heading.textContent)).toEqual(["Components", "Foundation"])
    await expectAccessible(host)
  })

  it("keeps the page links when the data doesn't load", async () => {
    SiteData.reset("/no-such-folder/_data/components.json")
    const host = Fixture.render<StubHost>(`<x-fb-docs-nav base="#/" current="theming"></x-fb-docs-nav>`)
    const nav = FallbackStub.shadow(host).querySelector("nav")!
    await expect(SiteData.load()).rejects.toThrow()
    expect(nav.querySelectorAll("a")).toHaveLength(8)
    expect(nav.querySelector("[aria-current=page]")!.textContent).toBe("Theming")
  })
})
