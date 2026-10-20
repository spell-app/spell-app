import { describe, expect, it } from "vite-plus/test"

import { PropertySchemas, type JSONSchema } from "$/ui/property"
import { fieldVocabulary } from "$/ui/components/ui-form/UIField.en"

describe("PropertySchemas.fromVocabulary()", () => {
  it("reads a component's vocabulary as it is:  its tag is the name", () => {
    const schema = PropertySchemas.fromVocabulary(fieldVocabulary)
    expect(schema.name).toBe("ui-field")
    expect(schema.attributes).toBe(fieldVocabulary.attributes)
  })
})

describe("PropertySchemas.fromJSONSchema()", () => {
  const PROJECT: JSONSchema = {
    title: "ProjectSettings",
    type: "object",
    properties: {
      $type: { const: "ProjectSettings" },
      title: { type: ["string", "null"], title: "Title", description: "Shown in the project list." },
      version: { type: "integer", minimum: 1, default: 1 },
      listsStartAt: { enum: [1, 0, null], default: 1 },
      buildFolder: { anyOf: [{ type: "string", pattern: "^[\\w-]+$" }, { type: "null" }] },
      exports: { type: "array", items: { type: "string" } },
      build: { type: "object", properties: { minify: { type: "boolean" } } },
      created: { type: "string", format: "date-time" }
    }
  }

  it("reads each property:  its type, label, tip, limits, choices and default;  skips `$` keys", () => {
    const schema = PropertySchemas.fromJSONSchema(PROJECT)
    expect(schema.name).toBe("ProjectSettings")
    const byName = Object.fromEntries(schema.attributes.map((spec) => [spec.name, spec]))
    expect(Object.keys(byName)).toEqual([
      "title",
      "version",
      "listsStartAt",
      "buildFolder",
      "exports",
      "build",
      "created"
    ])
    expect(byName.title).toMatchObject({
      type: "text",
      kind: "string",
      label: "Title",
      tip: "Shown in the project list."
    })
    expect(byName.version).toMatchObject({ type: "number", min: 1, default: 1 })
    expect(byName.listsStartAt).toMatchObject({ type: "choice", kind: "enum", values: ["1", "0"], default: 1 })
    expect(byName.buildFolder).toMatchObject({ type: "text", pattern: "^[\\w-]+$" })
    expect(byName.exports).toMatchObject({ type: "list", of: "text" })
    expect(byName.build!.attributesOf).toEqual([{ name: "minify", kind: "boolean", type: "boolean", description: "" }])
    expect(byName.created).toMatchObject({ type: "date" })
  })

  it("throws for a schema that isn't an object's", () => {
    expect(() => PropertySchemas.fromJSONSchema({ type: "string" })).toThrow(TypeError)
  })
})

describe("PropertySchemas.fromValues()", () => {
  it("guesses each property's type from its value", () => {
    const schema = PropertySchemas.fromValues(
      { name: "Spell", size: 3, dark: true, tags: ["a"], font: { family: "Inter" }, extra: null, $type: "Theme" },
      "theme"
    )
    expect(schema.attributes.map((spec) => [spec.name, spec.type])).toEqual([
      ["name", "text"],
      ["size", "number"],
      ["dark", "boolean"],
      ["tags", "list"],
      ["font", "thing"],
      ["extra", "data"]
    ])
    expect(schema.attributes[3]!.of).toBe("text")
    expect(schema.attributes[4]!.attributesOf!.map((spec) => spec.name)).toEqual(["family"])
  })
})

describe("PropertySchemas.typeOf() and .labelOf()", () => {
  it("reads a value's type from its kind when it has no `type`", () => {
    const of = (spec: object) => PropertySchemas.typeOf({ name: "x", description: "", ...spec } as never)
    expect(of({ kind: "keyOnly" })).toBe("boolean")
    expect(of({ kind: "number" })).toBe("number")
    expect(of({ kind: "size" })).toBe("choice")
    expect(of({ kind: "string", values: ["a", "b"] })).toBe("choice")
    expect(of({ kind: "string" })).toBe("text")
    expect(of({ kind: "json" })).toBe("data")
    expect(of({ kind: "json", type: "list" })).toBe("list")
  })

  it("makes a label from the name when there's none", () => {
    const label = (name: string, own?: string) =>
      PropertySchemas.labelOf({ name, kind: "string", description: "", label: own })
    expect(label("listsStartAt")).toBe("Lists start at")
    expect(label("text-align")).toBe("Text align")
    expect(label("x", "Own label")).toBe("Own label")
  })
})
