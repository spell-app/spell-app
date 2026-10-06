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

  it("rejects a folder with no family", async () => {
    await expect(RootLoader.load("ui-nope")).rejects.toThrow(/no family/)
  })
})

describe("RootLoader.folderFor()", () => {
  it("names the family that defines a tag;  nothing for an `Object.prototype` key", () => {
    expect(RootLoader.folderFor("ui-buttons")).toBe("ui-button")
    expect(RootLoader.folderFor("toString")).toBeUndefined()
  })
})

describe("RootLoader.undefinedTags()", () => {
  it("lists each undefined `ui-*` tag once;  defined ones and an app's own elements are left out", () => {
    customElements.define("ui-test-loader-defined", class extends HTMLElement {})
    const root = document.createElement("div")
    root.innerHTML =
      `<ui-test-loader-a></ui-test-loader-a><p><ui-test-loader-a></ui-test-loader-a></p>` +
      `<ui-test-loader-defined></ui-test-loader-defined><app-widget></app-widget>`
    expect(RootLoader.undefinedTags(root)).toEqual(new Set(["ui-test-loader-a"]))
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

/** The pack fixtures' folder, absolute, as a pack tag's `source` is. */
const PACKS = new URL("/test/fixtures/component-pack/", location.href).href

describe("RootLoader.addTags()", () => {
  it("lets loadTag() import a pack tag's module, once for every tag it defines", async () => {
    RootLoader.addTags([
      { tag: "x-pack-chart", source: `${PACKS}widgets.js`, load: "on-demand" },
      { tag: "x-pack-legend", source: `${PACKS}widgets.js`, load: "on-demand" }
    ])
    expect(customElements.get("x-pack-chart")).toBeUndefined()
    await Promise.all([RootLoader.loadTag("x-pack-chart"), RootLoader.loadTag("x-pack-legend")])
    expect(customElements.get("x-pack-legend")).toBeDefined()
    expect((globalThis as { packWidgetImports?: number }).packWidgetImports).toBe(1)
  })

  it("imports an `eager` tag at once", async () => {
    RootLoader.addTags([{ tag: "x-pack-eager", source: `${PACKS}eager.js`, load: "eager" }])
    await customElements.whenDefined("x-pack-eager")
  })

  it("wins over the catalog:  the pack's skeleton (or none) and module", () => {
    expect(RootLoader.skeletonFor("ui-button")).toEqual({ display: "inline", width: "6em", height: "2.5em" })
    expect(RootLoader.skeletonFor("ui-docs-toc")).toBeDefined()
    RootLoader.addTags([{ tag: "ui-docs-toc", source: `${PACKS}card.js`, load: "on-demand" }])
    expect(RootLoader.skeletonFor("ui-docs-toc")).toBeUndefined()
    expect(RootLoader.knows("ui-docs-toc")).toBe(true)
  })

  it("puts a pack's tags in undefinedTags(), whatever their name", () => {
    RootLoader.addTags([{ tag: "app-pack-widget", source: `${PACKS}card.js`, load: "on-demand" }])
    const root = document.createElement("div")
    root.innerHTML = `<app-pack-widget></app-pack-widget><app-other></app-other>`
    expect(RootLoader.undefinedTags(root)).toEqual(new Set(["app-pack-widget"]))
  })
})

describe("RootLoader.loadTag()", () => {
  it("loads a catalog tag's family;  nothing for a tag nobody knows", async () => {
    await RootLoader.loadTag("ui-rail")
    expect(customElements.get("ui-rail")).toBeDefined()
    expect(RootLoader.loadTag("x-nobody")).toBeUndefined()
    expect(RootLoader.knows("x-nobody")).toBe(false)
  })
})

describe("RootLoader.whenAdded()", () => {
  it("is undefined with no pack on its way;  resolves once every one settled, a failed one too", async () => {
    expect(RootLoader.whenAdded()).toBeUndefined()
    let resolve!: () => void
    RootLoader.adding(new Promise<void>((done) => (resolve = done)))
    RootLoader.adding(Promise.reject(new Error("no pack")))
    const added = RootLoader.whenAdded()
    expect(added).toBeInstanceOf(Promise)
    resolve()
    await added
    expect(RootLoader.whenAdded()).toBeUndefined()
  })
})
