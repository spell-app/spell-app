import { afterEach, describe, expect, it, vi } from "vitest"

import { Fixture } from "$/ui/test/fixture"
import { IconPacks } from "./IconPacks"

/** The stroke-style (Lucide-like) fixture pack:  `bell`, `sun` (aliases `light`, `day`), 24 x 24. */
const STROKE = new URL("/test/fixtures/stroke-pack/pack.js", location.href).href

/** Resource Timing entries whose URL contains `part`, since the last `clearResourceTimings()`. */
function requests(part: string): number {
  return performance.getEntriesByType("resource").filter((entry) => entry.name.includes(part)).length
}

afterEach(() => {
  for (const set of document.querySelectorAll("ui-icon-set")) set.remove()
})

describe("UI.icons:  names", () => {
  it("answers one normalized name:  case, dashes and spaces ~== the same icon", async () => {
    const packs = new IconPacks()
    await packs.ready
    expect(packs.resolve("Address-Book")?.key).toBe("solid/address-book")
    expect(packs.resolve("address  book")?.key).toBe("solid/address-book")
  })

  it("gives a name solid and regular share to solid;  `… outline` is the regular icon", async () => {
    const packs = new IconPacks()
    await packs.ready
    expect(packs.resolve("bell")?.key).toBe("solid/bell")
    expect(packs.resolve("bell outline")?.key).toBe("regular/bell")
  })

  it("follows aliases:  Font Awesome's own, and the default pack's Fomantic extras", async () => {
    const packs = new IconPacks()
    await packs.ready
    expect(packs.resolve("cog")?.key).toBe("solid/gear")
    expect(packs.resolve("setting")?.key).toBe("solid/gear")
    expect(packs.resolve("github")?.key).toBe("brands/github")
    expect(packs.resolve("discord")?.key).toBe("brands/discord")
    expect(packs.resolve("slack")).toBeUndefined()
  })

  it("resolves keys against `pack.js`'s folder, sized from the index", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE)
    expect(packs.resolve("bell")).toEqual({
      pack: "stroke",
      name: "bell",
      key: "bell",
      url: new URL("bell.svg", STROKE).href,
      width: 24,
      height: 24
    })
    expect(packs.resolve("day")?.key).toBe("sun")
  })
})

describe("UI.icons:  packs", () => {
  it("lets the last pack added win a name, and `prefix:name` pick one", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE, { prefix: "lucide" })
    expect(packs.resolve("bell")?.pack).toBe("stroke")
    expect(packs.resolve("fa7-free:bell")?.pack).toBe("fa7-free")
    expect(packs.resolve("lucide:bell")?.pack).toBe("stroke")
    expect(packs.resolve("stroke:bell")?.pack).toBe("stroke")
    expect(packs.resolve("stroke:gear")).toBeUndefined()
  })

  it("re-points a pack's SVGs with `base`, relative to the page", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE, { base: "/somewhere/else" })
    expect(packs.resolve("bell")?.url).toBe(new URL("/somewhere/else/bell.svg", location.href).href)
  })

  it("drops every earlier pack, the default included, for `only`", async () => {
    const packs = new IconPacks()
    await packs.use("fomantic", { only: true })
    expect(packs.packs.map((pack) => pack.id)).toEqual(["fomantic"])
  })

  it("draws Fomantic names from the fomantic pack alone, from the FA folders beside it", async () => {
    const packs = new IconPacks()
    await packs.use("fomantic", { only: true })
    expect(packs.resolve("setting")?.url).toMatch(/\/icon-packs\/fa7-free\/solid\/gear\.svg$/)
    expect(packs.resolve("x")?.url).toMatch(/\/icon-packs\/fa7-free\/solid\/xmark\.svg$/)
    expect(await packs.get("setting")).toBeInstanceOf(SVGSVGElement)
  })

  it("fetches a file once, whichever pack or name reaches it", async () => {
    const packs = new IconPacks()
    await packs.use("fomantic")
    performance.clearResourceTimings()
    const [gear, setting] = await Promise.all([packs.get("fa7-free:gear"), packs.get("setting")])
    expect(gear).toBe(setting)
    expect(requests("/solid/gear.svg")).toBeLessThanOrEqual(1)
  })

  it("warns about a pack that won't load, and keeps answering from the others", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const packs = new IconPacks()
    expect(await packs.use("/no/such/pack.js")).toBeUndefined()
    expect(warn).toHaveBeenCalled()
    expect(packs.resolve("bell")?.pack).toBe("fa7-free")
    warn.mockRestore()
  })

  it("reset() drops every pack, the default included, and chains:  `reset().use(pack)`", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE)
    const pack = await packs.reset().use("fa7-brands")
    expect(pack?.id).toBe("fa7-brands")
    expect(packs.packs.map((each) => each.id)).toEqual(["fa7-brands"])
    expect(packs.resolve("bell")).toBeUndefined()
  })

  it("reset() before first use loads neither the default nor the document's sets", async () => {
    Fixture.render(`<ui-icon-set src="${STROKE}"></ui-icon-set>`)
    const packs = new IconPacks().reset()
    await packs.ready
    expect(packs.packs).toEqual([])
    expect(packs.resolve("bell")).toBeUndefined()
  })

  it("reset() forgets packs still loading, and sets added later still count", async () => {
    const packs = new IconPacks()
    void packs.use(STROKE)
    packs.reset()
    await packs.ready
    expect(packs.packs).toEqual([])
    Fixture.render(`<ui-icon-set src="fa7-brands"></ui-icon-set>`)
    await expect.poll(async () => (await packs.ready, packs.packs.map((pack) => pack.id))).toEqual(["fa7-brands"])
  })

  it("reset() keeps register()ed icons", async () => {
    const packs = new IconPacks()
    packs.register("mine", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>`)
    expect(await packs.reset().get("mine")).toBeInstanceOf(SVGSVGElement)
  })

  it("remove() drops a pack", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE)
    packs.remove("stroke")
    expect(packs.resolve("bell")?.pack).toBe("fa7-free")
  })
})

describe("UI.icons:  <ui-icon-set>", () => {
  it("adds the document's sets on first use, after the default", async () => {
    Fixture.render(`<ui-icon-set src="${STROKE}"></ui-icon-set>`)
    const packs = new IconPacks()
    await packs.ready
    expect(packs.packs.map((pack) => pack.id)).toEqual(["fa7-free", "stroke"])
  })

  it('skips the default and earlier sets before an `only`, but not for `only="false"`', async () => {
    Fixture.render(`<ui-icon-set src="fa7-brands"></ui-icon-set>`)
    Fixture.render(`<ui-icon-set src="${STROKE}" only></ui-icon-set>`)
    const packs = new IconPacks()
    await packs.ready
    expect(packs.packs.map((pack) => pack.id)).toEqual(["stroke"])

    for (const set of document.querySelectorAll("ui-icon-set")) set.remove()
    Fixture.render(`<ui-icon-set src="${STROKE}" only="false"></ui-icon-set>`)
    const kept = new IconPacks()
    await kept.ready
    expect(kept.packs.map((pack) => pack.id)).toEqual(["fa7-free", "stroke"])
  })

  it("follows sets added and removed later", async () => {
    const packs = new IconPacks()
    await packs.ready
    const set = Fixture.render(`<ui-icon-set src="fa7-brands" prefix="b"></ui-icon-set>`)
    await expect.poll(async () => (await packs.ready, packs.resolve("b:slack")?.key)).toBe("brands/slack")
    set.remove()
    await expect.poll(() => packs.resolve("slack")).toBeUndefined()
  })
})

describe("UI.icons:  SVGs", () => {
  it("returns a page-owned template:  FA's fill becomes currentColor, its licence comment stays", async () => {
    const packs = new IconPacks()
    const svg = (await packs.get("bell"))!
    expect(svg.ownerDocument).toBe(document)
    expect(svg.getAttribute("fill")).toBe("currentColor")
    expect(svg.innerHTML).toContain("Font Awesome Free")
    expect(packs.peek("bell")).toBe(svg)
  })

  it("keeps a stroke set's own root fill, over component sheets", async () => {
    const packs = new IconPacks()
    await packs.use(STROKE)
    const svg = (await packs.get("bell"))!
    expect(svg.getAttribute("fill")).toBe("none")
    expect(svg.style.getPropertyValue("fill")).toBe("none")
  })

  it("answers an unknown name with nothing, and no request", async () => {
    const packs = new IconPacks()
    await packs.ready
    performance.clearResourceTimings()
    expect(await packs.get("no such icon")).toBeUndefined()
    expect(requests(".svg")).toBe(0)
  })

  it("register() adds an icon ahead of every pack", async () => {
    const packs = new IconPacks()
    packs.register("Bell", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>`)
    const svg = (await packs.get("bell"))!
    expect(svg.getAttribute("viewBox")).toBe("0 0 1 1")
    expect(packs.peek("bell")).toBe(svg)
    expect(() => packs.register("x", "<p>no</p>")).toThrow("not an <svg>")
  })
})
