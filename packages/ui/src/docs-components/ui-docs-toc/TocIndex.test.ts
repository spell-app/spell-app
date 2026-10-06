import { describe, expect, test } from "vite-plus/test"

import { TocIndex } from "./TocIndex"
import type { TocEntry } from "./ui-docs-toc.types"

/** Two sections:  `types` holding `button` and `group` (holding `or`), and `states` with nothing under it. */
const TREE: TocEntry[] = [entryOf("types", [entryOf("button"), entryOf("group", [entryOf("or")])]), entryOf("states")]

describe("TocIndex.slug()", () => {
  test("makes lowercase words joined by `-`, accents dropped;  `section` when nothing is left", () => {
    expect(TocIndex.slug("Labeled Icon")).toBe("labeled-icon")
    expect(TocIndex.slug("  Émphasis & More! ")).toBe("emphasis-more")
    expect(TocIndex.slug("---")).toBe("section")
  })
})

describe("TocIndex.flatten()", () => {
  test("lists every entry depth first:  page order", () => {
    expect(TocIndex.flatten(TREE).map((entry) => entry.id)).toEqual(["types", "button", "group", "or", "states"])
  })
})

describe("TocIndex.pathTo()", () => {
  test("names the ids from the top section down to the entry;  [] when it isn't listed", () => {
    expect(TocIndex.pathTo(TREE, "or")).toEqual(["types", "group", "or"])
    expect(TocIndex.pathTo(TREE, "states")).toEqual(["states"])
    expect(TocIndex.pathTo(TREE, "nope")).toEqual([])
    expect(TocIndex.pathTo(TREE, undefined)).toEqual([])
  })
})

describe("TocIndex.sectionOf()", () => {
  test("finds the top-level section holding an entry at any depth, or being it", () => {
    expect(TocIndex.sectionOf(TREE, "or")).toBe(TREE[0])
    expect(TocIndex.sectionOf(TREE, "states")).toBe(TREE[1])
    expect(TocIndex.sectionOf(TREE, "nope")).toBeUndefined()
  })
})

describe("TocIndex.decode()", () => {
  test("decodes a hash, and keeps one that isn't valid percent-encoding as it is", () => {
    expect(TocIndex.decode("caf%C3%A9")).toBe("café")
    expect(TocIndex.decode("100%")).toBe("100%")
  })
})

/** An entry `id` (its text the id), with `entries` under it;  its target a detached `<div>`. */
function entryOf(id: string, entries: TocEntry[] = []): TocEntry {
  return { id, text: id, target: document.createElement("div"), entries }
}
