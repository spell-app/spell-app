import { describe, expect, it } from "vite-plus/test"

import { RootLoader } from "./RootLoader"

// `RootLoader`'s registries are page-wide and have no reset:  each case uses folders of its own

describe("RootLoader.load()", () => {
  it("loads a library family by folder", async () => {
    await RootLoader.load("ui-divider")
    expect(customElements.get("ui-divider")).toBeDefined()
  })

  it("doesn't know the doc-only families until a bundle adds them (I12)", async () => {
    await expect(RootLoader.load("ui-docs-toc")).rejects.toThrow('no family "ui-docs-toc"')
  })
})

describe("RootLoader.add()", () => {
  it("lets load() import an added barrel, keyed by its folder, once", async () => {
    let imports = 0
    RootLoader.add({ "../../docs-components/ui-added-once/index.ts": async () => void imports++ })
    await RootLoader.load("ui-added-once")
    await RootLoader.load("ui-added-once")
    expect(imports).toBe(1)
  })

  it("skips a path that isn't a family barrel", async () => {
    RootLoader.add({ "../../docs-components/ui-added-stray/other.ts": async () => undefined })
    await expect(RootLoader.load("ui-added-stray")).rejects.toThrow('no family "ui-added-stray"')
  })
})
