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
        `<ui-property-editor schema="Theme" label="Theme">`,
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
      `\n  <ui-property-group label="Other" data-other="">\n    <ui-property name="size"></ui-property>\n` +
        `    <ui-property name="dark"></ui-property>\n  </ui-property-group>\n`
    )
    expect(text).not.toContain(`name="font"`)
    expect(text).not.toContain(`as="number"`)
  })
})

describe("PropertyEditorPages.compile()", () => {
  it("makes a module defining <theme-editor>:  its layout and schema inlined, no page loading", async () => {
    // the elements are on the page already:  the module imports nothing more
    await import("$/ui")
    const editor = editorOf(`<ui-property-editor schema="Theme" label="Theme" source="nope.html">
      <ui-property name="title" hint="Used for the file name."></ui-property>
      <ui-property-group label="Look"><ui-property name="size" as="buttons"></ui-property></ui-property-group>
    </ui-property-editor>`)
    const compiled = PropertyEditorPages.compile(editor, THEME, { uiModule: "data:text/javascript," })
    expect([compiled.tag, compiled.className]).toEqual(["theme-editor", "ThemeEditor"])
    expect(compiled.text).not.toContain("nope.html")
    const url = URL.createObjectURL(new Blob([compiled.text], { type: "text/javascript" }))
    await import(/* @vite-ignore */ url)

    const host = document.createElement("theme-editor") as HTMLElement & { value: unknown }
    const thing = { title: "Sunrise", size: "md" }
    host.value = thing
    document.body.append(host)
    try {
      const inner = host.querySelector("ui-property-editor")!
      expect(inner.getAttribute("label")).toBe("Theme")
      expect(inner.hasAttribute("source")).toBe(false)
      await expect.poll(() => host.querySelectorAll("ui-property[name=size] ui-radio").length).toBe(2)
      const title = host.querySelector("ui-property[name=title] ui-input") as HTMLElement & { value: unknown }
      await expect.poll(() => title?.value).toBe("Sunrise")
      expect(host.value).toBe(thing)
    } finally {
      host.remove()
    }
  })
})
