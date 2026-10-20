import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/core"
import type { PropertySchema } from "$/ui/vocabulary"

import "$/ui"

////////////////
// ## Helpers
////////////////

/** A `<ui-property-editor>`, as the tests set it. */
type Editor = HTMLElement & { schema: unknown; value: unknown; save(): boolean; validate(): boolean }

/** A schema of a theme, every kind of property. */
const THEME: PropertySchema = {
  name: "Theme",
  attributes: [
    { name: "title", kind: "string", type: "text", description: "", tip: "Shown in the theme list." },
    { name: "size", kind: "enum", type: "choice", values: ["sm", "md", "lg"], description: "" },
    { name: "dark", kind: "boolean", type: "boolean", description: "" },
    {
      name: "font",
      kind: "json",
      type: "thing",
      description: "",
      attributesOf: [{ name: "family", kind: "string", type: "text", description: "", label: "Font family" }]
    }
  ]
}

/** An editor of `markup` (its inside), with `schema` and `value` set;  settled. */
async function editor(markup: string, value: unknown, attributes = "") {
  const host = await ElementFixture.render<Editor>(`<ui-property-editor ${attributes}>${markup}</ui-property-editor>`)
  host.schema = THEME
  host.value = value
  await settle(host)
  return host
}

/** Let the editor make its properties and controls, bind them and draw. */
async function settle(host: Element) {
  for (let round = 0; round < 4; round++) {
    await ElementFixture.settle(host)
    await ElementFixture.tick()
  }
}

/** The control inside property `name`. */
function control(host: Element, name: string): HTMLElement & { value: unknown; selected: boolean } {
  return host.querySelector(`ui-property[name="${name}"] [name="${name}"]`) as never
}

/** The `<input>` inside a `<ui-input>`. */
function inner(element: Element): HTMLInputElement {
  return element.shadowRoot!.querySelector("input")!
}

////////////////
// ## Drawing from a schema
////////////////

describe("<ui-property-editor> schema", () => {
  it("makes a property per attribute when it's empty, each with its label, tip and default control", async () => {
    const host = await editor("", { title: "Spell", size: "md", dark: false, font: { family: "Inter" } })
    const properties = [...host.querySelectorAll("ui-property")]
    expect(properties.map((property) => property.getAttribute("name"))).toEqual(["title", "size", "dark", "font"])
    const title = properties[0]!
    expect(title.shadowRoot!.querySelector("[part~=label]")!.textContent).toBe("Title")
    expect(title.shadowRoot!.querySelector("[part~=tip]")!.textContent).toBe("Shown in the theme list.")
    expect(control(host, "title").localName).toBe("ui-input")
    expect(control(host, "title").value).toBe("Spell")
    expect(control(host, "size").localName).toBe("ui-select")
    expect([...control(host, "size").querySelectorAll("ui-item")].map((item) => item.getAttribute("value"))).toEqual([
      "sm",
      "md",
      "lg"
    ])
    expect(control(host, "dark").localName).toBe("ui-checkbox")
  })

  it("keeps the author's layout:  only the properties written, in groups;  `as` picks the control", async () => {
    const host = await editor(
      `<ui-property-group header="Look">
         <ui-property name="size" as="buttons"></ui-property>
       </ui-property-group>
       <ui-property name="font.family"></ui-property>`,
      { size: "lg", font: { family: "Lora" } }
    )
    expect(host.querySelectorAll("ui-property")).toHaveLength(2)
    const radios = [...host.querySelectorAll("ui-property[name=size] ui-radio")] as (HTMLElement & {
      selected: boolean
    })[]
    expect(radios.map((radio) => radio.getAttribute("value"))).toEqual(["sm", "md", "lg"])
    expect(radios.map((radio) => radio.selected)).toEqual([false, false, true])
    const family = host.querySelector("ui-property[name='font.family']")!
    expect(family.shadowRoot!.querySelector("[part~=label]")!.textContent).toBe("Font family")
    expect((family.querySelector("ui-input") as HTMLElement & { value: unknown }).value).toBe("Lora")
  })

  it("writes what the person types back to the thing, and sends `ui-change` from the editor and the property", async () => {
    const thing = { title: "Spell" }
    const host = await editor(`<ui-property name="title"></ui-property>`, thing)
    const changes: unknown[] = []
    host.addEventListener("ui-change", (event) => {
      if (event.target === host) changes.push((event as CustomEvent).detail.value)
    })
    let propertyHeard = false
    host.querySelector("ui-property")!.addEventListener("ui-change", () => (propertyHeard = true))
    await userEvent.type(inner(control(host, "title")), "!")
    await settle(host)
    expect(thing.title).toBe("Spell!")
    expect(changes).toContain("Spell!")
    expect(propertyHeard).toBe(true)
  })

  it("runs the schema's on-change rules after a write", async () => {
    UI.propertyControls.addRule("darkSetsSize", ({ things, value }) => {
      for (const thing of things as { size: string }[]) thing.size = value ? "lg" : "sm"
    })
    const schema: PropertySchema = {
      ...THEME,
      attributes: THEME.attributes.map((spec) =>
        spec.name === "dark" ? { ...spec, onChange: ["darkSetsSize"] } : spec
      )
    }
    const thing = { dark: false, size: "md" }
    const host = await editor(`<ui-property name="dark"></ui-property>`, thing)
    host.schema = schema
    await settle(host)
    control(host, "dark").shadowRoot!.querySelector("input")!.click()
    await settle(host)
    expect(thing).toEqual({ dark: true, size: "lg" })
  })
})

////////////////
// ## Readonly, groups and the registry
////////////////

describe("<ui-property-editor> groups and readonly", () => {
  it("a `readonly` group makes every control in it readonly", async () => {
    const host = await editor(
      `<ui-property-group header="Locked" readonly><ui-property name="title"></ui-property></ui-property-group>`,
      { title: "Spell" }
    )
    expect(control(host, "title").hasAttribute("readonly")).toBe(true)
    expect(host.querySelector("ui-property")!.matches(":state(readonly)")).toBe(true)
  })

  it("a group shows the error state, and hears `ui-invalid`, while a property in it fails", async () => {
    const host = await editor(
      `<ui-property-group header="Name"><ui-property name="title" rules='["empty"]'></ui-property></ui-property-group>`,
      { title: "" }
    )
    const group = host.querySelector("ui-property-group")!
    ;(host.querySelector("ui-property") as HTMLElement & { rules: unknown }).rules = ["empty"]
    let heard = false
    group.addEventListener("ui-invalid", () => (heard = true))
    expect(host.validate()).toBe(false)
    await settle(host)
    expect(group.matches(":state(error)")).toBe(true)
    expect(heard).toBe(true)
  })

  it("checks a schema's rules as a spell type writes them, each in its own words (epic `property-editor` P9)", async () => {
    const host = await ElementFixture.render<Editor>(`<ui-property-editor></ui-property-editor>`)
    host.schema = {
      name: "Release",
      attributes: [
        {
          name: "version",
          kind: "string",
          type: "text",
          description: "",
          rules: [{ type: "empty" }, { type: "regExp", value: "/^\\d+$/", prompt: "Digits only" }]
        }
      ]
    } satisfies PropertySchema
    host.value = { version: "1.x" }
    await settle(host)
    expect(host.validate()).toBe(false)
    await settle(host)
    const property = host.querySelector("ui-property")!
    expect(property.shadowRoot!.textContent).toContain("Digits only")
    // a rule's own message, else the form's, naming the property by the label it shows
    host.value = { version: "" }
    await settle(host)
    expect(host.validate()).toBe(false)
    await settle(host)
    expect(property.shadowRoot!.textContent).toContain("Version must have a value")
  })

  it("draws a control kind a page added", async () => {
    UI.propertyControls.add("shout", { tag: "ui-input", attributes: { placeholder: "LOUD" } })
    const host = await editor(`<ui-property name="title" as="shout"></ui-property>`, { title: "" })
    expect(control(host, "title").getAttribute("placeholder")).toBe("LOUD")
  })
})

////////////////
// ## The section around it, and Save
////////////////

describe("<ui-property-editor> section and Save", () => {
  it("draws a section with its title around the properties, passing on the section's attributes", async () => {
    const host = await editor(
      `<ui-property name="title"></ui-property>`,
      { title: "Spell" },
      `header="Theme" collapsible`
    )
    const section = host.shadowRoot!.querySelector("ui-section")!
    expect(section.getAttribute("header")).toBe("Theme")
    expect(section.hasAttribute("collapsible")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=form]")!.classList.contains("collapsible")).toBe(false)
  })

  it('`apply="on save"`:  Save and Cancel under the properties;  Save writes the held edits', async () => {
    const thing = { title: "Spell" }
    const host = await editor(`<ui-property name="title"></ui-property>`, thing, `apply="on save"`)
    expect(host.shadowRoot!.querySelectorAll("[part~=footer] ui-button")).toHaveLength(2)
    await userEvent.type(inner(control(host, "title")), "!")
    await settle(host)
    expect(thing.title).toBe("Spell")
    expect(host.querySelector("ui-property")!.matches(":state(changed)")).toBe(true)
    ;(host.shadowRoot!.querySelector("[part~=footer] ui-button") as HTMLElement).click()
    await settle(host)
    expect(thing.title).toBe("Spell!")
    expect(host.querySelector("ui-property")!.matches(":state(changed)")).toBe(false)
  })

  it("edits many things at once:  mixed where they disagree", async () => {
    const things = [{ title: "A" }, { title: "B" }]
    const host = await editor(`<ui-property name="title"></ui-property>`, things)
    expect(host.querySelector("ui-property")!.matches(":state(mixed)")).toBe(true)
    await userEvent.type(inner(control(host, "title")), "C")
    await settle(host)
    expect(things).toEqual([{ title: "C" }, { title: "C" }])
  })
})

////////////////
// ## Its layout from a page (`source`)
////////////////

describe("<ui-property-editor source>", () => {
  const PAGE = "/test/fixtures/sources/property-editor/Theme.editor.html"

  it("takes its layout from the page:  its groups and properties, and the page's attributes it doesn't have", async () => {
    const host = await ElementFixture.render<Editor>(`<ui-property-editor source="${PAGE}"></ui-property-editor>`)
    host.schema = THEME
    host.value = { title: "Spell", size: "md", dark: false }
    let loaded = false
    host.addEventListener("ui-loaded", () => (loaded = true))
    await expect.poll(() => host.querySelectorAll("ui-property").length, { timeout: 5000 }).toBeGreaterThan(1)
    await settle(host)
    expect(loaded).toBe(true)
    expect(host.getAttribute("header")).toBe("Theme")
    expect(host.querySelector("ui-property[name=title]")!.getAttribute("hint")).toBe("Used for the file name.")
    await expect.poll(() => host.querySelectorAll("ui-property[name=size] ui-radio").length).toBe(3)
    expect(host.querySelector("ui-property-group[header=More] ui-property[name=dark]")).not.toBeNull()
    expect(control(host, "title").value).toBe("Spell")
  })

  it("`select`:  only that part of the page", async () => {
    const host = await ElementFixture.render<Editor>(
      `<ui-property-editor source="${PAGE}" select="ui-property-group[header=Look]"></ui-property-editor>`
    )
    host.schema = THEME
    host.value = { size: "lg" }
    await expect.poll(() => host.querySelectorAll("ui-property").length, { timeout: 5000 }).toBe(1)
    expect(host.querySelector("ui-property")!.getAttribute("name")).toBe("size")
  })
})
