import { afterAll, describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import { SiteData, type SiteDataFile } from "$/ui/docs-components"

import { DocsApiFallback } from "./ui-docs-api.fallback"

FallbackStub.define("x-fb-docs-api", (host, root, internals) =>
  DocsApiFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Two tags of one family. */
const DATA = {
  components: [
    {
      tag: "x-chip",
      folder: "x-chip",
      description: "A `chip`.",
      attributes: [{ name: "size", kind: "size", values: ["small", "large"], description: "Size." }],
      events: [{ name: "ui-remove", detail: "{}", cancelable: true, description: "Removed." }],
      slots: [{ name: "", description: "Content." }],
      parts: [],
      states: [],
      texts: []
    },
    {
      tag: "x-chips",
      folder: "x-chip",
      attributes: [],
      events: [],
      slots: [],
      parts: [{ name: "group", description: "The group." }],
      states: [],
      texts: []
    }
  ],
  docs: [],
  families: { "x-chip": { folder: "x-chip", mainTag: "x-chip", tags: ["x-chip", "x-chips"] } }
} as unknown as SiteDataFile

afterAll(() => SiteData.reset())

/** Render the stub with `attributes` and wait for its data. */
async function render(attributes: string, url = `data:application/json,${encodeURIComponent(JSON.stringify(DATA))}`) {
  SiteData.reset(url)
  const host = Fixture.render<StubHost>(`<x-fb-docs-api ${attributes}></x-fb-docs-api>`)
  await SiteData.load().catch(() => undefined)
  await new Promise((resolve) => setTimeout(resolve))
  return { host, section: FallbackStub.shadow(host).firstElementChild as HTMLElement }
}

describe("DocsApiFallback", () => {
  it("renders one tag's tables as plain native tables, captioned", async () => {
    const { host, section } = await render(`tag="x-chip"`)
    expect(section.localName).toBe("section")
    expect(section.className).toBe("ui api")
    expect(section.getAttribute("part")).toBe("api")
    const captions = [...section.querySelectorAll("table > caption")].map((caption) => caption.textContent)
    expect(captions).toEqual(["Attributes", "Events", "Slots"])
    expect(section.querySelector("h3")).toBeNull()
    const size = section.querySelector<HTMLTableRowElement>("tbody tr")!
    expect(size.querySelector("th[scope=row] code")!.textContent).toBe("size")
    expect(size.cells[2]!.textContent).toBe("small, large")
    expect(section.querySelectorAll("table")[1]!.querySelector("tbody th")!.textContent).toBe("ui-remove (cancelable)")
    await expectAccessible(host)
  })

  it("heads each tag with `family`, its id the tag", async () => {
    const { section } = await render(`family="x-chip" level="2"`)
    const headers = [...section.querySelectorAll("h2[part=header]")]
    expect(headers.map((header) => [header.id, header.textContent])).toEqual([
      ["x-chip", "<x-chip>"],
      ["x-chips", "<x-chips>"]
    ])
    expect(section.querySelector("p code")!.textContent).toBe("chip")
  })

  it("says when there's nothing to show", async () => {
    const missing = await render(`tag="x-nope"`)
    expect(missing.section.querySelector("[part=message]")!.textContent).toBe("No API data for x-nope.")
    const broken = await render(`tag="x-chip"`, "/no/such/components.json")
    expect(broken.section.querySelector("[part=message]")!.textContent).toContain("Couldn't load the API data")
  })
})
