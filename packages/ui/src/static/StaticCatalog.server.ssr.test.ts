import { describe, expect, it } from "vite-plus/test"

import { StaticCatalog, StaticRender } from "$/ui/static"

import { StaticFamilies } from "$/ui/tools/visual/StaticFamilies"

/** The catalog `spell static` defines:  every supported family, each rendering on its own. */
describe("StaticCatalog", () => {
  it("lists every class tools/visual/StaticFamilies.ts lists", () => {
    const names = Object.values(StaticFamilies.CLASSES).flat().sort()
    expect(StaticCatalog.classes.map((Class) => Class.name).sort()).toEqual(names)
  })

  it("renders every tag, empty, without throwing or leaving the tag", async () => {
    StaticRender.define(...StaticCatalog.classes)
    for (const tag of StaticRender.families.keys()) {
      const html = `<${tag}></${tag}>`
      await StaticRender.prepare(html)
      expect(StaticRender.fragment(html), tag).not.toContain(`<${tag}`)
    }
  })
})
