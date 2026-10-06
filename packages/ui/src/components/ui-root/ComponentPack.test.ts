import { beforeAll, describe, expect, test } from "vite-plus/test"

import { E, UI } from "$/ui/core"

import { ComponentPack } from "./ComponentPack"
import { RootLoader } from "./RootLoader"

/** A pack's URL, as `UI.sources` hands it over. */
const PACK = "https://example.com/packs/pack.json"

/** Fixture packs the test server serves. */
const DIR = "/test/fixtures/component-pack"

beforeAll(async () => {
  await UI.load()
})

/** `ComponentPack.entries()` on `json`, written out, at `PACK`. */
function entries(json: unknown) {
  return ComponentPack.entries(JSON.stringify(json), PACK)
}

/** What `entries()` threw for `text` (raw, not written out). */
function errorFor(text: string): E.SourceError {
  try {
    ComponentPack.entries(text, PACK)
  } catch (error) {
    return error as E.SourceError
  }
  throw new Error("no error")
}

describe("ComponentPack.entries()", () => {
  test("resolves each source against the PACK, defaults `load`, parses the skeleton", () => {
    expect(
      entries([
        { tag: "x-chart", source: "chart.js", skeleton: "20 x 12" },
        { tag: "ui-docs-api", source: "../site/ui-docs-api.js", load: "eager", skeleton: "none" },
        { tag: "x-legend", source: "/abs/legend.js" }
      ])
    ).toEqual([
      {
        tag: "x-chart",
        source: "https://example.com/packs/chart.js",
        load: "on-demand",
        skeleton: { width: "20em", height: "12em" }
      },
      { tag: "ui-docs-api", source: "https://example.com/site/ui-docs-api.js", load: "eager" },
      { tag: "x-legend", source: "https://example.com/abs/legend.js", load: "on-demand" }
    ])
  })

  test("an empty pack is fine", () => {
    expect(entries([])).toEqual([])
  })

  test.each([
    ["not JSON", "[{", /pack\.json isn't JSON/],
    ["not an array", `{ "tag": "x-a", "source": "a.js" }`, /isn't an array of entries/],
    ["an entry that isn't an object", `["x-a"]`, /entry 1 isn't an object/],
    ["an unknown key", `[{ "tag": "x-a", "source": "a.js", "lod": "eager" }]`, /entry 1 has an unknown key "lod"/],
    ["a tag that isn't a custom-element name", `[{ "tag": "chart", "source": "a.js" }]`, /tag "chart" isn't a/],
    ["no source", `[{ "tag": "x-a" }]`, /entry 1 \(<x-a>\) has no source/],
    ["a load policy it doesn't know", `[{ "tag": "x-a", "source": "a.js", "load": "lazy" }]`, /load "lazy" isn't/],
    ["bad skeleton text", `[{ "tag": "x-a", "source": "a.js", "skeleton": "huge" }]`, /can't read "huge"/]
  ])("throws a `render` SourceError for %s, naming the pack and the fix", (_, text, message) => {
    const error = errorFor(text)
    expect(error).toBeInstanceOf(E.SourceError)
    expect(error.kind).toBe("render")
    expect(error.message).toMatch(message)
    expect(error.message).toMatch(/^ComponentPack\.load\(\):  .*;  write a JSON array of/)
  })

  test("keeps the skeleton's TypeError as `cause.error`", () => {
    expect(errorFor(`[{ "tag": "x-a", "source": "a.js", "skeleton": "huge" }]`).cause?.error).toBeInstanceOf(TypeError)
  })
})

describe("ComponentPack.load()", () => {
  test("tells the roots at once, then adds the pack's tags", async () => {
    const loading = ComponentPack.load(`${DIR}/pack.json`)
    expect(RootLoader.whenAdded()).toBeInstanceOf(Promise)
    const tags = await loading
    expect(tags.map((it) => it.tag)).toEqual(["x-pack-chart", "x-pack-legend", "x-pack-eager", "x-pack-broken"])
    expect(RootLoader.knows("x-pack-chart")).toBe(true)
    expect(RootLoader.skeletonFor("x-pack-chart")).toEqual({ width: "20em", height: "12em" })
    expect(tags[0]!.source).toBe(new URL(`${DIR}/widgets.js`, location.href).href)
    // `eager`:  imported without any root asking
    await customElements.whenDefined("x-pack-eager")
    expect(RootLoader.whenAdded()).toBeUndefined()
  })

  test("rejects with a `load` SourceError when the pack isn't there", async () => {
    await expect(ComponentPack.load(`${DIR}/nope.json`)).rejects.toMatchObject({ kind: "load" })
  })
})
