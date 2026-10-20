import { describe, expect, it } from "vite-plus/test"

import { declareProp, Observable } from "$/util"
import { ClassSchemas } from "$/app/ui/ClassSchemas"

describe("ClassSchemas.fromClass()", () => {
  class Settings extends Observable {}
  declareProp(Settings, "title", { type: "text", default: "Untitled" })
  declareProp(Settings, "listsStartAt", { type: "number", oneOf: [1, 0], default: 1 })
  declareProp(Settings, "minify", { type: "choice" })
  declareProp(Settings, "exports", { type: "list", itemType: "text" })
  declareProp(Settings, "owner", { type: "Person" })

  class TeamSettings extends Settings {}
  declareProp(TeamSettings, "title", { type: "text", default: "Team" })
  declareProp(TeamSettings, "created", { type: "date" })

  it("reads each declared property:  its type, legal values and default", () => {
    const schema = ClassSchemas.fromClass(Settings)
    expect(schema.name).toBe("Settings")
    expect(schema.attributes.map((spec) => [spec.name, spec.type])).toEqual([
      ["title", "text"],
      ["listsStartAt", "choice"],
      ["minify", "boolean"],
      ["exports", "list"],
      ["owner", "thing"]
    ])
    expect(schema.attributes[0]).toMatchObject({ kind: "string", default: "Untitled" })
    expect(schema.attributes[1]).toMatchObject({ kind: "enum", values: ["1", "0"], default: 1 })
    expect(schema.attributes[3]!.of).toBe("text")
  })

  it("puts a superclass's properties first;  a subclass's declaration of the same name wins", () => {
    const schema = ClassSchemas.fromClass(TeamSettings)
    expect(schema.attributes.map((spec) => spec.name)).toEqual([
      "title",
      "listsStartAt",
      "minify",
      "exports",
      "owner",
      "created"
    ])
    expect(schema.attributes[0]!.default).toBe("Team")
    expect(schema.attributes[5]!.type).toBe("date")
  })
})
