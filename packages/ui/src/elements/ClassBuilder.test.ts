import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { ClassBuilder, type ClassInput } from "$/ui/elements"
import type { ComponentVocabulary } from "$/ui/vocabulary"

afterEach(() => {
  vi.restoreAllMocks()
})

/** One attribute of every class kind, deliberately out of output order. */
const widget = {
  tag: "ui-widget",
  noun: "widget",
  attributes: [
    { name: "vertical-align", kind: "verticalAlign", description: "" },
    { name: "text-align", kind: "textAlign", description: "" },
    { name: "width", kind: "width", description: "" },
    { name: "only", kind: "multiple", description: "" },
    { name: "reversed", kind: "multiple", description: "" },
    { name: "pointing", kind: "keyOrValueAndKey", description: "" },
    { name: "floated", kind: "valueAndKey", description: "" },
    { name: "attached", kind: "keyOrValueAndKey", description: "" },
    { name: "fluid", kind: "keyOnly", description: "" },
    { name: "basic", kind: "keyOnly", description: "" },
    { name: "very-basic", kind: "keyOnly", description: "" },
    { name: "labeled", kind: "keyOnly", key: "labeled icon", description: "" },
    { name: "color", kind: "color", description: "" },
    { name: "size", kind: "size", description: "" },
    { name: "disabled", kind: "boolean", description: "" },
    { name: "value", kind: "string", description: "" }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

/** Grid-ish vocabulary exercising `widthClass` / `canEqual` and `ui: false`. */
const column = {
  tag: "ui-column",
  noun: "column",
  ui: false,
  attributes: [
    { name: "width", kind: "width", description: "" },
    { name: "computer", kind: "width", widthClass: "wide computer", description: "" },
    { name: "columns", kind: "width", widthClass: "column", canEqual: true, description: "" },
    { name: "count", kind: "width", widthClass: "", description: "" }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

const widgets = new ClassBuilder(widget)
const columns = new ClassBuilder(column)

describe("ClassBuilder.build() per kind", () => {
  it.each<[string, ClassInput, string]>([
    ["nothing", {}, "ui widget"],
    ["size", { size: "small" }, "ui small widget"],
    ["size medium is a no-op", { size: "medium" }, "ui widget"],
    ["color", { color: "red" }, "ui red widget"],
    ["color true emits nothing", { color: true }, "ui widget"],
    ["keyOnly", { basic: true }, "ui basic widget"],
    ["keyOnly false", { basic: false }, "ui widget"],
    ["keyOnly hyphenated name => words", { "very-basic": true }, "ui very basic widget"],
    ["keyOnly explicit key", { labeled: true }, "ui labeled icon widget"],
    ["valueAndKey", { floated: "left" }, "ui left floated widget"],
    ["valueAndKey bare emits nothing", { floated: true }, "ui widget"],
    ["keyOrValueAndKey bare", { pointing: true }, "ui pointing widget"],
    ["keyOrValueAndKey value", { pointing: "left" }, "ui left pointing widget"],
    ["keyOrValueAndKey false", { pointing: false }, "ui widget"],
    ["multiple", { only: "mobile" }, "ui mobile only widget"],
    ["multiple, several", { only: "mobile tablet" }, "ui mobile only tablet only widget"],
    ["multiple, large screen", { only: "large screen widescreen" }, "ui large screen only widescreen only widget"],
    ["multiple, array", { only: ["computer", "tablet"] }, "ui computer only tablet only widget"],
    [
      "multiple, vertically",
      { reversed: "computer vertically mobile" },
      "ui computer vertically reversed mobile reversed widget"
    ],
    ["multiple true emits nothing", { only: true }, "ui widget"],
    ["width number", { width: 4 }, "ui four wide widget"],
    ["width string", { width: "4" }, "ui four wide widget"],
    ["width word", { width: "four" }, "ui four wide widget"],
    ["width fraction", { width: "1/4" }, "ui four wide widget"],
    ["width fraction 3/4", { width: "3/4" }, "ui twelve wide widget"],
    ["width percent", { width: "25%" }, "ui four wide widget"],
    ["width 100%", { width: "100%" }, "ui sixteen wide widget"],
    ["textAlign", { "text-align": "left" }, "ui left aligned widget"],
    ["textAlign justified", { "text-align": "justified" }, "ui justified widget"],
    ["verticalAlign", { "vertical-align": "middle" }, "ui middle aligned widget"],
    ["property-only kinds emit nothing", { disabled: true, value: "x" }, "ui widget"],
    ["unknown keys are ignored", { nope: true }, "ui widget"]
  ])("%s", (_, values, expected) => {
    expect(widgets.build(values)).toBe(expected)
  })
})

describe("ClassBuilder.build() order", () => {
  it("is ui, size, color, keyOnly (alphabetical), keyOrValue (vocabulary order), multiple, width, aligns, noun, extra", () => {
    const everything: ClassInput = {
      "vertical-align": "top",
      "text-align": "center",
      width: 8,
      only: "mobile",
      pointing: "left",
      floated: "right",
      attached: true,
      fluid: true,
      basic: true,
      "very-basic": true,
      labeled: true,
      color: "blue",
      size: "large"
    }
    expect(widgets.build(everything, { extra: "active" })).toBe(
      "ui large blue basic fluid labeled icon very basic left pointing right floated attached " +
        "mobile only eight wide center aligned top aligned widget active"
    )
  })

  it("sorts keyOnly by canonical name, not vocabulary order", () => {
    expect(widgets.build({ fluid: true, basic: true })).toBe("ui basic fluid widget")
  })

  it("puts valueOnly with color, in vocabulary order:  each emits its value alone", () => {
    const panel = new ClassBuilder({
      ...widget,
      attributes: [
        { name: "basic", kind: "keyOnly", description: "" },
        { name: "position", kind: "valueOnly", values: ["left", "right"], description: "" },
        { name: "color", kind: "color", description: "" },
        { name: "speed", kind: "valueOnly", values: ["slow", "fast"], description: "" },
        { name: "size", kind: "size", description: "" }
      ]
    })
    expect(panel.build({ basic: true, position: "left", color: "red", speed: "slow", size: "small" })).toBe(
      "ui small left red slow basic widget"
    )
  })
})

describe("ClassBuilder width options", () => {
  it.each<[string, ClassInput, string]>([
    ["no ui class", {}, "column"],
    ["default widthClass is wide", { width: 4 }, "four wide column"],
    ["widthClass with a device", { computer: 4 }, "four wide computer column"],
    ["widthClass column", { columns: 3 }, "three column column"],
    ["equal when allowed", { columns: "equal" }, "equal width column"],
    ["empty widthClass emits the bare word", { count: 2 }, "two column"]
  ])("%s", (_, values, expected) => {
    expect(columns.build(values)).toBe(expected)
  })

  it("rejects equal where not allowed, and out-of-range widths", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(columns.build({ width: "equal" })).toBe("column")
    expect(columns.build({ width: 17 })).toBe("column")
    expect(columns.build({ width: "0%" })).toBe("column")
    expect(warn).toHaveBeenCalledTimes(3)
  })

  it("snaps inexact widths to the nearest column, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(columns.build({ width: "1/3" })).toBe("five wide column")
    expect(columns.build({ width: "33%" })).toBe("five wide column")
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0][0]).toMatch(/5\.33 of 16 columns;  using 5/)
  })
})

describe("ClassBuilder statics", () => {
  it("keeps grammar words on the prototype", () => {
    expect(widgets.grammar.aligned).toBe("aligned")
    expect(Object.hasOwn(widgets, "grammar")).toBe(false)
  })

  it("builds quickly", () => {
    const values: ClassInput = { size: "small", color: "red", basic: true, pointing: "left", width: "1/4" }
    const start = performance.now()
    for (let index = 0; index < 10_000; index++) widgets.build(values)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
