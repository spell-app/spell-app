import { afterEach, describe, expect, test } from "vite-plus/test"

import { SiteData } from "./SiteData"
import type { SiteDataFile } from "./docs-components.types"

/** `<x-button>` and its sub-tag `<x-or>`, a docs tag, and the `x-button` family. */
const DATA = {
  components: [
    { tag: "x-button", folder: "x-button" },
    { tag: "x-or", folder: "x-button" }
  ],
  docs: [{ tag: "x-docs", folder: "x-docs" }],
  families: { "x-button": { folder: "x-button", mainTag: "x-button", tags: ["x-button", "x-or"] } }
} as unknown as SiteDataFile

afterEach(() => SiteData.reset())

describe("SiteData.root()", () => {
  test("defaults `base` to the site root above the data file", () => {
    SiteData.reset("/somewhere/site/_data/components.json")
    expect(SiteData.root()).toBe(`${location.origin}/somewhere/site/`)
  })
})

describe("SiteData.tag()", () => {
  test("finds a component or a docs tag;  undefined for anything else", () => {
    expect(SiteData.tag(DATA, "x-or")).toBe(DATA.components[1])
    expect(SiteData.tag(DATA, "x-docs")).toBe(DATA.docs[0])
    expect(SiteData.tag(DATA, "x-nope")).toBeUndefined()
  })
})

describe("SiteData.family()", () => {
  test("finds a sub-tag's family by its folder;  NEVER an inherited key", () => {
    expect(SiteData.family(DATA, "x-or")).toBe(DATA.families["x-button"])
    expect(SiteData.family(DATA, "x-button")).toBe(DATA.families["x-button"])
    expect(SiteData.family(DATA, "toString")).toBeUndefined()
  })
})
