import { describe, expect, it } from "vite-plus/test"

import { PropertyEditorPages } from "$/ui/property"
import type { V } from "$/ui/api"

/** A theme's schema:  three properties. */
const THEME: V.PropertySchema = {
  name: "Theme",
  attributes: [
    { name: "title", kind: "string", type: "text", description: "" },
    { name: "size", kind: "enum", type: "choice", values: ["sm", "md"], description: "" },
    { name: "dark", kind: "boolean", type: "boolean", description: "" }
  ]
}

/** A page's editor, parsed from `text`. */
function editorOf(text: string): Element {
  return PropertyEditorPages.editorIn(new DOMParser().parseFromString(text, "text/html"))!
}

describe("PropertyEditorPages", () => {
  it("write():  the schema's default page, a property per attribute, two spaces in", () => {
    expect(PropertyEditorPages.write(THEME, document)).toBe(
      [
        `<ui-property-editor schema="Theme" header="Theme">`,
        `  <ui-property name="title"></ui-property>`,
        `  <ui-property name="size"></ui-property>`,
        `  <ui-property name="dark"></ui-property>`,
        `</ui-property-editor>`,
        ``
      ].join("\n")
    )
  })

  it("check():  a dropped property, a missing one, a control that no longer fits", () => {
    const editor = editorOf(`<ui-property-editor schema="Theme">
      <ui-property name="title" as="number"></ui-property>
      <ui-property name="size" as="buttons"></ui-property>
      <ui-property name="font"></ui-property>
    </ui-property-editor>`)
    expect(PropertyEditorPages.check(editor, THEME).map(({ kind, name }) => [kind, name])).toEqual([
      ["control", "title"],
      ["dropped", "font"],
      ["missing", "dark"]
    ])
  })

  it("fix():  drops what's gone, adds what's new to an Other group, a misfit control back to its type's;  then it checks clean", () => {
    const editor = editorOf(`<ui-property-editor schema="Theme">
      <ui-property name="title" as="number"></ui-property>
      <ui-property name="font"></ui-property>
    </ui-property-editor>`)
    expect(PropertyEditorPages.fix(editor, THEME)).toHaveLength(4)
    expect(PropertyEditorPages.check(editor, THEME)).toEqual([])
    const text = PropertyEditorPages.text(editor)
    expect(text).toContain(
      `\n  <ui-property-group header="Other" data-other="">\n    <ui-property name="size"></ui-property>\n` +
        `    <ui-property name="dark"></ui-property>\n  </ui-property-group>\n`
    )
    expect(text).not.toContain(`name="font"`)
    expect(text).not.toContain(`as="number"`)
  })
})
