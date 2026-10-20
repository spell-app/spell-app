import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"

// every Spell UI family the fields hold (`<ui-panel>`, `<ui-menu>`, `<ui-input>` ...), as the brand bundle loads them
import "$/ui"
import "$/brand/components"
import "$/brand/inspector.css"

////////////////
// ## Helpers
////////////////

/** A part of the DOM element `host`'s shadow root. */
function part(host: Element, name: string): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)!
}

/** Render `fields` in an inspector panel `width` px wide;  the first `<ui-field>`. */
async function inspectorField(fields: string, width = 300): Promise<HTMLElement> {
  const panel = await ElementFixture.render(
    `<ui-panel header="Inspector" style="width: ${width}px">${fields}</ui-panel>`
  )
  await ElementFixture.settle()
  return panel.querySelector<HTMLElement>("ui-field")!
}

/** Rounded box of `element`. */
function box(element: Element) {
  const { top, bottom, width, height } = element.getBoundingClientRect()
  return { top: Math.round(top), bottom: Math.round(bottom), width: Math.round(width), height: Math.round(height) }
}

////////////////
// ## The label row
////////////////

describe("inspector.css:  a <ui-field> in a <ui-panel>", () => {
  test("draws a 20px label row:  a 13px medium label, a 12px medium output;  the control 6px under it", async () => {
    const field = await inspectorField(`<ui-field label="Vibrancy" output="100%"><ui-slider></ui-slider></ui-field>`)
    const label = getComputedStyle(part(field, "label"))
    const output = getComputedStyle(part(field, "output"))
    expect({
      row: box(part(field, "row")).height,
      label: [label.fontSize, label.fontWeight],
      output: [output.fontSize, output.fontWeight]
    }).toEqual({ row: 20, label: ["13px", "500"], output: ["12px", "500"] })
    const slider = field.querySelector("ui-slider")!
    expect(box(slider).top - box(part(field, "row")).bottom).toBe(6)
  })

  test("keeps the row 20px when a taller action pill appears", async () => {
    const field = await inspectorField(`<ui-field label="Vibrancy" output="100%"><ui-slider></ui-slider></ui-field>`)
    const slider = field.querySelector("ui-slider")!
    const before = box(slider).top
    field.insertAdjacentHTML(
      "afterbegin",
      `<ui-button slot="actions" size="mini" circular basic icon="rotate left">Reset</ui-button>`
    )
    await ElementFixture.settle()
    expect(box(field.querySelector("ui-button")!).height).toBeGreaterThan(20)
    expect(box(part(field, "row")).height).toBe(20)
    expect(box(slider).top).toBe(before)
  })

  test("leaves no margin under a field:  the panel's gap spaces them", async () => {
    const field = await inspectorField(`<ui-field label="A"><ui-slider></ui-slider></ui-field><p>after</p>`)
    expect(getComputedStyle(part(field, "field")).marginBlockEnd).toBe("0px")
  })

  test("leaves a field outside a panel alone", async () => {
    const field = await ElementFixture.render(
      `<ui-field label="Name"><ui-input aria-label="Name"></ui-input></ui-field>`
    )
    await ElementFixture.settle()
    expect(getComputedStyle(part(field, "label")).fontWeight).not.toBe("500")
    const input = field.querySelector("ui-input")!.shadowRoot!.querySelector("input")!
    expect(box(input).height).toBeGreaterThan(30)
  })
})

////////////////
// ## Its controls
////////////////

describe("inspector.css:  the controls of an inspector field", () => {
  test("draws a slotted input / select / dropdown compact:  30px tall, 14px, weight 500, 6px corners (I16)", async () => {
    const field = await inspectorField(`<ui-field label="Fonts">
      <ui-input value="Spell" aria-label="Name"></ui-input>
      <ui-select value="a"><ui-item value="a">Palatino</ui-item><ui-item value="b">Georgia</ui-item></ui-select>
      <ui-dropdown selection placeholder="Pick" aria-label="Pick"><ui-item value="a">One</ui-item></ui-dropdown>
    </ui-field>`)
    const boxes = {
      input: field.querySelector("ui-input")!.shadowRoot!.querySelector("input")!,
      select: field.querySelector("ui-select")!.shadowRoot!.querySelector<HTMLElement>(".ui.select")!,
      dropdown: field.querySelector("ui-dropdown")!.shadowRoot!.querySelector<HTMLElement>(".ui.dropdown")!
    }
    for (const [name, control] of Object.entries(boxes)) {
      const style = getComputedStyle(control)
      expect(
        {
          height: box(control).height,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          radius: Math.round(parseFloat(style.borderTopLeftRadius))
        },
        name
      ).toEqual({ height: 30, fontSize: "14px", fontWeight: "500", radius: 6 })
    }
  })

  test("leaves a control nested deeper (a row in a slotted <div>) at the page's size", async () => {
    const field = await inspectorField(`<ui-field label="RGB">
      <div><ui-input value="#8E96B5" aria-label="RGB"></ui-input></div>
    </ui-field>`)
    const input = field.querySelector("ui-input")!.shadowRoot!.querySelector("input")!
    expect(getComputedStyle(input).fontSize).toBe("16px")
    expect(box(input).height).toBeGreaterThan(30)
  })

  test("draws a slotted segmented menu as the inspector's track, stretched across the field", async () => {
    const field = await inspectorField(`<ui-field label="Corners">
      <ui-menu appearance="segmented" alignment="fluid" equal link>
        <ui-item selected>Sharp</ui-item><ui-item>Soft</ui-item><ui-item>Round</ui-item>
      </ui-menu>
    </ui-field>`)
    const menu = field.querySelector<HTMLElement>("ui-menu")!
    const track = menu.shadowRoot!.querySelector<HTMLElement>(".ui.menu")!
    const items = [...menu.querySelectorAll("ui-item")].map((item) =>
      item.shadowRoot!.querySelector<HTMLElement>(".item")!
    )
    // a 32px track of 26px options at 12px, 3px apart, 9px corners;  no margin:  6px under the row
    expect(getComputedStyle(menu).display).toBe("block")
    expect(
      Math.abs(track.getBoundingClientRect().width - part(field, "field").getBoundingClientRect().width)
    ).toBeLessThan(1)
    expect(box(track).height).toBe(32)
    expect(box(track).top - box(part(field, "row")).bottom).toBe(6)
    expect(getComputedStyle(track).borderTopLeftRadius).toBe("9px")
    for (const item of items) {
      const { fontSize, fontWeight } = getComputedStyle(item)
      expect({ height: box(item).height, fontSize, fontWeight }).toEqual({
        height: 26,
        fontSize: "12px",
        fontWeight: "500"
      })
    }
    const [first, second] = items.map((item) => item.getBoundingClientRect())
    expect(Math.round(second!.left - first!.right)).toBe(3)
    menu.hidden = true
    expect(getComputedStyle(menu).display).toBe("none")
  })

  test("stretches a slotted colour set across the field", async () => {
    const field = await inspectorField(`<ui-field label="Primary">
      <brand-color-set columns="4"><brand-color value="#6550CA"></brand-color></brand-color-set>
    </ui-field>`)
    const set = field.querySelector("brand-color-set")!
    expect(
      Math.abs(set.getBoundingClientRect().width - part(field, "field").getBoundingClientRect().width)
    ).toBeLessThan(1)
  })
})
