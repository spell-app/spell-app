import { describe, expect, test } from "vite-plus/test"

import type { SiteTag } from "$/ui/docs-components"

import { ApiModel } from "./ApiModel"

/** `<x-button>`:  a plain attribute and a rich-data one. */
const BUTTON = tagOf("x-button", {
  attributes: [
    { name: "basic", kind: "keyOnly", description: "Less `pronounced`." },
    { name: "options", kind: "json", reflect: false, description: "Rich `MenuOption[]`." }
  ]
})

/** Widths `1` ... `5`:  a numeric run long enough to show as a range. */
const WIDTHS = ["1", "2", "3", "4", "5"]

/** `<x-or>`:  parts only. */
const OR = tagOf("x-or", { parts: [{ name: "or", description: "The or." }] })

describe("ApiModel.sectionsFor()", () => {
  test("leaves out empty tables and keeps rich data apart", () => {
    expect(ApiModel.sectionsFor(OR).map((section) => section.id)).toEqual(["parts"])
    const sections = ApiModel.sectionsFor(BUTTON)
    expect(sections.find((section) => section.id === "properties")!.rows.map((row) => row.key)).toEqual(["options"])
    expect(sections.find((section) => section.id === "attributes")!.rows.map((row) => row.key)).not.toContain("options")
  })

  test("puts a function component's props FIRST and where it's drawn LAST", () => {
    const notice = tagOf("Notice", {
      props: [{ name: "autoHide", type: "boolean", description: "Hide after 3s." }],
      parts: [{ name: "message", description: "The message." }],
      usedIn: [{ name: "AppRoot", file: "packages/app/src/solid/AppRoot.tsx" }]
    })
    const sections = ApiModel.sectionsFor(notice)
    expect(sections.map((section) => section.id)).toEqual(["props", "parts", "usedIn"])
    expect(sections[0]!.rows[0]!.cells).toEqual([
      { type: "name", code: "autoHide", notes: [] },
      { type: "text", text: "`boolean`" },
      { type: "text", text: "Hide after 3s." }
    ])
    expect(sections[2]!.rows[0]!.cells).toEqual([
      { type: "name", code: "AppRoot", notes: [] },
      { type: "text", text: "`packages/app/src/solid/AppRoot.tsx`" }
    ])
  })

  test("notes a required prop", () => {
    const pane = tagOf("RunnerPane", { props: [{ name: "id", type: "Id", required: true, description: "Its id." }] })
    expect(ApiModel.sectionsFor(pane)[0]!.rows[0]!.cells[0]).toEqual({
      type: "name",
      code: "id",
      notes: [{ key: "required" }]
    })
  })
})

describe("ApiModel.propertyFor()", () => {
  test("camelCases the name, unless the attribute names its property", () => {
    expect(ApiModel.propertyFor({ name: "column-defs", kind: "json", description: "" })).toBe("columnDefs")
    expect(ApiModel.propertyFor({ name: "x", kind: "number", property: "y", description: "" })).toBe("y")
  })
})

describe("ApiModel.defaultFor()", () => {
  test("shows a declared default, `false` for a boolean, and nothing for free text", () => {
    expect(ApiModel.defaultFor({ name: "x", kind: "keyOnly", description: "" })).toBe("false")
    expect(ApiModel.defaultFor({ name: "x", kind: "string", description: "" })).toBeUndefined()
    expect(ApiModel.defaultFor({ name: "x", kind: "number", default: 0, description: "" })).toBe("0")
  })
})

describe("ApiModel.kindLabelFor()", () => {
  test("names a kind as an author reads it", () => {
    expect(ApiModel.kindLabelFor("keyOrValueAndKey")).toBe("boolean or value")
  })
})

describe("ApiModel.valuesFor()", () => {
  test("marks hues as swatches and a run of 4+ whole numbers as a range;  nothing without values", () => {
    expect(
      ApiModel.valuesFor({ name: "color", kind: "color", values: ["red", "blue"], valueSet: "hues", description: "" })
    ).toEqual({ type: "values", values: ["red", "blue"], set: "hues", isSwatch: true, isRange: false })
    expect(ApiModel.valuesFor({ name: "width", kind: "width", values: WIDTHS, description: "" })).toEqual({
      type: "values",
      values: WIDTHS,
      isSwatch: false,
      isRange: true
    })
    expect(ApiModel.valuesFor({ name: "span", kind: "enum", values: ["1", "2", "3"], description: "" })).toMatchObject({
      isRange: false
    })
    expect(ApiModel.valuesFor({ name: "basic", kind: "keyOnly", description: "" })).toBeUndefined()
  })
})

describe("ApiModel.labelsFor()", () => {
  test("collapses a range to ONE `first … last` label;  other values stay one label each", () => {
    expect(ApiModel.labelsFor(valuesCell(WIDTHS, true))).toEqual(["1 … 5"])
    expect(ApiModel.labelsFor(valuesCell(["button", "submit"], false))).toEqual(["button", "submit"])
  })
})

/** A tag entry of family `x-button` with nothing but `overrides`. */
function tagOf(tag: string, overrides: Partial<SiteTag>): SiteTag {
  return {
    tag,
    name: tag,
    folder: "x-button",
    mainTag: "x-button",
    main: tag === "x-button",
    page: tag === "x-button",
    topics: [],
    aka: [],
    noun: tag.replace(/^x-/, ""),
    attributes: [],
    slots: [],
    events: [],
    parts: [],
    states: [],
    texts: [],
    ...overrides
  }
}

/** A Values cell of `values`, no swatches. */
function valuesCell(values: string[], isRange: boolean) {
  return { type: "values" as const, values, isSwatch: false, isRange }
}
