import { describe, expect, it } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"

import { ElementSnapshot, type SnapshotRow } from "./ElementSnapshot"

import "$/ui/components/ui-button"

describe("ElementSnapshot()", () => {
  it("reads a plain element's attributes, as written;  no properties, no states", () => {
    const input = document.createElement("input")
    input.setAttribute("value", "x")
    input.setAttribute("required", "")
    const snapshot = new ElementSnapshot(input)
    expect(snapshot.attributes).toEqual([
      { name: "value", value: '"x"' },
      { name: "required", value: '""' }
    ])
    expect(snapshot.properties).toEqual([])
    expect(snapshot.states).toEqual([])
  })

  it("reads a Spell UI element's set properties, converted, and its states A-Z", async () => {
    const button = await ElementFixture.render(`<ui-button active size="large" toggle>A</ui-button>`)
    const snapshot = new ElementSnapshot(button)
    expect(snapshot.properties).toEqual([
      { name: "size", value: '"large"' },
      { name: "toggle", value: "true" },
      { name: "active", value: "true" },
      { name: "type", value: '"button"' }
    ])
    expect(snapshot.states).toEqual(["active"])
  })

  it("`all`:  every vocabulary property, unset ones too", async () => {
    const button = await ElementFixture.render(`<ui-button>A</ui-button>`)
    const { properties } = new ElementSnapshot(button, { all: true })
    expect(properties.length).toBeGreaterThan(10)
    expect(properties).toContainEqual({ name: "primary", value: "false" })
  })
})

describe("ElementSnapshot.keepUnchanged()", () => {
  const a: SnapshotRow = { name: "a", value: "1" }
  const b: SnapshotRow = { name: "b", value: "2" }

  it("returns the old list itself when nothing changed", () => {
    const previous = [a, b]
    expect(ElementSnapshot.keepUnchanged(previous, [{ ...a }, { ...b }])).toBe(previous)
  })

  it("keeps each unchanged row's object, and takes the changed ones", () => {
    const changed = { name: "b", value: "3" }
    const rows = ElementSnapshot.keepUnchanged([a, b], [{ ...a }, changed])
    expect(rows[0]).toBe(a)
    expect(rows[1]).toBe(changed)
  })
})

describe("ElementSnapshot.valueText()", () => {
  it.each([
    ["text", '"text"'],
    [3, "3"],
    [true, "true"],
    [undefined, "undefined"],
    [null, "null"],
    [["x", 1], '["x",1]'],
    [() => 1, "ƒ"]
  ])("%s => %s", (value, text) => {
    expect(ElementSnapshot.valueText(value)).toBe(text)
  })

  it("cuts a long value, ending in …", () => {
    const text = ElementSnapshot.valueText({ long: "x".repeat(100) })
    expect(text).toHaveLength(60)
    expect(text.endsWith("…")).toBe(true)
  })
})
