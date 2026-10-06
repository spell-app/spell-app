import { afterAll, describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import { SiteData, type SiteDataFile } from "$/ui/docs-components"

import { DocsTokensFallback } from "./ui-docs-tokens.fallback"

FallbackStub.define("x-fb-docs-tokens", (host, root, internals) =>
  DocsTokensFallback.render({ host, root, error: new Error("boom"), internals })
)

/** One family with two tokens, one foundation group. */
const DATA = {
  components: [{ tag: "x-chip", folder: "x-chip" }],
  docs: [],
  families: {
    "x-chip": {
      folder: "x-chip",
      mainTag: "x-chip",
      tags: ["x-chip"],
      tokens: [
        { name: "--x-chip-radius", default: "1em", description: "Corner `radius`.", type: "length" },
        { name: "--x-chip-color", default: "rgb(0, 0, 255)", type: "color" }
      ]
    }
  },
  foundation: [
    {
      id: "radii",
      title: "Radii",
      description: "Corner radii.",
      tokens: [{ name: "--ui-radius", default: "var(--ui-radius-m)", type: "length" }]
    }
  ]
} as unknown as SiteDataFile

afterAll(() => SiteData.reset())

/** Render the stub with `attributes` (and `children`), and wait for its data. */
async function render(attributes: string, children = "") {
  SiteData.reset(`data:application/json,${encodeURIComponent(JSON.stringify(DATA))}`)
  const host = Fixture.render<StubHost>(`<x-fb-docs-tokens ${attributes}>${children}</x-fb-docs-tokens>`)
  await SiteData.load().catch(() => undefined)
  await new Promise((resolve) => setTimeout(resolve))
  return { host, section: FallbackStub.shadow(host).firstElementChild as HTMLElement }
}

describe("DocsTokensFallback", () => {
  it("renders a family's tokens as a plain native table, a swatch on colours", async () => {
    const { host, section } = await render(`family="x-chip" caption="Chip tokens"`)
    expect(section.localName).toBe("section")
    expect(section.className).toBe("ui tokens")
    expect(section.getAttribute("part")).toBe("tokens")
    const table = section.querySelector("table[part=table]")!
    expect(table.querySelector("caption")!.textContent).toBe("Chip tokens")
    const rows = [...table.querySelectorAll("tbody tr")]
    expect(rows.map((row) => row.querySelector("th")!.textContent)).toEqual(["--x-chip-radius", "--x-chip-color"])
    expect(rows[0]!.querySelector("td:last-child code")!.textContent).toBe("radius")
    expect(rows[0]!.querySelector("[part=swatch]")).toBeNull()
    const swatch = rows[1]!.querySelector<HTMLElement>("[part=swatch]")!
    expect(getComputedStyle(swatch).backgroundColor).toBe("rgb(0, 0, 255)")
    await expectAccessible(host)
  })

  it("renders `global` groups under headings, and the preview with `playground`", async () => {
    const { section } = await render(`global playground level="2"`, `<b class="sample">Sample</b>`)
    expect(section.querySelector("[part=preview] slot")).not.toBeNull()
    const group = section.querySelector("[part=group]")!
    expect(group.querySelector("h2[part=header]")!.textContent).toBe("Radii")
    expect(group.querySelector("[part=description]")!.textContent).toBe("Corner radii.")
    expect(group.querySelector("tbody th")!.textContent).toBe("--ui-radius")
  })

  it("says what's missing", async () => {
    const { section } = await render(`family="x-nope"`)
    expect(section.querySelector("[part=message]")!.textContent).toBe("No family x-nope in the site data.")
  })
})
