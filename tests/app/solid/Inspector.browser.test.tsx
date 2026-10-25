import { afterEach, describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "spell/test-helpers/ElementFixture"
import { Inspector, InspectorColumn, uiReady } from "spell-app/app/solid"

/**
 * The Inspector (`Inspector.tsx`):  what a part of the app is, picking it, and the column that shows it.
 * - In the browser:  Solid's client build, so `flush()` before asserting.
 */

/** Undo for each test:  unmount, close the Inspector. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  Inspector.close()
  flush()
})

describe("Inspector.partFor()", () => {
  test("a Spell UI element:  itself, with its tag's attributes", async () => {
    const button = await inArea(`<ui-button primary>Go</ui-button>`)
    const part = Inspector.partFor(button.querySelector("ui-button")!)
    expect(part && { value: part.value.constructor.name, schema: part.schema, label: part.label }).toEqual({
      value: button.querySelector("ui-button")!.constructor.name,
      schema: "ui-button",
      label: "<ui-button>"
    })
  })

  test("anything else:  nothing to inspect", async () => {
    const area = await inArea(`<p>words</p>`)
    expect(Inspector.partFor(area.querySelector("p")!)).toBeUndefined()
  })
})

describe("picking", () => {
  test("a click in the app picks the control under it, and never reaches the app", async () => {
    const area = await inArea(`<ui-button>Go</ui-button>`)
    let pressed = 0
    area.querySelector("ui-button")!.addEventListener("click", () => pressed++)
    cleanups.push(Inspector.watch(area))
    Inspector.toggle()
    flush()
    expect(Inspector.isPicking).toBe(true)

    area.querySelector("ui-button")!.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }))
    flush()
    expect(Inspector.picked?.label).toBe("<ui-button>")
    expect(pressed).toBe(0)
    // picked:  the app has its clicks back
    expect(Inspector.isPicking).toBe(false)
  })

  test("the column shows what's picked, in a property editor", async () => {
    const area = await inArea(`<ui-input value="hi"></ui-input>`)
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    Inspector.pick(area.querySelector("ui-input")!)
    flush()
    await ElementFixture.settle(host)
    const editor = host.querySelector<HTMLElement & { schema: unknown }>(".Inspector ui-property-editor")!
    expect(editor.schema).toBe("ui-input")
    expect(host.querySelector(".Inspector ui-panel")!.getAttribute("label")).toBe("<ui-input>")
  })
})

/** An app area holding `html`, on the page for the test. */
async function inArea(html: string): Promise<HTMLElement> {
  await uiReady
  const area = document.body.appendChild(document.createElement("div"))
  area.innerHTML = html
  cleanups.push(() => area.remove())
  await ElementFixture.settle(area)
  return area
}

/** `component`, rendered on the page for the test. */
async function mount(component: () => unknown): Promise<HTMLElement> {
  await uiReady
  const host = document.body.appendChild(document.createElement("div"))
  const dispose = render(component as () => never, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}
