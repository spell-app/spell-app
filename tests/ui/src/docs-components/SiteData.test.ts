import { afterEach, describe, expect, test } from "vite-plus/test"

import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile } from "$/ui/docs-components/docs-components.types"

/** `<x-button>` and its sub-tag `<x-or>`, a docs tag, and the `x-button` family. */
const DATA = {
  components: [
    { tag: "x-button", folder: "x-button" },
    { tag: "x-or", folder: "x-button" }
  ],
  docs: [{ tag: "x-docs", folder: "x-docs" }],
  families: { "x-button": { folder: "x-button", mainTag: "x-button", tags: ["x-button", "x-or"] } }
} as unknown as SiteDataFile

afterEach(() => (SiteData.url = undefined))

describe("SiteData.root()", () => {
  test("defaults `base` to the site root above the data file", () => {
    SiteData.url = "/somewhere/docs/__data/components.json5"
    expect(SiteData.root()).toBe(`${location.origin}/somewhere/docs/`)
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

describe("SiteData.json()", () => {
  test("reads a data file as plain JSON, as its writer writes it", async () => {
    expect(await SiteData.json(new Response('{"version": 1}'))).toEqual({ version: 1 })
  })

  test("reads it as JSON5 once somebody has written a comment into it", async () => {
    expect(await SiteData.json(new Response('{\n  // why it is 1\n  "version": 1\n}\n'))).toEqual({ version: 1 })
  })

  test("rejects a file that won't read even as JSON5", async () => {
    await expect(SiteData.json(new Response("{ nope"))).rejects.toThrow(SyntaxError)
  })
})
